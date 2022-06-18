const multer = require('multer');
const sharp = require('sharp');
const catchAsync = require('../middleware/catchAsync');
const AppError = require('../utils/appError');
const filterObject = require('../utils/filterObject');
const User = require('../models/userModel');
const Notification = require('../models/notificationModel');

exports.getLoggedInUserDoc = async (userId) => {
    const user = await User.findById(userId)
        .populate('books')
        .populate({
            path: 'notifications',
            populate: {
                path: 'sender'
            }
        })
        .select('+unreadConversationsCount +email');

    return user;
};

exports.getMe = catchAsync(async (req, res, next) => {
    let user = await User.findById(req.user._id).populate({ path: 'books' });

    if (!user) return next(new AppError('No user found.', 404));

    res.status(200).json({
        status: 'success',
        data: user
    });
});

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, next) => {
    if (file.mimetype.startsWith('image')) {
        return next(null, true);
    }

    next(
        new AppError('Not an image. Only image formats are accepted.', 400),
        false
    );
};

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
});

exports.uploadProfilePhoto = upload.single('profilePhoto');

exports.resizeProfilePhoto = catchAsync(async (req, res, next) => {
    if (!req.file) return next();

    // Saving filename to multer properties because it's needed in the .updateMe method.
    req.file.filename = `user-${req.user.id}-${Date.now()}.jpg`;

    await sharp(req.file.buffer)
        .resize(300, 300)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/images/users/${req.file.filename}`);

    next();
});

exports.updateMe = catchAsync(async (req, res, next) => {
    const filteredBody = filterObject(req.body, 'username', 'email');

    if (req.file) filteredBody.profilePhoto = req.file.filename;

    const user = await User.findByIdAndUpdate(req.user._id, filteredBody, {
        runValidators: true,
        new: true
    });

    res.status(200).json({
        status: 'success',
        message: 'Your data was updated successfully.',
        data: user
    });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
    const user = await User.findByIdAndUpdate(req.user._id, { active: false });

    res.status(204).json({
        status: 'success',
        data: user
    });
});

exports.getSearchResults = catchAsync(async (req, res, next) => {
    const results = await User.find({
        username: {
            $regex: req.params.query,
            $options: 'i'
        }
    });

    res.status(200).json({
        status: 'success',
        data: results
    });
});

exports.updateNotifications = catchAsync(async (req, res, next) => {
    if (req.user && req.query.notifId) {
        const notification = await Notification.findOneAndUpdate(
            {
                recipient: req.user._id,
                _id: req.query.notifId
            },
            {
                unread: false
            },
            { new: true }
        );

        if (notification) {
            const user = await this.getLoggedInUserDoc(req.user._id);

            req.user = user;
            res.locals.user = user;
        }
    }

    next();
});
