const express = require('express');
const router = express.Router();
const couponController = require('../controllers/couponController');

router.get('/', couponController.getAllCoupons);
router.post('/validate', couponController.validateCoupon);
router.post('/apply', couponController.applyCoupon);
router.post('/', couponController.createCoupon);
router.put('/:id', couponController.updateCoupon);
router.delete('/:id', couponController.deleteCoupon);

module.exports = router;
