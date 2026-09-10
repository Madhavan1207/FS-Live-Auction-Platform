import Bid from "../models/Bid.js";
import Item from "../models/Item.js";

// Bids are read/created through an item (/api/items/:itemId/bids), which
// mirrors how the frontend already thinks about them (Redux's placeBid
// reducer works the same way — one item, one growing bid history).

export async function getBidsForItem(req, res) {
  const bids = await Bid.find({ item: req.params.itemId }).sort({ createdAt: -1 });
  res.json(bids);
}

export async function placeBid(req, res) {
  const { itemId } = req.params;
  const { amount, bidderName, bidder } = req.body;

  const item = await Item.findById(itemId);
  if (!item) return res.status(404).json({ message: "Item not found" });

  // Basic sanity check only — full validation (Joi/Zod, rejecting bids on
  // a closed auction server-side, etc.) is Experiment 5.
  if (!amount || amount <= item.currentBid) {
    return res.status(400).json({
      message: `Bid must be higher than the current bid of ${item.currentBid}`,
    });
  }

  const bid = await Bid.create({ item: itemId, amount, bidderName, bidder });

  item.currentBid = amount;
  item.bidCount += 1;
  await item.save();

  res.status(201).json({ bid, item });
}

export async function deleteBid(req, res) {
  const bid = await Bid.findByIdAndDelete(req.params.id);
  if (!bid) return res.status(404).json({ message: "Bid not found" });
  res.json({ message: "Bid deleted" });
}
