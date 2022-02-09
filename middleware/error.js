const AppError = require('../utils/appError');

const getCastError = (err) => {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new AppError(message, 400);
};

const getDublicateFieldError = (err) => {
    const key = Object.keys(err.keyPattern)[0];
    const message = `Duplicate key value for the key ${key}.`;
    return new AppError(message, 400);
};

const getDublicateFieldErrorForEmail = (err) => {
    const message = 'An account with the same email address already exists.';
    return new AppError(message, 400);
};

const getValidationError = (err) => {
    // editing!!!
    const errors = Object.values(err.errors).map((el) => {
        if (el.name === 'CastError') return `Invalid ${el.path}: ${el.value}.`;

        return el.message;
    });

    const message = `Invalid input data. ${errors.join(' ')}`;
    return new AppError(message, 400);
};

const sendError = (err, req, res) => {
    if (req.originalUrl.startsWith('/api')) {
        if (err.isOperational) {
            return res.status(err.statusCode).json({
                status: err.status,
                message: err.message
            });
        }

        console.log('ERROR', err);
        return res.status(500).json({
            status: 'error',
            message: 'Something went wrong.'
        });
    }

    if (err.isOperational) {
        return res.status(err.statusCode).render('error', {
            title: 'Error',
            message: err.message
        });
    }

    console.log('ERROR', err);
    return res.status(500).render('error', {
        title: 'Error',
        message: 'Something went wrong.'
    });
};

module.exports = (err, req, res, next) => {
    const { originalUrl } = req;

    if (err.name === 'CastError' && originalUrl.startsWith('/api'))
        err = getCastError(err);
    if (err.code === 11000) {
        if (
            originalUrl === '/api/v1/users/signup' &&
            Object.keys(err.keyPattern)[0] === 'email'
        ) {
            err = getDublicateFieldErrorForEmail(err);
        } else {
            err = getDublicateFieldError(err);
        }
    }
    if (err.name === 'ValidationError') err = getValidationError(err);

    sendError(err, req, res);
};
