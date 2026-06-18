import express from "express";
import {
  registerUser,
  loginUser,
  getAllUser,
  updateUser,
  deleteUser,
  forgotPassword,
  resetPassword,
  updateRole,
} from "../controllers/userController.js";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";

const router = express.Router();

// ── Public routes (no auth needed) ───────────────────────────
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// ── Protected routes (login required) ────────────────────────
router.get(
  "/profile",
  protect,
  authorizeRoles("admin", "superadmin"),
  getAllUser
);

router.put(
  "/:id",
  protect,
  authorizeRoles("admin", "superadmin"),
  updateUser
);

router.delete(
  "/:id",
  protect,
  authorizeRoles("superadmin"), // only superadmin can delete
  deleteUser
);

// ── superadmin only ───────────────────────────────────────────
router.patch(
  "/:id/role",
  protect,
  authorizeRoles("superadmin"),
  updateRole
);

export default router;