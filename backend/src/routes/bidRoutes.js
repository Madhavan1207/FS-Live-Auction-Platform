import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { validate } from "../middleware/validate.js";
import { protect, authorize } from "../middleware/auth.js";
import { placeBidSchema } from "../validation/bidValidation.js";
import { bidLimiter } from "../middleware/rateLimiters.js";
import { getBidsForItem, placeBid, deleteBid } from "../controllers/bidController.js";

// mergeParams lets this router read :itemId from the parent route
// (itemRoutes.js), since it's mounted at /api/items/:itemId/bids.
const router = Router({ mergeParams: true });

router.get("/", asyncHandler(getBidsForItem));

// Only logged-in buyers can bid — enforced here server-side, not just
// hidden in the frontend's BidBox component like it was in Experiment 2.
router.post(
  "/",
  protect,
  authorize("buyer"),
  bidLimiter,
  validate(placeBidSchema),
  asyncHandler(placeBid)
);

export default router;

// Separate router for /api/bids/:id — deleting a bid is an admin
// moderation action (removing a fraudulent bid), not something any user
// can do to any bid.
export const bidByIdRouter = Router();
bidByIdRouter.delete("/:id", protect, authorize("admin"), asyncHandler(deleteBid));
