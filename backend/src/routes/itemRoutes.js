import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import {
  getItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
} from "../controllers/itemController.js";
import bidRoutes from "./bidRoutes.js";

const router = Router();

router.get("/", asyncHandler(getItems));
router.post("/", asyncHandler(createItem));
router.get("/:id", asyncHandler(getItemById));
router.put("/:id", asyncHandler(updateItem));
router.delete("/:id", asyncHandler(deleteItem));

// Nested resource: /api/items/:itemId/bids
router.use("/:itemId/bids", bidRoutes);

export default router;
