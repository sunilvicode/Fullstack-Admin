import jwt from "jsonwebtoken";
import User from "../models/User.js";

// ── Verify JWT token ──────────────────────────────────────────
export const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user; // attach user (with role) to request
    next();
  } catch (error) {
    res.status(401).json({ message: "Token invalid or expired" });
  }
};

// ── Role-based authorization ──────────────────────────────────
// Usage: authorizeRoles("superadmin")
//        authorizeRoles("admin", "superadmin")
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Required role: ${roles.join(" or ")}. Your role: ${req.user.role}`,
      });
    }
    next();
  };
};
