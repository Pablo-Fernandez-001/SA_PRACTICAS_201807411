class Promotion {
  constructor(data = {}) {
    this.id = data.id || null;
    this.restaurantId = data.restaurant_id || data.restaurantId || null;
    this.name = data.name || '';
    this.description = data.description || '';
    this.discountPercentage = parseFloat(data.discount_percentage || data.discountPercentage || 0);
    this.startDate = data.start_date || data.startDate || null;
    this.endDate = data.end_date || data.endDate || null;
    this.isActive = data.is_active !== undefined ? data.is_active : (data.isActive !== undefined ? data.isActive : true);
    this.createdAt = data.created_at || data.createdAt || new Date();
    this.updatedAt = data.updated_at || data.updatedAt || new Date();
    this.restaurantName = data.restaurant_name || data.restaurantName || null;
  }

  validate(isUpdate = false) {
    const errors = [];

    if (!isUpdate || this.name !== undefined) {
      if (!this.name || this.name.trim() === '') {
        errors.push('Promotion name is required');
      }
    }

    if (!isUpdate) {
      if (!this.restaurantId) {
        errors.push('Restaurant ID is required');
      }
    }

    if (!isUpdate || this.discountPercentage !== undefined) {
      if (this.discountPercentage <= 0 || this.discountPercentage > 100) {
        errors.push('Discount percentage must be between 0.01 and 100');
      }
    }

    if (!isUpdate) {
      if (!this.startDate) errors.push('Start date is required');
      if (!this.endDate) errors.push('End date is required');
      if (this.startDate && this.endDate && new Date(this.startDate) >= new Date(this.endDate)) {
        errors.push('End date must be after start date');
      }
    }

    return { isValid: errors.length === 0, errors };
  }

  isCurrentlyActive() {
    if (!this.isActive) return false;
    const now = new Date();
    return now >= new Date(this.startDate) && now <= new Date(this.endDate);
  }

  toDatabase() {
    const data = {
      restaurant_id: this.restaurantId,
      name: this.name,
      description: this.description,
      discount_percentage: this.discountPercentage,
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
      restaurantId: this.restaurantId,
      restaurantName: this.restaurantName,
      name: this.name,
      description: this.description,
      discountPercentage: this.discountPercentage,
      startDate: this.startDate,
      endDate: this.endDate,
      isActive: this.isActive,
      isCurrentlyActive: this.isCurrentlyActive(),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  static fromDatabase(row) {
    if (!row) return null;
    return new Promotion({
      id: row.id,
      restaurant_id: row.restaurant_id,
      restaurant_name: row.restaurant_name,
      name: row.name,
      description: row.description,
      discount_percentage: parseFloat(row.discount_percentage),
      start_date: row.start_date,
      end_date: row.end_date,
      is_active: row.is_active,
      created_at: row.created_at,
      updated_at: row.updated_at
    });
  }
}

module.exports = Promotion;
