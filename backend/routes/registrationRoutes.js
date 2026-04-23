const express = require('express');
const router = express.Router();
const {
    registerEvent,
    getMyRegistrations,
    getEventRegistrations,
    markAttendance,
    getCertificate
} = require('../controllers/registrationController');
const { protect, facultyOrAdmin } = require('../middleware/authMiddleware');

router.post('/:eventId', protect, registerEvent);
router.get('/my', protect, getMyRegistrations);
router.get('/event/:eventId', protect, getEventRegistrations);
router.put('/:id/attendance', protect, markAttendance);
router.get('/:id/certificate', protect, getCertificate);

module.exports = router;
