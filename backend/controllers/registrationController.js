const asyncHandler = require('express-async-handler');
const Registration = require('../models/Registration');
const Event = require('../models/Event');

// @desc    Register user for an event
// @route   POST /api/registrations/:eventId
// @access  Private (Student)
const registerEvent = asyncHandler(async (req, res) => {
    const { eventId } = req.params;
    const userId = req.user._id;

    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
        res.status(404);
        throw new Error('Event not found');
    }

    // Check if event is approved
    if (event.status !== 'approved') {
        res.status(400);
        throw new Error('Cannot register for an unapproved event');
    }

    // Check if user already registered
    const existingRegistration = await Registration.findOne({ user: userId, event: eventId });
    if (existingRegistration) {
        res.status(400);
        throw new Error('User already registered for this event');
    }

    const registration = await Registration.create({
        user: userId,
        event: eventId,
    });

    res.status(201).json(registration);
});

// @desc    Get logged-in user's registrations
// @route   GET /api/registrations/my
// @access  Private
const getMyRegistrations = asyncHandler(async (req, res) => {
    const registrations = await Registration.find({ user: req.user._id })
        .populate('event', 'title eventDate startTime venue status')
        .sort({ registeredAt: -1 });
    res.json(registrations);
});

// @desc    Get all registrations for an event (Faculty/Admin/Coordinator)
// @route   GET /api/registrations/event/:eventId
// @access  Private (Faculty/Admin/Coordinator)
const getEventRegistrations = asyncHandler(async (req, res) => {
    const { eventId } = req.params;

    const event = await Event.findById(eventId);
    if (!event) {
        res.status(404);
        throw new Error('Event not found');
    }

    // Auth Check
    const isCreator = event.createdBy.toString() === req.user._id.toString();
    const isCoordinator = event.coordinators && event.coordinators.some(c => c.toString() === req.user._id.toString());
    const isAdmin = req.user.role === 'admin';

    if (!isCreator && !isCoordinator && !isAdmin) {
        res.status(401);
        throw new Error('Not authorized to view registrations');
    }

    const registrations = await Registration.find({ event: eventId })
        .populate('user', 'name email department')
        .sort({ registeredAt: -1 });

    res.json(registrations);
});

// @desc    Mark attendance
// @route   PUT /api/registrations/:id/attendance
// @access  Private (Faculty/Admin/Coordinator)
const markAttendance = asyncHandler(async (req, res) => {
    const registration = await Registration.findById(req.params.id).populate('event');

    if (!registration) {
        res.status(404);
        throw new Error('Registration not found');
    }

    const event = registration.event;

    // Auth Check
    const isCreator = event.createdBy.toString() === req.user._id.toString();
    const isCoordinator = event.coordinators && event.coordinators.some(c => c.toString() === req.user._id.toString());
    const isAdmin = req.user.role === 'admin';

    if (!isCreator && !isCoordinator && !isAdmin) {
        res.status(401);
        throw new Error('Not authorized to mark attendance');
    }

    registration.attendance = req.body.attendance !== undefined ? req.body.attendance : !registration.attendance;
    const updatedRegistration = await registration.save();
    res.json(updatedRegistration);
});

// @desc    Get certificate data
// @route   GET /api/registrations/:id/certificate
// @access  Private
const getCertificate = asyncHandler(async (req, res) => {
    const registration = await Registration.findById(req.params.id)
        .populate('user', 'name')
        .populate('event', 'title date venue');

    if (!registration) {
        res.status(404);
        throw new Error('Registration not found');
    }

    if (registration.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin' && req.user.role !== 'faculty') {
        res.status(401);
        throw new Error('Not authorized');
    }

    if (!registration.attendance) {
        res.status(400);
        throw new Error('Attendance not marked. Cannot generate certificate.');
    }

    res.json({
        id: registration._id,
        studentName: registration.user.name,
        eventName: registration.event.title,
        date: registration.event.date,
        venue: registration.event.venue,
        issuedDate: new Date(),
    });
});

module.exports = { registerEvent, getMyRegistrations, getEventRegistrations, markAttendance, getCertificate };
