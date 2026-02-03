const authClient = require('../clients/authClient');

const authMiddleware = async (req, res, next) => {
    try {
        // Obtener token del header
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Token no proporcionado'
            });
        }

        const token = authHeader.split(' ')[1];

        // Validar token con el Auth Service
        const validation = await authClient.validateToken(token);

        if (!validation.valid) {
            return res.status(401).json({
                success: false,
                message: 'Token inválido o expirado'
            });
        }

        // Adjuntar información del usuario a la request
        req.user = validation.user;
        next();
    } catch (error) {
        console.error('Error en middleware de autenticación:', error);
        return res.status(500).json({
            success: false,
            message: 'Error de autenticación'
        });
    }
};

module.exports = authMiddleware;
