const express = require('express');
const router = express.Router({ mergeParams: true });

const connectionsController = require('../controllers/connectionsController');
const authController = require('../controllers/authController');

router.get('/followers', connectionsController.getFollowers);
router.get('/following', connectionsController.getAccountsFollowing);

router.post('/', authController.protect, connectionsController.createConnection);

router.delete('/:connId', authController.protect, connectionsController.deleteConnection);

module.exports = router;