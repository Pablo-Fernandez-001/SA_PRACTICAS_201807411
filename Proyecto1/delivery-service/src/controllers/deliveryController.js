const { getPool } = require('../config/database');
const { Delivery } = require('../models');
const logger = require('../utils/logger');

// Helper — lazy pool access
const db = () => getPool();

/**
 * Get all deliveries
 */
exports.getAllDeliveries = async (req, res) => {
  try {
    const [rows] = await db().query(`
      SELECT * FROM deliveries ORDER BY id DESC
    `);
    
    const deliveries = rows.map(row => Delivery.fromDatabase(row).toJSON());
    res.json(deliveries);
  } catch (error) {
    logger.error('Error fetching deliveries:', error);
    res.status(500).json({ error: 'Error fetching deliveries' });
  }
};

/**
 * Get deliveries by courier
 */
exports.getDeliveriesByCourier = async (req, res) => {
  try {
    const { courierId } = req.params;
    
    const [rows] = await db().query(
      'SELECT * FROM deliveries WHERE courier_id = ? ORDER BY id DESC',
      [courierId]
    );

    const deliveries = rows.map(row => Delivery.fromDatabase(row).toJSON());
    res.json(deliveries);
  } catch (error) {
    logger.error('Error fetching courier deliveries:', error);
    res.status(500).json({ error: 'Error fetching deliveries' });
  }
};

/**
 * Get active deliveries by courier
 */
exports.getActiveDeliveriesByCourier = async (req, res) => {
  try {
    const { courierId } = req.params;
    
    const [rows] = await db().query(
      `SELECT * FROM deliveries 
       WHERE courier_id = ? AND status IN ('ASIGNADO', 'EN_CAMINO')
       ORDER BY id DESC`,
      [courierId]
    );

    const deliveries = rows.map(row => Delivery.fromDatabase(row).toJSON());
    res.json(deliveries);
  } catch (error) {
    logger.error('Error fetching active deliveries:', error);
    res.status(500).json({ error: 'Error fetching deliveries' });
  }
};

/**
 * Get delivery by ID
 */
exports.getDeliveryById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [rows] = await db().query('SELECT * FROM deliveries WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Delivery not found' });
    }

    const delivery = Delivery.fromDatabase(rows[0]);
    res.json(delivery.toJSON());
  } catch (error) {
    logger.error('Error fetching delivery:', error);
    res.status(500).json({ error: 'Error fetching delivery' });
  }
};

/**
 * Get delivery by order ID
 */
exports.getDeliveryByOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const [rows] = await db().query(
      'SELECT * FROM deliveries WHERE order_external_id = ?',
      [orderId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Delivery not found for this order' });
    }

    const delivery = Delivery.fromDatabase(rows[0]);
    res.json(delivery.toJSON());
  } catch (error) {
    logger.error('Error fetching delivery:', error);
    res.status(500).json({ error: 'Error fetching delivery' });
  }
};

/**
 * Create new delivery (assign courier to order)
 */
exports.createDelivery = async (req, res) => {
  try {
    const delivery = new Delivery(req.body);
    
    const validation = delivery.validate();
    if (!validation.isValid) {
      return res.status(400).json({ errors: validation.errors });
    }

    // Check if delivery already exists for this order
    const [existing] = await db().query(
      'SELECT id FROM deliveries WHERE order_external_id = ?',
      [delivery.orderExternalId]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Delivery already assigned for this order' });
    }

    const dbData = delivery.toDatabase();
    const [result] = await db().query(
      'INSERT INTO deliveries (order_external_id, courier_id, status, started_at, delivered_at) VALUES (?, ?, ?, ?, ?)',
      [dbData.order_external_id, dbData.courier_id, dbData.status, dbData.started_at, dbData.delivered_at]
    );

    delivery.id = result.insertId;
    logger.info(`Delivery created for order ${delivery.orderExternalId} (ID: ${delivery.id})`);
    
    res.status(201).json(delivery.toJSON());
  } catch (error) {
    logger.error('Error creating delivery:', error);
    res.status(500).json({ error: 'Error creating delivery' });
  }
};

/**
 * Start delivery (courier picks up order)
 */
exports.startDelivery = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [existing] = await db().query('SELECT * FROM deliveries WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Delivery not found' });
    }

    const delivery = Delivery.fromDatabase(existing[0]);
    
    if (!delivery.start()) {
      return res.status(400).json({ 
        error: `Cannot start delivery with status ${delivery.status}` 
      });
    }

    await db().query(
      'UPDATE deliveries SET status = ?, started_at = ? WHERE id = ?',
      [delivery.status, delivery.startedAt, id]
    );

    logger.info(`Delivery ${id} started`);
    res.json(delivery.toJSON());
  } catch (error) {
    logger.error('Error starting delivery:', error);
    res.status(500).json({ error: 'Error starting delivery' });
  }
};

/**
 * Complete delivery
 */
exports.completeDelivery = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [existing] = await db().query('SELECT * FROM deliveries WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Delivery not found' });
    }

    const delivery = Delivery.fromDatabase(existing[0]);
    
    if (!delivery.complete()) {
      return res.status(400).json({ 
        error: `Cannot complete delivery with status ${delivery.status}` 
      });
    }

    await db().query(
      'UPDATE deliveries SET status = ?, delivered_at = ? WHERE id = ?',
      [delivery.status, delivery.deliveredAt, id]
    );

    logger.info(`Delivery ${id} completed`);
    res.json(delivery.toJSON());
  } catch (error) {
    logger.error('Error completing delivery:', error);
    res.status(500).json({ error: 'Error completing delivery' });
  }
};

/**
 * Cancel delivery
 */
exports.cancelDelivery = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [existing] = await db().query('SELECT * FROM deliveries WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Delivery not found' });
    }

    const delivery = Delivery.fromDatabase(existing[0]);
    
    if (!delivery.cancel()) {
      return res.status(400).json({ 
        error: `Cannot cancel delivery with status ${delivery.status}` 
      });
    }

    await db().query(
      'UPDATE deliveries SET status = ? WHERE id = ?',
      [delivery.status, id]
    );

    logger.info(`Delivery ${id} cancelled`);
    res.json({ message: 'Delivery cancelled successfully', delivery: delivery.toJSON() });
  } catch (error) {
    logger.error('Error cancelling delivery:', error);
    res.status(500).json({ error: 'Error cancelling delivery' });
  }
};

/**
 * Reassign delivery to different courier
 */
exports.reassignDelivery = async (req, res) => {
  try {
    const { id } = req.params;
    const { courierId } = req.body;
    
    if (!courierId) {
      return res.status(400).json({ error: 'New courier ID is required' });
    }

    const [existing] = await db().query('SELECT * FROM deliveries WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Delivery not found' });
    }

    const delivery = Delivery.fromDatabase(existing[0]);
    
    // Can only reassign if not completed or cancelled
    if ([Delivery.STATUS.ENTREGADO, Delivery.STATUS.CANCELADO].includes(delivery.status)) {
      return res.status(400).json({ 
        error: `Cannot reassign delivery with status ${delivery.status}` 
      });
    }

    await db().query(
      'UPDATE deliveries SET courier_id = ?, status = ? WHERE id = ?',
      [courierId, Delivery.STATUS.ASIGNADO, id]
    );

    delivery.courierId = courierId;
    delivery.status = Delivery.STATUS.ASIGNADO;
    
    logger.info(`Delivery ${id} reassigned to courier ${courierId}`);
    res.json(delivery.toJSON());
  } catch (error) {
    logger.error('Error reassigning delivery:', error);
    res.status(500).json({ error: 'Error reassigning delivery' });
  }
};
