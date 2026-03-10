// catalog-service/src/messaging/rabbitmqConsumer.js
const amqp = require('amqplib');
const logger = require('../utils/logger');

let channel = null;
let connection = null;

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
const EXCHANGE_NAME = 'orders_exchange';
const QUEUE_NAME = 'orders.created';
const ROUTING_KEY = 'orders.created';

/**
 * Conectar a RabbitMQ y comenzar a consumir mensajes
 */
async function startConsumer() {
  try {
    logger.info('🐰 Connecting to RabbitMQ Consumer...');
    
    connection = await amqp.connect(RABBITMQ_URL);
    logger.info('✅ Consumer connected to RabbitMQ');

    channel = await connection.createChannel();
    logger.info('✅ Consumer channel created');

    // Declarar exchange (debe coincidir con el publisher)
    await channel.assertExchange(EXCHANGE_NAME, 'topic', {
      durable: true
    });
    logger.info(`✅ Exchange '${EXCHANGE_NAME}' declared`);

    // Declarar cola
    await channel.assertQueue(QUEUE_NAME, {
      durable: true,
      arguments: {
        'x-message-ttl': 86400000, // 24 horas en ms
        'x-dead-letter-exchange': 'dlx_orders' // Dead Letter Exchange (opcional)
      }
    });
    logger.info(`✅ Queue '${QUEUE_NAME}' declared`);

    // Binding: Conectar queue con exchange usando routing key
    await channel.bindQueue(QUEUE_NAME, EXCHANGE_NAME, ROUTING_KEY);
    logger.info(`✅ Queue '${QUEUE_NAME}' bound to '${EXCHANGE_NAME}' with routing key '${ROUTING_KEY}'`);

    // Configurar prefetch para no sobrecargar el consumidor
    channel.prefetch(1);

    // Comenzar a consumir mensajes
    logger.info('👂 Waiting for order events...');
    channel.consume(QUEUE_NAME, async (msg) => {
      if (msg !== null) {
        await handleOrderMessage(msg);
      }
    });

    // Manejar reconexión en caso de error
    connection.on('error', (err) => {
      logger.error('❌ RabbitMQ consumer connection error:', err);
      setTimeout(startConsumer, 5000);
    });

    connection.on('close', () => {
      logger.warn('⚠️ RabbitMQ consumer connection closed. Reconnecting...');
      setTimeout(startConsumer, 5000);
    });

  } catch (error) {
    logger.error('❌ Failed to start RabbitMQ consumer:', error.message);
    setTimeout(startConsumer, 5000);
  }
}

/**
 * Procesar mensaje de orden recibido
 * @param {Object} msg - Mensaje de RabbitMQ
 */
async function handleOrderMessage(msg) {
  try {
    const content = msg.content.toString();
    const orderEvent = JSON.parse(content);

    logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    logger.info('📦 ORDER EVENT RECEIVED FROM RABBITMQ');
    logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    logger.info(`📋 Event Type: ${orderEvent.event}`);
    logger.info(`🕒 Timestamp: ${orderEvent.timestamp}`);
    logger.info('📄 Order Details:');
    logger.info(`   - Order ID: ${orderEvent.data.orderId}`);
    logger.info(`   - Restaurant ID: ${orderEvent.data.restaurantId}`);
    logger.info(`   - User ID: ${orderEvent.data.userId}`);
    logger.info(`   - Total: $${orderEvent.data.total}`);
    logger.info(`   - Delivery Address: ${orderEvent.data.deliveryAddress}`);
    logger.info(`   - Items Count: ${orderEvent.data.items.length}`);
    logger.info('   - Items:');
    
    orderEvent.data.items.forEach((item, index) => {
      logger.info(`      ${index + 1}. Item ID: ${item.itemId}, Quantity: ${item.quantity}, Price: $${item.price}`);
    });

    logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    logger.info('✅ Order event processed successfully (PoC - No business logic yet)');
    logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // TODO (Fase 2 completa): Aquí se implementaría la lógica de negocio
    // - Validar disponibilidad de items
    // - Actualizar inventario
    // - Notificar al restaurante
    // - Registrar estadísticas, etc.

    // Acknowledge manual del mensaje (confirmar que fue procesado)
    channel.ack(msg);

  } catch (error) {
    logger.error('❌ Error processing order message:', error.message);
    logger.error(error.stack);

    // NACK: Rechazar mensaje y reenviarlo a la cola (o a DLQ si está configurado)
    // false = no requeue (enviar a DLQ si está configurado)
    // true = requeue (volver a intentar)
    channel.nack(msg, false, false);
  }
}

/**
 * Cerrar conexión con RabbitMQ
 */
async function closeConsumer() {
  try {
    if (channel) await channel.close();
    if (connection) await connection.close();
    logger.info('🐰 RabbitMQ consumer connection closed');
  } catch (error) {
    logger.error('Error closing RabbitMQ consumer connection:', error);
  }
}

// Manejar cierre graceful
process.on('SIGINT', async () => {
  await closeConsumer();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closeConsumer();
  process.exit(0);
});

module.exports = {
  startConsumer,
  closeConsumer
};
