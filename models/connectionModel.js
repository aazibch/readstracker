const mongoose = require('mongoose');
const User = require('./userModel');

const connectionSchema = new mongoose.Schema({
    follower: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [
            true,
            'To create a valid connection, a follower is required.'
        ],
        validate: {
            validator: function (val) {
                console.log(
                    '[connectionSchema] validate',
                    typeof val,
                    typeof this.following
                );
                return val.toString() !== this.following.toString();
            },
            message:
                'The follower cannot be the same user as the one you are following.'
        }
    },
    following: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [
            true,
            'To create a valid connection, the user to follow is required.'
        ]
    }
});

connectionSchema.index({ follower: 1, following: 1 }, { unique: true });

connectionSchema.statics.calcFollowers = async function (userId) {
    const stats = await this.aggregate([
        {
            $match: { following: userId }
        },
        {
            $group: {
                _id: '$following',
                followers: { $sum: 1 }
            }
        }
    ]);

    if (stats.length > 0) {
        return await User.findByIdAndUpdate(userId, {
            followersCount: stats[0].followers
        });
    }

    await User.findByIdAndUpdate(userId, {
        followersCount: 0
    });
};

connectionSchema.statics.calcFollowing = async function (userId) {
    const stats = await this.aggregate([
        {
            $match: { follower: userId }
        },
        {
            $group: {
                _id: '$follower',
                following: { $sum: 1 }
            }
        }
    ]);

    if (stats.length > 0) {
        return await User.findByIdAndUpdate(userId, {
            followingCount: stats[0].following
        });
    }

    await User.findByIdAndUpdate(userId, {
        followingCount: 0
    });
};

connectionSchema.post('save', function () {
    this.constructor.calcFollowers(this.following);
    this.constructor.calcFollowing(this.follower);
});

connectionSchema.pre('findOneAndDelete', async function (next) {
    this.f = await this.findOne();
    next();
});

connectionSchema.post('findOneAndDelete', async function () {
    this.f.constructor.calcFollowers(this.f.following);
    this.f.constructor.calcFollowing(this.f.follower);
});

const Connection = mongoose.model('Connection', connectionSchema);
module.exports = Connection;
