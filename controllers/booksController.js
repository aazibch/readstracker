const Book = require('../models/bookModel');
const Connection = require('../models/connectionModel');
const catchAsync = require('../middleware/catchAsync');
const AppError = require('../utils/appError');
const ApiFeatures = require('../utils/apiFeatures');

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

exports.likeBook = catchAsync(async (req, res, next) => {
    const book = await Book.findByIdAndUpdate(
        req.params.id,
        { $push: { likedBy: req.user._id } },
        { new: true }
    );

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

    // const books = await Book.find({
    //     user: {
    //         $in: usersFollowing
    //     }
    // });

    console.log({ usersFollowing });

    const features = new ApiFeatures(
        Book.find({
            user: {
                $in: usersFollowing
            }
        }),
        req.query
    )
        .paginate()
        .sort();

    const books = await features.query.populate({
        path: 'user',
        select: 'profilePhoto username'
    });

    res.status(200).json({
        status: 'success',
        data: books
    });
});
