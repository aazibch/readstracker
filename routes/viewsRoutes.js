const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const viewsController = require('../controllers/viewsController');
const userController = require('../controllers/usersController');

router.get('/', authController.isLoggedIn, viewsController.getHome);
// router.get('/login', authController.isLoggedIn, viewsController.getLoginForm);
router.get('/signup', authController.isLoggedIn, viewsController.getSignupForm);

// Routes related to the logged in user.

router.get(
    '/profile',
    authController.protect,
    viewsController.redirectToProfile
);

router.get(
    '/settings',
    authController.protect,
    viewsController.getSettingsPage
);

router.get(
    '/messages',
    authController.protect,
    viewsController.getConversations
);

router.get(
    '/messages/:convoId',
    authController.protect,
    viewsController.getMessages
);

router.get(
    '/:username/books/:id/edit',
    authController.protect,
    viewsController.getBookEditPage
);

router.get(
    '/:username/books/add',
    authController.protect,
    viewsController.getAddBookPage
);

// Routes related to all users.

router.get(
    '/:username',
    authController.isLoggedIn,
    userController.updateNotifications,
    viewsController.getProfile
);

router.get(
    '/:username/books/:id',
    authController.isLoggedIn,
    userController.updateNotifications,
    viewsController.getBook
);

router.get(
    '/search-results',
    authController.isLoggedIn,
    viewsController.getSearchResults
);

module.exports = router;
