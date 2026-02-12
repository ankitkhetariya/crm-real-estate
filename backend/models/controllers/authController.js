const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// --- 1. REGISTER USER ---
exports.register = async (req, res) => {
  try {
    // ✅ Change 1: 'role' bhi accept karein
    const { name, email, password, phone, role } = req.body;
    
    // Basic Validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Change 2: Role save karein (Agar nahi aaya toh default 'agent')
    const newUser = new User({ 
        name, 
        email, 
        password: hashedPassword, 
        phone,
        role: role || 'agent' 
    });
    
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
      { expiresIn: "30d" } // Thoda lamba time rakhein (1 month)
    );

    // ✅ Change 3: Response Structure Frontend ke hisab se set kiya
    res.json({ 
      token,
      _id: user._id,
      name: user.name, 
      email: user.email, 
      role: user.role // <--- Ye line zaroori hai Frontend ke liye
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ error: "Server error during login" });
  }
};

// --- 3. GET CURRENT USER ---
exports.getCurrentUser = async (req, res) => {
  try {
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

// --- 4. FORGOT PASSWORD ---
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found with this email" });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Reset Password Request',
      text: `Hello ${user.name},\n\nYou requested a password reset.\nClick here: http://localhost:5173/reset-password\n\n(This is an automated email)`
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully to: ${email}`);
    
    res.status(200).json({ message: "Password reset link sent to email 📧" });

  } catch (err) {
    console.error("Email Error:", err);
    res.status(500).json({ error: "Failed to send email. Check backend console." });
  }
};

// --- 5. RESET PASSWORD ---
exports.resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    if (!email || !newPassword) {
      return res.status(400).json({ error: "Email and New Password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    await user.save();

    console.log(` Password updated successfully for: ${email}`);
    res.status(200).json({ message: "Password updated successfully" });

  } catch (err) {
    console.error("Reset Password Error:", err);
    res.status(500).json({ error: "Server Error" });
  }
};

// --- 6. UPDATE PROFILE ---
exports.updateProfile = async (req, res) => {
    try {
        const { name, email } = req.body;
        const userId = req.user.id || req.user._id || req.user.userId;

        const user = await User.findByIdAndUpdate(
            userId, 
            { name, email }, 
            { new: true, runValidators: true }
        ).select("-password");

        res.status(200).json({ message: "Profile Updated", user });

    } catch (error) {
        console.error("Update Profile Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// --- 7. CHANGE PASSWORD ---
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id || req.user._id || req.user.userId;

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