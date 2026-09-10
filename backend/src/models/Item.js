import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, trim: true, default: "General" },
    image: { type: String, default: "" },

    startingPrice: { type: Number, required: true, min: 0 },
    // Denormalized for fast reads on the Browse page — kept in sync by the
    // bid controller whenever a new highest bid is placed, rather than
    // recalculated from the Bid collection on every request.
    currentBid: { type: Number, required: true, default: 0 },
    bidCount: { type: Number, default: 0 },

    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    closingAt: { type: Date, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Item", itemSchema);
