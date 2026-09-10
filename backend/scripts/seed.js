import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { connectDB } from "../src/config/db.js";
import Item from "../src/models/Item.js";

// Run once with: npm run seed
// Clears existing items and inserts a handful of sample listings, so
// Browse/Item Detail have real data to show instead of an empty catalogue.
// Safe to re-run any time — it always starts from a clean slate.

const now = Date.now();

const sampleItems = [
  {
    title: "Vintage Leather Armchair",
    category: "Furniture",
    description:
      "A well-preserved mid-century leather armchair, original stitching, minor wear on the armrests. Local pickup preferred.",
    startingPrice: 100,
    currentBid: 120,
    bidCount: 8,
    image: "https://images.unsplash.com/photo-1567016432779-094069958ea5?w=900",
    closingAt: new Date(now + (2 * 60 + 14) * 60 * 1000), // 2h 14m from now
  },
  {
    title: "Canon AE-1 Film Camera",
    category: "Electronics",
    description:
      "Classic 35mm SLR from the late 70s, fully functional, comes with a 50mm f/1.8 lens and original strap.",
    startingPrice: 60,
    currentBid: 85,
    bidCount: 5,
    image: "https://images.unsplash.com/photo-1495707902641-75cac588d2e9?w=900",
    closingAt: new Date(now + 45 * 60 * 1000), // 45m from now
  },
  {
    title: "Handmade Ceramic Vase Set",
    category: "Home Decor",
    description:
      "Set of three hand-thrown stoneware vases, matte glaze finish. Sold as a set only.",
    startingPrice: 25,
    currentBid: 40,
    bidCount: 2,
    image: "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=900",
    closingAt: new Date(now + (5 * 60 + 2) * 60 * 1000), // 5h 02m from now
  },
  {
    title: "Mountain Bike - Trek 820",
    category: "Sports",
    description:
      "Steel-frame hardtail, recently tuned, new brake pads. Great commuter or trail starter bike.",
    startingPrice: 150,
    currentBid: 210,
    bidCount: 11,
    image: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=900",
    closingAt: new Date(now + 2 * 24 * 60 * 60 * 1000)
  },
];

async function seed() {
  await connectDB(process.env.MONGODB_URI);

  await Item.deleteMany({});
  console.log("Cleared existing items.");

  const created = await Item.insertMany(sampleItems);
  console.log(`Inserted ${created.length} sample items.`);

  await mongoose.disconnect();
  console.log("Done.");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
