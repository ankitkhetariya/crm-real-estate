const express = require('express');
const router = express.Router();
const { 
    createTask, 
    getAllTasks, 
    getTaskById, 
    updateTask, 
    deleteTask 
} = require('../controllers/taskController');

// ✅ Middleware Import (Destructuring zaroori hai)
const { protect } = require('../middleware/authMiddleware');

// 🔒 Security: Sabhi routes par login zaroori hai
router.use(protect);

// Routes
router.post('/', createTask);       // Create Task
router.get('/', getAllTasks);       // Get All Tasks
router.get('/:id', getTaskById);    // Get Single Task
router.put('/:id', updateTask);     // Update Task
router.delete('/:id', deleteTask);  // Delete Task

module.exports = router;