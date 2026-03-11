const { getPool } = require('../config/database');
const { Coupon } = require('../models');
const logger = require('../utils/logger');

const db = () => getPool();

exports.getAllCoupons = async (req, res) => {
  try {
    const [rows] = await db().query('SELECT * FROM coupons ORDER BY is_active DESC, end_date DESC');
    const coupons = rows.map(row => Coupon.fromDatabase(row).toJSON());
    res.json(coupons);
  } catch (error) {
    logger.error('Error fetching coupons:', error);
    res.status(500).json({ error: 'Error fetching coupons' });
  }
};

exports.validateCoupon = async (req, res) => {
  try {
    const { code, orderTotal } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'Coupon code is required' });
    }

    const [rows] = await db().query(
      'SELECT * FROM coupons WHERE code = ?',
      [code.toUpperCase()]
    );

    if (rows.length === 0) {
      return res.status(404).json({ valid: false, error: 'Cupon no encontrado' });
    }

    const coupon = Coupon.fromDatabase(rows[0]);

    if (!coupon.isActive) {
      return res.status(400).json({ valid: false, error: 'Cupon desactivado' });
    }

    const now = new Date();
    if (now < new Date(coupon.startDate) || now > new Date(coupon.endDate)) {
      return res.status(400).json({ valid: false, error: 'Cupon expirado o no vigente' });
    }

    if (coupon.currentUses >= coupon.maxUses) {
      return res.status(400).json({ valid: false, error: 'Cupon agotado' });
    }

    const total = parseFloat(orderTotal || 0);
    if (total < coupon.minOrderAmount) {
      return res.status(400).json({
        valid: false,
        error: `El pedido minimo para este cupon es Q${coupon.minOrderAmount}`
      });
    }

    const discount = coupon.calculateDiscount(total);

    res.json({
      valid: true,
      coupon: coupon.toJSON(),
      discount,
      finalTotal: Math.round((total - discount) * 100) / 100
    });
  } catch (error) {
    logger.error('Error validating coupon:', error);
    res.status(500).json({ error: 'Error validating coupon' });
  }
};

exports.applyCoupon = async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'Coupon code is required' });
    }

    const [rows] = await db().query(
      'SELECT * FROM coupons WHERE code = ?',
      [code.toUpperCase()]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Cupon no encontrado' });
    }

    const coupon = Coupon.fromDatabase(rows[0]);

    if (!coupon.isCurrentlyValid()) {
      return res.status(400).json({ error: 'Cupon no valido o agotado' });
    }

    await db().query(
      'UPDATE coupons SET current_uses = current_uses + 1 WHERE id = ?',
      [coupon.id]
    );

    logger.info(`Coupon ${coupon.code} applied (uses: ${coupon.currentUses + 1}/${coupon.maxUses})`);
    res.json({ success: true, message: 'Cupon aplicado exitosamente' });
  } catch (error) {
    logger.error('Error applying coupon:', error);
    res.status(500).json({ error: 'Error applying coupon' });
  }
};

exports.createCoupon = async (req, res) => {
  try {
    const coupon = new Coupon(req.body);
    const validation = coupon.validate();
    if (!validation.isValid) {
      return res.status(400).json({ errors: validation.errors });
    }

    const [existing] = await db().query(
      'SELECT id FROM coupons WHERE code = ?',
      [coupon.code.toUpperCase()]
    );
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Coupon code already exists' });
    }

    const dbData = coupon.toDatabase();
    const [result] = await db().query(
      `INSERT INTO coupons (code, description, discount_percentage, discount_amount, min_order_amount, max_uses, start_date, end_date, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [dbData.code, dbData.description, dbData.discount_percentage, dbData.discount_amount,
       dbData.min_order_amount, dbData.max_uses, dbData.start_date, dbData.end_date, dbData.is_active]
    );

    coupon.id = result.insertId;
    logger.info(`Coupon created: ${coupon.code} (ID: ${coupon.id})`);
    res.status(201).json(coupon.toJSON());
  } catch (error) {
    logger.error('Error creating coupon:', error);
    res.status(500).json({ error: 'Error creating coupon' });
  }
};

exports.updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const [existing] = await db().query('SELECT * FROM coupons WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Coupon not found' });
    }

    const coupon = new Coupon({ ...existing[0], ...req.body });
    const validation = coupon.validate(true);
    if (!validation.isValid) {
      return res.status(400).json({ errors: validation.errors });
    }

    const dbData = coupon.toDatabase();
    await db().query(
      `UPDATE coupons SET code = ?, description = ?, discount_percentage = ?, discount_amount = ?,
       min_order_amount = ?, max_uses = ?, start_date = ?, end_date = ?, is_active = ? WHERE id = ?`,
      [dbData.code, dbData.description, dbData.discount_percentage, dbData.discount_amount,
       dbData.min_order_amount, dbData.max_uses, dbData.start_date, dbData.end_date, dbData.is_active, id]
    );

    logger.info(`Coupon updated: ${coupon.code} (ID: ${id})`);
    res.json(coupon.toJSON());
  } catch (error) {
    logger.error('Error updating coupon:', error);
    res.status(500).json({ error: 'Error updating coupon' });
  }
};

exports.deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const [existing] = await db().query('SELECT * FROM coupons WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Coupon not found' });
    }

    await db().query('UPDATE coupons SET is_active = false WHERE id = ?', [id]);
    logger.info(`Coupon deactivated: ID ${id}`);
    res.json({ message: 'Coupon deactivated successfully' });
  } catch (error) {
    logger.error('Error deleting coupon:', error);
    res.status(500).json({ error: 'Error deleting coupon' });
  }
};
