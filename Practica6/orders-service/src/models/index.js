/**
 * Orders Service Models - SOA Pattern
 * Export all models for the orders service
 */

const Order = require('./Order');
const OrderItem = require('./OrderItem');
const Rating = require('./Rating');

module.exports = {
  Order,
  OrderItem,
  Rating
};
