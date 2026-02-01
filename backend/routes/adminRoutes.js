const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

// ✅ Import the new function name
const { 
    getAdminMasterStats, 
    assignTeam 
} = require('../controllers/adminController');

router.use(protect);

// ✅ This MUST match your API.get('/admin/master-dashboard') in React
router.get('/master-dashboard', getAdminMasterStats);

router.put('/assign-team', assignTeam);

module.exports = router;