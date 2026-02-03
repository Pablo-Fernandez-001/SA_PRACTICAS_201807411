const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
require('dotenv').config();

class AuthClient {
    constructor() {
        // Cargar archivo proto
        const PROTO_PATH = path.join(__dirname, '../../auth-service/proto/auth.proto');
        const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
            keepCase: true,
            longs: String,
            enums: String,
            defaults: true,
            oneofs: true
        });

        const authProto = grpc.loadPackageDefinition(packageDefinition).auth;

        // Crear cliente gRPC
        this.client = new authProto.AuthService(
            process.env.AUTH_SERVICE_URL || 'localhost:50051',
            grpc.credentials.createInsecure()
        );
    }

    // Método para registro
    register(userData) {
        return new Promise((resolve, reject) => {
            this.client.register(userData, (error, response) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(response);
                }
            });
        });
    }

    // Método para login
    login(credentials) {
        return new Promise((resolve, reject) => {
            this.client.login(credentials, (error, response) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(response);
                }
            });
        });
    }

    // Método para validar token
    validateToken(token) {
        return new Promise((resolve, reject) => {
            this.client.validateToken({ token }, (error, response) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(response);
                }
            });
        });
    }
}

// Exportar instancia única (Singleton)
module.exports = new AuthClient();
