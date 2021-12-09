const Book = require('../models/bookModel');
const User = require('../models/userModel');
const catchAsync = require('../middleware/catchAsync');
const AppError = require('../utils/appError');
const crypto = require('crypto');
const { profile } = require('console');

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

    res.status(200).render('passwordRecovery', {
        title: 'Recover your Password'
    });
});

exports.getProfile = catchAsync(async (req, res) => {
    if (req.user && req.user.username === req.params.username) {
        console.log('logged in user');
        return res
            .status(200)
            .render('profile', { title: 'Profile', profile: req.user });
    }

    const user = await User.findOne({ username: req.params.username }).populate(
        { path: 'books' }
    );

    if (!user) return next(new AppError('User not found.', 404));

    res.status(200).render('profile', { title: 'Profile', profile: user });
});

exports.getBook = catchAsync(async (req, res, next) => {
    const book = await Book.findById(req.params.id).populate({
        path: 'user',
        select: 'username profilePhoto'
    });

    if (!book || book.user.username !== req.params.username)
        return next(new AppError('No book found.', 404));

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

exports.getSearchResults = catchAsync(async (req, res) => {
    const results = await User.find({
        username: {
            $regex: req.query['search-query'],
            $options: 'i'
        }
    })
        .select('-email')
        .populate({ path: 'books' })
        .limit(5);

    res.status(200).render('searchResults', {
        title: 'Results',
        results
    });
});

exports.getMessages = (req, res) => {
    res.status(200).render('messages', { title: 'Messages' });
};
