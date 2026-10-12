import Item from "../models/Item.js";
import { broadcast } from "../socket.js";

// Full CRUD for listings. Experiment 6 adds real ownership checks: the
// seller is taken from the authenticated user (req.user), never trusted
// from the request body, and only the item's own seller (or an admin) can
// update/delete it — enforced here, not just hidden in the frontend UI.

export async function getItems(req, res) {
  const items = await Item.find().sort({ createdAt: -1 });
  res.json(items);
}

export async function getItemById(req, res) {
  const item = await Item.findById(req.params.id);
  if (!item) return res.status(404).json({ message: "Item not found" });
  res.json(item);
}

export async function createItem(req, res) {
  const { title, description, category, image, startingPrice, closingAt } = req.body;

  const item = await Item.create({
    title,
    description,
    category,
    image,
    startingPrice,
    currentBid: startingPrice, // no bids yet — highest bid starts at the asking price
    closingAt,
    seller: req.user._id, // from the verified JWT, never from the request body
  });

  // Experiment 8: anyone sitting on the Browse page sees the new listing
  // appear live, without refreshing.
  broadcast("itemCreated", item);

  res.status(201).json(item);
}

export async function updateItem(req, res) {
  const item = await Item.findById(req.params.id);
  if (!item) return res.status(404).json({ message: "Item not found" });

  const isOwner = item.seller && item.seller.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== "admin") {
    return res.status(403).json({ message: "You can only edit your own listings" });
  }

  Object.assign(item, req.body);
  await item.save();
  res.json(item);
}

export async function deleteItem(req, res) {
  const item = await Item.findById(req.params.id);
  if (!item) return res.status(404).json({ message: "Item not found" });

  const isOwner = item.seller && item.seller.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== "admin") {
    return res.status(403).json({ message: "You can only delete your own listings" });
  }

  await item.deleteOne();
  res.json({ message: "Item deleted" });
}
