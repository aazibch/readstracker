const express = require('express');
const router = express.Router();

const conversationsController = require('../controllers/conversationsController');
const authController = require('../controllers/authController');

const messagesRouter = require('./messagesRoutes');

router.use('/:conversationId/messages', messagesRouter);

router
    .route('/')
    .post(authController.protect, conversationsController.createConversation);

module.exports = router;
