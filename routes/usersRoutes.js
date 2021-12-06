const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const usersController = require('../controllers/usersController');

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

router.get('/search/:query', usersController.getSearchResults);

router.use(authController.protect);
router.patch('/updateMyPassword', authController.updateMyPassword);

router.get(
    '/me',
    usersController.setIdPropertyOnReqParams,
    usersController.getUser
);

router.patch(
    '/updateMe',
    usersController.uploadProfilePhoto,
    usersController.resizeProfilePhoto,
    usersController.updateMe
);

router.delete('/deleteMe', usersController.deleteMe);

// Routes pertaining to other users.

router.get('/:id', usersController.getUser);

module.exports = router;
