const Book = require('../models/bookModel');
const catchAsync = require('../middleware/catchAsync');
const AppError = require('../utils/appError');
const ApiFeatures = require('../utils/apiFeatures');
const filterObject = require('../utils/filterObject');

exports.getAllBooks = catchAsync(async (req, res, next) => {
    const features = new ApiFeatures(Book.find({ user: req.user._id }), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();

    const docs = await features.query;

    res.status(200).json({
        status: 'success',
        results: docs.length,
        data: docs
    });
});

exports.getBook = catchAsync(async (req, res, next) => {
    let book = await Book
        .findOne({
            _id: req.params.id,
            user: req.user._id
        });

    if (!book) return next(new AppError('No book found.', 404));

    res.status(200).json({
        status: 'success',
        data: book
    });
});

exports.createBook = catchAsync(async (req, res, next) => {
    const filteredBody = filterObject(req.body, 'title', 'author', 'rating', 'genre');
    req.body.user = req.user._id;

    const book = new Book(req.body);
    await book.save();

    res.status(201).json({
        status: 'success',
        data: book
    });
});

exports.updateBook = catchAsync(async (req, res, next) => {
    const filteredBody = filterObject(req.body, 'title', 'author', 'rating', 'genre');

    const doc = await Book.findOneAndUpdate({
        _id: req.params.id,
        user: req.user._id
    }, filteredBody, { new: true, runValidators: true });

    if (!doc) return next(new AppError('No book found.', 404));

    res.status(200).json({
        status: 'success',
        data: doc
    });
});

exports.deleteBook = catchAsync(async (req, res, next) => {
    const doc = await Book.findOneAndDelete({
        _id: req.params.id,
        user: req.user._id
    });

    if (!doc) return next(new AppError('No book found.', 404));

    res.status(204).json({
        status: 'success',
        data: doc
    });
});;