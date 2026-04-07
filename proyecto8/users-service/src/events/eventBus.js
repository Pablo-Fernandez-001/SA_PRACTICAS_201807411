const amqp = require("amqplib");

class EventBus {
  constructor(logger) {
    this.logger = logger;
    this.enabled = process.env.EVENT_BUS_ENABLED === "true";
    this.url = process.env.EVENT_BUS_URL;
    this.exchange = "helpdesk.events";
    this.channel = null;
  }

  async connect() {
    if (!this.enabled || !this.url) {
      this.logger.info("Event bus disabled for users-service");
      return;
    }

    try {
      const conn = await amqp.connect(this.url);
      this.channel = await conn.createChannel();
      await this.channel.assertExchange(this.exchange, "topic", { durable: true });
      this.logger.info("Connected to RabbitMQ (users-service)");
    } catch (error) {
      this.logger.error({ error: error.message }, "RabbitMQ connection failed (users-service)");
    }
  }

  async publish(routingKey, payload) {
    if (!this.channel) return;
    this.channel.publish(this.exchange, routingKey, Buffer.from(JSON.stringify(payload)), {
      persistent: true,
      contentType: "application/json",
    });
  }
}

module.exports = EventBus;
