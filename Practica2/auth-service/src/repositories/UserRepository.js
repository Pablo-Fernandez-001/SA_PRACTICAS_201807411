const db = require('../../config/database');
const User = require('../models/User');

class UserRepository {
    async create(userData) {
        const [result] = await db.execute(
            'INSERT INTO users (name, email, password, role_id) VALUES (?, ?, ?, ?)',
            [userData.name, userData.email, userData.password, userData.role_id]
        );
        
        return this.findById(result.insertId);
    }

    async findByEmail(email) {
        const [rows] = await db.execute(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );
        
        return rows[0] ? new User(
            rows[0].id,
            rows[0].name,
            rows[0].email,
            rows[0].password,
            rows[0].role_id,
            rows[0].created_at
        ) : null;
    }

    async findById(id) {
        const [rows] = await db.execute(
            'SELECT * FROM users WHERE id = ?',
            [id]
        );
        
        return rows[0] ? new User(
            rows[0].id,
            rows[0].name,
            rows[0].email,
            rows[0].password,
            rows[0].role_id,
            rows[0].created_at
        ) : null;
    }
}

module.exports = UserRepository;
