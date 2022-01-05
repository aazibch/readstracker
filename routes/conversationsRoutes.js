const express = require('express');
const router = express.Router();

const conversationsController = require('../controllers/conversationsController');
const authController = require('../controllers/authController');

router
    .route('/')
    .post(authController.protect, conversationsController.createConversation);

module.exports = router;
