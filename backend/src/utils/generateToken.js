import jwt from "jsonwebtoken";

// The token payload only carries the user's id — role and name are looked
// up fresh from the database on every protected request (see
// middleware/auth.js), rather than trusted from an old token, so a role
// change takes effect immediately instead of only after re-login.
export function generateToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
}
