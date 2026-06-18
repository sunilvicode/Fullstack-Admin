import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },

    // ── ROLE FIELD ──────────────────────────────────
    // 'user'       → normal registered user
    // 'admin'      → can view all users
    // 'superadmin' → full CRUD + can change roles
    role: {
      type: String,
      enum: ["user", "admin", "superadmin"],
      default: "user",
    },

    resetToken: {
      type: String,
      default: null,
    },
    resetTokenExpiry: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("User", UserSchema);
