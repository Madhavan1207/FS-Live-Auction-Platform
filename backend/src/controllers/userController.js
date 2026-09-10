import User from "../models/User.js";

// Plain CRUD only. There is intentionally no password hashing and no
// login/token logic here — that's Experiment 6. This just proves the User
// schema and basic persistence work.

export async function getUsers(req, res) {
  const users = await User.find().select("-password");
  res.json(users);
}

export async function getUserById(req, res) {
  const user = await User.findById(req.params.id).select("-password");
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
}

export async function createUser(req, res) {
  const { name, email, password, role } = req.body;
  const user = await User.create({ name, email, password, role });
  const { password: _omit, ...safeUser } = user.toObject();
  res.status(201).json(safeUser);
}

export async function updateUser(req, res) {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).select("-password");
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
}

export async function deleteUser(req, res) {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json({ message: "User deleted" });
}
