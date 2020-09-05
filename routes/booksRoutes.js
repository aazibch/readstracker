const express = require('express');
const router = express.Router();

const booksController = require('../controllers/booksController');
const authController = require('../controllers/authController');

const commentsRouter = require('./commentsRoutes');

router.use('/:bookId/comments', commentsRouter);

router
    .route('/')
    .get(
        authController.protect,
        booksController.getAllBooks
    ).post(
        authController.protect,
        booksController.createBook
    );

router
    .route('/:id')
    .get(
        authController.protect,
        booksController.getBook
    ).delete(
        authController.protect,
        booksController.deleteBook
    ).patch(
        authController.protect,
        booksController.updateBook
    );

module.exports = router;