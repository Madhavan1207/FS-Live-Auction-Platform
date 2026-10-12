import Bid from "../models/Bid.js";
import Item from "../models/Item.js";
import { broadcast, roomFor } from "../socket.js";

// Anti-sniping: a bid placed in the final 30 seconds pushes the closing time
// back by 30 seconds, so nobody can win by bidding at the last instant. It
// also gives Experiment 8 a real server-side change to the countdown that
// every viewer's screen must pick up live.
const ANTI_SNIPE_WINDOW_MS = 30 * 1000;

// Bids are read/created through an item (/api/items/:itemId/bids), which
// mirrors how the frontend already thinks about them (Redux's placeBid
// reducer works the same way — one item, one growing bid history).
//
// Experiment 6 change: bidderName/bidder now come from the authenticated
// user (req.user), never from the request body. Previously a client could
// place a bid claiming to be anyone; now the name attached to a bid is
// guaranteed to be whoever actually owns the token.

export async function getBidsForItem(req, res) {
  const bids = await Bid.find({ item: req.params.itemId }).sort({ createdAt: -1 });
  res.json(bids);
}

export async function placeBid(req, res) {
  const { itemId } = req.params;
  const { amount } = req.body;

  const item = await Item.findById(itemId);
  if (!item) return res.status(404).json({ message: "Item not found" });

  // Gap found while preparing Experiment 7's expired-auction edge-case
  // tests: nothing previously checked closingAt at all, so a bid placed
  // after an auction had closed would still succeed. Fixed here.
  if (new Date() > item.closingAt) {
    return res.status(400).json({ message: "This auction has already closed" });
  }

  if (item.seller && item.seller.toString() === req.user._id.toString()) {
    return res.status(403).json({ message: "You cannot bid on your own listing" });
  }

  if (!amount || amount <= item.currentBid) {
    return res.status(400).json({
      message: `Bid must be higher than the current bid of ${item.currentBid}`,
    });
  }

  const bid = await Bid.create({
    item: itemId,
    amount,
    bidder: req.user._id,
    bidderName: req.user.name,
  });

  item.currentBid = amount;
  item.bidCount += 1;

  let extended = false;
  if (item.closingAt - Date.now() < ANTI_SNIPE_WINDOW_MS) {
    item.closingAt = new Date(new Date(item.closingAt).getTime() + ANTI_SNIPE_WINDOW_MS);
    extended = true;
  }

  await item.save();

  // Experiment 8: push the new bid out in real time. Two events:
  //  - "bidPlaced" -> only the room of people viewing THIS item (full bid
  //    details for the bid history list + the extension notice)
  //  - "itemUpdated" -> everyone connected (so Browse page cards update too)
  broadcast("bidPlaced", { bid, item, extended }, roomFor(itemId));
  broadcast("itemUpdated", item);

  res.status(201).json({ bid, item, extended });
}

export async function deleteBid(req, res) {
  const bid = await Bid.findByIdAndDelete(req.params.id);
  if (!bid) return res.status(404).json({ message: "Bid not found" });
  res.json({ message: "Bid deleted" });
}
