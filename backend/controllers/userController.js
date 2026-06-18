import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendOtpEmail } from "../utils/emailService.js";

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ name, email, password: hashedPassword });

    res.status(201).json({ message: "User Registered", success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      message: "Login Successfully",
      success: true,
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllUser = async (req, res) => {
  try {
    const users = await User.find().select("-password -resetToken -resetTokenExpiry");
    res.status(200).json({ success: true, count: users.length, users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password } = req.body;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const updateData = {};
    if (name) updateData.name = name;
    if (email) {
      const existing = await User.findOne({ email, _id: { $ne: id } });
      if (existing) return res.status(400).json({ message: "Email already in use" });
      updateData.email = email;
    }
    if (password) updateData.password = await bcrypt.hash(password, 10);

    const updated = await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).select("-password -resetToken -resetTokenExpiry");

    res.status(200).json({ success: true, message: "User updated successfully", user: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    await User.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── Forgot Password ───────────────────────────────────────────
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "No account found with this email" });
    }

    // Generate secure 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await User.findByIdAndUpdate(user._id, {
      resetToken: otp,
      resetTokenExpiry: expiry,
    });

    // Check if email credentials are configured
    const emailConfigured = process.env.EMAIL_USER && process.env.EMAIL_PASS;

    if (emailConfigured) {
      // ── PRODUCTION MODE: Send real email ──
      try {
        await sendOtpEmail(email, otp, user.name);
        res.status(200).json({
          success: true,
          message: `OTP sent to ${email}. Check your inbox.`,
          mode: "email", // tells frontend NOT to show OTP box
        });
      } catch (emailError) {
        console.error("Email send failed:", emailError.message);
        // Fallback to demo if email fails
        res.status(200).json({
          success: true,
          message: "OTP generated (email failed, using demo mode)",
          otp,
          mode: "demo",
        });
      }
    } else {
      // ── DEMO MODE: Return OTP in response ──
      res.status(200).json({
        success: true,
        message: "OTP generated successfully (Demo Mode)",
        otp,
        mode: "demo",
        expiresIn: "15 minutes",
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── Reset Password ────────────────────────────────────────────
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "No account found with this email" });
    }

    if (!user.resetToken || user.resetToken !== otp) {
      return res.status(400).json({ message: "Invalid OTP code" });
    }

    if (!user.resetTokenExpiry || new Date() > new Date(user.resetTokenExpiry)) {
      return res.status(400).json({ message: "OTP has expired. Please request a new one." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await User.findByIdAndUpdate(user._id, {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null,
    });

    res.status(200).json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── Update Role (superadmin only) ────────────────────────────
export const updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const validRoles = ["user", "admin", "superadmin"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: `Invalid role. Must be: ${validRoles.join(", ")}` });
    }

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Prevent changing own role
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot change your own role" });
    }

    const updated = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true }
    ).select("-password -resetToken -resetTokenExpiry");

    res.status(200).json({
      success: true,
      message: `Role updated to '${role}' successfully`,
      user: updated,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
