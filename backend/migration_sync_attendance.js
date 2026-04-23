const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Registration = require('./models/Registration');
const Attendance = require('./models/Attendance');

dotenv.config();

const syncAttendance = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected for migration...');

        const attendanceRecords = await Attendance.find({ status: 'Present' });
        console.log(`Found ${attendanceRecords.length} 'Present' attendance records.`);

        let updatedCount = 0;
        for (const record of attendanceRecords) {
            const result = await Registration.findOneAndUpdate(
                { event: record.event, user: record.student },
                { attendance: true }
            );
            if (result) updatedCount++;
        }

        console.log(`Migration complete. Updated ${updatedCount} registration records.`);
        process.exit();
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

syncAttendance();
