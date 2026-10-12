import { Server } from "socket.io";

// Experiment 8: real-time layer. HTTP is request/response — the server can
// only answer when a client asks. WebSockets keep one connection open in
// both directions, so the server can PUSH a new bid to every browser the
// moment it happens, with no refresh and no polling.

let io = null;

const OBJECT_ID = /^[a-f\d]{24}$/i;

// Socket.io rooms: each auction item gets its own room ("item:<id>"), so a
// bid on one item is only pushed to people actually looking at that item.
const roomFor = (itemId) => `item:${itemId}`;

function viewerCount(room) {
  return io.sockets.adapter.rooms.get(room)?.size ?? 0;
}

export function initSocket(httpServer) {
  io = new Server(httpServer, {
    // Same restriction idea as Experiment 5's CORS config: only our own
    // frontend may open a socket to this server.
    cors: {
      origin: process.env.FRONTEND_ORIGIN || "http://localhost:5173",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on("joinItem", (itemId) => {
      // Never trust client input (Experiment 5's lesson, applied to sockets
      // too): only accept something shaped like a real MongoDB ObjectId.
      if (typeof itemId !== "string" || !OBJECT_ID.test(itemId)) return;
      const room = roomFor(itemId);
      socket.join(room);
      io.to(room).emit("viewerCount", { itemId, count: viewerCount(room) });
    });

    socket.on("leaveItem", (itemId) => {
      if (typeof itemId !== "string" || !OBJECT_ID.test(itemId)) return;
      const room = roomFor(itemId);
      socket.leave(room);
      io.to(room).emit("viewerCount", { itemId, count: viewerCount(room) });
    });

    // "disconnecting" (not "disconnect") fires while the socket is still in
    // its rooms, so we can tell each room it just lost one viewer.
    socket.on("disconnecting", () => {
      for (const room of socket.rooms) {
        if (room.startsWith("item:")) {
          io.to(room).emit("viewerCount", {
            itemId: room.slice("item:".length),
            count: viewerCount(room) - 1,
          });
        }
      }
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
}

// Mongoose documents contain ObjectIds/Dates; round-tripping through JSON
// guarantees the browser receives plain, serializable data.
const toPlain = (doc) => JSON.parse(JSON.stringify(doc));

// Safe to call from any controller: does nothing if sockets aren't running
// (e.g. when the API is exercised on its own in tests).
export function broadcast(event, payload, room) {
  if (!io) return;
  const target = room ? io.to(room) : io;
  target.emit(event, toPlain(payload));
  console.log(`Broadcast "${event}"${room ? ` to ${room} (${viewerCount(room)} viewers)` : " to everyone"}`);
}

export { roomFor };
