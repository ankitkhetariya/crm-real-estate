const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// --- 1. REGISTER USER ---
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    
    // Basic Validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword, phone });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Register Error:', err);
    res.status(500).json({ error: 'Server error during registration' });
  }
};

// --- 2. LOGIN USER ---
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
      { expiresIn: "1d" }
    );

    res.json({ 
      token, 
      user: { id: user._id, name: user.name, email: user.email, role: user.role } 
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ error: "Server error during login" });
  }
};

// --- 3. GET CURRENT USER ---
exports.getCurrentUser = async (req, res) => {
  try {
    // req.user.id middleware se aa raha hai
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error('Get User Error:', err);
    res.status(500).json({ error: 'Server Error' });
  }
};

// --- 4. FORGOT PASSWORD (EMAIL SENDING) ---
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found with this email" });
    }

    // Nodemailer Setup
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Email Content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Reset Password Request',
      text: `Hello ${user.name},\n\nYou requested a password reset.\nClick here: http://localhost:5173/reset-password\n\n(This is an automated email)`
    };

    // Send Email
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully to: ${email}`);
    
    res.status(200).json({ message: "Password reset link sent to email 📧" });

  } catch (err) {
    console.error("Email Error:", err);
    res.status(500).json({ error: "Failed to send email. Check backend console." });
  }
};

// --- 5. RESET PASSWORD (ACTUAL UPDATE) ---
exports.resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    // Validation
    if (!email || !newPassword) {
      return res.status(400).json({ error: "Email and New Password are required" });
    }

    // 1. User dhundo
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // 2. Naya Password Hash karo
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 3. Update karo
    user.password = hashedPassword;
    await user.save();

    console.log(`✅ Password updated successfully for: ${email}`);
    res.status(200).json({ message: "Password updated successfully" });

  } catch (err) {
    console.error("Reset Password Error:", err);
    res.status(500).json({ error: "Server Error" });
  }
};

// 👇👇👇 NEW SETTINGS MODULE FUNCTIONS 👇👇👇

// --- 6. UPDATE PROFILE (Name/Email) ---
exports.updateProfile = async (req, res) => {
    try {
        const { name, email } = req.body;
        // User ID Middleware se lo (Support both .id and .userId just in case)
        const userId = req.user.id || req.user._id || req.user.userId;

        // User update karo
        const user = await User.findByIdAndUpdate(
            userId, 
            { name, email }, 
            { new: true, runValidators: true } // Return updated data
        ).select("-password"); // Password return mat karna

        res.status(200).json({ message: "Profile Updated", user });

    } catch (error) {
        console.error("Update Profile Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// --- 7. CHANGE PASSWORD (Logged In User) ---
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id || req.user._id || req.user.userId;

        const user = await User.findById(userId);

        // 1. Purana Password Check
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Incorrect current password" }); // Use 'message' for frontend toast
        }

        // 2. Naya Password Hash & Save
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        
        await user.save();

        res.status(200).json({ message: "Password Changed Successfully" });

    } catch (error) {
        console.error("Change Password Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};