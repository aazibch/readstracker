const catchAsync = require('../middleware/catchAsync');
const Connection = require('../models/connectionModel');
const User = require('../models/userModel');
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

    res.status(204).json({
        status: 'success',
        message: 'Unfollowed successfully.',
        data: conn
    });
});
