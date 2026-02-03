-- Crear base de datos para autenticación
CREATE DATABASE IF NOT EXISTS auth_db;
USE auth_db;

-- Tabla de roles
CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

-- Tabla de usuarios
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id)
);

-- Insertar roles base
INSERT INTO roles (name) VALUES 
    ('ADMIN'),
    ('CLIENTE'),
    ('RESTAURANTE'),
    ('REPARTIDOR');

-- Insertar usuarios de ejemplo
INSERT INTO users (name, email, password, role_id) VALUES
    ('Admin User', 'admin@delivereats.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1),
    ('Carlos Cliente', 'cliente@mail.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 2),
    ('Restaurante Pizza', 'pizza@mail.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 3),
    ('Repartidor Luis', 'repartidor@mail.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 4);

-- Crear índices para mejor performance
CREATE INDEX idx_users_email ON users(email);
