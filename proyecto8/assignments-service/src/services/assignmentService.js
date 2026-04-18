const { validateAssignmentPayload } = require("../models/assignmentModel");
const AppError = require("../shared/appError");

class AssignmentService {
  constructor(assignmentRepository, usersClient, ticketsClient, eventBus) {
    this.assignmentRepository = assignmentRepository;
    this.usersClient = usersClient;
    this.ticketsClient = ticketsClient;
    this.eventBus = eventBus;
  }

  async createAssignment(payload) {
    const errors = validateAssignmentPayload(payload);
    if (errors.length) {
      return { status: 400, body: { errors } };
    }

    const ticket = await this.ticketsClient.getTicket(payload.ticket_id);
    if (!ticket) {
      return { status: 404, body: { message: "ticket not found" } };
    }

    if (["RESOLVED", "CLOSED"].includes(ticket.status)) {
      return { status: 409, body: { message: "ticket cannot be assigned in current status" } };
    }

    const agent = await this.usersClient.getUser(payload.agent_id);
    if (!agent || agent.role !== "agent" || !agent.is_active) {
      return { status: 400, body: { message: "agent_id must belong to an active agent user" } };
    }

    const assigner = await this.usersClient.getUser(payload.assigned_by);
    if (!assigner || !["admin", "agent"].includes(assigner.role)) {
      return { status: 400, body: { message: "assigned_by must be admin or agent" } };
    }

    await this.assignmentRepository.deactivateByTicket(payload.ticket_id);
    const created = await this.assignmentRepository.create(payload);

    await this.ticketsClient.updateTicket(payload.ticket_id, { status: "ASSIGNED" });

    await this.eventBus.publish("ticket.assigned", {
      type: "ticket.assigned",
      occurred_at: new Date().toISOString(),
      data: created,
    });

    return { status: 201, body: created };
  }

  async getAssignments(filters) {
    return this.assignmentRepository.findAll(filters);
  }

  async getAssignmentById(id) {
    if (!Number.isInteger(id) || id <= 0) {
      throw new AppError(400, "invalid assignment id");
    }

    return this.assignmentRepository.findById(id);
  }

  async updateAssignment(id, payload) {
    if (!Number.isInteger(id) || id <= 0) {
      throw new AppError(400, "invalid assignment id");
    }

    const errors = validateAssignmentPayload(payload, { partial: true });
    if (errors.length) {
      return { status: 400, body: { errors } };
    }

    const exists = await this.assignmentRepository.findById(id);
    if (!exists) {
      return { status: 404, body: { message: "assignment not found" } };
    }

    if (payload.ticket_id !== undefined) {
      const ticket = await this.ticketsClient.getTicket(payload.ticket_id);
      if (!ticket) {
        return { status: 404, body: { message: "ticket not found" } };
      }
    }

    if (payload.agent_id !== undefined) {
      const agent = await this.usersClient.getUser(payload.agent_id);
      if (!agent || agent.role !== "agent" || !agent.is_active) {
        return { status: 400, body: { message: "agent_id must belong to an active agent user" } };
      }
    }

    if (payload.assigned_by !== undefined) {
      const assigner = await this.usersClient.getUser(payload.assigned_by);
      if (!assigner || !["admin", "agent"].includes(assigner.role)) {
        return { status: 400, body: { message: "assigned_by must be admin or agent" } };
      }
    }

    const updated = await this.assignmentRepository.update(id, payload);
    await this.eventBus.publish("assignment.updated", {
      type: "assignment.updated",
      occurred_at: new Date().toISOString(),
      data: updated,
    });

    return { status: 200, body: updated };
  }

  async deleteAssignment(id) {
    if (!Number.isInteger(id) || id <= 0) {
      throw new AppError(400, "invalid assignment id");
    }

    const exists = await this.assignmentRepository.findById(id);
    if (!exists) {
      return { status: 404, body: { message: "assignment not found" } };
    }

    await this.assignmentRepository.delete(id);
    await this.eventBus.publish("assignment.deleted", {
      type: "assignment.deleted",
      occurred_at: new Date().toISOString(),
      data: { id },
    });

    return { status: 204, body: null };
  }

  async releaseByTicket(ticketId) {
    if (!Number.isInteger(ticketId) || ticketId <= 0) {
      throw new AppError(400, "invalid ticket id");
    }

    const before = await this.assignmentRepository.findAll({ ticket_id: ticketId, is_active: true });
    if (!before.length) {
      return { status: 200, body: { message: "no active assignments to release", ticket_id: ticketId, released: 0 } };
    }

    await this.assignmentRepository.deactivateByTicket(ticketId);

    await this.eventBus.publish("assignment.released", {
      type: "assignment.released",
      occurred_at: new Date().toISOString(),
      data: { ticket_id: ticketId, released: before.length },
    });

    return { status: 200, body: { message: "assignment released", ticket_id: ticketId, released: before.length } };
  }
}

module.exports = AssignmentService;
