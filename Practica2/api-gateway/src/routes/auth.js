const express = require('express')
const { body, validationResult } = require('express-validator')
const authService = require('../services/authService')
const { authMiddleware } = require('../middleware/auth')
const logger = require('../utils/logger')

const router = express.Router()

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: errors.array()
    })
  }
  next()
}

// Register
router.post('/register',
  [
    body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').isIn(['CLIENTE', 'RESTAURANTE', 'REPARTIDOR']).withMessage('Invalid role')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const result = await authService.register(req.body)
      
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: result.user,
          token: result.token
        }
      })
    } catch (error) {
      logger.error('Registration error:', error)
      res.status(400).json({
        success: false,
        message: error.message || 'Registration failed'
      })
    }
  }
)

// Admin register - protected route for admins to register other users
router.post('/admin/register', 
  authMiddleware, // Require authentication
  [
    body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').isIn(['CLIENTE', 'ADMIN', 'RESTAURANTE', 'REPARTIDOR']).withMessage('Invalid role')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      // Check if requester is admin
      if (req.user.role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          message: 'Only administrators can register new users'
        })
      }

      const result = await authService.register(req.body)
      
      res.status(201).json({
        success: true,
        message: `User registered successfully as ${req.body.role}`,
        data: {
          user: result.user
        }
      })
    } catch (error) {
      logger.error('Admin registration error:', error)
      res.status(400).json({
        success: false,
        message: error.message || 'Registration failed'
      })
    }
  }
)

// Login
router.post('/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    body('password').exists().withMessage('Password is required')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const result = await authService.login(req.body)
      
      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: result.user,
          token: result.token
        }
      })
    } catch (error) {
      logger.error('Login error:', error)
      res.status(401).json({
        success: false,
        message: error.message || 'Login failed'
      })
    }
  }
)

// Validate token
router.post('/validate',
  [
    body('token').exists().withMessage('Token is required')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const result = await authService.validateToken(req.body.token)
      
      res.json({
        success: true,
        data: result
      })
    } catch (error) {
      logger.error('Token validation error:', error)
      res.status(401).json({
        success: false,
        message: 'Invalid token'
      })
    }
  }
)

module.exports = router