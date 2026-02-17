const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");

// ✅ Import the new functions from adminController
const {
  getAdminMasterStats,
  assignTeam,
  updateUserRole, // NEW: Role change karne ke liye
  deleteUser, // NEW: Employee ko fire karne ke liye
} = require("../controllers/adminController");

// Ye line ensure karti hai ki bina token ke koi yahan na aa paye
router.use(protect);

// 1. Get Master Dashboard Data
//  This MUST match your API.get('/admin/master-dashboard') in React
router.get("/master-dashboard", getAdminMasterStats);

// 2. Assign Agents to Manager
router.put("/assign-team", assignTeam);

// --- NEW GOD MODE ROUTES ---

// 3. Update Employee Role (Agent <-> Manager)
// Match: API.put(`/admin/users/${userId}/role`)
router.put("/users/:id/role", updateUserRole);

// 4. Fire / Delete Employee
// Match: API.delete(`/admin/users/${userId}`)
router.delete("/users/:id", deleteUser);

module.exports = router;
