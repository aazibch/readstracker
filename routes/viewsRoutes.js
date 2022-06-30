const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const viewsController = require('../controllers/viewsController');
const userController = require('../controllers/usersController');

router.get('/', authController.isLoggedIn, viewsController.getHome);
router.get('/signup', authController.isLoggedIn, viewsController.getSignupForm);

// Routes for the logged in user.

// router.use(authController.protect);

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
    viewsController.getEditBookPage
);

router.get(
    '/:username/books/add',
    authController.protect,
    viewsController.getAddBookPage
);

router.get(
    '/:username',
    authController.protect,
    userController.updateNotifications,
    viewsController.getProfile
);

router.get(
    '/:username/books/:id',
    authController.protect,
    userController.updateNotifications,
    viewsController.getBook
);

router.get('/search-results', viewsController.getSearchResults);

module.exports = router;
