const express = require('express');
const router = express.Router();
const { protect, admin, facultyOrAdmin } = require('../middleware/authMiddleware');
const {
    getUsers,
    updateUserRole,
    toggleUserStatus,
    deleteUser,
    getAuditLogs,
    getPendingUsers,
    approveUser,
    rejectUser,
} = require('../controllers/adminController');

// Routes accessible by Faculty and Admin
router.get('/pending-users', protect, facultyOrAdmin, getPendingUsers);
router.put('/users/:id/approve', protect, facultyOrAdmin, approveUser);
router.delete('/users/:id/reject', protect, facultyOrAdmin, rejectUser);

// Routes restricted to Admin only
router.get('/users', protect, admin, getUsers);
router.put('/users/:id/role', protect, admin, updateUserRole);
router.put('/users/:id/toggle-status', protect, admin, toggleUserStatus);
router.delete('/users/:id', protect, admin, deleteUser);
router.get('/audit-logs', protect, admin, getAuditLogs);

module.exports = router;
