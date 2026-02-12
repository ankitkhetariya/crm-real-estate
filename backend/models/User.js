const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
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
  // If the user is an Admin or Manager, this stays null
  managedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  // --- Fields for Secure Updates ---

  // Store the new email here until it's verified via OTP
  tempEmail: {
    type: String,
    default: null,
  },
  emailOtp: {
    type: String,
    default: null,
  },
  emailOtpExpires: {
    type: Date,
    default: null,
  },

  // Store OTP for password resets (Forgot Password flow)
  resetPasswordOtp: {
    type: String,
    default: null,
  },
  resetPasswordOtpExpires: {
    type: Date,
    default: null,
  },
});

module.exports = mongoose.model("User", userSchema);
