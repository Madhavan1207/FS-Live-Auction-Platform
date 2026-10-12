import express from "express";
import cors from "cors";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import itemRoutes from "./routes/itemRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import { bidByIdRouter } from "./routes/bidRoutes.js";
import { apiLimiter } from "./middleware/rateLimiters.js";

// Kept separate from server.js (which handles the DB connection and
// port listening) so the app itself can be imported and tested — e.g.
// with supertest in Experiment 7 — without needing a live server socket.
const app = express();

// --- Security hardening (Experiment 5) ---

// Helmet sets a batch of protective HTTP headers (X-Content-Type-Options,
// X-Frame-Options, a conservative Content-Security-Policy, etc.) that
// Express doesn't set by default.
app.use(helmet());

// CORS: Experiment 4 allowed cors() with no config, meaning literally any
// website could call this API from a browser. Restricting it to the
// frontend's own origin (configurable via .env) closes that off while
// still allowing local development.
const allowedOrigin = process.env.FRONTEND_ORIGIN || "http://localhost:5173";
app.use(cors({ origin: allowedOrigin }));

app.use(express.json());

// Strips out any request body/query/param keys starting with "$" or
// containing ".", which is how NoSQL injection payloads are shaped (e.g.
// sending { "email": { "$gt": "" } } to try to bypass a lookup). Runs
// after body parsing since it needs req.body to already be a JSON object.
app.use(mongoSanitize());

// General rate limit across the whole API — a broad safety net against
// basic abuse/scripted hammering. The stricter, bid-specific limiter is
// applied directly on the bid routes (see bidRoutes.js).
app.use("/api", apiLimiter);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/users", userRoutes);
app.use("/api/bids", bidByIdRouter); // DELETE /api/bids/:id

// 404 for anything unmatched under /api
app.use("/api", (req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Centralized error handler — now gives specific, correct status codes
// for the most common failure types instead of a blanket 500 for
// everything, which Experiment 4's version did.
app.use((err, req, res, next) => {
  console.error(err);

  // Invalid MongoDB ObjectId in a URL param, e.g. GET /api/items/not-an-id
  if (err.name === "CastError") {
    return res.status(400).json({ message: `Invalid ${err.path}: ${err.value}` });
  }

  // Mongoose schema validation failed at the database layer (a second,
  // deeper line of defense behind the Joi validation at the route level).
  if (err.name === "ValidationError") {
    return res.status(400).json({
      message: "Validation failed",
      details: Object.values(err.errors).map((e) => e.message),
    });
  }

  // Duplicate key error, e.g. two users signing up with the same email.
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || "field";
    return res.status(409).json({ message: `That ${field} is already in use.` });
  }

  res.status(500).json({ message: "Something went wrong", error: err.message });
});

export default app;
