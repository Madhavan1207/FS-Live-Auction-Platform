import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { validate } from "../middleware/validate.js";
import { protect, authorize } from "../middleware/auth.js";
import { createItemSchema, updateItemSchema } from "../validation/itemValidation.js";
import {
  getItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
} from "../controllers/itemController.js";
import bidRoutes from "./bidRoutes.js";

const router = Router();

// Browsing is public — no login needed to look at listings.
router.get("/", asyncHandler(getItems));
router.get("/:id", asyncHandler(getItemById));

// Only sellers (or an admin) can list an item.
router.post(
  "/",
  protect,
  authorize("seller", "admin"),
  validate(createItemSchema),
  asyncHandler(createItem)
);

// Ownership itself (is this YOUR listing) is checked inside the
// controller, since it needs to compare against the specific item's
// seller field, not just the user's role.
router.put("/:id", protect, authorize("seller", "admin"), validate(updateItemSchema), asyncHandler(updateItem));
router.delete("/:id", protect, authorize("seller", "admin"), asyncHandler(deleteItem));

// Nested resource: /api/items/:itemId/bids
router.use("/:itemId/bids", bidRoutes);

export default router;
