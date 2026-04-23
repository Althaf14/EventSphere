const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

// Helper: create audit log entry
const logAction = async (action, performedBy, targetUser, details) => {
    await AuditLog.create({ action, performedBy, targetUser, details });
};

// @desc    Get all users (with optional search/filter)
// @route   GET /api/admin/users
// @access  Admin only
const getUsers = asyncHandler(async (req, res) => {
    const { role, search } = req.query;
    const query = {};

    if (role && role !== 'all') query.role = role;
    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
        ];
    }

    const users = await User.find(query).select('-password').sort({ createdAt: -1 });
    res.json(users);
});

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Admin only
const updateUserRole = asyncHandler(async (req, res) => {
    const { role } = req.body;
    const validRoles = ['student', 'faculty', 'admin', 'coordinator'];

    if (!validRoles.includes(role)) {
        res.status(400);
        throw new Error('Invalid role');
    }

    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    const oldRole = user.role;
    user.role = role;
    await user.save();

    await logAction(
        'USER_ROLE_CHANGED',
        req.user._id,
        user._id,
        `Role changed from "${oldRole}" to "${role}" for user ${user.name} (${user.email})`
    );

    res.json(user);
});

// @desc    Toggle user active/suspended status
// @route   PUT /api/admin/users/:id/toggle-status
// @access  Admin only
const toggleUserStatus = asyncHandler(async (req, res) => {
    if (req.params.id === req.user._id.toString()) {
        res.status(400);
        throw new Error('You cannot suspend yourself');
    }

    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    user.isActive = !user.isActive;
    await user.save();

    const action = user.isActive ? 'USER_ACTIVATED' : 'USER_SUSPENDED';
    await logAction(
        action,
        req.user._id,
        user._id,
        `${user.name} (${user.email}) has been ${user.isActive ? 'activated' : 'suspended'}`
    );

    res.json(user);
});

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
// @access  Admin only
const deleteUser = asyncHandler(async (req, res) => {
    if (req.params.id === req.user._id.toString()) {
        res.status(400);
        throw new Error('You cannot delete yourself');
    }

    const user = await User.findById(req.params.id);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    await logAction(
        'USER_DELETED',
        req.user._id,
        null,
        `User ${user.name} (${user.email}) with role "${user.role}" was deleted`
    );

    await user.deleteOne();
    res.json({ message: 'User removed' });
});

// @desc    Get audit logs
// @route   GET /api/admin/audit-logs
// @access  Admin only
const getAuditLogs = asyncHandler(async (req, res) => {
    const { action, page = 1, limit = 20 } = req.query;
    const query = {};

    if (action && action !== 'all') query.action = action;

    const total = await AuditLog.countDocuments(query);
    const logs = await AuditLog.find(query)
        .populate('performedBy', 'name email')
        .populate('targetUser', 'name email')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit));

    res.json({ logs, total, page: Number(page), pages: Math.ceil(total / limit) });
});

// @desc    Get pending users (unapproved faculty)
// @route   GET /api/admin/pending-users
// @access  Faculty or Admin
const getPendingUsers = asyncHandler(async (req, res) => {
    const users = await User.find({ isApproved: false }).select('-password').sort({ createdAt: -1 });
    res.json(users);
});

// @desc    Approve a user
// @route   PUT /api/admin/users/:id/approve
// @access  Faculty or Admin
const approveUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    if (user.isApproved) {
        res.status(400);
        throw new Error('User is already approved');
    }

    user.isApproved = true;
    await user.save();

    await logAction(
        'USER_APPROVED',
        req.user._id,
        user._id,
        `Faculty member ${user.name} (${user.email}) has been approved by ${req.user.name}`
    );

    res.json(user);
});

// @desc    Reject/Delete a pending user
// @route   DELETE /api/admin/users/:id/reject
// @access  Faculty or Admin
const rejectUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    if (user.isApproved) {
        res.status(400);
        throw new Error('Cannot reject an already approved user. Use the main users list to manage approved accounts.');
    }

    await logAction(
        'USER_REJECTED',
        req.user._id,
        null,
        `Faculty registration for ${user.name} (${user.email}) was rejected/deleted by ${req.user.name}`
    );

    await user.deleteOne();
    res.json({ message: 'Registration request rejected and user deleted' });
});

module.exports = {
    getUsers,
    updateUserRole,
    toggleUserStatus,
    deleteUser,
    getAuditLogs,
    getPendingUsers,
    approveUser,
    rejectUser
};
