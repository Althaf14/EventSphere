const mongoose = require('mongoose');

const auditLogSchema = mongoose.Schema({
    action: {
        type: String,
        required: true,
        enum: ['USER_ROLE_CHANGED', 'USER_SUSPENDED', 'USER_ACTIVATED', 'USER_DELETED', 'USER_CREATED', 'USER_APPROVED', 'USER_REJECTED'],
    },
    performedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    targetUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
    details: {
        type: String,
        required: true,
    },
}, {
    timestamps: true,
});

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

module.exports = AuditLog;
