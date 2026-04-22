const { validateTicketPayload, STATUS_VALUES } = require("../models/ticketModel");
const AppError = require("../shared/appError");

class TicketService {
  constructor(ticketRepository, userClient, eventBus, metrics = {}) {
    this.ticketRepository = ticketRepository;
    this.userClient = userClient;
    this.eventBus = eventBus;
    this.metrics = metrics;
  }

  generateCode() {
    const timestampPart = Date.now().toString(36).toUpperCase();
    const randomPart = Math.random().toString(36).slice(2, 8).toUpperCase();
    return `TCK-${timestampPart}-${randomPart}`;
  }

  async createTicket(payload) {
    const errors = validateTicketPayload(payload);
    if (errors.length) {
      return { status: 400, body: { errors } };
    }

    const requesterExists = await this.userClient.userExists(payload.requester_id);
    if (!requesterExists) {
      return { status: 400, body: { message: "requester_id does not exist" } };
    }

    const toCreate = {
      ...payload,
      code: this.generateCode(),
      status: "OPEN",
    };

    const created = await this.ticketRepository.create(toCreate);
    await this.ticketRepository.addHistory(created.id, "OPEN", "Ticket created");
    await this.eventBus.publish("ticket.created", {
      type: "ticket.created",
      occurred_at: new Date().toISOString(),
      data: created,
    });
    this.metrics.ticketsCreated?.inc();

    return { status: 201, body: created };
  }

  async getTickets(filters) {
    return this.ticketRepository.findAll(filters);
  }

  async getTicketById(id) {
    if (!Number.isInteger(id) || id <= 0) {
      throw new AppError(400, "invalid ticket id");
    }
    return this.ticketRepository.findById(id);
  }

  async getTicketHistory(id) {
    if (!Number.isInteger(id) || id <= 0) {
      throw new AppError(400, "invalid ticket id");
    }

    const exists = await this.ticketRepository.findById(id);
    if (!exists) {
      return { status: 404, body: { message: "ticket not found" } };
    }

    const history = await this.ticketRepository.findHistoryByTicketId(id);
    return { status: 200, body: history };
  }

  async updateTicket(id, payload) {
    const errors = validateTicketPayload(payload, { partial: true });
    if (errors.length) {
      return { status: 400, body: { errors } };
    }

    const exists = await this.ticketRepository.findById(id);
    if (!exists) {
      return { status: 404, body: { message: "ticket not found" } };
    }

    if (payload.requester_id !== undefined) {
      const requesterExists = await this.userClient.userExists(payload.requester_id);
      if (!requesterExists) {
        return { status: 400, body: { message: "requester_id does not exist" } };
      }
    }

    if (payload.status && !STATUS_VALUES.includes(payload.status)) {
      return { status: 400, body: { message: "invalid status" } };
    }

    const updated = await this.ticketRepository.update(id, payload);
    const historyMessage = payload.status
      ? `Status changed to ${payload.status}`
      : "Ticket updated";
    await this.ticketRepository.addHistory(id, updated.status, historyMessage);

    if (payload.status) {
      await this.eventBus.publish("ticket.status.changed", {
        type: "ticket.status.changed",
        occurred_at: new Date().toISOString(),
        data: {
          ticket_id: id,
          new_status: payload.status,
        },
      });
    } else {
      await this.eventBus.publish("ticket.updated", {
        type: "ticket.updated",
        occurred_at: new Date().toISOString(),
        data: updated,
      });
    }

    return { status: 200, body: updated };
  }

  async deleteTicket(id) {
    if (!Number.isInteger(id) || id <= 0) {
      throw new AppError(400, "invalid ticket id");
    }

    const exists = await this.ticketRepository.findById(id);
    if (!exists) {
      return { status: 404, body: { message: "ticket not found" } };
    }

    await this.ticketRepository.delete(id);
    await this.eventBus.publish("ticket.deleted", {
      type: "ticket.deleted",
      occurred_at: new Date().toISOString(),
      data: { id },
    });

    return { status: 204, body: null };
  }
}

module.exports = TicketService;
