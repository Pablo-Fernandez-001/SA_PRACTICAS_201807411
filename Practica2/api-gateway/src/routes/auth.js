const express = require('express');
const router = express.Router();
const authClient = require('../clients/authClient');

// Ruta de registro
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role_id } = req.body;

        // Validar campos requeridos
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Nombre, email y contraseña son requeridos'
            });
        }

        // Llamar al Auth Service vía gRPC
        const response = await authClient.register({
            name,
            email,
            password,
            role_id: role_id || 2
        });

        if (response.success) {
            return res.status(201).json({
                success: true,
                message: 'Usuario registrado exitosamente',
                data: {
                    user: response.user,
                    token: response.token
                }
            });
        } else {
            return res.status(400).json({
                success: false,
                message: response.message
            });
        }
    } catch (error) {
        console.error('Error en registro:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

// Ruta de login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validar campos requeridos
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email y contraseña son requeridos'
            });
        }

        // Llamar al Auth Service vía gRPC
        const response = await authClient.login({ email, password });

        if (response.success) {
            return res.json({
                success: true,
                message: 'Login exitoso',
                data: {
                    user: response.user,
                    token: response.token
                }
            });
        } else {
            return res.status(401).json({
                success: false,
                message: response.message
            });
        }
    } catch (error) {
        console.error('Error en login:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

// Ruta para obtener perfil (protegida)
router.get('/profile', require('../middleware/auth'), (req, res) => {
    res.json({
        success: true,
        message: 'Perfil obtenido exitosamente',
        data: {
            user: req.user
        }
    });
});

// Ruta protegida de ejemplo para administradores
router.get('/admin/dashboard', require('../middleware/auth'), (req, res) => {
    if (req.user.role_id !== 1) { // 1 = ADMIN
        return res.status(403).json({
            success: false,
            message: 'No tienes permisos para acceder a esta ruta'
        });
    }

    res.json({
        success: true,
        message: 'Dashboard de administrador',
        data: {
            adminInfo: 'Información sensible solo para admins'
        }
    });
});

module.exports = router;
