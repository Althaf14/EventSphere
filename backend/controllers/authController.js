const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        if (!user.isActive) {
            res.status(403);
            throw new Error('Your account has been suspended. Please contact an administrator.');
        }

        // Faculty approval check removed from login - unapproved faculty can use student features
        // if (!user.isApproved) {
        //     res.status(401);
        //     throw new Error('Your account is pending approval...');
        // }

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isApproved: user.isApproved,
            token: generateToken(user._id),
        });
    } else {
        res.status(401);
        throw new Error('Invalid email or password');
    }
});

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, role, department } = req.body;

    // Password validation
    const passwordRegex = /[!@#$%^&*(),.?":{}|<>]/;
    if (password.length < 6) {
        res.status(400);
        throw new Error('Password must be at least 6 characters long');
    }
    if (!passwordRegex.test(password)) {
        res.status(400);
        throw new Error('Password must contain at least one special character');
    }

    // Only allow student and faculty registration publicly
    if (role !== 'student' && role !== 'faculty') {
        res.status(400);
        throw new Error('Only student and faculty registration is allowed. Admins/Coordinators must be added by an existing admin.');
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    const user = await User.create({
        name,
        email,
        password,
        role,
        department,
        isApproved: role === 'faculty' ? false : true,
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            department: user.department,
            department: user.department,
            isApproved: user.isApproved,
            token: generateToken(user._id),
            message: user.isApproved ? 'Registration successful' : 'Registration successful. Your account is pending approval.'
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Admin)
const getUsers = asyncHandler(async (req, res) => {
    const users = await User.find({});
    res.json(users);
});

module.exports = { authUser, registerUser, getUsers };
