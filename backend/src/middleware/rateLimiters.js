import rateLimit from "express-rate-limit";

// Broad safety net across the whole API — generous enough not to get in
// the way of normal browsing/testing, just there to blunt basic abuse.
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 300,
  standardHeaders: true, // adds RateLimit-* response headers
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later." },
});

// Much stricter limit specifically on placing bids — this is the direct
// answer to "prevent bid spamming" from the experiment plan. A real
// bidder placing a handful of bids on one item in a minute is normal;
// dozens per second is a script.
export const bidLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many bids placed too quickly. Slow down." },
});
