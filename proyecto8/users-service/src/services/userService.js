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

    const normalizedPayload = {
      ...payload,
      password: payload.password,
    };

    let created;
    try {
      created = await this.userRepository.create(normalizedPayload);
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
      const normalizedPayload = {
        ...payload,
      };

      if (normalizedPayload.password !== undefined && !normalizedPayload.password) {
        delete normalizedPayload.password;
      }

      updated = await this.userRepository.update(id, normalizedPayload);
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

  async login(payload) {
    const email = typeof payload?.email === "string" ? payload.email.trim().toLowerCase() : "";
    const password = typeof payload?.password === "string" ? payload.password : "";

    if (!email || !password) {
      return { status: 400, body: { message: "email and password are required" } };
    }

    const user = await this.userRepository.findByEmailWithPassword(email);
    if (!user) {
      return { status: 401, body: { message: "invalid credentials" } };
    }

    if (!user.is_active) {
      return { status: 403, body: { message: "user is inactive" } };
    }

    if ((user.password || "") !== password) {
      return { status: 401, body: { message: "invalid credentials" } };
    }

    return {
      status: 200,
      body: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        is_active: user.is_active,
      },
    };
  }
}

module.exports = UserService;
