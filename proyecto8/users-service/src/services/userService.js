const { validateUserPayload } = require("../models/userModel");
const AppError = require("../shared/appError");

class UserService {
  constructor(userRepository, eventBus) {
    this.userRepository = userRepository;
    this.eventBus = eventBus;
  }

  mapDbError(error) {
    if (error && error.code === "ER_DUP_ENTRY") {
      return { status: 409, body: { message: "email already exists" } };
    }
    throw error;
  }

  async createUser(payload) {
    const errors = validateUserPayload(payload);
    if (errors.length) {
      return { status: 400, body: { errors } };
    }

    let created;
    try {
      created = await this.userRepository.create(payload);
    } catch (error) {
      return this.mapDbError(error);
    }

    await this.eventBus.publish("user.created", {
      type: "user.created",
      occurred_at: new Date().toISOString(),
      data: created,
    });

    return { status: 201, body: created };
  }

  async getUsers() {
    return this.userRepository.findAll();
  }

  async getUserById(id) {
    if (!Number.isInteger(id) || id <= 0) {
      throw new AppError(400, "invalid user id");
    }
    return this.userRepository.findById(id);
  }

  async updateUser(id, payload) {
    const errors = validateUserPayload(payload, { partial: true });
    if (errors.length) {
      return { status: 400, body: { errors } };
    }

    if (!Number.isInteger(id) || id <= 0) {
      throw new AppError(400, "invalid user id");
    }

    const exists = await this.userRepository.findById(id);
    if (!exists) {
      return { status: 404, body: { message: "user not found" } };
    }

    let updated;
    try {
      updated = await this.userRepository.update(id, payload);
    } catch (error) {
      return this.mapDbError(error);
    }

    await this.eventBus.publish("user.updated", {
      type: "user.updated",
      occurred_at: new Date().toISOString(),
      data: updated,
    });

    return { status: 200, body: updated };
  }

  async deleteUser(id) {
    if (!Number.isInteger(id) || id <= 0) {
      throw new AppError(400, "invalid user id");
    }

    const exists = await this.userRepository.findById(id);
    if (!exists) {
      return { status: 404, body: { message: "user not found" } };
    }

    await this.userRepository.delete(id);
    await this.eventBus.publish("user.deleted", {
      type: "user.deleted",
      occurred_at: new Date().toISOString(),
      data: { id },
    });

    return { status: 204, body: null };
  }
}

module.exports = UserService;
