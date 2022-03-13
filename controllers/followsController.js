const catchAsync = require('../middleware/catchAsync');
const Follow = require('../models/followModel');
const User = require('../models/userModel');
const AppError = require('../utils/appError');

exports.createMyFollow = catchAsync(async (req, res, next) => {
    const userToFollow = await User.findById(req.body.following);

    if (!userToFollow) return next(new AppError('The user you\'re trying to follow was not found.', 404));

    const follow = await Follow.create({ 
        follower: req.user._id,
        following: req.body.following
    });

    res.status(201).json({
        status: 'success',
        data: follow
    });
});

exports.deleteMyFollow = catchAsync(async (req, res, next) => {
    const follow = await Follow.findByIdAndDelete(req.params.followId);

    if (!follow) return next(new AppError('Follow not found.', 404));

    res.status(204).json({
        status: 'success',
        message: 'Unfollowed successfully.',
        data: follow
    })
});