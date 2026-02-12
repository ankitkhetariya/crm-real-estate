const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

// --- HELPER: Create Transporter ---
const getTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// --- 1. REGISTER USER (Unchanged) ---
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      role: role || "agent",
    });

    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).json({ error: "Server error during registration" });
  }
};

// --- 2. LOGIN USER (Unchanged) ---
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and Password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "30d" },
    );

    res.json({
      token,
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ error: "Server error during login" });
  }
};

// --- 3. GET CURRENT USER (Unchanged) ---
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (err) {
    console.error("Get User Error:", err);
    res.status(500).json({ error: "Server Error" });
  }
};

// --- 4. FORGOT PASSWORD (Unchanged) ---
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found with this email" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.resetPasswordOtp = otp;
    user.resetPasswordOtpExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    const transporter = getTransporter();

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset Code",
      text: `Hello ${user.name},\n\nYour One-Time Password (OTP) for resetting your password is:\n\n${otp}\n\nThis code expires in 10 minutes. Do not share this with anyone.`,
    });

    console.log(`Password OTP sent to: ${email}`);
    res.status(200).json({ message: "OTP sent to your email" });
  } catch (err) {
    console.error("Email Error:", err);
    res
      .status(500)
      .json({ error: "Failed to send email. Check backend logs." });
  }
};

// --- 5. RESET PASSWORD (Unchanged) ---
exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!user.resetPasswordOtp || user.resetPasswordOtp !== otp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    if (user.resetPasswordOtpExpires < Date.now()) {
      return res.status(400).json({ error: "OTP has expired" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    user.resetPasswordOtp = null;
    user.resetPasswordOtpExpires = null;

    await user.save();

    console.log(`Password updated successfully for: ${email}`);
    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Reset Password Error:", err);
    res.status(500).json({ error: "Server Error" });
  }
};

// ==========================================================
//  CHANGED LOGIC STARTS HERE (To separate Phone vs Email)
// ==========================================================

// --- 6. UPDATE PROFILE (Only Name & Phone) ---
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const userId = req.user.id || req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ Update Name and Phone IMMEDIATELY
    if (name) user.name = name;
    if (phone) user.phone = phone;

    await user.save();

    const responseUser = {
      _id: user._id,
      name: user.name,
      email: user.email, // Email remains unchanged here
      phone: user.phone,
      role: user.role,
    };

    res.status(200).json({
      message: "Profile details updated successfully",
      user: responseUser,
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// --- 7. NEW: REQUEST EMAIL CHANGE (Sends OTP) ---
exports.requestEmailChange = async (req, res) => {
  try {
    const { newEmail } = req.body;
    const userId = req.user.id || req.user._id;

    if (!newEmail) {
      return res.status(400).json({ message: "New email is required" });
    }

    const existingUser = await User.findOne({ email: newEmail });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use." });
    }

    const user = await User.findById(userId);

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save to temp fields
    user.tempEmail = newEmail;
    user.emailOtp = otp;
    user.emailOtpExpires = Date.now() + 10 * 60 * 1000;

    await user.save();

    // Send OTP
    const transporter = getTransporter();
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: newEmail, // Send to the NEW email
      subject: "Verify Email Change",
      text: `Your verification code is: ${otp}\n\nThis code expires in 10 minutes.`,
    });

    res.status(200).json({ message: "OTP sent to new email" });
  } catch (error) {
    console.error("Request Email Change Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// --- 8. VERIFY EMAIL CHANGE (Finalize Update) ---
exports.verifyEmailChange = async (req, res) => {
  try {
    const { otp } = req.body;
    const userId = req.user.id || req.user._id;

    const user = await User.findById(userId);

    if (!user.tempEmail || !user.emailOtp) {
      return res
        .status(400)
        .json({ message: "No pending email change request found." });
    }

    if (user.emailOtp !== otp) {
      return res.status(400).json({ message: "Invalid verification code." });
    }

    if (user.emailOtpExpires < Date.now()) {
      return res
        .status(400)
        .json({ message: "Verification code has expired." });
    }

    // Success: Update the real email
    user.email = user.tempEmail;
    user.tempEmail = null;
    user.emailOtp = null;
    user.emailOtpExpires = null;

    await user.save();

    res.status(200).json({
      message: "Email changed successfully!",
      email: user.email,
    });
  } catch (error) {
    console.error("Verify Email Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// --- 9. CHANGE PASSWORD (Unchanged) ---
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id || req.user._id;

    const user = await User.findById(userId);

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect current password" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    await user.save();

    res.status(200).json({ message: "Password Changed Successfully" });
  } catch (error) {
    console.error("Change Password Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
