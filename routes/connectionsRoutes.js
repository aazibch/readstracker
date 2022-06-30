const express = require('express');
const router = express.Router({ mergeParams: true });

const connectionsController = require('../controllers/connectionsController');
const authController = require('../controllers/authController');

router.get(
    '/followers',
    authController.protect,
    connectionsController.getFollowers
);
router.get(
    '/following',
    authController.protect,
    connectionsController.getAccountsFollowing
);

router.post(
    '/',
    authController.protect,
    connectionsController.createConnection
);

router.delete(
    '/:connId',
    authController.protect,
    connectionsController.deleteConnection
);

module.exports = router;
