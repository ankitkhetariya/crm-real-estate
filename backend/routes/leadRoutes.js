const express = require('express');
const router = express.Router();
const leadController = require('../controllers/leadController');
const { protect } = require('../middleware/authMiddleware');

// 1. Create New Lead
router.post('/', protect, leadController.createLead);

// 2. Get All Leads
router.get('/', protect, leadController.getAllLeads);

// 👇👇👇 NAYA ROUTE (Dashboard Stats ke liye) 👇👇👇
// Isse hamesha '/:id' wale se upar rakhna zaroori hai
router.get('/stats', protect, leadController.getDashboardStats); 

// 3. Single Lead Operations (ID wale routes)
router.get('/:id', protect, leadController.getLeadById);
router.put('/:id', protect, leadController.updateLead);
router.delete('/:id', protect, leadController.deleteLead);
router.delete('/delete-all', protect, leadController.deleteAllLeads);

module.exports = router;