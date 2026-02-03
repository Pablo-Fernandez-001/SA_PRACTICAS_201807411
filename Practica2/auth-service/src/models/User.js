class User {
    constructor(id, name, email, password, role_id, created_at) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password;
        this.role_id = role_id;
        this.created_at = created_at;
    }

    // Eliminar password para respuestas
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            email: this.email,
            role_id: this.role_id,
            created_at: this.created_at
        };
    }
}

module.exports = User;
