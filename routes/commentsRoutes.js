const express = require('express');
const router = express.Router({ mergeParams: true });

const authController = require('../controllers/authController');
const commentsController = require('../controllers/commentsController');

router
    .route('/')
    .get(authController.protect, commentsController.getAllComments)
    .post(authController.protect, commentsController.createComment);

module.exports = router;
