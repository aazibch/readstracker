const mongoose = require('mongoose');
const User = require('./userModel');
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
        ]
        // ,
        // validate: [
        //     {
        //         validator: function (val) {
        //             return val.length === 2;
        //         },
        //         message: 'There must be two participants in a conversation.'
        //     },
        //     {
        //         validator: function (val) {
        //             return val[0].toString() !== val[1].toString();
        //         },
        //         message: 'Both participants cannot be the same.'
        //     }
        // ],
        // unique: [true, 'A conversation with these participants already exists.']
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
    },
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

conversationSchema.statics.calcUnreadConversations = async function (userId) {
    const stats = await this.aggregate([
        {
            $match: { unreadBy: userId }
        },
        {
            $group: {
                _id: '$unreadBy',
                unreadConversations: { $sum: 1 }
            }
        }
    ]);

    if (stats.length > 0) {
        return await User.findByIdAndUpdate(userId, {
            unreadConversations: stats[0].unreadConversations
        });
    }

    await User.findByIdAndUpdate(userId, {
        unreadConversations: 0
    });
};

conversationSchema.pre('save', function (next) {
    this.u = this.isModified('unreadBy');
    next();
});

conversationSchema.post('save', function () {
    if (!this.u) return;

    this.constructor.calcUnreadConversations(this.participants[0]);
    this.constructor.calcUnreadConversations(this.participants[1]);
});

const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = Conversation;
