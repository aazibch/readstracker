const express = require('express');
const router = express.Router({ mergeParams: true });

const authController = require('../controllers/authController');
const notesController = require('../controllers/notesController');

router
    .route('/')
    .get(authController.protect, notesController.getAllNotes)
    .post(authController.protect, notesController.createNote);

router
    .route('/:id')
    .delete(authController.protect, notesController.deleteNote);

module.exports = router;
