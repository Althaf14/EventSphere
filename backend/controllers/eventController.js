const asyncHandler = require('express-async-handler');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { checkCertificateEligibility } = require('../utils/certificateUtils');

// @desc    Fetch all approved events (public)
// @route   GET /api/events
// @access  Public
const getEvents = asyncHandler(async (req, res) => {
    const events = await Event.find({ status: { $nin: ['pending', 'Rejected'] } }).sort({ eventDate: 1 }).populate('createdBy', 'name email');
    res.json(events);
});

// @desc    Get event by ID
// @route   GET /api/events/:id
// @access  Public
const getEventById = asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id)
        .populate('createdBy', 'name email')
        .populate('coordinators', 'name email role department');

    if (event) {
        // If event is MULTI, fetch sub-events
        let subEvents = [];
        if (event.eventType === 'MULTI') {
            subEvents = await Event.find({ parentEvent: event._id })
                .sort({ eventDate: 1, startTime: 1 })
                .populate('createdBy', 'name email');
        }

        res.json({
            ...event.toObject(),
            subEvents: event.eventType === 'MULTI' ? subEvents : undefined
        });
    } else {
        res.status(404);
        throw new Error('Event not found');
    }
});

// @desc    Create a new event
// @route   POST /api/events
// @access  Private (Faculty/Admin)
const createEvent = asyncHandler(async (req, res) => {
    const {
        title,
        description,
        category,
        department,
        venue,
        eventDate,
        startTime,
        endTime,
        maxParticipants,
        eventType,
        parentEvent,
        coordinatorName,
        principalName
    } = req.body;

    if (!title || !eventDate) {
        res.status(400);
        throw new Error('Please provide title and event date');
    }

    // Validation for eventType and parentEvent
    const finalEventType = eventType || 'SINGLE';

    // Rule: MULTI events cannot have a parentEvent
    if (finalEventType === 'MULTI' && parentEvent) {
        res.status(400);
        throw new Error('Big Events (MULTI) cannot have a parent event');
    }

    // Rule: If parentEvent is provided, verify it exists and is of type MULTI
    if (parentEvent) {
        const parent = await Event.findById(parentEvent);
        if (!parent) {
            res.status(404);
            throw new Error('Parent event not found');
        }
        if (parent.eventType !== 'MULTI') {
            res.status(400);
            throw new Error('Parent event must be of type MULTI');
        }
    }

    // Determine status based on role
    // Students -> Pending
    // Admin/Faculty/Coordinator -> Upcoming (Approved)
    let initialStatus = 'Upcoming';
    if (req.user.role === 'student') {
        initialStatus = 'pending';
    }

    // Handle file uploads (event image & signatures)
    let eventImage = null;
    let coordinatorSignature = null;
    let principalSignature = null;

    if (req.files) {
        if (req.files['eventImage'] && req.files['eventImage'][0]) {
            eventImage = `/uploads/events/${req.files['eventImage'][0].filename}`;
        }
        if (req.files['coordinatorSignature'] && req.files['coordinatorSignature'][0]) {
            coordinatorSignature = `/uploads/events/${req.files['coordinatorSignature'][0].filename}`;
        }
        if (req.files['principalSignature'] && req.files['principalSignature'][0]) {
            principalSignature = `/uploads/events/${req.files['principalSignature'][0].filename}`;
        }
    } else if (req.file) { // fallback
        eventImage = `/uploads/events/${req.file.filename}`;
    }

    // Parse coordinators if provided (comes as JSON string from FormData)
    let coordinators = [];
    if (req.body.coordinators) {
        try {
            coordinators = JSON.parse(req.body.coordinators);
        } catch (err) {
            // If parsing fails, ignore coordinators
            console.error('Failed to parse coordinators:', err);
        }
    }

    const event = new Event({
        title,
        description,
        category,
        department,
        venue,
        eventDate,
        startTime,
        endTime,
        maxParticipants,
        eventImage,
        createdBy: req.user._id,
        coordinators,
        status: initialStatus,
        eventType: finalEventType,
        parentEvent: parentEvent || null,
        certificateInfo: {
            coordinatorName: coordinatorName || 'Event Coordinator',
            coordinatorSignature: coordinatorSignature,
            principalName: principalName || 'Principal',
            principalSignature: principalSignature
        }
    });

    const createdEvent = await event.save();
    res.status(201).json(createdEvent);
});

// @desc    Get all pending events (Admin only)
// @route   GET /api/events/pending
// @access  Private (Admin)
const getPendingEvents = asyncHandler(async (req, res) => {
    const events = await Event.find({ status: 'pending' }).populate('createdBy', 'name email');
    res.json(events);
});

// @desc    Approve an event
// @route   PUT /api/events/:id/approve
// @access  Private (Admin)
const approveEvent = asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id);

    if (event) {
        event.status = 'Upcoming';
        const updatedEvent = await event.save();
        res.json(updatedEvent);
    } else {
        res.status(404);
        throw new Error('Event not found');
    }
});

// @desc    Reject an event
// @route   PUT /api/events/:id/reject
// @access  Private (Admin)
const rejectEvent = asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id);

    if (event) {
        event.status = 'Rejected';
        const updatedEvent = await event.save();
        res.json(updatedEvent);
    } else {
        res.status(404);
        throw new Error('Event not found');
    }
});

// @desc    Get logged-in user's created events OR events they coordinate
// @route   GET /api/events/my
// @access  Private (Faculty/Admin/Student Coordinator)
const getMyEvents = asyncHandler(async (req, res) => {
    const events = await Event.find({
        $or: [
            { createdBy: req.user._id },
            { coordinators: req.user._id }
        ]
    }).sort({ createdAt: -1 });
    res.json(events);
});

// @desc    Update an event
// @route   PUT /api/events/:id
// @access  Private (Admin or Event Coordinator)
const updateEvent = asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id);

    if (event) {
        // Check authorization: Admin, Event Creator, or Coordinator
        const isCreator = event.createdBy.toString() === req.user._id.toString();
        const isCoordinator = event.coordinators && event.coordinators.some(coord => coord.toString() === req.user._id.toString());
        const isAdmin = req.user.role === 'admin';

        if (!isCreator && !isCoordinator && !isAdmin) {
            res.status(401);
            throw new Error('Not authorized to update this event');
        }

        const {
            title,
            description,
            category,
            department,
            venue,
            eventDate,
            startTime,
            endTime,
            maxParticipants,
            status,
            coordinatorName,
            principalName
        } = req.body;

        if (req.files) {
            if (req.files['eventImage'] && req.files['eventImage'][0]) {
                event.eventImage = `/uploads/events/${req.files['eventImage'][0].filename}`;
            }
            if (req.files['coordinatorSignature'] && req.files['coordinatorSignature'][0]) {
                if (!event.certificateInfo) event.certificateInfo = {};
                event.certificateInfo.coordinatorSignature = `/uploads/events/${req.files['coordinatorSignature'][0].filename}`;
            }
            if (req.files['principalSignature'] && req.files['principalSignature'][0]) {
                if (!event.certificateInfo) event.certificateInfo = {};
                event.certificateInfo.principalSignature = `/uploads/events/${req.files['principalSignature'][0].filename}`;
            }
        } else if (req.file) { // fallback
            event.eventImage = `/uploads/events/${req.file.filename}`;
        }

        if (coordinatorName !== undefined) {
            if (!event.certificateInfo) event.certificateInfo = {};
            event.certificateInfo.coordinatorName = coordinatorName;
        }
        if (principalName !== undefined) {
            if (!event.certificateInfo) event.certificateInfo = {};
            event.certificateInfo.principalName = principalName;
        }

        event.title = title || event.title;
        event.description = description || event.description;
        event.category = category || event.category;
        event.department = department || event.department;
        event.venue = venue || event.venue;
        event.eventDate = eventDate || event.eventDate;
        event.startTime = startTime || event.startTime;
        event.endTime = endTime || event.endTime;
        event.maxParticipants = maxParticipants || event.maxParticipants;
        event.status = status || event.status;

        const updatedEvent = await event.save();
        res.json(updatedEvent);
    } else {
        res.status(404);
        throw new Error('Event not found');
    }
});

// @desc    Delete an event
// @route   DELETE /api/events/:id
// @access  Private (Admin)
const deleteEvent = asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id);

    if (event) {
        await event.deleteOne();
        res.json({ message: 'Event removed' });
    } else {
        res.status(404);
        throw new Error('Event not found');
    }
});

// @desc    Register for an event
// @route   POST /api/events/:id/register
// @access  Private (Student)
const registerForEvent = asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id);

    if (!event) {
        res.status(404);
        throw new Error('Event not found');
    }

    // Block registration for MULTI events (Big Events)
    if (event.eventType === 'MULTI') {
        res.status(400);
        throw new Error('Cannot register for Big Events. Please register for individual sub-events.');
    }

    // Check if user is a student
    if (req.user.role !== 'student') {
        res.status(403); // Forbidden
        throw new Error('Only students can register for events');
    }

    // Check if event is upcoming or approved
    if (event.status !== 'Upcoming' && event.status !== 'approved') {
        res.status(400);
        throw new Error('Cannot register. Event is not Upcoming or Approved');
    }

    // Check capacity
    if (event.maxParticipants && event.registeredCount >= event.maxParticipants) {
        res.status(400);
        throw new Error('Event is full');
    }

    // Check validation for duplicate registration handled by database unique index, 
    // but explicit check is friendlier.
    const existingRegistration = await Registration.findOne({
        event: event._id,
        user: req.user._id
    });

    if (existingRegistration) {
        res.status(400);
        throw new Error('You are already registered for this event');
    }

    // Create Registration
    const registration = await Registration.create({
        event: event._id,
        user: req.user._id,
    });

    if (registration) {
        // Increment registered count
        event.registeredCount = (event.registeredCount || 0) + 1;
        await event.save();

        res.status(201).json({
            message: 'Registration successful',
            registration
        });
    } else {
        res.status(400);
        throw new Error('Invalid registration data');
    }
});

// @desc    Unregister from an event
// @route   DELETE /api/events/:id/unregister
// @access  Private (Student)
const unregisterFromEvent = asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id);

    if (!event) {
        res.status(404);
        throw new Error('Event not found');
    }

    // Check if user is a student
    if (req.user.role !== 'student') {
        res.status(403);
        throw new Error('Only students can unregister from events');
    }

    // Check if registration exists
    const registration = await Registration.findOne({
        event: event._id,
        user: req.user._id
    });

    if (!registration) {
        res.status(400);
        throw new Error('You are not registered for this event');
    }

    // Delete Registration
    await registration.deleteOne();

    // Decrement registered count
    if (event.registeredCount > 0) {
        event.registeredCount = event.registeredCount - 1;
        await event.save();
    }

    res.json({ message: 'Successfully unregistered from event' });
});

// @desc    Check if user is registered for an event
// @route   GET /api/events/:id/registration-status
// @access  Private (Student)
const checkRegistrationStatus = asyncHandler(async (req, res) => {
    const registration = await Registration.findOne({
        event: req.params.id,
        user: req.user._id
    });

    res.json({ registered: !!registration });
});

// @desc    Mark attendance for an event
// @route   POST /api/events/:id/attendance
// @access  Private (Admin or Event Creator)
const markEventAttendance = asyncHandler(async (req, res) => {
    const { attendance } = req.body; // Expects [{ studentId, status }]
    const eventId = req.params.id;

    const event = await Event.findById(eventId);

    if (!event) {
        res.status(404);
        throw new Error('Event not found');
    }

    // Authorization: Admin, Creator, or Coordinator
    const isCreator = event.createdBy.toString() === req.user._id.toString();
    const isCoordinator = event.coordinators && event.coordinators.some(coord => coord.toString() === req.user._id.toString());
    const isAdmin = req.user.role === 'admin';

    if (!isCreator && !isCoordinator && !isAdmin) {
        res.status(401);
        throw new Error('Not authorized to mark attendance for this event');
    }

    // Role check: Only Faculty, Coordinator, or Admin can mark attendance
    if (req.user.role === 'student' && !isAdmin) {
        res.status(403);
        throw new Error('Students are not authorized to mark attendance, even as coordinators');
    }

    if (!attendance || !Array.isArray(attendance)) {
        res.status(400);
        throw new Error('Invalid attendance data');
    }

    const results = [];

    for (const record of attendance) {
        const { studentId, status } = record;

        // Verify registration
        const isRegistered = await Registration.findOne({ event: eventId, user: studentId });

        if (isRegistered) {
            const att = await Attendance.findOneAndUpdate(
                { event: eventId, student: studentId },
                { status: status || 'Present', markedAt: Date.now() },
                { new: true, upsert: true }
            );

            // Sync with Registration model
            await Registration.findOneAndUpdate(
                { event: eventId, user: studentId },
                { attendance: status === 'Present' || status === undefined }
            );

            results.push(att);
        }
    }

    res.json({ message: `Attendance marked for ${results.length} students`, results });
});

// @desc    Get attendance list for an event
// @route   GET /api/events/:id/attendance
// @access  Private (Admin, Faculty, Event Creator)
const getEventAttendance = asyncHandler(async (req, res) => {
    const eventId = req.params.id;
    const event = await Event.findById(eventId);

    if (!event) {
        res.status(404);
        throw new Error('Event not found');
    }

    // Auth Check: Admin, Faculty, Creator, or Coordinator
    const isCreator = event.createdBy.toString() === req.user._id.toString();
    const isCoordinator = event.coordinators && event.coordinators.some(coord => coord.toString() === req.user._id.toString());
    const isAdminOrFaculty = req.user.role === 'admin' || req.user.role === 'faculty';

    if (!isCreator && !isCoordinator && !isAdminOrFaculty) {
        res.status(401);
        throw new Error('Not authorized to view attendance for this event');
    }

    // Role check: Students only edit details
    if (req.user.role === 'student' && !isAdminOrFaculty) {
        res.status(403);
        throw new Error('Students are not authorized to view registration lists or attendance');
    }

    // Get all registrations to know who SHOULD be there
    const registrations = await Registration.find({ event: eventId })
        .populate('user', 'name department email'); // Assuming User model has these fields

    // Get existing attendance records
    const attendanceRecords = await Attendance.find({ event: eventId });

    // Merge data
    const attendanceList = registrations.map(reg => {
        const record = attendanceRecords.find(
            ar => ar.student.toString() === reg.user._id.toString()
        );

        return {
            studentId: reg.user._id,
            name: reg.user.name,
            email: reg.user.email,
            department: reg.user.department,
            status: record ? record.status : 'Not Marked', // Distinct from 'Absent' if not yet processed
            markedAt: record ? record.markedAt : null
        };
    });

    res.json(attendanceList);
});

// @desc    Get logged-in student's attendance history
// @route   GET /api/my-attendance
// @access  Private (Student)
const getMyAttendance = asyncHandler(async (req, res) => {
    const attendance = await Attendance.find({ student: req.user._id })
        .populate('event', 'title eventDate startTime venue status')
        .sort({ markedAt: -1 });
    res.json(attendance);
});



// @desc    Generate Certificate
// @route   GET /api/events/:id/certificate
// @access  Private (Student Only)
// @desc    Generate Certificate
// @route   GET /api/events/:id/certificate
// @access  Private (Student Only)
const generateCertificate = asyncHandler(async (req, res) => {
    const eventId = req.params.id;
    const studentId = req.user._id;

    // 1. Check Eligibility
    const { eligible, message } = await checkCertificateEligibility(studentId, eventId);

    if (!eligible) {
        res.status(400);
        throw new Error(message || 'Not eligible for certificate');
    }

    const event = await Event.findById(eventId);
    const student = await require('../models/User').findById(studentId);

    // 2. Create PDF
    const doc = new PDFDocument({
        layout: 'landscape',
        size: 'A4',
        margins: { top: 50, bottom: 20, left: 50, right: 50 }
    });

    // 3. Set Response Headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Certificate-${event.title.replace(/ /g, '_')}.pdf`);

    // 4. Pipe Response
    doc.pipe(res);

    // --- PDF Design ---
    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;

    // double border
    doc.lineWidth(3).strokeColor('#1F2937').rect(20, 20, pageWidth - 40, pageHeight - 40).stroke();
    doc.lineWidth(1).strokeColor('#E5E7EB').rect(25, 25, pageWidth - 50, pageHeight - 50).stroke();

    // Header (Event Name)
    doc.moveDown(2);
    doc.font('Times-Bold').fontSize(36).fillColor('#111827').text(event.title.toUpperCase(), { align: 'center' });

    doc.moveDown(0.5);
    // Optional subtitle
    doc.font('Times-Roman').fontSize(14).fillColor('#6B7280').text('OFFICIAL CERTIFICATE OF PARTICIPATION', { align: 'center', characterSpacing: 2 });

    doc.moveDown(2.5);

    // Title
    doc.font('Times-BoldItalic').fontSize(42).fillColor('#1E40AF').text('Certificate of Participation', { align: 'center' });

    doc.moveDown(1.5);

    // Body Text
    doc.font('Times-Roman').fontSize(18).fillColor('#374151').text('This is to certify that', { align: 'center' });

    doc.moveDown(0.8);
    // Student Name
    doc.font('Times-Bold').fontSize(32).fillColor('#111827').text(student.name, { align: 'center' });

    doc.moveDown(0.8);
    doc.font('Times-Roman').fontSize(18).fillColor('#374151').text(`has successfully participated in the event`, { align: 'center' });

    doc.moveDown(0.8);
    // Date
    doc.font('Times-Italic').fontSize(16).fillColor('#4B5563').text(`held on ${new Date(event.eventDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`, { align: 'center' });

    // Signatures
    const bottomY = pageHeight - 115;
    const certInfo = event.certificateInfo || {};
    const coordName = certInfo.coordinatorName || 'Event Coordinator';
    const prinName = certInfo.principalName || 'Principal';

    // Line specifics
    doc.lineWidth(1).strokeColor('#111827');

    // Add Signature Images if they exist
    if (certInfo.coordinatorSignature) {
        const coordSigPath = path.join(__dirname, '..', certInfo.coordinatorSignature);
        if (fs.existsSync(coordSigPath)) {
            const img = doc.openImage(coordSigPath);
            const fitWidth = 200;
            const fitHeight = 45;
            const ratio = Math.min(fitWidth / img.width, fitHeight / img.height);
            const scaledWidth = img.width * ratio;
            const xOffset = (fitWidth - scaledWidth) / 2;
            doc.image(coordSigPath, 80 + xOffset, bottomY - 50, { fit: [fitWidth, fitHeight] });
        }
    }

    if (certInfo.principalSignature) {
        const prinSigPath = path.join(__dirname, '..', certInfo.principalSignature);
        if (fs.existsSync(prinSigPath)) {
            const img = doc.openImage(prinSigPath);
            const fitWidth = 200;
            const fitHeight = 45;
            const ratio = Math.min(fitWidth / img.width, fitHeight / img.height);
            const scaledWidth = img.width * ratio;
            const xOffset = (fitWidth - scaledWidth) / 2;
            doc.image(prinSigPath, (pageWidth - 280) + xOffset, bottomY - 50, { fit: [fitWidth, fitHeight] });
        }
    }

    // Coordinator Sig
    doc.moveTo(80, bottomY).lineTo(280, bottomY).stroke();
    doc.font('Times-Bold').fontSize(14).fillColor('#111827').text(coordName, 80, bottomY + 10, { width: 200, align: 'center' });
    doc.font('Times-Italic').fontSize(12).fillColor('#4B5563').text('Coordinator', 80, bottomY + 28, { width: 200, align: 'center' });

    // Principal Sig
    doc.moveTo(pageWidth - 280, bottomY).lineTo(pageWidth - 80, bottomY).stroke();
    doc.font('Times-Bold').fontSize(14).fillColor('#111827').text(prinName, pageWidth - 280, bottomY + 10, { width: 200, align: 'center' });
    doc.font('Times-Italic').fontSize(12).fillColor('#4B5563').text('Principal', pageWidth - 280, bottomY + 28, { width: 200, align: 'center' });

    // App Name & Date Generated Footer
    doc.font('Times-Roman').fontSize(10).fillColor('#9CA3AF').text(
        `Generated by Event Sphere | Issued on: ${new Date().toLocaleDateString()}`,
        50,
        pageHeight - 35,
        { align: 'center' }
    );

    doc.end();
});

// @desc    Search users by name (for adding coordinators)
// @route   GET /api/events/search-users?name=query
// @access  Private (Faculty/Admin)
const searchUsers = asyncHandler(async (req, res) => {
    const { name } = req.query;

    if (!name || name.trim() === '') {
        res.status(400);
        throw new Error('Please provide a name to search');
    }

    // Search for users with matching name (case-insensitive, partial match)
    // Return faculty, coordinator, admin, and student roles
    const users = await User.find({
        name: { $regex: name, $options: 'i' },
        role: { $in: ['faculty', 'coordinator', 'admin', 'student'] }
    })
        .select('name email role department')
        .limit(10);

    res.json(users);
});

// @desc    Add coordinator to event
// @route   POST /api/events/:id/coordinators
// @access  Private (Event Creator, Existing Coordinator, or Admin)
const addCoordinator = asyncHandler(async (req, res) => {
    const { userId } = req.body;
    const eventId = req.params.id;

    if (!userId) {
        res.status(400);
        throw new Error('Please provide a user ID');
    }

    const event = await Event.findById(eventId);

    if (!event) {
        res.status(404);
        throw new Error('Event not found');
    }

    // Authorization: Event creator, existing coordinator, or admin
    const isCreator = event.createdBy.toString() === req.user._id.toString();
    const isCoordinator = event.coordinators.some(coord => coord.toString() === req.user._id.toString());
    const isAdmin = req.user.role === 'admin';

    if (!isCreator && !isCoordinator && !isAdmin) {
        res.status(401);
        throw new Error('Not authorized to add coordinators to this event');
    }

    // Verify target user exists
    const targetUser = await User.findById(userId);
    if (!targetUser) {
        res.status(404);
        throw new Error('User not found');
    }

    // Verify target user has appropriate role
    if (!['faculty', 'coordinator', 'admin', 'student'].includes(targetUser.role)) {
        res.status(400);
        throw new Error('Only faculty, coordinators, admins, and students can be added as event coordinators');
    }

    // Check if user is already a coordinator
    if (event.coordinators.some(coord => coord.toString() === userId)) {
        res.status(400);
        throw new Error('User is already a coordinator for this event');
    }

    // Check if user is the creator
    if (event.createdBy.toString() === userId) {
        res.status(400);
        throw new Error('Event creator is already a coordinator by default');
    }

    // Add coordinator
    event.coordinators.push(userId);
    await event.save();

    // Return updated event with populated coordinators
    const updatedEvent = await Event.findById(eventId)
        .populate('coordinators', 'name email role department')
        .populate('createdBy', 'name email');

    res.json(updatedEvent);
});

// @desc    Remove coordinator from event
// @route   DELETE /api/events/:id/coordinators/:userId
// @access  Private (Event Creator, Existing Coordinator, or Admin)
const removeCoordinator = asyncHandler(async (req, res) => {
    const { id: eventId, userId } = req.params;

    const event = await Event.findById(eventId);

    if (!event) {
        res.status(404);
        throw new Error('Event not found');
    }

    // Authorization: Event creator, existing coordinator, or admin
    const isCreator = event.createdBy.toString() === req.user._id.toString();
    const isCoordinator = event.coordinators.some(coord => coord.toString() === req.user._id.toString());
    const isAdmin = req.user.role === 'admin';

    if (!isCreator && !isCoordinator && !isAdmin) {
        res.status(401);
        throw new Error('Not authorized to remove coordinators from this event');
    }

    // Check if user is in coordinators array
    const coordinatorIndex = event.coordinators.findIndex(coord => coord.toString() === userId);
    if (coordinatorIndex === -1) {
        res.status(400);
        throw new Error('User is not a coordinator for this event');
    }

    // Remove coordinator
    event.coordinators.splice(coordinatorIndex, 1);
    await event.save();

    // Return updated event with populated coordinators
    const updatedEvent = await Event.findById(eventId)
        .populate('coordinators', 'name email role department')
        .populate('createdBy', 'name email');

    res.json(updatedEvent);
});

// @desc    Get event coordinators
// @route   GET /api/events/:id/coordinators
// @access  Private
const getEventCoordinators = asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id)
        .populate('coordinators', 'name email role department')
        .populate('createdBy', 'name email role department');

    if (!event) {
        res.status(404);
        throw new Error('Event not found');
    }

    res.json({
        creator: event.createdBy,
        coordinators: event.coordinators
    });
});

module.exports = {
    getEvents,
    getEventById,
    createEvent,
    getPendingEvents,
    approveEvent,
    rejectEvent,
    getMyEvents,
    updateEvent,
    deleteEvent,
    registerForEvent,
    unregisterFromEvent,
    checkRegistrationStatus,
    markEventAttendance,
    getEventAttendance,
    getMyAttendance,
    generateCertificate,
    searchUsers,
    addCoordinator,
    removeCoordinator,
    getEventCoordinators
};
