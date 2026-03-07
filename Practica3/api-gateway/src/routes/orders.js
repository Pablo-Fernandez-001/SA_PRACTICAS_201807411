const express = require('express')
const axios = require('axios')
const { authMiddleware, authorize } = require('../middleware/auth')
const logger = require('../utils/logger')

const router = express.Router()

const ORDERS_URL = `http://${process.env.ORDERS_SERVICE_URL || 'orders-service:3003'}`
  .replace(':50053', ':3003')

// Get all orders (admin) or user orders
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { data } = await axios.get(`${ORDERS_URL}/api/orders`)
    res.json({ success: true, data })
  } catch (error) {
    logger.error('Orders proxy error:', error.message)
    res.status(error.response?.status || 502).json({ success: false, message: 'Error al obtener órdenes' })
  }
})

// Get orders by user
router.get('/user/:userId', authMiddleware, async (req, res) => {
  try {
    const { data } = await axios.get(`${ORDERS_URL}/api/orders/user/${req.params.userId}`)
    res.json({ success: true, data })
  } catch (error) {
    logger.error('Orders proxy error:', error.message)
    res.status(error.response?.status || 502).json({ success: false, message: 'Error al obtener órdenes del usuario' })
  }
})

// Get orders by restaurant
router.get('/restaurant/:restaurantId', authMiddleware, async (req, res) => {
  try {
    const { data } = await axios.get(`${ORDERS_URL}/api/orders/restaurant/${req.params.restaurantId}`)
    res.json({ success: true, data })
  } catch (error) {
    logger.error('Orders proxy error:', error.message)
    res.status(error.response?.status || 502).json({ success: false, message: 'Error al obtener órdenes del restaurante' })
  }
})

// Create order — triggers gRPC validation in orders-service
router.post('/', authMiddleware, authorize(['CLIENTE', 'ADMIN']), async (req, res) => {
  try {
    const orderData = {
      ...req.body,
      userId: req.user.id // inject authenticated user ID
    }
    const { data } = await axios.post(`${ORDERS_URL}/api/orders`, orderData)
    res.status(201).json(data) // forward full response (includes validation info)
  } catch (error) {
    logger.error('Orders proxy error (create):', error.message)
    // Forward the detailed error from orders-service (gRPC validation errors)
    if (error.response?.data) {
      return res.status(error.response.status).json(error.response.data)
    }
    res.status(502).json({ success: false, message: 'Error al crear la orden' })
  }
})

// Get order by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { data } = await axios.get(`${ORDERS_URL}/api/orders/${req.params.id}`)
    res.json({ success: true, data })
  } catch (error) {
    logger.error('Orders proxy error:', error.message)
    res.status(error.response?.status || 502).json({ success: false, message: 'Error al obtener la orden' })
  }
})

// Update order status
router.patch('/:id/status', authMiddleware, authorize(['RESTAURANTE', 'ADMIN']), async (req, res) => {
  try {
    const { data } = await axios.patch(`${ORDERS_URL}/api/orders/${req.params.id}/status`, req.body)
    res.json({ success: true, data })
  } catch (error) {
    logger.error('Orders proxy error (status):', error.message)
    res.status(error.response?.status || 502).json({ success: false, message: 'Error al actualizar estado' })
  }
})

// Cancel order
router.post('/:id/cancel', authMiddleware, async (req, res) => {
  try {
    const { data } = await axios.post(`${ORDERS_URL}/api/orders/${req.params.id}/cancel`)
    res.json({ success: true, data })
  } catch (error) {
    logger.error('Orders proxy error (cancel):', error.message)
    res.status(error.response?.status || 502).json({ success: false, message: 'Error al cancelar la orden' })
  }
})

module.exports = router