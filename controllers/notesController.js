const catchAsync = require('../middleware/catchAsync');
const Book = require('../models/bookModel');
const AppError = require('../utils/appError');
const filterObject = require('../utils/filterObject');

exports.getAllNotes = catchAsync(async (req, res, next) => {
    const book = await Book.findOne({
        _id: req.params.bookId,
        user: req.user._id
    });

    if (!book) return next(new AppError('No book found.', 404));

    res.status(200).json({
        status: 'success',
        data: book.notes
    });
});

exports.createNote = catchAsync(async (req, res, next) => {
    const book = await Book.findOne({
        _id: req.params.bookId,
        user: req.user._id
    });

    if (!book) return next(new AppError('No book found.', 404));

    const filteredBody = filterObject(req.body, 'note');

    book.notes.push(filteredBody);
    await book.save();

    const note = book.notes[book.notes.length - 1];

    res.status(201).json({
        status: 'success',
        data: note
    });
});

exports.getNote = catchAsync(async (req, res, next) => {
    const book = await Book.findOne({
        _id: req.params.bookId,
        user: req.user._id
    });
    const note = book.notes.id(req.params.id);

    if (!book) return next(new AppError('No book found.', 404));
    if (!note) return next(new AppError('No note found.', 404));

    res.status(200).json({
        status: 'success',
        data: note
    });
});

exports.deleteNote = catchAsync(async (req, res, next) => {
    const book = await Book.findOne({
        _id: req.params.bookId,
        user: req.user._id
    });

    if (!book) return next(new AppError('No book found.', 404));

    const note = book.notes.id(req.params.id);

    if (!note) return next(new AppError('No note found.', 404));

    note.remove();
    await book.save();

    res.status(204).json({
        status: 'success',
        data: null
    });
});
