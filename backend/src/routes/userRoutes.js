import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";

const router = Router();

router.get("/", asyncHandler(getUsers));
router.post("/", asyncHandler(createUser));
router.get("/:id", asyncHandler(getUserById));
router.put("/:id", asyncHandler(updateUser));
router.delete("/:id", asyncHandler(deleteUser));

export default router;
