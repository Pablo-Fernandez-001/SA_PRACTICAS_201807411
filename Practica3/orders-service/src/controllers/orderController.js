const { getPool } = require('../config/database');
const { Order, OrderItem } = require('../models');
const { validateOrderItems } = require('../grpc/catalogClient');
const logger = require('../utils/logger');

// Helper — lazy pool access
const db = () => getPool();

/**
 * Get all orders
 */
exports.getAllOrders = async (req, res) => {
  try {
    const [rows] = await db().query(`
      SELECT * FROM orders ORDER BY created_at DESC
    `);
    
    const orders = rows.map(row => Order.fromDatabase(row).toSummary());
    res.json(orders);
  } catch (error) {
    logger.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Error fetching orders' });
  }
};

/**
 * Get orders by user
 */
exports.getOrdersByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const [rows] = await db().query(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );

    const orders = rows.map(row => Order.fromDatabase(row).toSummary());
    res.json(orders);
  } catch (error) {
    logger.error('Error fetching user orders:', error);
    res.status(500).json({ error: 'Error fetching orders' });
  }
};

/**
 * Get orders by restaurant
 */
exports.getOrdersByRestaurant = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    
    const [rows] = await db().query(
      'SELECT * FROM orders WHERE restaurant_id = ? ORDER BY created_at DESC',
      [restaurantId]
    );

    const orders = rows.map(row => Order.fromDatabase(row).toSummary());
    res.json(orders);
  } catch (error) {
    logger.error('Error fetching restaurant orders:', error);
    res.status(500).json({ error: 'Error fetching orders' });
  }
};

/**
 * Get order by ID
 */
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [orderRows] = await db().query('SELECT * FROM orders WHERE id = ?', [id]);

    if (orderRows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = Order.fromDatabase(orderRows[0]);
    
    // Get order items
    const [itemRows] = await db().query(
      'SELECT * FROM order_items WHERE order_id = ?',
      [id]
    );
    
    order.items = itemRows.map(row => OrderItem.fromDatabase(row).toJSON());
    
    res.json(order.toJSON());
  } catch (error) {
    logger.error('Error fetching order:', error);
    res.status(500).json({ error: 'Error fetching order' });
  }
};

/**
 * Get order by order number
 */
exports.getOrderByNumber = async (req, res) => {
  try {
    const { orderNumber } = req.params;
    
    const [orderRows] = await db().query(
      'SELECT * FROM orders WHERE order_number = ?',
      [orderNumber]
    );

    if (orderRows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = Order.fromDatabase(orderRows[0]);
    
    // Get order items
    const [itemRows] = await db().query(
      'SELECT * FROM order_items WHERE order_id = ?',
      [order.id]
    );
    
    order.items = itemRows.map(row => OrderItem.fromDatabase(row).toJSON());
    
    res.json(order.toJSON());
  } catch (error) {
    logger.error('Error fetching order:', error);
    res.status(500).json({ error: 'Error fetching order' });
  }
};

/**
 * Create new order — WITH gRPC catalog validation
 *
 * Flow:
 *  1. Build order items from request body
 *  2. Call CatalogService.ValidateOrderItems via gRPC
 *     - Checks existence, belongingness, price, availability
 *  3. If validation fails → reject with detailed errors
 *  4. If validation passes → persist order + items in orders_db
 */
exports.createOrder = async (req, res) => {
  let connection;
  
  try {
    // Accept both camelCase and snake_case field names
    const userId = req.body.userId || req.body.user_id;
    const restaurantId = req.body.restaurantId || req.body.restaurant_id;
    const restaurantName = req.body.restaurantName || req.body.restaurant_name || '';
    const deliveryAddress = req.body.deliveryAddress || req.body.delivery_address || '';
    const notes = req.body.notes || '';
    const items = req.body.items;

    // ── Basic input validation ───────────────────────────────────────────────
    if (!userId || !restaurantId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Datos incompletos. Se requiere userId, restaurantId y al menos un item.',
        received: { userId, restaurantId, itemsCount: items?.length },
        details: []
      });
    }

    // ── Build gRPC request items ─────────────────────────────────────────────
    const grpcItems = items.map(item => ({
      menu_item_id: item.menu_item_id || item.id || item.menuItemId || item.menuItemExternalId,
      requested_price: item.unit_price || item.price || item.requested_price,
      quantity: item.quantity || 1
    }));

    // ── gRPC VALIDATION — call catalog service ──────────────────────────────
    logger.info(`[createOrder] Initiating gRPC validation — restaurant=${restaurantId}, items=${grpcItems.length}`);
    
    let validationResponse;
    try {
      validationResponse = await validateOrderItems(restaurantId, grpcItems);
    } catch (grpcError) {
      logger.error('[createOrder] gRPC communication error:', grpcError.message);
      return res.status(503).json({
        success: false,
        error: 'No se pudo comunicar con el servicio de catálogo para validar la orden. Intente nuevamente.',
        grpcError: grpcError.message
      });
    }

    // ── Handle validation failure ────────────────────────────────────────────
    if (!validationResponse.valid) {
      const failedItems = (validationResponse.item_results || [])
        .filter(r => r.error_message)
        .map(r => ({
          menuItemId: r.menu_item_id,
          itemName: r.item_name || `ID ${r.menu_item_id}`,
          exists: r.exists,
          belongsToRestaurant: r.belongs_to_restaurant,
          priceMatches: r.price_matches,
          isAvailable: r.is_available,
          currentPrice: r.current_price,
          requestedPrice: r.requested_price,
          errorMessage: r.error_message
        }));

      logger.warn(`[createOrder] ORDER REJECTED - restaurant=${restaurantId}, reason: ${validationResponse.message}`);
      logger.warn(`[createOrder] Failed items detail: ${JSON.stringify(failedItems)}`);

      return res.status(400).json({
        success: false,
        error: 'La orden no pudo ser procesada debido a errores de validación con el catálogo.',
        validationMessage: validationResponse.message,
        failedItems
      });
    }

    // Validation passed - persist the order
    logger.info(`[createOrder] gRPC validation passed - total=Q${validationResponse.total_calculated}`);

    connection = await db().getConnection();
    await connection.beginTransaction();

    // Create order items from validated data
    const orderItems = items.map(item => {
      const oi = OrderItem.fromCartItem(item);
      oi.calculateSubtotal();
      return oi;
    });

    // Use the server-calculated total from gRPC (trusted source)
    const order = new Order({
      userId,
      restaurantId,
      restaurantName: restaurantName || '',
      items: orderItems
    });

    order.total = validationResponse.total_calculated || order.calculateTotal();

    // Insert order
    const orderData = order.toDatabase();
    const [orderResult] = await connection.query(
      'INSERT INTO orders (order_number, user_id, restaurant_id, restaurant_name, status, total, delivery_address, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [orderData.order_number, orderData.user_id, orderData.restaurant_id, restaurantName || '', orderData.status, order.total, deliveryAddress || '', notes || '']
    );

    order.id = orderResult.insertId;

    // Insert order items
    for (const item of orderItems) {
      item.orderId = order.id;
      const itemData = item.toDatabase();
      await connection.query(
        'INSERT INTO order_items (order_id, menu_item_external_id, name, price, quantity, subtotal) VALUES (?, ?, ?, ?, ?, ?)',
        [itemData.order_id, itemData.menu_item_external_id, itemData.name, itemData.price, itemData.quantity, itemData.subtotal]
      );
    }

    await connection.commit();

    order.items = orderItems.map(item => item.toJSON());

    logger.info(`[createOrder] ORDER CREATED - number=${order.orderNumber}, id=${order.id}, total=Q${order.total}, items=${orderItems.length}`);
    
    res.status(201).json({
      success: true,
      message: `Orden ${order.orderNumber} creada exitosamente. Validación de catálogo superada.`,
      order: order.toJSON(),
      validation: {
        catalogValidated: true,
        itemsValidated: validationResponse.item_results?.length || items.length,
        serverTotal: validationResponse.total_calculated
      }
    });
  } catch (error) {
    if (connection) await connection.rollback();
    logger.error('[createOrder] Error creating order:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno al crear la orden.',
      message: error.message
    });
  } finally {
    if (connection) connection.release();
  }
};

/**
 * Update order status
 */
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const [existing] = await db().query('SELECT * FROM orders WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = Order.fromDatabase(existing[0]);
    
    if (!order.canTransitionTo(status)) {
      return res.status(400).json({ 
        error: `Cannot transition from ${order.status} to ${status}` 
      });
    }

    await db().query(
      'UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?',
      [status, id]
    );

    order.status = status;
    logger.info(`Order ${order.orderNumber} status updated to ${status}`);
    
    res.json(order.toJSON());
  } catch (error) {
    logger.error('Error updating order status:', error);
    res.status(500).json({ error: 'Error updating order' });
  }
};

/**
 * Cancel order
 */
exports.cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [existing] = await db().query('SELECT * FROM orders WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = Order.fromDatabase(existing[0]);
    
    if (!order.canTransitionTo(Order.STATUS.RECHAZADA)) {
      return res.status(400).json({ 
        error: `Cannot cancel order with status ${order.status}` 
      });
    }

    await db().query(
      'UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?',
      [Order.STATUS.RECHAZADA, id]
    );

    order.status = Order.STATUS.RECHAZADA;
    logger.info(`Order ${order.orderNumber} cancelled`);
    
    res.json({ message: 'Order cancelled successfully', order: order.toJSON() });
  } catch (error) {
    logger.error('Error cancelling order:', error);
    res.status(500).json({ error: 'Error cancelling order' });
  }
};
