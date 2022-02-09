const express = require('express');
const router = express.Router();

const conversationsController = require('../controllers/conversationsController');
const authController = require('../controllers/authController');

const messagesRouter = require('./messagesRoutes');

router.use('/:conversationId/messages', messagesRouter);

router
    .route('/')
    .get(authController.protect, conversationsController.getAllConversations)
    .post(authController.protect, conversationsController.createConversation);

router
    .route('/:conversationId/participants')
    .get(authController.protect, conversationsController.getParticipants);

module.exports = router;
