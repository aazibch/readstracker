const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const usersController = require('../controllers/usersController');

const connectionsRoutes = require('../routes/connectionsRoutes');

router.use('/:userId/connections/', connectionsRoutes);

router.post('/signup', authController.signup);
router.post('/login', authController.login);

// Returns a cookie, so GET HTTP verb makes sense
router.get('/logout', authController.logout);

router.get('/search/:query', usersController.getSearchResults);

router.use(authController.protect);

router.patch('/updateMyPassword', authController.updateMyPassword);

router
    .route('/me')
    .get(usersController.getMe)
    .patch(
        usersController.uploadProfilePhoto,
        usersController.resizeProfilePhoto,
        usersController.updateMe
    )
    .delete(usersController.deleteMe);

module.exports = router;
