const Conversation = require('../models/conversationModel');
const catchAsync = require('../middleware/catchAsync');
const AppError = require('../utils/appError');
const filterObject = require('../utils/filterObject');

exports.createMessage = catchAsync(async (req, res, next) => {
    // Check if conversation exists
    let conversation = await Conversation.findById(
        req.params.conversationId
    ).populate('participants');

    if (
        !conversation ||
        !conversation.participants.some(
            (el) => el._id.toString() === req.user._id.toString()
        )
    )
        return next(new AppError('Conversation not found.', 404));

    let filteredBody = filterObject(req.body, 'content');

    filteredBody = {
        ...filteredBody,
        conversation: req.params.conversationId,
        sender: req.user._id
    };

    conversation.messages.push(filteredBody);

    if (conversation.deletedBy) conversation.deletedBy = undefined;

    conversation.unreadBy = [
        conversation.participants.find(
            (user) => req.user._id.toString() !== user._id.toString()
        )
    ];

    await conversation.save();

    conversation = conversation.toObject();

    const sender = conversation.participants.find(
        (user) => req.user._id.toString() === user._id.toString()
    );

    res.status(200).json({
        status: 'success',
        data: {
            convoId: conversation._id,
            ...conversation.messages[conversation.messages.length - 1],
            recipient: conversation.participants.find(
                (user) => req.user._id.toString() !== user._id.toString()
            )._id,
            sender: conversation.participants.find(
                (user) => req.user._id.toString() === user._id.toString()
            )
        }
    });
});
