// This is going to be an embedded schema.

const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        maxlength: [
            255,
            'Messages must have fewer than two hundred and fifty six characters.'
        ],
        required: true
    },
    dateSent: {
        type: Date,
        default: Date.now
    }
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
