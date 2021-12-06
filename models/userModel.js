const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
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
                    'A username can only contain alphanumeric characters (letters A-Z, numbers 0-9) and the underscore (_).'
            },
            unique: [true, 'User with the same username already present.']
        },
        email: {
            type: String,
            required: [true, 'Please provide an email address.'],
            validate: [
                validator.isEmail,
                'Please provide a valid email address.'
            ],
            unique: [true, 'User with the same email address already present.'],
            lowercase: true,
            maxlength: [
                55,
                'The email address should have fewer than fifty five characters.'
            ],
            minlength: [
                5,
                'The email address should have at least five characters.'
            ]
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
                'The password should have at least eight characters.'
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
        passwordChangeDate: {
            type: Date,
            select: false
        },
        passwordResetToken: {
            type: String,
            select: false
        },
        passwordResetTokenExpirationDate: {
            type: Date,
            select: false
        },
        active: {
            type: Boolean,
            default: true
        }
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

userSchema.statics.encryptPasswordResetToken = function (token) {
    return crypto.createHash('sha256').update(token).digest('hex');
};

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

        return passwordChangeTimestamp > tokenIssuanceTimestamp;
    }

    return false;
};

userSchema.methods.generatePasswordResetToken = function () {
    const token = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = this.constructor.encryptPasswordResetToken(token);
    this.passwordResetTokenExpirationDate = Date.now() + 1000 * 60 * 10;

    return token;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
