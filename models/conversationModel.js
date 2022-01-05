const mongoose = require('mongoose');

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
    messages: [
        {
            sender: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            content: {
                type: String,
                maxlength: [
                    255,
                    'Messages must have fewer than two hundred and fifty six characters.'
                ]
            },
            dateSent: {
                type: Date,
                default: Date.now
            }
        }
    ]
});

const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = Conversation;
