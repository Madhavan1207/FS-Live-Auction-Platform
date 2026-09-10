import dotenv from "dotenv";
dotenv.config();

import app from "./src/app.js";
import { connectDB } from "./src/config/db.js";

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/live-auction";

connectDB(MONGODB_URI).then(() => {
  app.listen(PORT, () => {
    console.log(`Live Auction API running on http://localhost:${PORT}`);
  });
});
