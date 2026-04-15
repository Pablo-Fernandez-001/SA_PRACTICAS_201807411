const express = require("express");
const cors = require("cors");
const pino = require("pino");
const pinoHttp = require("pino-http");
const EventBus = require("./eventBus");

const logger = pino({ name: "processor-service" });
const app = express();
const port = Number(process.env.PORT || 3103);

const processedEvents = [];

app.use(cors());
app.use(express.json());
app.use(pinoHttp({ logger }));

app.get("/health", (_req, res) => {
  res.json({ service: "processor-service", status: "ok" });
});

app.get("/metrics", (_req, res) => {
  res.type("text/plain");
  res.send([
    "# HELP processed_events_total Total events processed",
    "# TYPE processed_events_total counter",
    `processed_events_total ${processedEvents.length}`,
  ].join("\n"));
});

app.get("/api/processed-events", (_req, res) => {
  res.json({ data: processedEvents });
});

const eventBus = new EventBus(logger, async (payload) => {
  const processed = {
    id: processedEvents.length + 1,
    event: payload.event || "ticket.created",
    ticket_code: payload.ticket?.code,
    requester: payload.ticket?.requester,
    processed_at: new Date().toISOString(),
  };
  processedEvents.push(processed);
  logger.info({ processed }, "event processed");
});

async function start() {
  await eventBus.connectAndConsume();
  app.listen(port, "0.0.0.0", () => {
    logger.info({ port }, "processor-service listening");
  });
}

start().catch((error) => {
  logger.error({ error: error.message }, "failed to start processor-service");
  process.exit(1);
});
