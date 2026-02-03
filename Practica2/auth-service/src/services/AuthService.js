const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserRepository = require('../repositories/UserRepository');

class AuthService {
    constructor() {
        this.userRepository = new UserRepository();
        this.jwtSecret = process.env.JWT_SECRET;
    }

    // SINGLE RESPONSIBILITY: Solo maneja autenticación
    async register(userData) {
        try {
            // Verificar si el usuario ya existe
            const existingUser = await this.userRepository.findByEmail(userData.email);
            if (existingUser) {
                throw new Error('El email ya está registrado');
            }

            // Hashear la contraseña
            const hashedPassword = await bcrypt.hash(userData.password, 10);

            // Crear usuario
            const user = await this.userRepository.create({
                ...userData,
                password: hashedPassword
            });

            // Generar token JWT
            const token = this.generateToken(user);

            return {
                success: true,
                user: user.toJSON(),
                token
            };
        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    }

    async login(email, password) {
        try {
            // Buscar usuario por email
            const user = await this.userRepository.findByEmail(email);
            if (!user) {
                throw new Error('Credenciales inválidas');
            }

            // Verificar contraseña
            const isValid = await bcrypt.compare(password, user.password);
            if (!isValid) {
                throw new Error('Credenciales inválidas');
            }

            // Generar token
            const token = this.generateToken(user);

            return {
                success: true,
                user: user.toJSON(),
                token
            };
        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    }

    async validateToken(token) {
        try {
            // Verificar token
            const decoded = jwt.verify(token, this.jwtSecret);
            
            // Buscar usuario
            const user = await this.userRepository.findById(decoded.userId);
            
            return {
                valid: !!user,
                user: user ? user.toJSON() : null
            };
        } catch (error) {
            return {
                valid: false,
                user: null
            };
        }
    }

    // Método privado para generar token
    generateToken(user) {
        const payload = {
            userId: user.id,
            email: user.email,
            role: user.role_id
        };

        return jwt.sign(payload, this.jwtSecret, {
            expiresIn: '24h'
        });
    }
}

module.exports = AuthService;
