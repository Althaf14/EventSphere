const Registration = require('../models/Registration');
const Attendance = require('../models/Attendance');

/**
 * Checks if a student is eligible for a certificate for a given event.
 * Eligibility Criteria:
 * 1. Must be registered for the event.
 * 2. Must be marked as 'Present' in the attendance record.
 * 
 * @param {string} studentId - The ID of the student.
 * @param {string} eventId - The ID of the event.
 * @returns {Promise<{eligible: boolean, message: string}>}
 */
const checkCertificateEligibility = async (studentId, eventId) => {
    // 1. Check Registration
    const registration = await Registration.findOne({
        user: studentId,
        event: eventId
    });

    if (!registration) {
        return {
            eligible: false,
            message: 'Student is not registered for this event.'
        };
    }

    // 2. Check Attendance
    const attendance = await Attendance.findOne({
        student: studentId,
        event: eventId
    });

    if (!attendance) {
        return {
            eligible: false,
            message: 'No attendance record found for this student.'
        };
    }

    if (attendance.status !== 'Present') {
        return {
            eligible: false,
            message: 'Student was absent for this event.'
        };
    }

    return {
        eligible: true,
        message: 'Student is eligible for certificate.'
    };
};

module.exports = {
    checkCertificateEligibility
};
