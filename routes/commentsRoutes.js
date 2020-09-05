const express = require('express');
const router = express.Router({ mergeParams: true });

const authController = require('../controllers/authController');
const commentsController = require('../controllers/commentsController');

router.use(authController.protect);

router
    .route('/')
    .get(commentsController.getAllComments)
    .post(commentsController.createComment);

router
    .route('/:id')
    .get(commentsController.getComment)
    .delete(commentsController.deleteComment);

module.exports = router;