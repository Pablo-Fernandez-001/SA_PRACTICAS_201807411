const axios = require("axios");
const AppError = require("../shared/appError");

class UserClient {
  constructor(baseURL) {
    this.client = axios.create({
      baseURL,
      timeout: 2500,
    });
  }

  async userExists(userId) {
    try {
      const response = await this.client.get(`/api/users/${userId}`);
      return response.status === 200;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return false;
      }
      throw new AppError(503, "users-service unavailable");
    }
  }
}

module.exports = UserClient;
