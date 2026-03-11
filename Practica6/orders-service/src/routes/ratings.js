const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/ratingController');

router.post('/', ratingController.createRating);
router.get('/order/:orderId', ratingController.getRatingsByOrder);
router.get('/user/:userId', ratingController.getRatingsByUser);
router.get('/:targetType/:targetId', ratingController.getRatingsByTarget);
router.get('/:targetType/:targetId/average', ratingController.getAverageRating);

module.exports = router;
