const mongoose = require('mongoose');

const eventSchema = mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title'],
    },
    description: {
        type: String,
    },
    category: {
        type: String,
    },
    department: {
        type: String,
    },
    venue: {
        type: String,
    },
    eventDate: {
        type: Date,
        required: [true, 'Please add an event date'],
    },
    startTime: {
        type: String,
    },
    endTime: {
        type: String,
    },
    maxParticipants: {
        type: Number,
    },
    registeredCount: {
        type: Number,
        default: 0,
    },
    eventImage: {
        type: String,
        default: null,
    },
    status: {
        type: String,
        enum: ['Upcoming', 'Ongoing', 'Completed', 'pending', 'Rejected', 'approved', 'Approved', 'cancelled', 'Cancelled'],
        default: 'Upcoming',
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    coordinators: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    eventType: {
        type: String,
        enum: ['SINGLE', 'MULTI'],
        default: 'SINGLE',
    },
    parentEvent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        default: null,
    },
    certificateInfo: {
        coordinatorName: { type: String, default: 'Event Coordinator' },
        coordinatorSignature: { type: String, default: null },
        principalName: { type: String, default: 'Principal' },
        principalSignature: { type: String, default: null }
    }
}, {
    timestamps: true,
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
