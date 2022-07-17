const Book = require('../models/bookModel');
const User = require('../models/userModel');
const Connection = require('../models/connectionModel');
const Notification = require('../models/notificationModel');
const catchAsync = require('../middleware/catchAsync');
const AppError = require('../utils/appError');

exports.getAllMyBooks = catchAsync(async (req, res, next) => {
    const books = await Book.find({ user: req.user._id }).sort('-dateCreated');

    res.status(200).json({
        status: 'success',
        results: books.length,
        data: books
    });
});

exports.getAllBooks = catchAsync(async (req, res, next) => {
    console.log('[getAllBooks] req.params.userId', req.params.userId);

    const books = await Book.find({ user: req.params.userId }).populate({
        path: 'user',
        select: 'profilePhoto username'
    });

    res.status(200).json({
        status: 'success',
        data: books
    });
});

exports.getMyBook = catchAsync(async (req, res, next) => {
    let book = await Book.findOne({
        _id: req.params.id,
        user: req.user._id
    });

    if (!book) return next(new AppError('Book not found.', 404));

    res.status(200).json({
        status: 'success',
        data: book
    });
});

exports.createMyBook = catchAsync(async (req, res, next) => {
    req.body.user = req.user._id;

    const book = await Book.create(req.body);

    res.status(201).json({
        status: 'success',
        message: 'Book was created successfully.',
        data: book
    });
});

exports.updateMyBook = catchAsync(async (req, res, next) => {
    const book = await Book.findOneAndUpdate(
        {
            _id: req.params.id,
            user: req.user._id
        },
        req.body,
        { new: true, runValidators: true }
    ).populate({ path: 'user', select: 'username' });

    if (!book) return next(new AppError('Book not found.', 404));

    res.status(200).json({
        status: 'success',
        message: 'Book was updated successfully.',
        data: book
    });
});

exports.deleteMyBook = catchAsync(async (req, res, next) => {
    const book = await Book.findOneAndDelete({
        _id: req.params.id,
        user: req.user._id
    });

    if (!book) return next(new AppError('Book not found.', 404));

    res.status(204).json({
        status: 'success',
        message: 'Book was deleted successfully.',
        data: book
    });
});

exports.likeBook = catchAsync(async (req, res, next) => {
    const book = await Book.findByIdAndUpdate(
        req.params.id,
        { $push: { likedBy: req.user._id } },
        { new: true }
    ).populate({ path: 'user', select: 'username' });

    if (book.user._id.toString() !== req.user._id.toString()) {
        await Notification.create({
            sender: req.user._id,
            recipient: book.user._id,
            content: `[username] liked the book ${book.title}.`,
            link: `/${book.user.username}/books/${book._id}`
        });
    }

    res.status(200).json({
        status: 'success',
        message: 'Book was liked successfully.',
        data: book
    });
});

exports.unlikeBook = catchAsync(async (req, res, next) => {
    const book = await Book.findByIdAndUpdate(
        req.params.id,
        { $pull: { likedBy: req.user._id } },
        { new: true }
    );

    res.status(204).json({
        status: 'success',
        message: 'Book was unliked successfully.',
        data: book
    });
});

exports.getBooksFeed = catchAsync(async (req, res, next) => {
    const following = await Connection.find({
        follower: req.user._id
    });

    const usersFollowing = [req.user._id];

    following.forEach((conn) => usersFollowing.push(conn.following));

    const books = await Book.find({
        user: {
            $in: usersFollowing
        }
    })
        .populate({
            path: 'user',
            select: 'profilePhoto username'
        })
        .sort('-dateCreated');

    res.status(200).json({
        status: 'success',
        data: books
    });
});

exports.getBookLikes = catchAsync(async (req, res, next) => {
    const book = await Book.findById(req.params.id).populate({
        path: 'likedBy',
        select: 'profilePhoto username'
    });

    res.status(200).json({
        status: 'success',
        data: book.likedBy
    });
});
