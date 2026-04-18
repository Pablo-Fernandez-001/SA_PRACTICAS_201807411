const axios = require("axios");
const AppError = require("../shared/appError");

class UsersClient {
  constructor(baseURL) {
    this.client = axios.create({ baseURL, timeout: 2500 });
  }

  async getUser(userId) {
    try {
      const response = await this.client.get(`/api/users/${userId}`);
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 404) return null;
      throw new AppError(503, "users-service unavailable");
    }
  }
}

class TicketsClient {
  constructor(baseURL) {
    this.client = axios.create({ baseURL, timeout: 2500 });
  }

  async getTicket(ticketId) {
    try {
      const response = await this.client.get(`/api/tickets/${ticketId}`);
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 404) return null;
      throw new AppError(503, "tickets-service unavailable");
    }
  }

  async updateTicket(ticketId, payload) {
    try {
      await this.client.put(`/api/tickets/${ticketId}`, payload);
    } catch (error) {
      throw new AppError(503, "tickets-service unavailable");
    }
  }
}

module.exports = {
  UsersClient,
  TicketsClient,
};
