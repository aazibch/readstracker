const mongoose = require('mongoose');
const Connection = require('./connectionModel');
const AppError = require('../utils/appError');

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
    },
    deletedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
});

//@todo check if this works
// for we are comparing objects.
const checkIfValidParticipant = function (val) {
    return this.participants.includes(val);
};

const conversationSchema = new mongoose.Schema({
    participants: {
        type: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }
        ],
        validate: [
            {
                validator: function (val) {
                    return val.length === 2;
                },
                message: 'There must be two participants in a conversation.'
            },
            {
                validator: function (val) {
                    return val[0].toString() !== val[1].toString();
                },
                message: 'Both participants cannot be the same.'
            }
        ],
        unique: [true, 'A conversation with these participants already exists.']
    },
    messages: {
        type: [messageSchema],
        required: [true, 'The conversation must contain at least one message.']
    },
    deletedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        validate: {
            validator: checkIfValidParticipant,
            message: 'Only participants can delete the conversation.'
        }
    }, //@todo implement custom validator.
    lastUpdated: {
        type: Date,
        default: Date.now
    },
    unreadBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        validate: {
            validator: checkIfValidParticipant,
            message:
                'The user who has unread messages must be among the participants in the conversation.'
        }
    }
});

conversationSchema.pre('save', function (next) {
    if (this.isModified('messages')) {
        this.lastUpdated = Date.now();
    }

    next();
});

const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = Conversation;
