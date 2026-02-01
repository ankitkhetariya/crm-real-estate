const express = require('express');
const router = express.Router();
const { 
    createLead, 
    getAllLeads, 
    getDashboardStats, 
    deleteAllLeads, 
    getLeadById, 
    updateLead, 
    deleteLead 
} = require('../controllers/leadController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

// Ensure these functions are actually defined in the controller!
router.post('/', createLead); 
router.get('/', getAllLeads);
router.get('/stats', getDashboardStats);
router.delete('/delete-all', deleteAllLeads);
router.get('/:id', getLeadById);
router.put('/:id', updateLead);
router.delete('/:id', deleteLead);

module.exports = router;