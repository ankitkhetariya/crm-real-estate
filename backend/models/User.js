const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
    },
    role: {
      type: String,
      enum: ["admin", "agent", "manager"],
      default: "agent",
    },

    // Self-reference to store the manager's ID
    managedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // --- Fields for Secure Updates ---
    tempEmail: { type: String, default: null },
    emailOtp: { type: String, default: null },
    emailOtpExpires: { type: Date, default: null },

    resetPasswordOtp: { type: String, default: null },
    resetPasswordOtpExpires: { type: Date, default: null },
  },
  // This adds both 'createdAt' and 'updatedAt' automatically
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
