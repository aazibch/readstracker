const express = require('express');
const router = express.Router({ mergeParams: true });

const authController = require('../controllers/authController');
const notesController = require('../controllers/notesController');

router.use(authController.protect);

router
    .route('/')
    .get(notesController.getAllNotes)
    .post(notesController.createNote);

router
    .route('/:id')
    .get(notesController.getNote)
    .delete(notesController.deleteNote);

module.exports = router;
