const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const viewsController = require('../controllers/viewsController');

router.get('/', authController.isLoggedIn, viewsController.getHome);
router.get('/login', authController.isLoggedIn, viewsController.getLoginForm);
router.get('/signup', authController.isLoggedIn, viewsController.getSignupForm);

// Routes pertaining to the logged in user.

router.get(
    '/forgot-password',
    authController.isLoggedIn,
    viewsController.getForgotPasswordPage
);

router.get(
    '/password-recovery/:token',
    authController.isLoggedIn,
    viewsController.getPasswordRecoveryPage
);

router.get(
    '/user/settings',
    authController.protect,
    viewsController.getSettingsPage
);

router.get(
    '/users/:username/books/:id',
    authController.isLoggedIn,
    viewsController.getBook
);

router.get(
    '/books/:id/edit',
    authController.protect,
    viewsController.getEditPage
);

router.get(
    '/search-results',
    authController.isLoggedIn,
    viewsController.getSearchResults
);

// Routes pertaining to other users.

router.get(
    '/users/:username',
    authController.isLoggedIn,
    viewsController.getProfile
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

module.exports = router;
