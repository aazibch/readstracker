const Conversation = require('../models/conversationModel');
const User = require('../models/userModel');
const Connection = require('../models/connectionModel');
const catchAsync = require('../middleware/catchAsync');
const AppError = require('../utils/appError');
const filterObject = require('../utils/filterObject');

exports.getAllConversations = catchAsync(async (req, res, next) => {
    const conversations = await Conversation.find({
        participants: { $in: [req.user._id] }
    });

    res.status(200).json({
        status: 'success',
        data: conversations
    });
});

exports.createConversation = catchAsync(async (req, res, next) => {
    const filteredConversation = filterObject(
        req.body,
        'participants',
        'message'
    );
    const filteredMessage = filterObject(req.body.message, 'content');

    const conns = await Promise.all([
        Connection.findOne({
            follower: req.user._id,
            following: filteredConversation.participants[0]
        }),
        Connection.findOne({
            follower: filteredConversation.participants[0],
            following: req.user._id
        })
    ]);

    if (!conns.every((elem) => elem))
        return next(
            new AppError('The participants must be following each other.', 400)
        );

    filteredConversation.messages = [
        { ...filteredMessage, sender: req.user._id }
    ];
    filteredConversation.unreadBy = filteredConversation.participants[0];
    filteredConversation.participants.push(req.user._id);

    const conversation = await Conversation.create(filteredConversation);

    res.status(201).json({
        status: 'success',
        data: conversation
    });
});

exports.deleteConversation = catchAsync(async (req, res, next) => {
    const convo = await Conversation.findOne({
        _id: req.params.convoId,
        participants: { $in: [req.user._id] }
    });

    if (!convo) return next(new AppError('Conversation not found.', 404));

    if (convo.deletedBy && convo.deletedBy !== req.user._id) {
        await convo.delete();
    } else {
        convo.deletedBy = req.user._id;

        convo.messages = convo.messages.map((el) => {
            el.deletedBy = req.user._id;
            return el;
        });

        await convo.save();
    }

    res.status(204).json({
        status: 'success',
        message: 'Conversation was deleted successfully.',
        data: convo
    });
});
