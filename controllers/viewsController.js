const Book = require('../models/bookModel');
const User = require('../models/userModel');
const Conversation = require('../models/conversationModel');
const Connection = require('../models/connectionModel');
const catchAsync = require('../middleware/catchAsync');
const AppError = require('../utils/appError');
const timeago = require('timeago.js');
const userController = require('./usersController');

exports.getHome = (req, res) => {
    res.status(200).render('home', { title: 'Home | ReadsTracker' });
};

exports.getLoginForm = (req, res) => {
    res.status(200).render('login', { title: 'Login | ReadsTracker' });
};

exports.getForgotPasswordPage = (req, res) => {
    res.status(200).render('forgotPassword', {
        title: 'Password Recovery | ReadsTracker'
    });
};

exports.getResetPasswordPage = (req, res) => {
    res.status(200).render('resetPassword', {
        title: 'Reset Password | ReadsTracker'
    });
};

exports.getSignupForm = (req, res) => {
    res.status(200).render('home', {
        title: 'Home | ReadsTracker',
        showSignupForm: true
    });
};

exports.redirectToProfile = catchAsync(async (req, res, next) => {
    res.redirect(302, `/${req.user.username}`);
});

exports.getProfile = catchAsync(async (req, res, next) => {
    const viewData = {
        title: `${req.params.username}'s Profile | ReadsTracker`,
        profile: req.user,
        isOwn: true
    };

    if (req.user?.username === req.params.username)
        return res.status(200).render('profile', viewData);

    const user = await User.findOne({ username: req.params.username });

    if (!user) return next(new AppError('Route not found.', 404));

    viewData.relation = {
        following: {
            status: false
        },
        followed: {
            status: false
        },
        conversation: {
            toRestore: false
        }
    };

    const followingConn = await Connection.findOne({
        following: user._id,
        follower: req.user._id
    });

    if (followingConn) {
        viewData.relation.following.status = true;
        viewData.relation.following.connId = followingConn._id;
    }

    const followedConn = await Connection.findOne({
        following: req.user._id,
        follower: user._id
    });

    if (followedConn) {
        viewData.relation.followed.status = true;
    }

    viewData.profile = user;

    const conversation = await Conversation.findOne({
        $and: [
            { participants: { $in: [user._id] } },
            { participants: { $in: [req.user._id] } }
        ]
    });

    if (conversation) {
        viewData.relation.conversation.id = conversation._id;
    }

    if (
        conversation &&
        conversation.deletedBy?.toString() === req.user._id.toString()
    ) {
        viewData.relation.conversation.toRestore = true;
    }

    viewData.isOwn = false;

    res.status(200).render('profile', viewData);
});

exports.getBook = catchAsync(async (req, res, next) => {
    const book = await Book.findById(req.params.id)
        .populate({
            path: 'user',
            select: 'username profilePhoto'
        })
        .populate({ path: 'comments.user', select: 'username profilePhoto' });

    if (!book || book.user.username !== req.params.username)
        return next(new AppError('Route not found.', 404));

    res.status(200).render('book', {
        title: `${book.title} | ReadsTracker`,
        book,
        newComment: req.query.comment === 'true'
    });
});

exports.getAddBookPage = catchAsync(async (req, res, next) => {
    if (req.user.username !== req.params.username)
        return next(new AppError('Route not found.', 404));

    res.status(200).render('addBook', {
        title: 'Add Book | ReadsTracker'
    });
});

exports.getEditBookPage = catchAsync(async (req, res, next) => {
    const book = await Book.findById(req.params.id);

    if (!book || book.user.toString() !== req.user._id.toString())
        return next(new AppError('Route not found.', 404));

    res.status(200).render('editBook', {
        title: `Edit ${book.title} | ReadsTracker`,
        book
    });
});

exports.getSettingsPage = catchAsync(async (req, res) => {
    res.status(200).render('settings', {
        title: 'Settings | ReadsTracker',
        pageType: 'settings'
    });
});

exports.getEditProfilePage = catchAsync(async (req, res) => {
    res.status(200).render('settings', {
        title: 'Edit Profile | ReadsTracker',
        pageType: 'subpage'
    });
});

exports.getChangePasswordPage = catchAsync(async (req, res) => {
    res.status(200).render('settings', {
        title: 'Change Password | ReadsTracker',
        pageType: 'subpage'
    });
});

exports.getDeleteAccountPage = catchAsync(async (req, res) => {
    res.status(200).render('settings', {
        title: 'Delete Account | ReadsTracker',
        pageType: 'subpage'
    });
});

exports.getSearchResults = catchAsync(async (req, res, next) => {
    if (!req.query['search_query'])
        return res.status(200).render('searchResults', {
            title: 'Search | ReadsTracker',
            results: []
        });

    const results = await User.find({
        username: {
            $regex: req.query['search_query'],
            $options: 'i'
        }
    });

    res.status(200).render('searchResults', {
        title: 'Search | ReadsTracker',
        results
    });
});

const getConversations = async (user) => {
    let conversations = await Conversation.find({
        participants: { $in: [user._id] }
    }).sort('-lastUpdated');

    // Remove conversations that have been deleted by logged in user.
    conversations = conversations.filter(
        (convo) => convo.deletedBy?.toString() !== user._id.toString()
    );

    // Remove the user ID for the logged in user
    // and convert mongoIDs to strings in unreadBy property
    conversations = conversations.map((conversation) => {
        conversation.participants.splice(
            conversation.participants.indexOf(user._id),
            1
        );

        if (conversation.unreadBy)
            conversation.unreadBy = conversation.unreadBy.toString();

        return conversation;
    });

    // Populate existing participant
    await Conversation.populate(conversations, {
        path: 'participants'
    });

    // Changing property "participants" to "participant" with the value to the user object of the other participant.
    conversations = conversations.map((conversation) => {
        const convo = conversation.toObject();

        convo.participant = {
            ...conversation
                .toObject()
                .participants.find(
                    (participant) =>
                        participant._id.toString() !== user._id.toString()
                )
        };

        delete convo.participants;

        return convo;
    });

    return conversations;
};

exports.getConversations = catchAsync(async (req, res, next) => {
    res.set('Cache-Control', 'no-store');
    const conversations = await getConversations(req.user);
    const newConversation = { status: false };
    let user;

    if (req.query.newId) {
        user = await User.findById(req.query.newId);

        if (!user) return;

        const conversation = await Conversation.findOne({
            $and: [
                { participants: { $in: [user._id] } },
                { participants: { $in: [req.user._id] } }
            ]
        });

        if (conversation)
            return res.redirect(303, `/messages/${conversation._id}`);

        newConversation.participant = user;
        newConversation.status = true;
    }

    res.status(200).render('messages', {
        title: 'Messages | ReadsTracker',
        conversations,
        newConversation,
        pageType: 'conversations'
    });
});

exports.getMessages = catchAsync(async (req, res, next) => {
    res.set('Cache-Control', 'no-store');
    let selectedConversation = await Conversation.findById(req.params.convoId);
    if (!selectedConversation)
        return next(new AppError('Route not found.', 404));

    if (selectedConversation.unreadBy?.toString() === req.user._id.toString()) {
        selectedConversation.unreadBy = undefined;
        await selectedConversation.save();
    }

    if (
        selectedConversation?.deletedBy?.toString() ===
            req.user._id.toString() &&
        req.query.toRestore === 'true'
    ) {
        selectedConversation.deletedBy = undefined;
        await selectedConversation.save();
    }

    const conversations = await getConversations(req.user);

    selectedConversation = conversations.find(
        (convo) => convo._id.toString() === req.params.convoId
    );

    // Get user again to render updated data.
    let user = await userController.getLoggedInUserDoc(req.user._id);

    res.status(200).render('messages', {
        title: 'Messages | ReadsTracker',
        conversations,
        selectedConversation,
        timeago,
        user,
        pageType: 'messages'
    });
});
