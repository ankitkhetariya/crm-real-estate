// backend/routes/managerRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
// ✅ Fast fix: Import the whole controller object to avoid undefined errors
const managerController = require('../controllers/managerController');

// Check line 8: We use managerController.getMyAgents
// If this still crashes, getMyAgents is NOT exported in the controller
router.get('/my-agents', protect, managerController.getMyAgents); 

module.exports = router;