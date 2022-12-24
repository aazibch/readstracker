const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { promisify } = require('util');
const AppError = require('../utils/appError');
const catchAsync = require('../middleware/catchAsync');
const User = require('../models/userModel');
const getLoggedInUserDoc = require('./usersController').getLoggedInUserDoc;
const filterObject = require('../utils/filterObject');
const Email = require('../utils/Email');

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

exports.sendLogoutCookie = sendLogoutCookie;

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

    const emailUrl = `${req.protocol}://${req.get('host')}/${
        newUser.username
    }/books/add`;
    await new Email(newUser, emailUrl).sendWelcome();

    res.status(201).json({
        status: 'success',
        message: 'Your account was created successfully.',
        token,
        data: {
            userId: newUser._id
        }
    });
});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(
            new AppError('Please provide an email address and password.', 400)
        );
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

    const user = await getLoggedInUserDoc(decodedToken.id);

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

        let decodedToken = await promisify(jwt.verify)(
            token,
            process.env.JWT_SECRET
        );

        const user = await getLoggedInUserDoc(decodedToken.id);

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

exports.forgotPassword = catchAsync(async (req, res, next) => {
    // 1) Get user
    const user = await User.findOne({ email: req.body.email }).select('+email');

    if (!user) return next(new AppError('No user found.', 404));

    // 2) Generate random password reset token
    const passResetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // 3) Send email with password reset token.
    try {
        const resetUrl = `${req.protocol}://${req.get(
            'host'
        )}/login/reset-password?token=${passResetToken}`;
        await new Email(user, resetUrl).sendPasswordReset();

        res.status(200).json({
            status: 'success',
            message:
                'Instructions to reset your password have been sent to your email address.'
        });
    } catch (error) {
        user.passwordResetToken = undefined;
        user.passwordResetTokenExpirationDate = undefined;
        await user.save({ validateBeforeSave: false });

        return next(
            new AppError('An error occured. Please try again later.', 500)
        );
    }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
    // 1) Get user based on token.
    const hashedToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

    console.log({ hashedToken }, { date: new Date() });

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetTokenExpirationDate: { $gt: Date.now() }
    });

    if (!user) return next(new AppError('Invalid or expired token.', 400));

    // 2) Token is valid and has not expired, set new password.
    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpirationDate = undefined;
    await user.save();

    res.status(200).json({
        status: 'success',
        message:
            'Password has been reset. You may login with your new password.'
    });
});
