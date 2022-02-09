const Conversation = require('../models/conversationModel');
const User = require('../models/userModel');
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
    const filteredBody = filterObject(req.body, 'recipient');

    if (!filteredBody.recipient)
        return next(
            new AppError(
                'The request must contain the "recipient" property.',
                400
            )
        );

    if (filteredBody.recipient === req.user._id.toString())
        return next(new AppError('The recipient cannot be the sender.', 400));

    // Check if there is already an existing conversation with the same participants.
    const existingConversation = await Conversation.findOne({
        $and: [
            { participants: { $in: [filteredBody.recipient] } },
            { participants: { $in: [req.user._id] } }
        ]
    });

    if (existingConversation)
        return next(
            new AppError(
                'A conversation with the same participants is already present.',
                400
            )
        );

    const { recipient } = filteredBody;
    delete filteredBody.recipient;

    const recipientUser = await User.findById(recipient);

    if (!recipientUser)
        return next(new AppError('The recipient cannot be found.', 404));

    filteredBody.participants = [recipient, req.user._id];

    const conversation = await Conversation.create(filteredBody);

    res.status(201).json({
        status: 'success',
        data: conversation
    });
});

// @ToDo
// 1. Check if the request format needs to be modified. If so, how.

exports.getParticipants = catchAsync(async (req, res, next) => {
    const convoParticipants = await Conversation.findById(
        req.params.conversationId
    )
        .select('participants')
        .populate({
            path: 'participants',
            select: ['-email']
        });

    if (!convoParticipants)
        return next(new AppError('The conversation was not found.', 404));

    if (
        convoParticipants.participants.findIndex(
            (participant) =>
                participant._id.toString() === req.user._id.toString()
        ) === -1
    )
        return next(
            new AppError(
                'You must be a participant in the conversation to access this data.',
                403
            )
        );

    res.status(200).json({
        status: 'success',
        data: convoParticipants
    });
});
