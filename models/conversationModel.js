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
            'Message content should have fewer than two hundred and fifty six characters.'
        ],
        required: true
    },
    dateSent: {
        type: Date,
        default: Date.now
    }
});

const conversationSchema = new mongoose.Schema({
    participants: {
        type: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }
        ],
        validate: {
            validator: function (val) {
                return val.length === 2;
            },
            message: 'There must be two participants in a conversation.'
        }
    },
    messages: [messageSchema],
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = Conversation;
