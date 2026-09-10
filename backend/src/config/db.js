import mongoose from "mongoose";

// Single place responsible for opening the MongoDB connection via
// Mongoose. server.js calls this once on startup, before the Express app
// starts accepting requests.
export async function connectDB(uri) {
  try {
    await mongoose.connect(uri);
    console.log("MongoDB connected:", mongoose.connection.host);
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    // Fail fast — there's no useful way to serve API requests without a DB.
    process.exit(1);
  }
}
