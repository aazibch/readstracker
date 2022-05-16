const Conversation = require('../models/conversationModel');
const User = require('../models/userModel');
const catchAsync = require('../middleware/catchAsync');
const AppError = require('../utils/appError');
const filterObject = require('../utils/filterObject');

exports.createMessage = catchAsync(async (req, res, next) => {
    const conversation = await Conversation.findOne({
        _id: req.params.conversationId,
        participants: { $in: [req.user._id] }
    });

    if (!conversation)
        return next(new AppError('Conversation not found.', 404));

    let filteredBody = filterObject(req.body, 'content');

    filteredBody.sender = req.user._id;

    conversation.messages.push(filteredBody);
    conversation.deletedBy = undefined;

    conversation.unreadBy = conversation.participants.find(
        (user) => filteredBody.sender.toString() !== user._id.toString()
    );

    await conversation.save();

    const recipient = conversation.participants.find(
        (id) => id.toString() !== req.user._id.toString()
    );

    const sender = await User.findById(req.user._id);

    const data = {
        ...conversation.messages[conversation.messages.length - 1].toObject(),
        conversationId: conversation._id.toString(),
        recipient,
        sender
    };

    res.status(200).json({
        status: 'success',
        data
    });
});
