const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: [true, 'Please provide a username.'],
            maxlength: [
                50,
                'The username should have fewer than fifty characters.'
            ],
            minlength: [3, 'The name should at least have three characters.'],
            validate: {
                validator: function (val) {
                    return /^[a-zA-Z0-9_]*$/.test(val);
                },
                message:
                    'The username can only contain alphanumeric characters (letters A-Z, numbers 0-9) and underscores (_).'
            },
            unique: [true, 'The username already exists.']
        },
        email: {
            type: String,
            required: [true, 'Please provide an email address.'],
            validate: [
                validator.isEmail,
                'Please provide a valid email address.'
            ],
            unique: [true, 'The email address already exists.'],
            lowercase: true,
            maxlength: [
                50,
                'The email address should have fewer than fifty characters.'
            ],
            minlength: [
                5,
                'The email address should at least have five characters.'
            ],
            select: false
        },
        profilePhoto: {
            type: String,
            default: 'default.jpg'
        },
        password: {
            type: String,
            required: [true, 'Please provide a password.'],
            minlength: [
                8,
                'The password should at least have eight characters.'
            ],
            select: false
        },
        confirmPassword: {
            type: String,
            required: [true, 'Please confirm your password.'],
            validate: {
                validator: function (val) {
                    return val === this.password;
                },
                message: 'Passwords do not match.'
            }
        },
        passwordChangeDate: Date,
        active: {
            type: Boolean,
            default: true
        },
        followersCount: {
            type: Number,
            default: 0
        },
        followingCount: {
            type: Number,
            default: 0
        },
        unreadConversationsCount: {
            type: Number,
            default: 0,
            select: false
        },
        passwordResetToken: String,
        passwordResetTokenExpirationDate: Date
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

userSchema.virtual('books', {
    ref: 'Book',
    localField: '_id',
    foreignField: 'user'
});

userSchema.virtual('notifications', {
    ref: 'Notification',
    localField: '_id',
    foreignField: 'recipient'
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 12);
    this.confirmPassword = undefined;

    next();
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password') || this.isNew) return next();

    this.passwordChangeDate = Date.now() - 1000;
    next();
});

userSchema.pre(/^find/, function (next) {
    this.find({ active: { $ne: false } });
    next();
});

userSchema.methods.isPasswordCorrect = async function (
    inputPass,
    encryptedPass
) {
    return await bcrypt.compare(inputPass, encryptedPass);
};

userSchema.methods.changedPasswordAfterToken = function (
    tokenIssuanceTimestamp
) {
    if (this.passwordChangeDate) {
        const passwordChangeTimestamp =
            this.passwordChangeDate.getTime() / 1000;

        return tokenIssuanceTimestamp < passwordChangeTimestamp;
    }

    return false;
};

userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // Reset token expires in five minutes.
    this.passwordResetTokenExpirationDate = Date.now() + 5 * 60 * 1000;
    return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
