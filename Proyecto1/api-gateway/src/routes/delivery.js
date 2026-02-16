const express = require('express')
const axios = require('axios')
const { authMiddleware, authorize } = require('../middleware/auth')
const logger = require('../utils/logger')

const router = express.Router()

const DELIVERY_URL = `http://${process.env.DELIVERY_SERVICE_URL || 'delivery-service:3004'}`
  .replace(':50054', ':3004')

// Get all deliveries
router.get('/', authMiddleware, authorize(['REPARTIDOR', 'ADMIN']), async (req, res) => {
  try {
    const { data } = await axios.get(`${DELIVERY_URL}/api/deliveries`)
    res.json({ success: true, data })
  } catch (error) {
    logger.error('Delivery proxy error:', error.message)
    res.status(error.response?.status || 502).json({ success: false, message: 'Error al obtener entregas' })
  }
})

// Get deliveries by courier
router.get('/courier/:courierId', authMiddleware, async (req, res) => {
  try {
    const { data } = await axios.get(`${DELIVERY_URL}/api/deliveries/courier/${req.params.courierId}`)
    res.json({ success: true, data })
  } catch (error) {
    logger.error('Delivery proxy error:', error.message)
    res.status(error.response?.status || 502).json({ success: false, message: 'Error al obtener entregas del repartidor' })
  }
})

// Get delivery by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { data } = await axios.get(`${DELIVERY_URL}/api/deliveries/${req.params.id}`)
    res.json({ success: true, data })
  } catch (error) {
    logger.error('Delivery proxy error:', error.message)
    res.status(error.response?.status || 502).json({ success: false, message: 'Error al obtener entrega' })
  }
})

// Get delivery by order ID
router.get('/order/:orderId', authMiddleware, async (req, res) => {
  try {
    const { data } = await axios.get(`${DELIVERY_URL}/api/deliveries/order/${req.params.orderId}`)
    res.json({ success: true, data })
  } catch (error) {
    logger.error('Delivery proxy error:', error.message)
    res.status(error.response?.status || 502).json({ success: false, message: 'Error al obtener entrega por orden' })
  }
})

// Create delivery
router.post('/', authMiddleware, authorize(['RESTAURANTE', 'ADMIN']), async (req, res) => {
  try {
    const { data } = await axios.post(`${DELIVERY_URL}/api/deliveries`, req.body)
    res.status(201).json({ success: true, data })
  } catch (error) {
    logger.error('Delivery proxy error (create):', error.message)
    res.status(error.response?.status || 502).json({ success: false, message: 'Error al crear entrega' })
  }
})

// Start delivery
router.post('/:id/start', authMiddleware, authorize(['REPARTIDOR', 'ADMIN']), async (req, res) => {
  try {
    const { data } = await axios.post(`${DELIVERY_URL}/api/deliveries/${req.params.id}/start`)
    res.json({ success: true, data })
  } catch (error) {
    logger.error('Delivery proxy error (start):', error.message)
    res.status(error.response?.status || 502).json({ success: false, message: 'Error al iniciar entrega' })
  }
})

// Complete delivery
router.post('/:id/complete', authMiddleware, authorize(['REPARTIDOR', 'ADMIN']), async (req, res) => {
  try {
    const { data } = await axios.post(`${DELIVERY_URL}/api/deliveries/${req.params.id}/complete`)
    res.json({ success: true, data })
  } catch (error) {
    logger.error('Delivery proxy error (complete):', error.message)
    res.status(error.response?.status || 502).json({ success: false, message: 'Error al completar entrega' })
  }
})

// Cancel delivery
router.post('/:id/cancel', authMiddleware, authorize(['REPARTIDOR', 'ADMIN']), async (req, res) => {
  try {
    const { data } = await axios.post(`${DELIVERY_URL}/api/deliveries/${req.params.id}/cancel`)
    res.json({ success: true, data })
  } catch (error) {
    logger.error('Delivery proxy error (cancel):', error.message)
    res.status(error.response?.status || 502).json({ success: false, message: 'Error al cancelar entrega' })
  }
})

// Reassign delivery
router.put('/:id/reassign', authMiddleware, authorize(['ADMIN']), async (req, res) => {
  try {
    const { data } = await axios.put(`${DELIVERY_URL}/api/deliveries/${req.params.id}/reassign`, req.body)
    res.json({ success: true, data })
  } catch (error) {
    logger.error('Delivery proxy error (reassign):', error.message)
    res.status(error.response?.status || 502).json({ success: false, message: 'Error al reasignar entrega' })
  }
})

module.exports = router