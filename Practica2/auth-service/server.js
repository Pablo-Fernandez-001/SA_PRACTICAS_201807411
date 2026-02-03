const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
require('dotenv').config();

// Cargar servicio de autenticación
const AuthService = require('./src/services/AuthService');
const authService = new AuthService();

// Cargar archivo proto
const PROTO_PATH = path.join(__dirname, 'proto/auth.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});

const authProto = grpc.loadPackageDefinition(packageDefinition).auth;

// Implementar servicios gRPC
const server = new grpc.Server();

server.addService(authProto.AuthService.service, {
    register: async (call, callback) => {
        try {
            const { name, email, password, role_id } = call.request;
            
            // Validar datos
            if (!name || !email || !password) {
                callback(null, {
                    success: false,
                    message: 'Todos los campos son requeridos',
                    user: null,
                    token: null
                });
                return;
            }

            const result = await authService.register({
                name,
                email,
                password,
                role_id: role_id || 2 // Default: Cliente
            });

            callback(null, {
                success: result.success,
                message: result.success ? 'Usuario registrado exitosamente' : result.message,
                user: result.user || null,
                token: result.token || null
            });
        } catch (error) {
            callback(null, {
                success: false,
                message: 'Error interno del servidor',
                user: null,
                token: null
            });
        }
    },

    login: async (call, callback) => {
        try {
            const { email, password } = call.request;
            
            // Validar datos
            if (!email || !password) {
                callback(null, {
                    success: false,
                    message: 'Email y contraseña son requeridos',
                    user: null,
                    token: null
                });
                return;
            }

            const result = await authService.login(email, password);

            callback(null, {
                success: result.success,
                message: result.success ? 'Login exitoso' : result.message,
                user: result.user || null,
                token: result.token || null
            });
        } catch (error) {
            callback(null, {
                success: false,
                message: 'Error interno del servidor',
                user: null,
                token: null
            });
        }
    },

    validateToken: async (call, callback) => {
        try {
            const { token } = call.request;
            
            if (!token) {
                callback(null, {
                    valid: false,
                    user: null
                });
                return;
            }

            const result = await authService.validateToken(token);

            callback(null, {
                valid: result.valid,
                user: result.user || null
            });
        } catch (error) {
            callback(null, {
                valid: false,
                user: null
            });
        }
    }
});

// Iniciar servidor
const PORT = process.env.PORT || 50051;
server.bindAsync(
    `0.0.0.0:${PORT}`,
    grpc.ServerCredentials.createInsecure(),
    (error, port) => {
        if (error) {
            console.error('Error al iniciar el servidor gRPC:', error);
            return;
        }
        console.log(`✅ Auth Service ejecutándose en puerto ${port}`);
        server.start();
    }
);
