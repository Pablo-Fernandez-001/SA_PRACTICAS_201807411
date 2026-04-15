const amqp = require("amqplib");

class EventBus {
  constructor(logger, onEvent) {
    this.logger = logger;
    this.url = process.env.EVENT_BUS_URL || "amqp://guest:guest@localhost:5672";
    this.exchange = process.env.EVENT_EXCHANGE || "helpdesk.events";
    this.queue = process.env.EVENT_QUEUE || "practica9.ticket.processor";
    this.routingKey = process.env.EVENT_ROUTING_KEY || "ticket.created";
    this.onEvent = onEvent;
    this.channel = null;
  }

  async connectAndConsume() {
    for (let attempt = 1; attempt <= 10; attempt += 1) {
      try {
        const conn = await amqp.connect(this.url);
        conn.on("close", () => {
          this.logger.warn("RabbitMQ connection closed (processor-service)");
          this.channel = null;
        });

        this.channel = await conn.createChannel();
        await this.channel.assertExchange(this.exchange, "topic", { durable: true });
        await this.channel.assertQueue(this.queue, { durable: true });
        await this.channel.bindQueue(this.queue, this.exchange, this.routingKey);

        await this.channel.consume(this.queue, async (msg) => {
          if (!msg) return;
          try {
            const payload = JSON.parse(msg.content.toString("utf-8"));
            await this.onEvent(payload);
            this.channel.ack(msg);
          } catch (error) {
            this.logger.error({ error: error.message }, "Failed processing event");
            this.channel.nack(msg, false, false);
          }
        });

        this.logger.info({ attempt }, "Connected to RabbitMQ (processor-service)");
        return;
      } catch (error) {
        this.logger.error(
          { attempt, error: error.message },
          "RabbitMQ connection failed (processor-service)"
        );
        await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
      }
    }
  }
}

module.exports = EventBus;
