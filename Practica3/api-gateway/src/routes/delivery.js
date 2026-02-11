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

// Update delivery status
router.patch('/:id/status', authMiddleware, authorize(['REPARTIDOR', 'ADMIN']), async (req, res) => {
  try {
    const { data } = await axios.patch(`${DELIVERY_URL}/api/deliveries/${req.params.id}/status`, req.body)
    res.json({ success: true, data })
  } catch (error) {
    logger.error('Delivery proxy error (status):', error.message)
    res.status(error.response?.status || 502).json({ success: false, message: 'Error al actualizar estado de entrega' })
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

module.exports = router