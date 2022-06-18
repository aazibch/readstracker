const express = require('express');
const router = express.Router();

const booksController = require('../controllers/booksController');
const authController = require('../controllers/authController');

router
    .route('/')
    .get(authController.protect, booksController.getAllMyBooks)
    .post(authController.protect, booksController.createMyBook);

router
    .route('/following')
    .get(authController.protect, booksController.getBooksFeed);

router
    .route('/:id')
    .get(authController.protect, booksController.getMyBook)
    .delete(authController.protect, booksController.deleteMyBook)
    .patch(authController.protect, booksController.updateMyBook);

router
    .route('/:id/likes')
    .get(booksController.getBookLikes)
    .post(authController.protect, booksController.likeBook)
    .delete(authController.protect, booksController.unlikeBook);

module.exports = router;
