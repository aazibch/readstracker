const Message = require('../models/messageModel');
const Conversation = require('../models/conversationModel');
const catchAsync = require('../middleware/catchAsync');
const AppError = require('../utils/appError');
const filterObject = require('../utils/filterObject');

exports.getAllMessages = catchAsync(async (req, res, next) => {
    // Fetch the conversation
    const conversation = await Conversation.findById(req.params.conversationId);

    if (!conversation)
        return next(new AppError('Conversation not found.', 404));

    res.status(200).json({
        status: 'success',
        data: conversation.messages
    });
});

exports.createMessage = catchAsync(async (req, res, next) => {
    // Check if conversation exists
    const conversation = await Conversation.findById(req.params.conversationId);

    if (!conversation)
        return next(new AppError('Conversation not found.', 404));

    // Check if user is a participant in the conversation
    if (!conversation.participants.includes(req.user._id))
        return next(
            new AppError('User is not a participant in the conversation.', 403)
        );

    let filteredBody = filterObject(req.body, 'content');

    filteredBody = {
        ...filteredBody,
        conversation: req.params.conversationId,
        sender: req.user._id
    };

    conversation.messages.push(filteredBody);
    await conversation.save();

    res.status(200).json({
        status: 'success',
        data: conversation.messages[conversation.messages.length - 1]
    });
});
