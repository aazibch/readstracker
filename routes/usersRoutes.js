const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const usersController = require('../controllers/usersController');

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

router.use(authController.protect);
router.patch('/userUpdatePassword', authController.updatePassword);

router.get('/user',
    usersController.setIdPropertyOnReqParams,
    usersController.getUser
);

router.patch(
    '/userUpdateData',
    usersController.uploadProfilePhoto,
    usersController.updateUser
);
router.delete('/userDelete', usersController.deleteUser);

module.exports = router;