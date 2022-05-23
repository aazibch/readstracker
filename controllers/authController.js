const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const AppError = require('../utils/appError');
const catchAsync = require('../middleware/catchAsync');
const User = require('../models/userModel');
const filterObject = require('../utils/filterObject');

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRATION_TIME
    });
};

const createSendToken = (userId, req, res) => {
    const token = signToken(userId);

    res.cookie('jwt', token, {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRATION * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
        secure: req.secure
    });

    return token;
};

const sendLogoutCookie = (res) => {
    res.cookie('jwt', '', {
        expires: new Date(Date.now() + 1000),
        httpOnly: true
    });
};

exports.signup = catchAsync(async (req, res, next) => {
    const filteredBody = filterObject(
        req.body,
        'username',
        'email',
        'password',
        'confirmPassword'
    );

    const newUser = await User.create(filteredBody);

    // Send the cookie.
    const token = createSendToken(newUser._id, req, res);

    // Remove the password property.
    newUser.password = undefined;

    res.status(201).json({
        status: 'success',
        message: 'Your account was created successfully.',
        token,
        data: newUser
    });
});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new AppError('Please an email address and password.', 400));
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.isPasswordCorrect(password, user.password))) {
        return next(new AppError('Incorrect email address or password.', 401));
    }

    const token = createSendToken(user._id, req, res);

    res.status(200).json({
        status: 'success',
        message: 'You were logged in successfully.',
        token,
        data: {
            userId: user._id
        }
    });
});

exports.protect = catchAsync(async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }

    if (!token) {
        return next(new AppError("You're not logged in.", 401));
    }

    let decodedToken;

    try {
        decodedToken = await promisify(jwt.verify)(
            token,
            process.env.JWT_SECRET
        );
    } catch (err) {
        sendLogoutCookie(res);
        return next(new AppError("You're not logged in.", 401));
    }

    const user = await User.findById(decodedToken.id)
        .populate('books')
        .select('+unreadConversationsCount');

    if (!user || user.changedPasswordAfterToken(decodedToken.iat)) {
        sendLogoutCookie(res);
        return next(new AppError("You're not logged in.", 401));
    }

    req.user = user;
    res.locals.user = user;
    next();
});

exports.isLoggedIn = catchAsync(async (req, res, next) => {
    if (!req.cookies.jwt) return next();

    try {
        let token = req.cookies.jwt;

        decodedToken = await promisify(jwt.verify)(
            token,
            process.env.JWT_SECRET
        );

        const user = await User.findById(decodedToken.id)
            .populate('books')
            .select('+unreadConversationsCount');

        if (!user) return next();

        if (user.changedPasswordAfterToken(decodedToken.iat)) return next();

        req.user = user;
        res.locals.user = user;
    } catch (err) {
        next();
    }

    next();
});

exports.logout = (req, res, next) => {
    sendLogoutCookie(res);
    res.status(200).json({ status: 'success' });
};

exports.updateMyPassword = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user._id).select('+password');

    if (
        !(await user.isPasswordCorrect(req.body.currentPassword, user.password))
    ) {
        return next(
            new AppError('Incorrect value for the current password.', 400)
        );
    }

    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    await user.save();

    const token = createSendToken(user, req, res);

    res.status(200).json({
        status: 'success',
        message: 'Your password was updated successfully.',
        token
    });
});
