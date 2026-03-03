const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/deliveryController');

// GET available orders for repartidores
router.get('/available-orders', deliveryController.getAvailableOrders);

// GET all deliveries
router.get('/', deliveryController.getAllDeliveries);

// GET deliveries by courier
router.get('/courier/:courierId', deliveryController.getDeliveriesByCourier);

// GET active deliveries by courier
router.get('/courier/:courierId/active', deliveryController.getActiveDeliveriesByCourier);

// GET delivery by order ID
router.get('/order/:orderId', deliveryController.getDeliveryByOrder);

// GET delivery by ID
router.get('/:id', deliveryController.getDeliveryById);

// POST create delivery (assign courier)
router.post('/', deliveryController.createDelivery);

// POST start delivery
router.post('/:id/start', deliveryController.startDelivery);

// POST complete delivery
router.post('/:id/complete', deliveryController.completeDelivery);

// POST cancel delivery
router.post('/:id/cancel', deliveryController.cancelDelivery);

// PUT reassign delivery
router.put('/:id/reassign', deliveryController.reassignDelivery);

// POST accept order (repartidor accepts available order)
router.post('/accept', deliveryController.acceptOrder);

module.exports = router;
