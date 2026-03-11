const { getPool } = require('../config/database');
const Rating = require('../models/Rating');
const logger = require('../utils/logger');

const db = () => getPool();

exports.createRating = async (req, res) => {
  try {
    const rating = new Rating(req.body);
    const validation = rating.validate();
    if (!validation.isValid) {
      return res.status(400).json({ errors: validation.errors });
    }

    // Verify order exists and belongs to user
    const [orders] = await db().query(
      'SELECT id, status FROM orders WHERE id = ? AND user_id = ?',
      [rating.orderId, rating.userId]
    );
    if (orders.length === 0) {
      return res.status(404).json({ error: 'Orden no encontrada o no pertenece al usuario' });
    }
    if (orders[0].status !== 'ENTREGADO') {
      return res.status(400).json({ error: 'Solo se pueden calificar ordenes entregadas' });
    }

    // Check duplicate
    const [existing] = await db().query(
      'SELECT id FROM ratings WHERE user_id = ? AND order_id = ? AND target_type = ? AND target_id = ?',
      [rating.userId, rating.orderId, rating.targetType, rating.targetId]
    );
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Ya calificaste este elemento para esta orden' });
    }

    const dbData = rating.toDatabase();
    const [result] = await db().query(
      'INSERT INTO ratings (user_id, order_id, target_type, target_id, score, comment) VALUES (?, ?, ?, ?, ?, ?)',
      [dbData.user_id, dbData.order_id, dbData.target_type, dbData.target_id, dbData.score, dbData.comment]
    );

    rating.id = result.insertId;
    logger.info(`Rating created: ${rating.targetType} ${rating.targetId} - Score: ${rating.score}`);
    res.status(201).json(rating.toJSON());
  } catch (error) {
    logger.error('Error creating rating:', error);
    res.status(500).json({ error: 'Error creating rating' });
  }
};

exports.getRatingsByTarget = async (req, res) => {
  try {
    const { targetType, targetId } = req.params;
    if (!['RESTAURANTE', 'REPARTIDOR', 'PRODUCTO'].includes(targetType.toUpperCase())) {
      return res.status(400).json({ error: 'Tipo de target invalido' });
    }

    const [rows] = await db().query(
      'SELECT * FROM ratings WHERE target_type = ? AND target_id = ? ORDER BY created_at DESC',
      [targetType.toUpperCase(), targetId]
    );
    const ratings = rows.map(row => Rating.fromDatabase(row).toJSON());
    res.json(ratings);
  } catch (error) {
    logger.error('Error fetching ratings:', error);
    res.status(500).json({ error: 'Error fetching ratings' });
  }
};

exports.getAverageRating = async (req, res) => {
  try {
    const { targetType, targetId } = req.params;
    if (!['RESTAURANTE', 'REPARTIDOR', 'PRODUCTO'].includes(targetType.toUpperCase())) {
      return res.status(400).json({ error: 'Tipo de target invalido' });
    }

    const [rows] = await db().query(
      'SELECT AVG(score) as average, COUNT(*) as total FROM ratings WHERE target_type = ? AND target_id = ?',
      [targetType.toUpperCase(), targetId]
    );

    res.json({
      targetType: targetType.toUpperCase(),
      targetId: parseInt(targetId),
      average: rows[0].average ? Math.round(rows[0].average * 100) / 100 : 0,
      total: rows[0].total
    });
  } catch (error) {
    logger.error('Error fetching average rating:', error);
    res.status(500).json({ error: 'Error fetching average rating' });
  }
};

exports.getRatingsByOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const [rows] = await db().query(
      'SELECT * FROM ratings WHERE order_id = ? ORDER BY created_at DESC',
      [orderId]
    );
    const ratings = rows.map(row => Rating.fromDatabase(row).toJSON());
    res.json(ratings);
  } catch (error) {
    logger.error('Error fetching ratings by order:', error);
    res.status(500).json({ error: 'Error fetching ratings' });
  }
};

exports.getRatingsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const [rows] = await db().query(
      'SELECT * FROM ratings WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    const ratings = rows.map(row => Rating.fromDatabase(row).toJSON());
    res.json(ratings);
  } catch (error) {
    logger.error('Error fetching ratings by user:', error);
    res.status(500).json({ error: 'Error fetching ratings' });
  }
};
