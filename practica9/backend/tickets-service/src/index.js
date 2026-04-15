const express = require("express");
const cors = require("cors");
const pino = require("pino");
const pinoHttp = require("pino-http");
const EventBus = require("./eventBus");

const logger = pino({ name: "tickets-service" });
const app = express();
const port = Number(process.env.PORT || 3102);

const tickets = [];
let sequence = 1;

app.use(cors());
app.use(express.json());
app.use(pinoHttp({ logger }));

const eventBus = new EventBus(logger);

app.get("/health", (_req, res) => {
  res.json({ service: "tickets-service", status: "ok" });
});

app.get("/metrics", (_req, res) => {
  res.type("text/plain");
  res.send([
    "# HELP tickets_total Total tickets created",
    "# TYPE tickets_total counter",
    `tickets_total ${tickets.length}`,
  ].join("\n"));
});

app.get("/api/tickets", (_req, res) => {
  res.json({ data: tickets });
});

app.post("/api/tickets", async (req, res) => {
  const { title, description, requester } = req.body;
  if (!title || !description || !requester) {
    return res.status(400).json({ message: "title, description y requester son obligatorios" });
  }

  const ticket = {
    id: sequence,
    code: `TCK-${String(sequence).padStart(4, "0")}`,
    title,
    description,
    requester,
    status: "OPEN",
    created_at: new Date().toISOString(),
  };
  sequence += 1;
  tickets.push(ticket);

  await eventBus.publish("ticket.created", {
    event: "ticket.created",
    ticket,
    emitted_at: new Date().toISOString(),
  });

  return res.status(201).json({ data: ticket });
});

async function start() {
  await eventBus.connect();
  app.listen(port, "0.0.0.0", () => {
    logger.info({ port }, "tickets-service listening");
  });
}

start().catch((error) => {
  logger.error({ error: error.message }, "failed to start tickets-service");
  process.exit(1);
});
