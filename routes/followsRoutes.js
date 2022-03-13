const express = require('express');
const router = express.Router();

const followsController = require('../controllers/followsController');
const authController = require('../controllers/authController');

router.post('/', authController.protect, followsController.createMyFollow);

router.delete('/:followId', authController.protect, followsController.deleteMyFollow);

module.exports = router;