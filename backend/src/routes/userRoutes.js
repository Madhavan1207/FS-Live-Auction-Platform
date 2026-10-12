import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { validate } from "../middleware/validate.js";
import { protect, authorize } from "../middleware/auth.js";
import { createUserSchema, updateUserSchema } from "../validation/userValidation.js";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";

// Everything here is now admin-only. Public account creation goes through
// POST /api/auth/register instead — this router is for an admin directly
// managing/moderating user accounts (e.g. removing a fraudulent user),
// which is exactly the Admin role's job from the project plan.
const router = Router();

router.use(protect, authorize("admin"));

router.get("/", asyncHandler(getUsers));
router.post("/", validate(createUserSchema), asyncHandler(createUser));
router.get("/:id", asyncHandler(getUserById));
router.put("/:id", validate(updateUserSchema), asyncHandler(updateUser));
router.delete("/:id", asyncHandler(deleteUser));

export default router;
