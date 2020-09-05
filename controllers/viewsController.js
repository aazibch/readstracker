const Book = require('../models/bookModel');
const User = require('../models/userModel');
const catchAsync = require('../middleware/catchAsync');
const AppError = require('../utils/appError');
const crypto = require('crypto');

exports.getHome = (req, res) => {
    res.status(200).render('home', { title: 'Home' });
};

exports.getLoginForm = (req, res) => {
    res.status(200).render('login', { title: 'Login' });
};

exports.getSignupForm = (req, res) => {
    res.status(200).render('signup', { title: 'Signup' });
};

exports.getForgotPasswordPage = (req, res) => {
    res.status(200).render('forgotPassword', { title: 'Forgot Password' });
};

exports.getPasswordRecoveryPage = catchAsync(async (req, res, next) => {
    const encryptedToken = User.encryptPasswordResetToken(req.params.token);

    const user = await User.findOne({ passwordResetToken: encryptedToken });
    if (!user) return next(new AppError('Route not found.', 404));
    
    res.status(200).render('passwordRecovery', { title: 'Recover your Password' });
});

exports.getProfile = (req, res) => {
    res.status(200).render('profile', { title: 'Profile' });
};

exports.getBook = catchAsync(async (req, res, next) => {
    const book = await Book.findById(req.params.id);

    if (!book) return next(new AppError('No book found.', 404));

    res.status(200).render('book', {
        title: book.title,
        book
    });
});

exports.getEditPage = catchAsync(async (req, res, next) => {
    const book = await Book.findById(req.params.id);

    if (!book) return next(new AppError('No book found.', 404));

    res.status(200).render('editBook', {
        title: `Edit ${book.title}`,
        book
    });
});

exports.getSettingsPage = catchAsync(async (req, res) => {
    res.status(200).render('settings', {
        title: 'Settings'
    });
});