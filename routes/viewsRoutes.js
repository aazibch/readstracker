const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const viewsController = require('../controllers/viewsController');

router.get('/', authController.isLoggedIn, viewsController.getHome);
// router.get('/login', authController.isLoggedIn, viewsController.getLoginForm);
router.get('/signup', authController.isLoggedIn, viewsController.getSignupForm);

// Routes related to the logged in user.

router.get(
    '/settings',
    authController.protect,
    viewsController.getSettingsPage
);

router.get(
    '/:username/books/:id/edit',
    authController.protect,
    viewsController.getBookEditPage
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
    
// Routes related to all users.

router.get(
    '/search-results',
    authController.isLoggedIn,
    viewsController.getSearchResults
);

router.get(
    '/:username',
    authController.isLoggedIn,
    viewsController.getProfile
);

router.get(
    '/:username/books/:id',
    authController.isLoggedIn,
    viewsController.getBook
);

module.exports = router;
