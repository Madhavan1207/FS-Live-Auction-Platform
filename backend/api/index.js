import mongoose from "mongoose";
import app from "../src/app.js";

// Vercel entry point (Experiment 9). Vercel runs the API as a serverless
// function: there is no long-running server, so server.js (which connects
// to MongoDB once and then calls listen) is not used there. Instead, each
// request lands on this handler, which makes sure MongoDB is connected and
// then hands the request to the same Express app used locally.

let connecting = null;

// A serverless instance can serve many requests before it is recycled, so
// the connection is created once and reused. Without this, every single
// request would open a brand new connection to Atlas.
async function ensureDb() {
  if (mongoose.connection.readyState === 1) return;
  if (!connecting) {
    connecting = mongoose
      .connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 8000 })
      .catch((err) => {
        connecting = null; // allow the next request to try again
        throw err;
      });
  }
  await connecting;
}

export default async function handler(req, res) {
  try {
    await ensureDb();
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ message: "Database connection failed" }));
    return;
  }
  return app(req, res);
}