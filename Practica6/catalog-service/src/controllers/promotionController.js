const { getPool } = require('../config/database');
const { Promotion } = require('../models');
const logger = require('../utils/logger');

const db = () => getPool();

exports.getAllPromotions = async (req, res) => {
  try {
    const [rows] = await db().query(`
      SELECT p.*, r.name as restaurant_name
      FROM promotions p
      JOIN restaurants r ON p.restaurant_id = r.id
      ORDER BY p.is_active DESC, p.end_date DESC
    `);
    const promotions = rows.map(row => Promotion.fromDatabase(row).toJSON());
    res.json(promotions);
  } catch (error) {
    logger.error('Error fetching promotions:', error);
    res.status(500).json({ error: 'Error fetching promotions' });
  }
};

exports.getActivePromotions = async (req, res) => {
  try {
    const [rows] = await db().query(`
      SELECT p.*, r.name as restaurant_name
      FROM promotions p
      JOIN restaurants r ON p.restaurant_id = r.id
      WHERE p.is_active = TRUE AND NOW() BETWEEN p.start_date AND p.end_date
      ORDER BY p.discount_percentage DESC
    `);
    const promotions = rows.map(row => Promotion.fromDatabase(row).toJSON());
    res.json(promotions);
  } catch (error) {
    logger.error('Error fetching active promotions:', error);
    res.status(500).json({ error: 'Error fetching promotions' });
  }
};

exports.getPromotionsByRestaurant = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const [rows] = await db().query(
      `SELECT p.*, r.name as restaurant_name
       FROM promotions p
       JOIN restaurants r ON p.restaurant_id = r.id
       WHERE p.restaurant_id = ?
       ORDER BY p.is_active DESC, p.end_date DESC`,
      [restaurantId]
    );
    const promotions = rows.map(row => Promotion.fromDatabase(row).toJSON());
    res.json(promotions);
  } catch (error) {
    logger.error('Error fetching restaurant promotions:', error);
    res.status(500).json({ error: 'Error fetching promotions' });
  }
};

exports.createPromotion = async (req, res) => {
  try {
    const promotion = new Promotion(req.body);
    const validation = promotion.validate();
    if (!validation.isValid) {
      return res.status(400).json({ errors: validation.errors });
    }

    const [restaurant] = await db().query(
      'SELECT id FROM restaurants WHERE id = ? AND is_active = true',
      [promotion.restaurantId]
    );
    if (restaurant.length === 0) {
      return res.status(400).json({ error: 'Restaurant not found or inactive' });
    }

    const dbData = promotion.toDatabase();
    const [result] = await db().query(
      `INSERT INTO promotions (restaurant_id, name, description, discount_percentage, start_date, end_date, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [dbData.restaurant_id, dbData.name, dbData.description, dbData.discount_percentage,
       dbData.start_date, dbData.end_date, dbData.is_active]
    );

    promotion.id = result.insertId;
    logger.info(`Promotion created: ${promotion.name} (ID: ${promotion.id})`);
    res.status(201).json(promotion.toJSON());
  } catch (error) {
    logger.error('Error creating promotion:', error);
    res.status(500).json({ error: 'Error creating promotion' });
  }
};

exports.updatePromotion = async (req, res) => {
  try {
    const { id } = req.params;
    const [existing] = await db().query('SELECT * FROM promotions WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Promotion not found' });
    }

    const promotion = new Promotion({ ...existing[0], ...req.body });
    const validation = promotion.validate(true);
    if (!validation.isValid) {
      return res.status(400).json({ errors: validation.errors });
    }

    const dbData = promotion.toDatabase();
    await db().query(
      `UPDATE promotions SET name = ?, description = ?, discount_percentage = ?,
       start_date = ?, end_date = ?, is_active = ? WHERE id = ?`,
      [dbData.name, dbData.description, dbData.discount_percentage,
       dbData.start_date, dbData.end_date, dbData.is_active, id]
    );

    logger.info(`Promotion updated: ${promotion.name} (ID: ${id})`);
    res.json(promotion.toJSON());
  } catch (error) {
    logger.error('Error updating promotion:', error);
    res.status(500).json({ error: 'Error updating promotion' });
  }
};

exports.deletePromotion = async (req, res) => {
  try {
    const { id } = req.params;
    const [existing] = await db().query('SELECT * FROM promotions WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Promotion not found' });
    }

    await db().query('UPDATE promotions SET is_active = false WHERE id = ?', [id]);
    logger.info(`Promotion deactivated: ID ${id}`);
    res.json({ message: 'Promotion deactivated successfully' });
  } catch (error) {
    logger.error('Error deleting promotion:', error);
    res.status(500).json({ error: 'Error deleting promotion' });
  }
};
