import mongoose from "mongoose";

const bidSchema = new mongoose.Schema(
  {
    item: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true },
    // `bidder` will be populated automatically from the logged-in user's
    // JWT once Experiment 6 adds real auth. Until then, `bidderName` is
    // taken directly from the request body so bids can still be tested
    // end-to-end with Postman in Experiment 7.
    bidder: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    bidderName: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Bid", bidSchema);
