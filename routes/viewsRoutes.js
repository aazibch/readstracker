const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const viewsController = require('../controllers/viewsController');

router.get('/', authController.isLoggedIn, viewsController.getHome);
router.get('/login', authController.isLoggedIn, viewsController.getLoginForm);
router.get('/signup', authController.isLoggedIn, viewsController.getSignupForm);
router.get('/forgot-password', authController.isLoggedIn, viewsController.getForgotPasswordPage);
router.get('/password-recovery/:token', authController.isLoggedIn, viewsController.getPasswordRecoveryPage);
router.get('/user', authController.protect, viewsController.getProfile);
router.get('/user/settings', authController.protect, viewsController.getSettingsPage);
router.get('/books/:id', authController.protect, viewsController.getBook);
router.get('/books/:id/edit', authController.protect, viewsController.getEditPage);

module.exports = router;