const Book = require('../models/bookModel');
const User = require('../models/userModel');
const Conversation = require('../models/conversationModel');
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
    res.status(200).render('signup', { title: 'Signup | ReadsTracker' });
};

exports.getProfile = catchAsync(async (req, res, next) => {
    if (req.user && req.user.username === req.params.username) {
        return res
            .status(200)
            .render('profile', { title: `${req.user.username}'s Profile | ReadsTracker`, profile: req.user });
    }

    const user = await User.findOne({ username: req.params.username }).populate(
        { path: 'books' }
    );

    if (!user) return next(new AppError('User not found.', 404));

    res.status(200).render('profile', { title: `${user.username}'s Profile | ReadsTracker`, profile: user });
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

    if (!book || book.user._id.toString() !== req.user._id.toString()) return next(new AppError('Book not found.', 404));

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
    })
        .select('-email')
        .populate({ path: 'books' });

    res.status(200).render('searchResults', {
        title: 'Search | ReadsTracker',
        results
    });
});

const getConversations = async (user) => {
    let conversations = await Conversation.find({
        participants: { $in: [user._id] }
    });

    // Remove the user ID for the logged in user.
    conversations = conversations.map(convo => {
        convo.participants.splice(convo.participants.indexOf(user._id), 1)

        return convo;
    });

    // Populate existing participant
    await Conversation.populate(conversations, {
        path: 'participants',
        select: ['-email']
    });

    // Remove converstions with accounts that are inactive
    conversations = conversations.filter((convo) => {
        return convo.participants.length > 0;
    });

    // Changing property "participants" to "participant" with the value to the user object of the other participant.
    for (let i in conversations) {
        conversations[i] = conversations[i].toObject();
        conversations[i].participant = { ...conversations[i].participants[0] }
        delete conversations[i].participants;
    }

    return conversations;
};

exports.getConversations = catchAsync(async (req, res, next) => {
    const conversations = await getConversations(req.user);

    res.status(200).render('messages', { title: 'Messages | ReadsTracker', conversations });
});

exports.getMessages = catchAsync(async (req, res, next) => {
    const conversations = await getConversations(req.user);

    const selectedConvo = conversations.find(
        (convo) => convo._id.toString() === req.params.convoId
    );

    if (!selectedConvo)
        return next(new AppError('No conversation found.', 404));

    res.status(200).render('messages', {
        title: 'Messages | ReadsTracker',
        conversations,
        selectedConvo,
        timeago
    });
});
