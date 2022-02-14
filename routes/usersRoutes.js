const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const usersController = require('../controllers/usersController');

router.post('/signup', authController.signup);
router.post('/login', authController.login);

// Returns a cookie, so GET HTTP verb makes sense
router.get('/logout', authController.logout);

router.get('/search/:query', usersController.getSearchResults);

router.use(authController.protect);

router.patch('/updateMyPassword', authController.updateMyPassword);

router.get(
    '/me',
    usersController.getMe
);

router.patch(
    '/updateMe',
    usersController.uploadProfilePhoto,
    usersController.resizeProfilePhoto,
    usersController.updateMe
);

router.delete('/deleteMe', usersController.deleteMe);

module.exports = router;
