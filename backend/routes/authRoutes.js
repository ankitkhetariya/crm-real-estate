const express = require('express');
const router = express.Router();
// Hum controller se saare functions import kar rahe hain
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware'); 

// 1. Register Route
router.post('/register', authController.register);

// 2. Login Route
router.post('/login', authController.login);

// 3. Current User Route (Protected)
router.get('/me', protect, authController.getCurrentUser);

// 4. Forgot Password Route
router.post('/forgot-password', authController.forgotPassword);

// 5. Reset Password Route
router.post('/reset-password', authController.resetPassword);

// NEW SETTINGS ROUTES (Protected)

// 6. Update Profile (Name/Email)
router.put('/profile', protect, authController.updateProfile);

// 7. Change Password (Logged in User)
router.put('/update-password', protect, authController.changePassword);

module.exports = router;