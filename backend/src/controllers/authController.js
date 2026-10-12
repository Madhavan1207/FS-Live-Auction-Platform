import User from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";

// Replaces Experiment 2's fake login, which just pushed a plain
// {name, role} object into React Context with no backend involved at
// all. This actually creates a User document (password hashed by the
// model's pre-save hook) and issues a real, verifiable JWT.
export async function register(req, res) {
  const { name, email, password, role } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(409).json({ message: "An account with that email already exists" });
  }

  const user = await User.create({ name, email, password, role });
  const token = generateToken(user._id);

  res.status(201).json({
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
    token,
  });
}

// Also replaces Experiment 2's fake login, which accepted literally any
// password. This checks the submitted password against the stored bcrypt
// hash and only issues a token if it actually matches.
export async function login(req, res) {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    // Deliberately the same message for "no such user" and "wrong
    // password" — being specific here would let an attacker discover
    // which emails are registered.
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const token = generateToken(user._id);

  res.json({
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
    token,
  });
}

// Lets the frontend check "who am I / am I still logged in" using just
// the token, without re-sending credentials. req.user is already attached
// by the `protect` middleware by the time this runs.
export async function getMe(req, res) {
  res.json({ user: req.user });
}
