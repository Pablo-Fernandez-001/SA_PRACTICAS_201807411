const amqp = require("amqplib");

class EventBus {
  constructor(logger) {
    this.logger = logger;
    this.url = process.env.EVENT_BUS_URL || "amqp://guest:guest@localhost:5672";
    this.exchange = process.env.EVENT_EXCHANGE || "helpdesk.events";
    this.channel = null;
  }

  async connect() {
    for (let attempt = 1; attempt <= 10; attempt += 1) {
      try {
        const conn = await amqp.connect(this.url);
        conn.on("close", () => {
          this.logger.warn("RabbitMQ connection closed (tickets-service)");
          this.channel = null;
        });
        this.channel = await conn.createChannel();
        await this.channel.assertExchange(this.exchange, "topic", { durable: true });
        this.logger.info({ attempt }, "Connected to RabbitMQ (tickets-service)");
        return;
      } catch (error) {
        this.logger.error(
          { attempt, error: error.message },
          "RabbitMQ connection failed (tickets-service)"
        );
        await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
      }
    }
  }

  async publish(routingKey, payload) {
    if (!this.channel) return;
    this.channel.publish(this.exchange, routingKey, Buffer.from(JSON.stringify(payload)), {
      contentType: "application/json",
      persistent: true,
    });
  }
}

module.exports = EventBus;
