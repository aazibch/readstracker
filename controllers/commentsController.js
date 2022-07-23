const catchAsync = require('../middleware/catchAsync');
const Book = require('../models/bookModel');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const filterObject = require('../utils/filterObject');

exports.getAllComments = catchAsync(async (req, res, next) => {
    const book = await Book.findOne({
        _id: req.params.bookId,
        user: req.user._id
    });

    if (!book) return next(new AppError('Book not found.', 404));

    res.status(200).json({
        status: 'success',
        data: book.comments
    });
});

exports.createComment = catchAsync(async (req, res, next) => {
    let book = await Book.findOne({
        _id: req.params.bookId
    });

    if (!book) return next(new AppError('Book not found.', 404));

    const filteredBody = filterObject(req.body, 'content');

    filteredBody.user = req.user._id;

    book.comments.push(filteredBody);
    await book.save();

    const comment = book.comments[book.comments.length - 1].toObject();

    comment.user = await User.findById(comment.user).select(
        'profilePhoto username'
    );

    res.status(201).json({
        status: 'success',
        message: 'Comment was created successfully.',
        data: comment
    });
});

// exports.deleteNote = catchAsync(async (req, res, next) => {
//     const book = await Book.findOne({
//         _id: req.params.bookId,
//         user: req.user._id
//     });

//     if (!book) return next(new AppError('Book not found.', 404));

//     const note = book.notes.id(req.params.id);

//     if (!note) return next(new AppError('No note found.', 404));

//     note.remove();
//     await book.save();

//     res.status(204).json({
//         status: 'success',
//         data: note
//     });
// });
