/**
 * Catalog Service Models - SOA Pattern
 * Export all models for the catalog service
 */

const Restaurant = require('./Restaurant');
const MenuItem = require('./MenuItem');
const Promotion = require('./Promotion');
const Coupon = require('./Coupon');

module.exports = {
  Restaurant,
  MenuItem,
  Promotion,
  Coupon
};
