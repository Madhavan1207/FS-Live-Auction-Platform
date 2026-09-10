import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { getBidsForItem, placeBid, deleteBid } from "../controllers/bidController.js";

// mergeParams lets this router read :itemId from the parent route
// (itemRoutes.js), since it's mounted at /api/items/:itemId/bids.
const router = Router({ mergeParams: true });

router.get("/", asyncHandler(getBidsForItem));
router.post("/", asyncHandler(placeBid));

export default router;

// Separate router for /api/bids/:id (delete by the bid's own id, not
// nested under an item) — exported alongside the default so server.js can
// mount both.
export const bidByIdRouter = Router();
bidByIdRouter.delete("/:id", asyncHandler(deleteBid));
