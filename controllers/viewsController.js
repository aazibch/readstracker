const Book = require('../models/bookModel');
const User = require('../models/userModel');
const Conversation = require('../models/conversationModel');
const Connection = require('../models/connectionModel');
const catchAsync = require('../middleware/catchAsync');
const AppError = require('../utils/appError');
const timeago = require('timeago.js');

exports.getHome = (req, res) => {
    res.status(200).render('home', { title: 'Home | ReadsTracker' });
};

exports.getLoginForm = (req, res) => {
    res.status(200).render('login', { title: 'Login | ReadsTracker' });
};

exports.getSignupForm = (req, res) => {
    res.status(200).render('home', {
        title: 'Home | ReadsTracker',
        showSignupForm: true
    });
};

exports.getProfile = catchAsync(async (req, res, next) => {
    const pugData = {
        title: `${req.params.username}'s Profile | ReadsTracker`,
        profile: req.user
    };

    if (req.user?.username === req.params.username)
        return res.status(200).render('profile', pugData);

    const user = await User.findOne({ username: req.params.username }).populate(
        { path: 'books' }
    );

    if (!user) return next(new AppError('User not found.', 404));

    pugData.relation = {
        following: false,
        followed: false,
        convoToRestore: false
    };

    const followingConn = await Connection.findOne({
        following: user._id,
        follower: req.user._id
    });

    if (followingConn) {
        pugData.relation.following = true;
        pugData.relation.followingConnId = followingConn._id;
    }

    const followedConn = await Connection.findOne({
        following: req.user._id,
        follower: user._id
    });

    if (followedConn) {
        pugData.relation.followed = true;
    }

    pugData.profile = user;

    const convo = await Conversation.findOne({
        $and: [
            { participants: { $in: [user._id] } },
            { participants: { $in: [req.user._id] } }
        ]
    });

    if (convo) {
        if (convo.deletedBy?.toString() === req.user._id.toString()) {
            pugData.relation.convoToRestore = true;
        }

        pugData.relation.convoId = convo._id;
    }

    res.status(200).render('profile', pugData);
});

exports.getBook = catchAsync(async (req, res, next) => {
    const book = await Book.findById(req.params.id).populate({
        path: 'user',
        select: 'username profilePhoto'
    });

    if (!book || book.user.username !== req.params.username)
        return next(new AppError('Book not found.', 404));

    res.status(200).render('book', {
        title: 'ReadsTracker',
        book
    });
});

exports.getBookEditPage = catchAsync(async (req, res, next) => {
    const book = await Book.findById(req.params.id);

    if (!book || book.user._id.toString() !== req.user._id.toString())
        return next(new AppError('Book not found.', 404));

    res.status(200).render('editBook', {
        title: `Edit Book | ReadsTracker`,
        book
    });
});

exports.getSettingsPage = catchAsync(async (req, res) => {
    res.status(200).render('settings', {
        title: 'Settings | ReadsTracker'
    });
});

exports.getSearchResults = catchAsync(async (req, res, next) => {
    const results = await User.find({
        username: {
            $regex: req.query['search_query'],
            $options: 'i'
        }
    }).populate({ path: 'books' });

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
    conversations = conversations.map((convo) => {
        convo.participants.splice(convo.participants.indexOf(user._id), 1);
        if (convo.unreadBy)
            for (let x in convo.unreadBy) {
                convo.unreadBy[x] = convo.unreadBy[x].toString();
            }

        return convo;
    });

    // Populate existing participant
    await Conversation.populate(conversations, {
        path: 'participants'
    });

    // Remove converstions with accounts that are inactive
    conversations = conversations.filter((convo) => {
        return convo.participants.length > 0;
    });

    // Changing property "participants" to "participant" with the value to the user object of the other participant.
    for (let i in conversations) {
        conversations[i] = conversations[i].toObject();
        conversations[i].participant = { ...conversations[i].participants[0] };
        delete conversations[i].participants;
    }

    return conversations;
};

exports.getConversations = catchAsync(async (req, res, next) => {
    const conversations = await getConversations(req.user);
    let newConvo = false;

    if (req.query.newId) {
        const user = await User.findById(req.query.newId);

        if (!user) return;

        const convo = await Conversation.findOne({
            $and: [
                { participants: { $in: [user._id] } },
                { participants: { $in: [req.user._id] } }
            ]
        });

        if (convo) return res.redirect(303, `/messages/${convo._id}`);

        newConvo = true;
    }

    res.status(200).render('messages', {
        title: 'Messages | ReadsTracker',
        conversations,
        newConvo
    });
});

exports.getMessages = catchAsync(async (req, res, next) => {
    const convoUpdates = {};

    if (req.query.toRestore === 'true') convoUpdates.deletedBy = undefined;

    // let selectedConvo = await Conversation.findByIdAndUpdate(
    //     req.params.convoId,
    //     { unreadMessages: false, ...convoUpdates },
    //     { runValidators: true }
    // );

    let selectedConvo = await Conversation.findById(req.params.convoId);

    if (!selectedConvo)
        return next(new AppError('No conversation found.', 404));

    if (selectedConvo.unreadBy?.includes(req.user._id.toString())) {
        selectedConvo.unreadBy = selectedConvo.unreadBy.filter(
            (el) => el.toString() !== req.user._id.toString()
        );
    }

    await selectedConvo.save();

    const conversations = await getConversations(req.user);

    selectedConvo = conversations.find(
        (convo) => convo._id.toString() === req.params.convoId
    );

    res.status(200).render('messages', {
        title: 'Messages | ReadsTracker',
        conversations,
        selectedConvo,
        timeago
    });
});
