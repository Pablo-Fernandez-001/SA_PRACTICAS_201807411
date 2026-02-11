const express = require('express');
const router = express.Router();
const restaurantController = require('../controllers/restaurantController');

// GET all restaurants
router.get('/', restaurantController.getAllRestaurants);

// GET restaurant by ID
router.get('/:id', restaurantController.getRestaurantById);

// GET restaurants by owner
router.get('/owner/:ownerId', restaurantController.getRestaurantsByOwner);

// POST create restaurant
router.post('/', restaurantController.createRestaurant);

// PUT update restaurant
router.put('/:id', restaurantController.updateRestaurant);

// DELETE restaurant (soft delete)
router.delete('/:id', restaurantController.deleteRestaurant);

module.exports = router;
