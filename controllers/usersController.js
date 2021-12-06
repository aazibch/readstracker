const multer = require('multer');
const sharp = require('sharp');
const catchAsync = require('../middleware/catchAsync');
const AppError = require('../utils/appError');
const filterObject = require('../utils/filterObject');
const User = require('../models/userModel');

exports.setIdPropertyOnReqParams = (req, res, next) => {
    req.params.id = req.user._id;
    next();
};

exports.getUser = catchAsync(async (req, res, next) => {
    let query = User.findById(req.params.id).populate({ path: 'books' });

    // Remove email property when accessing another user's data.
    if (req.path !== '/user') query = query.select('-email');

    const doc = await query;

    if (!doc) return next(new AppError('No user found.', 404));

    res.status(200).json({
        status: 'success',
        data: doc
    });
});

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, next) => {
    if (file.mimetype.startsWith('image')) {
        return next(null, true);
    }

    next(
        new AppError('Not an image. Only image formats are acceptable.', 400),
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

    // Saving filename to multer properties because it's needed
    // in the .updateMe method.
    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

    await sharp(req.file.buffer)
        .resize(500, 500)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/images/users/${req.file.filename}`);

    next();
});

exports.updateMe = catchAsync(async (req, res, next) => {
    if (req.body.password || req.body.confirmPassword) {
        return next(new AppError('Updating password is not allowed.', 400));
    }

    const filteredUpdatesBody = filterObject(req.body, 'name', 'email');
    if (req.file) filteredUpdatesBody.profilePhoto = req.file.filename;

    const user = await User.findByIdAndUpdate(
        req.user._id,
        filteredUpdatesBody,
        {
            runValidators: true,
            new: true
        }
    );

    res.status(200).json({
        status: 'success',
        data: user
    });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
    const user = await User.findByIdAndUpdate(req.user._id, { active: false });

    res.status(204).json({
        status: 'success',
        data: null
    });
});

exports.getSearchResults = catchAsync(async (req, res, next) => {
    const results = await User.find({
        username: {
            $regex: req.params.query,
            $options: 'i'
        }
    })
        .select('-email')
        .populate({ path: 'books' });

    res.status(200).json({
        status: 'success',
        data: results
    });
});
