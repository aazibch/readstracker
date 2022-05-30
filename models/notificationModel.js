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
        minLength: 5,
        maxLength: 75,
        required: true
    },
    dateSent: {
        type: Date,
        default: Date.now,
        required: true
    }
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
