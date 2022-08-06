const catchAsync = require('../middleware/catchAsync');
const Book = require('../models/bookModel');
const User = require('../models/userModel');
const Notification = require('../models/notificationModel');
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
    }).populate({ path: 'user', select: 'username' });

    if (!book) return next(new AppError('Book not found.', 404));

    const filteredBody = filterObject(req.body, 'content');

    filteredBody.user = req.user._id;

    book.comments.push(filteredBody);
    await book.save();

    console.log(
        '[createBook]',
        'book.user._id',
        book.user._id,
        'req.user._id',
        req.user._id
    );

    if (book.user._id.toString() !== req.user._id.toString()) {
        await Notification.create({
            sender: req.user._id,
            recipient: book.user._id,
            content: `[username] commented on the book ${book.title}.`,
            link: `/${book.user.username}/books/${book._id}`
        });
    }

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

exports.deleteComment = catchAsync(async (req, res, next) => {
    const book = await Book.findOne({
        _id: req.params.bookId
    });

    if (!book) return next(new AppError('Comment not found.', 404));

    const comment = book.comments.id(req.params.id);

    if (
        !comment ||
        (comment.user.toString() !== req.user._id.toString() &&
            req.user._id.toString() !== book.user.toString())
    )
        return next(new AppError('Comment not found.', 404));

    comment.remove();
    await book.save();

    res.status(204).json({
        status: 'success',
        data: comment
    });
});
