import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Verifies the "Authorization: Bearer <token>" header on protected routes.
// This is the real enforcement Experiment 2's frontend-only role checks
// were missing — even if someone bypasses the UI entirely and calls the
// API directly with Postman, an invalid/missing/expired token is rejected
// here before any controller runs.
export async function protect(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized, no token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Fetch the user fresh from the database on every request (instead of
    // trusting whatever role was in the token when it was issued) so a
    // role change or account deletion takes effect immediately.
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "Not authorized, user no longer exists" });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Not authorized, invalid or expired token" });
  }
}

// Role gate — used after `protect`, e.g.:
//   router.post("/", protect, authorize("seller", "admin"), createItem);
export function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Role '${req.user?.role}' is not permitted to perform this action`,
      });
    }
    next();
  };
}
