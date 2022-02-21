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
    const filteredBody = filterObject(req.body, 'participant');

    if (!filteredBody.participant)
        return next(
            new AppError(
                'Invalid input data. Please provide the second participant.',
                400
            )
        );

    if (filteredBody.participant === req.user._id.toString())
        return next(new AppError('The participant cannot be the same user as the creator of the conversation.', 400));

    // Check if there is already an existing conversation with the same participants.
    const existingConversation = await Conversation.findOne({
        $and: [
            { participants: { $in: [filteredBody.participant] } },
            { participants: { $in: [req.user._id] } }
        ]
    });

    if (existingConversation)
        return next(
            new AppError(
                'A conversation with the same participants already exists.',
                400
            )
        );

    const { participant } = filteredBody;
    delete filteredBody.participant;

    const participantUser = await User.findById(participant);

    if (!participantUser)
        return next(new AppError('The participant cannot be found.', 404));

    filteredBody.participants = [participant, req.user._id];

    const conversation = await Conversation.create(filteredBody);

    res.status(201).json({
        status: 'success',
        data: conversation
    });
});