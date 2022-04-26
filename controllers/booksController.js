const Book = require('../models/bookModel');
const catchAsync = require('../middleware/catchAsync');
const AppError = require('../utils/appError');
const filterObject = require('../utils/filterObject');

exports.getAllMyBooks = catchAsync(async (req, res, next) => {
    const books = await Book.find({ user: req.user._id });

    res.status(200).json({
        status: 'success',
        results: books.length,
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
    );

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
