const catchAsync = require('../middleware/catchAsync');
const Book = require('../models/bookModel');
const AppError = require('../utils/appError');
const filterObject = require('../utils/filterObject');

exports.getAllComments = catchAsync(async (req, res, next) => {
    const book = await Book
        .findOne({
            _id: req.params.bookId,
            user: req.user._id
        });

    if (!book) return next(new AppError('No book found.', 404));

    res.status(200).json({
        status: 'success',
        data: book.comments
    });
});

exports.createComment = catchAsync(async (req, res, next) => {
    const book = await Book.findOne({
        _id: req.params.bookId,
        user: req.user._id
    });
    
    if (!book) return next(new AppError('No book found.', 404));

    const filteredBody = filterObject(req.body, 'comment');

    book.comments.push(filteredBody);
    await book.save();

    const comment = book.comments[book.comments.length - 1];
    
    res.status(201).json({
        status: 'success',
        data: comment
    });
});

exports.getComment = catchAsync(async (req, res, next) => {
    const book = await Book.findOne({
        _id: req.params.bookId,
        user: req.user._id
    });
    const comment = book.comments.id(req.params.id);
    
    if (!book) return next(new AppError('No book found.', 404));
    if (!comment) return next(new AppError('No comment found.', 404));

    res.status(200).json({
        status: 'success',
        data: comment
    });
});

exports.deleteComment = catchAsync(async (req, res, next) => {
    const book = await Book.findOne({
        _id: req.params.bookId,
        user: req.user._id
    });

    if (!book) return next(new AppError('No book found.', 404));

    const comment = book.comments.id(req.params.id);

    if (!comment) return next(new AppError('No comment found.', 404));

    comment.remove();
    await book.save();

    res.status(204).json({
        status: 'success',
        data: null
    });
});