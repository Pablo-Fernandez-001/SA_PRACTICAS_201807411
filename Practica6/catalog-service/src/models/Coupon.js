class Coupon {
  constructor(data = {}) {
    this.id = data.id || null;
    this.code = data.code || '';
    this.description = data.description || '';
    this.discountPercentage = data.discount_percentage !== undefined && data.discount_percentage !== null
      ? parseFloat(data.discount_percentage) : (data.discountPercentage !== undefined && data.discountPercentage !== null ? parseFloat(data.discountPercentage) : null);
    this.discountAmount = data.discount_amount !== undefined && data.discount_amount !== null
      ? parseFloat(data.discount_amount) : (data.discountAmount !== undefined && data.discountAmount !== null ? parseFloat(data.discountAmount) : null);
    this.minOrderAmount = parseFloat(data.min_order_amount || data.minOrderAmount || 0);
    this.maxUses = parseInt(data.max_uses || data.maxUses || 1);
    this.currentUses = parseInt(data.current_uses || data.currentUses || 0);
    this.startDate = data.start_date || data.startDate || null;
    this.endDate = data.end_date || data.endDate || null;
    this.isActive = data.is_active !== undefined ? data.is_active : (data.isActive !== undefined ? data.isActive : true);
    this.createdAt = data.created_at || data.createdAt || new Date();
    this.updatedAt = data.updated_at || data.updatedAt || new Date();
  }

  validate(isUpdate = false) {
    const errors = [];

    if (!isUpdate || this.code !== undefined) {
      if (!this.code || this.code.trim() === '') {
        errors.push('Coupon code is required');
      }
    }

    if (!isUpdate) {
      if (this.discountPercentage === null && this.discountAmount === null) {
        errors.push('Either discount_percentage or discount_amount is required');
      }
      if (this.discountPercentage !== null && (this.discountPercentage <= 0 || this.discountPercentage > 100)) {
        errors.push('Discount percentage must be between 0.01 and 100');
      }
      if (this.discountAmount !== null && this.discountAmount <= 0) {
        errors.push('Discount amount must be positive');
      }
      if (!this.startDate) errors.push('Start date is required');
      if (!this.endDate) errors.push('End date is required');
    }

    return { isValid: errors.length === 0, errors };
  }

  isCurrentlyValid() {
    if (!this.isActive) return false;
    if (this.currentUses >= this.maxUses) return false;
    const now = new Date();
    return now >= new Date(this.startDate) && now <= new Date(this.endDate);
  }

  calculateDiscount(orderTotal) {
    if (!this.isCurrentlyValid()) return 0;
    if (orderTotal < this.minOrderAmount) return 0;

    if (this.discountPercentage !== null) {
      return Math.round(orderTotal * (this.discountPercentage / 100) * 100) / 100;
    }
    if (this.discountAmount !== null) {
      return Math.min(this.discountAmount, orderTotal);
    }
    return 0;
  }

  toDatabase() {
    const data = {
      code: this.code.toUpperCase(),
      description: this.description,
      discount_percentage: this.discountPercentage,
      discount_amount: this.discountAmount,
      min_order_amount: this.minOrderAmount,
      max_uses: this.maxUses,
      current_uses: this.currentUses,
      start_date: this.startDate,
      end_date: this.endDate,
      is_active: this.isActive
    };
    if (this.id) data.id = this.id;
    return data;
  }

  toJSON() {
    return {
      id: this.id,
      code: this.code,
      description: this.description,
      discountPercentage: this.discountPercentage,
      discountAmount: this.discountAmount,
      minOrderAmount: this.minOrderAmount,
      maxUses: this.maxUses,
      currentUses: this.currentUses,
      startDate: this.startDate,
      endDate: this.endDate,
      isActive: this.isActive,
      isCurrentlyValid: this.isCurrentlyValid(),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  static fromDatabase(row) {
    if (!row) return null;
    return new Coupon({
      id: row.id,
      code: row.code,
      description: row.description,
      discount_percentage: row.discount_percentage,
      discount_amount: row.discount_amount,
      min_order_amount: row.min_order_amount,
      max_uses: row.max_uses,
      current_uses: row.current_uses,
      start_date: row.start_date,
      end_date: row.end_date,
      is_active: row.is_active,
      created_at: row.created_at,
      updated_at: row.updated_at
    });
  }
}

module.exports = Coupon;
