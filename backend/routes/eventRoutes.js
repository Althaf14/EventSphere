const express = require('express');
const router = express.Router();
const {
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
    generateCertificate,
    searchUsers,
    addCoordinator,
    removeCoordinator,
    getEventCoordinators
} = require('../controllers/eventController');
const { protect, admin, facultyOrAdmin, adminOrCoordinator } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const cpUpload = upload.fields([
    { name: 'eventImage', maxCount: 1 },
    { name: 'coordinatorSignature', maxCount: 1 },
    { name: 'principalSignature', maxCount: 1 }
]);

router.route('/')
    .get(getEvents)
    .post(protect, cpUpload, createEvent);

router.route('/my')
    .get(protect, getMyEvents);

router.route('/pending')
    .get(protect, facultyOrAdmin, getPendingEvents);

// Coordinator Management - MUST be before /:id routes
router.get('/search-users', protect, searchUsers);
router.get('/:id/coordinators', protect, getEventCoordinators);
router.post('/:id/coordinators', protect, addCoordinator);
router.delete('/:id/coordinators/:userId', protect, removeCoordinator);

router.route('/:id')
    .get(getEventById)
    .put(protect, cpUpload, updateEvent)
    .delete(protect, admin, deleteEvent);

router.route('/:id/approve')
    .put(protect, facultyOrAdmin, approveEvent);

router.route('/:id/reject')
    .put(protect, facultyOrAdmin, rejectEvent);

router.route('/:id/register')
    .post(protect, registerForEvent);

router.route('/:id/unregister')
    .delete(protect, unregisterFromEvent);

router.route('/:id/registration-status')
    .get(protect, checkRegistrationStatus);

router.route('/:id/attendance')
    .post(protect, markEventAttendance)
    .get(protect, getEventAttendance);

// Certificate Generation
router.get('/:id/certificate', protect, generateCertificate);

module.exports = router;
