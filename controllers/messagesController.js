const Conversation = require('../models/conversationModel');
const catchAsync = require('../middleware/catchAsync');
const AppError = require('../utils/appError');
const filterObject = require('../utils/filterObject');

exports.createMessage = catchAsync(async (req, res, next) => {
    // Check if conversation exists
    let conversation = await Conversation.findById(req.params.conversationId);

    if (!conversation || !conversation.participants.includes(req.user._id))
        return next(new AppError('Conversation not found.', 404));

    let filteredBody = filterObject(req.body, 'content');

    filteredBody = {
        ...filteredBody,
        conversation: req.params.conversationId,
        sender: req.user._id
    };

    conversation.messages.push(filteredBody);
    await conversation.save();

    conversation = conversation.toObject();

    res.status(200).json({
        status: 'success',
        sender: req.user._id.toString(),
        data: {
            ...conversation.messages[conversation.messages.length - 1],
            recipient: conversation.participants.find((user) => req.user._id.toString() !== user._id.toString())
        }
    });
});
