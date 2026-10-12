import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { validate } from "../middleware/validate.js";
import { protect } from "../middleware/auth.js";
import { registerSchema, loginSchema } from "../validation/authValidation.js";
import { register, login, getMe } from "../controllers/authController.js";

const router = Router();

router.post("/register", validate(registerSchema), asyncHandler(register));
router.post("/login", validate(loginSchema), asyncHandler(login));
router.get("/me", protect, asyncHandler(getMe));

export default router;
