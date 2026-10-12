import dotenv from "dotenv";
dotenv.config();

import http from "http";
import app from "./src/app.js";
import { connectDB } from "./src/config/db.js";
import { initSocket } from "./src/socket.js";

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/live-auction";

// Socket.io needs the raw HTTP server (not just the Express app) so it can
// share the same port: normal REST requests go to Express, WebSocket
// upgrade requests go to Socket.io.
const server = http.createServer(app);
initSocket(server);

connectDB(MONGODB_URI).then(() => {
  server.listen(PORT, () => {
    console.log(`Live Auction API + WebSocket server running on http://localhost:${PORT}`);
  });
});
