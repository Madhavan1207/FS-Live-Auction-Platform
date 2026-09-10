import express from "express";
import cors from "cors";
import itemRoutes from "./routes/itemRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import { bidByIdRouter } from "./routes/bidRoutes.js";

// Kept separate from server.js (which handles the DB connection and
// port listening) so the app itself can be imported and tested — e.g.
// with supertest in Experiment 7 — without needing a live server socket.
const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/items", itemRoutes);
app.use("/api/users", userRoutes);
app.use("/api/bids", bidByIdRouter); // DELETE /api/bids/:id

// 404 for anything unmatched under /api
app.use("/api", (req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Centralized error handler — catches anything thrown/rejected in the
// controllers above (e.g. an invalid MongoDB ObjectId). A more complete
// version with structured error codes arrives in Experiment 5.
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Something went wrong", error: err.message });
});

export default app;
