const express = require('express');
const router = express.Router();
const leadController = require('../controllers/leadController');
const { protect } = require('../middleware/authMiddleware');

// Sabhi routes ko protect middleware se guzaarna
router.use(protect);

// 1. Create New Lead
router.post('/', leadController.createLead);

// 2. Get All Leads
router.get('/', leadController.getAllLeads);

// 3. Dashboard Stats (Hamesha ID se upar)
router.get('/stats', leadController.getDashboardStats); 

// 4. DELETE ALL 
router.delete('/delete-all', leadController.deleteAllLeads); 

// 5. Single Lead Operations (Dynamic ID routes hamesha niche)
router.get('/:id', leadController.getLeadById);
router.put('/:id', leadController.updateLead);
router.delete('/:id', leadController.deleteLead);

module.exports = router;