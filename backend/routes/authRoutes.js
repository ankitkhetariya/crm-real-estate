const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

// 1. Register Route (🔒 PROTECTED: Only Logged-in Admins can access)
router.post("/register", protect, authController.register);

// 2. Login Route (Public)
router.post("/login", authController.login);

// 3. Current User Route (Protected)
router.get("/me", protect, authController.getCurrentUser);

// 4. Forgot Password Route (Public)
router.post("/forgot-password", authController.forgotPassword);

// 5. Reset Password Route (Public)
router.post("/reset-password", authController.resetPassword);

// --- NEW SETTINGS ROUTES (Protected) ---

// 6. Update Profile (Name & Phone ONLY)
// Note: This no longer handles email updates directly
router.put("/profile", protect, authController.updateProfile);

// 7. Request Email Change (Sends OTP to new email)
router.post(
  "/request-email-change",
  protect,
  authController.requestEmailChange,
);

// 8. Verify Email Change (Finalizes the update)
router.put("/verify-email-change", protect, authController.verifyEmailChange);

// 9. Change Password (Logged in User)
router.put("/update-password", protect, authController.changePassword);

module.exports = router;
