const express = require('express');
const router = express.Router({ mergeParams: true });

const authController = require('../controllers/authController');
const commentsController = require('../controllers/commentsController');

router
    .route('/')
    .get(authController.protect, commentsController.getAllComments)
    .post(authController.protect, commentsController.createComment);

router
    .route('/:id')
    .delete(authController.protect, commentsController.deleteComment);

module.exports = router;
