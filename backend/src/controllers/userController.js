import User from "../models/User.js";

// Admin-only user management (public signup is /api/auth/register).

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
  // findByIdAndUpdate would bypass the User model's pre("save") hashing
  // hook, silently storing a plain-text password if one is included in
  // the update. Fetch + assign + save() instead so hashing always runs.
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });

  Object.assign(user, req.body);
  await user.save();

  const { password: _omit, ...safeUser } = user.toObject();
  res.json(safeUser);
}

export async function deleteUser(req, res) {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json({ message: "User deleted" });
}
