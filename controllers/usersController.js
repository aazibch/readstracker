const catchAsync = require('../middleware/catchAsync');
const AppError = require('../utils/appError');
const filterObject = require('../utils/filterObject');
const User = require('../models/userModel');
const multer = require('multer');

exports.setIdPropertyOnReqParams = (req, res, next) => {
    req.params.id = req.user._id;
    next();
}

exports.getUser = catchAsync(async (req, res, next) => {
    let doc = await Book
        .findById(req.params.id)
        .populate({
            path: 'books'
        });

    if (!doc) return next(new AppError('No user found.', 404));

    res.status(200).json({
        status: 'success',
        data: doc
    });
});;

const multerStorage = multer.diskStorage({
    destination: (req, file, next) => {
        next(null, 'public/images/users');
    },
    filename: (req, file, next) => {
        const ext = file.mimetype.split('/')[1];
        next(null, `user-${req.user.id}-${Date.now()}.${ext}`);
    }
});

const multerFilter = (req, file, next) => {
    if (file.mimetype.startsWith('image')) {
        return next(null, true)
    }

    next(new AppError('Not an image. Only image formats are acceptable.', 400), false);
}

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
});

exports.uploadProfilePhoto = upload.single('profilePhoto');

exports.updateUser = catchAsync(async (req, res, next) => {
    if (req.body.password || req.body.confirmPassword) {
        return next(new AppError('Updating password is not allowed.', 400));
    }

    const filteredUpdatesBody = filterObject(req.body, 'name', 'email');
    if (req.file) filteredUpdatesBody.profilePhoto = req.file.filename;

    const user = await User.findByIdAndUpdate(req.user._id, filteredUpdatesBody, {
        runValidators: true,
        new: true
    });

    res.status(200).json({
        status: 'success',
        data: user
    });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
    const user = await User.findByIdAndUpdate(
        req.user._id,
        { active: false }
    );

    res.status(204).json({
        status: 'success',
        data: null
    });
});