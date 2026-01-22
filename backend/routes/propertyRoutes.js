const express = require('express');
const router = express.Router();
const { 
    createProperty, 
    getAllProperties, 
    getPropertyById, 
    updateProperty, 
    deleteProperty,
    deleteAllProperties // ✅ 1. Import New Function
} = require('../controllers/propertyController');

const { protect } = require('../middleware/authMiddleware');

// Saare routes password protected hain
router.use(protect);

router.post('/', createProperty);
router.get('/', getAllProperties);

// 🗑️ ✅ 2. DELETE ALL ROUTE (Isse /:id se PEHLE rakhna zaroori hai)
router.delete('/delete-all', deleteAllProperties);

// 👇 ID wale routes (Inke neeche rakhna)
router.get('/:id', getPropertyById);
router.put('/:id', updateProperty);
router.delete('/:id', deleteProperty);

module.exports = router;