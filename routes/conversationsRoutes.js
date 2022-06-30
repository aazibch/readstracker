const express = require('express');
const router = express.Router();

const conversationsController = require('../controllers/conversationsController');
const authController = require('../controllers/authController');

const messagesRouter = require('./messagesRoutes');

router.use('/:conversationId/messages', messagesRouter);

router.use(authController.protect);

router.route('/').post(conversationsController.createConversation);

router.route('/:convoId').delete(conversationsController.deleteConversation);

module.exports = router;
