const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        minLength: 5,
        maxLength: 75,
        required: true
    },
    dateSent: {
        type: Date,
        default: Date.now
    },
    unread: {
        type: Boolean,
        default: true
    },
    link: {
        type: String,
        required: true
    }
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
