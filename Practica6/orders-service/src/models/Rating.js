class Rating {
  constructor(data = {}) {
    this.id = data.id || null;
    this.userId = data.user_id || data.userId || null;
    this.orderId = data.order_id || data.orderId || null;
    this.targetType = data.target_type || data.targetType || null;
    this.targetId = data.target_id || data.targetId || null;
    this.score = data.score !== undefined ? parseInt(data.score) : null;
    this.comment = data.comment || null;
    this.createdAt = data.created_at || data.createdAt || new Date();
  }

  validate() {
    const errors = [];
    if (!this.userId) errors.push('User ID is required');
    if (!this.orderId) errors.push('Order ID is required');
    if (!this.targetType) {
      errors.push('Target type is required');
    } else if (!['RESTAURANTE', 'REPARTIDOR', 'PRODUCTO'].includes(this.targetType)) {
      errors.push('Target type must be RESTAURANTE, REPARTIDOR, or PRODUCTO');
    }
    if (!this.targetId) errors.push('Target ID is required');
    if (this.score === null || this.score === undefined) {
      errors.push('Score is required');
    } else if (this.score < 1 || this.score > 5) {
      errors.push('Score must be between 1 and 5');
    }
    return { isValid: errors.length === 0, errors };
  }

  toDatabase() {
    return {
      user_id: this.userId,
      order_id: this.orderId,
      target_type: this.targetType,
      target_id: this.targetId,
      score: this.score,
      comment: this.comment
    };
  }

  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      orderId: this.orderId,
      targetType: this.targetType,
      targetId: this.targetId,
      score: this.score,
      comment: this.comment,
      createdAt: this.createdAt
    };
  }

  static fromDatabase(row) {
    if (!row) return null;
    return new Rating({
      id: row.id,
      user_id: row.user_id,
      order_id: row.order_id,
      target_type: row.target_type,
      target_id: row.target_id,
      score: row.score,
      comment: row.comment,
      created_at: row.created_at
    });
  }
}

module.exports = Rating;
