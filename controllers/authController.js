const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const crypto = require('crypto');
const AppError = require('../utils/appError');
const Email = require('../utils/email');
const catchAsync = require('../middleware/catchAsync');
const User = require('../models/userModel');
const filterObject = require('../utils/filterObject');

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRATION_TIME
    });
};

const createSendToken = (user, req, res) => {
    const token = signToken(user._id);

    res.cookie('jwt', token, {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRATION * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
        secure: req.secure || req.header['x-forwarded-proto'] === 'https'
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

    // const url = `${req.protocol}://${req.get('host')}/`;

    // try {
    //     await new Email(newUser, url).sendWelcomeMessage();
    // } catch(err) {
    //     await User.findByIdAndDelete(newUser._id);
    //     return next(new AppError('Unable to send email. Try again later.', 500));
    // }

    // Send the cookie.
    const token = createSendToken(newUser, req, res);

    // Remove the password property.
    newUser.password = undefined;

    res.status(201).json({
        status: 'success',
        token,
        data: newUser
    });
});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(
            new AppError('Please provide the email address and password.', 400)
        );
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.isPasswordCorrect(password, user.password))) {
        return next(new AppError('Incorrect email or password.', 401));
    }

    const token = createSendToken(user, req, res);

    res.status(200).json({
        status: 'success',
        token
    });
});

passErrorForProtectHandler = (next) => {
    const errMessage = "You're not logged in.";
    next(new AppError(errMessage, 401));
};

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
        return passErrorForProtectHandler(next);
    }

    let decodedToken;

    try {
        decodedToken = await promisify(jwt.verify)(
            token,
            process.env.JWT_SECRET
        );
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            sendLogoutCookie(res);
            return passErrorForProtectHandler(next);
        }

        if (err.name === 'JsonWebTokenError') {
            sendLogoutCookie(res);
            return next(new AppError('Invalid login token.', 401));
        }
    }

    const user = await User.findById(decodedToken.id).populate({
        path: 'books',
        options: {
            sort: {
                dateCreated: -1
            }
        }
    });

    if (!user || user.changedPasswordAfterToken(decodedToken.iat)) {
        sendLogoutCookie(res);
        return passErrorForProtectHandler(next);
    }

    req.user = user;
    res.locals.user = user;
    next();
});

exports.isLoggedIn = async (req, res, next) => {
    if (req.cookies.jwt) {
        try {
            let token = req.cookies.jwt;

            const decodedToken = await promisify(jwt.verify)(
                token,
                process.env.JWT_SECRET
            );

            const user = await User.findById(decodedToken.id);

            if (!user) {
                return next();
            }

            if (user.changedPasswordAfterToken(decodedToken.iat)) {
                return next();
            }

            res.locals.user = user;

            if (
                req.originalUrl !== '/' &&
                !req.originalUrl.startsWith('/users/') &&
                !req.originalUrl.startsWith('/search-results')
            ) {
                res.status(401).render('error', {
                    title: 'Error',
                    message: "You can't visit this page while logged in."
                });
            }

            return next();
        } catch (err) {
            return next();
        }
    }

    next();
};

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
            new AppError('The current password entered is incorrect.', 401)
        );
    }

    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    await user.save();

    const token = createSendToken(user, req, res);

    res.status(200).json({
        status: 'success',
        token
    });
});
