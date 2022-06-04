const catchAsync = require('../middleware/catchAsync');
const Connection = require('../models/connectionModel');
const User = require('../models/userModel');
const Conversation = require('../models/conversationModel');
const Notification = require('../models/notificationModel');
const AppError = require('../utils/appError');

exports.getFollowers = catchAsync(async (req, res, next) => {
    if (!req.params.userId) return next(new AppError('Route not found.', 404));

    const followers = await Connection.find({ following: req.params.userId })
        .select('follower')
        .populate('follower');

    res.status(200).json({
        status: 'success',
        data: followers
    });
});

exports.getAccountsFollowing = catchAsync(async (req, res, next) => {
    if (!req.params.userId) return next(new AppError('Route not found.', 404));

    const following = await Connection.find({ follower: req.params.userId })
        .select('following')
        .populate('following');

    res.status(200).json({
        status: 'success',
        data: following
    });
});

exports.createConnection = catchAsync(async (req, res, next) => {
    const conn = await Connection.create({
        follower: req.user._id,
        following: req.body.following
    });

    // @todo add as part of mongoose hook
    await Notification.create({
        sender: req.user._id,
        recipient: req.body.following,
        content: '[username] started following you.'
    });

    res.status(201).json({
        status: 'success',
        data: conn
    });
});

exports.deleteConnection = catchAsync(async (req, res, next) => {
    const conn = await Connection.findOneAndDelete({
        _id: req.params.connId,
        follower: req.user._id
    });

    if (!conn) return next(new AppError('Connection not found.', 404));

    const conversation = await Conversation.findOneAndDelete({
        participants: { $all: [conn.follower, conn.following] }
    });

    if (conversation?.unreadBy) {
        const user = await User.findById(conversation.unreadBy).select(
            'unreadConversationsCount'
        );

        // Not decrementing in mongoDB hooks because then UI renders old state.
        user.unreadConversationsCount = --user.unreadConversationsCount;
        await user.save();
    }

    res.status(204).json({
        status: 'success',
        message: 'Unfollowed successfully.',
        data: conn
    });
});
