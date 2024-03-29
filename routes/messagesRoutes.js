const express = require('express');
const router = express.Router({ mergeParams: true });

const messagesController = require('../controllers/messagesController');
const authController = require('../controllers/authController');

router
    .route('/')
    .post(authController.protect, messagesController.createMessage);

module.exports = router;
