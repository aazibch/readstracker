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

// Currently working here.
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

    const participantUser = await User.findById(filteredBody.participant);

    if (!participantUser)
        return next(new AppError('The participant cannot be found.', 404));

    const conns = await Promise.all([Connection.findOne({ follower: req.user._id, following: filteredBody.participant }), Connection.findOne({ follower: filteredBody.participant, following: req.user._id })]);
    
    console.log({ conns });

    if (!conns.every(elem => elem)) return next(
        new AppError(
            'You and the other participant must be following each other.',
            400
        )
    );

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

    filteredBody.participants = [participant, req.user._id];

    const conversation = await Conversation.create(filteredBody);

    res.status(201).json({
        status: 'success',
        data: conversation
    });
});

exports.deleteConversation = catchAsync(async (req, res, next) => {
    const convo = await Conversation.findById(req.params.convoId);

    if (!convo) return next(new AppError('Conversation not found.', 404));

    if (!convo.participants.includes(req.user._id)) return next(new AppError('You cannot delete this conversation.', 403));

    if (!convo.deletedBy) {
        convo.deletedBy = req.user._id;
        await convo.save();
    }
    
    if (convo.deletedBy !== req.user._id) await Conversation.findByIdAndDelete(convo._id);

    res.status(204).json({
        status: 'success',
        message: 'Conversation was deleted successfully.',
        data: convo
    });
});