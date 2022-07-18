const express = require('express');
const router = express.Router();

const booksController = require('../controllers/booksController');
const authController = require('../controllers/authController');

router.use(authController.protect);

router
    .route('/')
    .get(booksController.getAllMyBooks)
    .post(booksController.createMyBook);

router.route('/following').get(booksController.getBooksFeed);

router.route('/user/:userId').get(booksController.getAllBooks);

router
    .route('/:id')
    .get(booksController.getMyBook)
    .delete(booksController.deleteMyBook)
    .patch(booksController.updateMyBook);

router
    .route('/:id/likes')
    .get(booksController.getBookLikes)
    .post(booksController.likeBook)
    .delete(booksController.unlikeBook);

module.exports = router;
