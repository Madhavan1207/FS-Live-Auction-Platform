import Item from "../models/Item.js";

// Full CRUD for listings. Deliberately minimal here: no input validation
// library, no auth/role checks, no rate limiting — those are Experiment 5
// and 6. This experiment is about the data layer and the five basic
// operations working correctly against MongoDB via Mongoose.

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
  const { title, description, category, image, startingPrice, closingAt, seller } = req.body;

  const item = await Item.create({
    title,
    description,
    category,
    image,
    startingPrice,
    currentBid: startingPrice, // no bids yet — highest bid starts at the asking price
    closingAt,
    seller,
  });

  res.status(201).json(item);
}

export async function updateItem(req, res) {
  const item = await Item.findByIdAndUpdate(req.params.id, req.body, {
    new: true, // return the updated document, not the pre-update one
    runValidators: true,
  });
  if (!item) return res.status(404).json({ message: "Item not found" });
  res.json(item);
}

export async function deleteItem(req, res) {
  const item = await Item.findByIdAndDelete(req.params.id);
  if (!item) return res.status(404).json({ message: "Item not found" });
  res.json({ message: "Item deleted" });
}
