const asyncHandler = require('express-async-handler');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const Registration = require('../models/Registration');
const Attendance = require('../models/Attendance');
const Event = require('../models/Event');
const User = require('../models/User');

// --- Helper Functions for Data Fetching ---

const fetchParticipationData = async (user) => {
    let matchStage = {};
    if (user.role !== 'admin') {
        const myEvents = await Event.find({ createdBy: user._id }).select('_id');
        const myEventIds = myEvents.map(e => e._id);
        matchStage = { event: { $in: myEventIds } };
    }

    return await Registration.aggregate([
        { $match: matchStage },
        {
            $group: {
                _id: '$event',
                count: { $sum: 1 }
            }
        },
        {
            $lookup: {
                from: 'events',
                localField: '_id',
                foreignField: '_id',
                as: 'eventDetails'
            }
        },
        { $unwind: '$eventDetails' },
        {
            $project: {
                _id: 0,
                eventId: '$_id',
                label: '$eventDetails.title',
                value: '$count'
            }
        },
        { $sort: { value: -1 } }
    ]);
};

const fetchAttendanceData = async (user) => {
    let eventQuery = {};
    let attendanceMatch = { status: 'Present' };

    if (user.role !== 'admin') {
        const myEvents = await Event.find({ createdBy: user._id }).select('_id');
        const myEventIds = myEvents.map(e => e._id);
        eventQuery = { _id: { $in: myEventIds } };
        attendanceMatch.status = 'Present';
        attendanceMatch.event = { $in: myEventIds };
    }

    const presentStats = await Attendance.aggregate([
        { $match: attendanceMatch },
        {
            $group: {
                _id: '$event',
                presentCount: { $sum: 1 }
            }
        }
    ]);

    const presentMap = new Map();
    presentStats.forEach(stat => {
        presentMap.set(stat._id.toString(), stat.presentCount);
    });

    const events = await Event.find(eventQuery, 'title registeredCount');

    return events.map(event => {
        const present = presentMap.get(event._id.toString()) || 0;
        const registered = event.registeredCount || 0;
        let percentage = 0;
        if (registered > 0) {
            percentage = Math.round((present / registered) * 100);
        }
        return {
            eventId: event._id,
            label: event.title,
            registered: registered,
            present: present,
            percentage: percentage
        };
    });
};

const fetchDepartmentData = async (user) => {
    let matchStage = {};
    if (user.role !== 'admin') {
        const myEvents = await Event.find({ createdBy: user._id }).select('_id');
        const myEventIds = myEvents.map(e => e._id);
        matchStage = { event: { $in: myEventIds } };
    }

    return await Registration.aggregate([
        { $match: matchStage },
        {
            $lookup: {
                from: 'users',
                localField: 'user',
                foreignField: '_id',
                as: 'studentDetails'
            }
        },
        { $unwind: '$studentDetails' },
        {
            $group: {
                _id: '$studentDetails.department',
                count: { $sum: 1 }
            }
        },
        { $match: { _id: { $ne: null } } },
        {
            $project: {
                _id: 0,
                label: '$_id',
                value: '$count'
            }
        },
        { $sort: { value: -1 } }
    ]);
};

const fetchEventRegistrations = async (eventId) => {
    const event = await Event.findById(eventId);
    if (!event) throw new Error('Event not found');

    const registrations = await Registration.find({ event: eventId })
        .populate('user', 'name email department phone')
        .sort({ registeredAt: 1 });

    return {
        eventTitle: event.title,
        registrations: registrations.map(reg => ({
            name: reg.user?.name || 'N/A',
            email: reg.user?.email || 'N/A',
            department: reg.user?.department || '—',
            phone: reg.user?.phone || '—',
            registeredAt: reg.registeredAt ? new Date(reg.registeredAt).toLocaleDateString() : 'N/A',
            attendance: reg.attendance ? 'Present' : 'Absent'
        }))
    };
};

// --- Controllers ---

// @desc    Get Event Participation Stats
// @route   GET /api/reports/event-summary
const getEventParticipationStats = asyncHandler(async (req, res) => {
    const data = await fetchParticipationData(req.user);
    res.json(data);
});

// @desc    Get Event Attendance Stats
// @route   GET /api/reports/attendance-summary
const getEventAttendanceStats = asyncHandler(async (req, res) => {
    const data = await fetchAttendanceData(req.user);
    res.json(data);
});

// @desc    Get Department Participation Stats
// @route   GET /api/reports/department-summary
const getDepartmentParticipationStats = asyncHandler(async (req, res) => {
    const data = await fetchDepartmentData(req.user);
    res.json(data);
});

// @desc    Export Report
// @route   GET /api/reports/export?type=...&format=...&eventId=...
// @access  Private (Admin/Faculty)
const exportReport = asyncHandler(async (req, res) => {
    const { type, format, eventId } = req.query;
    let data = [];
    let title = '';
    let columns = [];

    // 1. Fetch Data
    switch (type) {
        case 'participation':
            data = await fetchParticipationData(req.user);
            title = 'Event Participation Report';
            columns = ['Event Name', 'Registrations'];
            break;
        case 'attendance':
            data = await fetchAttendanceData(req.user);
            title = 'Event Attendance Report';
            columns = ['Event Name', 'Registered', 'Present', 'Percentage (%)'];
            break;
        case 'department':
            data = await fetchDepartmentData(req.user);
            title = 'Department Participation Report';
            columns = ['Department', 'Students'];
            break;
        case 'event-registrations':
            if (!eventId) {
                res.status(400);
                throw new Error('Event ID is required for this report');
            }
            const result = await fetchEventRegistrations(eventId);
            data = result.registrations;
            title = `${result.eventTitle} - Registered Members`;
            columns = ['Name', 'Email', 'Department', 'Phone', 'Registered At', 'Attendance'];
            break;
        default:
            res.status(400);
            throw new Error('Invalid report type');
    }

    // 2. Format & Send Response
    if (format === 'pdf') {
        const doc = new PDFDocument({ margin: 30, size: 'A4' });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${title.replace(/ /g, '_')}.pdf`);
        doc.pipe(res);

        // PDF Header
        doc.fontSize(20).text(title, { align: 'center' });
        doc.moveDown();
        doc.fontSize(10).text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });
        doc.moveDown(2);

        // Simple Table Logic for PDF
        let y = doc.y;
        const xStart = 30;
        const colWidth = 85;

        // Headers
        doc.font('Helvetica-Bold').fontSize(10);
        columns.forEach((col, i) => {
            doc.text(col, xStart + (i * colWidth), y, { width: colWidth - 5, truncate: true });
        });
        y += 20;
        doc.lineWidth(0.5).moveTo(xStart, y).lineTo(560, y).stroke();
        y += 10;

        // Rows
        doc.font('Helvetica').fontSize(9);
        data.forEach(row => {
            if (type === 'participation' || type === 'department') {
                doc.text(row.label, xStart, y, { width: colWidth * 2 });
                doc.text(row.value.toString(), xStart + (colWidth * 2), y);
                y += 20;
            } else if (type === 'attendance') {
                doc.text(row.label, xStart, y, { width: colWidth - 5, truncate: true });
                doc.text(row.registered.toString(), xStart + colWidth, y);
                doc.text(row.present.toString(), xStart + (colWidth * 2), y);
                doc.text(row.percentage + '%', xStart + (colWidth * 3), y);
                y += 20;
            } else if (type === 'event-registrations') {
                doc.text(row.name, xStart, y, { width: colWidth - 5, truncate: true });
                doc.text(row.email, xStart + colWidth, y, { width: colWidth - 5, truncate: true });
                doc.text(row.department, xStart + (colWidth * 2), y, { width: colWidth - 5, truncate: true });
                doc.text(row.phone, xStart + (colWidth * 3), y, { width: colWidth - 5, truncate: true });
                doc.text(row.registeredAt, xStart + (colWidth * 4), y, { width: colWidth - 5, truncate: true });
                doc.text(row.attendance, xStart + (colWidth * 5), y, { width: colWidth - 5, truncate: true });
                y += 25;
            }

            // New Page check
            if (y > 750) {
                doc.addPage();
                y = 50;
            }
        });

        doc.end();

    } else if (format === 'excel') {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Report');

        worksheet.columns = columns.map(col => ({ header: col, key: col, width: 25 }));

        // Add Data
        data.forEach(row => {
            if (type === 'participation' || type === 'department') {
                worksheet.addRow([row.label, row.value]);
            } else if (type === 'attendance') {
                worksheet.addRow([row.label, row.registered, row.present, row.percentage + '%']);
            } else if (type === 'event-registrations') {
                worksheet.addRow([row.name, row.email, row.department, row.phone, row.registeredAt, row.attendance]);
            }
        });

        // Styling
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F2F2F2' } };

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=${title.replace(/ /g, '_')}.xlsx`);

        await workbook.xlsx.write(res);
        res.end();
    } else {
        res.status(400);
        throw new Error('Invalid export format');
    }
});

module.exports = {
    getEventParticipationStats,
    getEventAttendanceStats,
    getDepartmentParticipationStats,
    exportReport
};
