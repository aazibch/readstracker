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
    })
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

// Follow user
exports.createConnection = catchAsync(async (req, res, next) => {
    if (req.user._id.toString() === req.body.following) return next(new AppError('You cannot follow yourself.', 400));

    const existingConn = await Connection.findOne({ follower: req.user._id, following: req.body.following });

    if (existingConn) return next(new AppError('You are already following this user.', 400)); 

    const userToFollow = await User.findById(req.body.following);

    if (!userToFollow) return next(new AppError('The user you are trying to follow was not found.', 404));

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
    const conn = await Connection.findOneAndDelete({ _id: req.params.connId, follower: req.user._id });

    if (!conn) return next(new AppError('Connection not found.', 404));

    res.status(204).json({
        status: 'success',
        message: 'Unfollowed successfully.',
        data: conn
    })
});