const express = require('express')
const { authMiddleware, authorize } = require('../middleware/auth')

const router = express.Router()

// Placeholder routes for delivery service
router.get('/', authMiddleware, authorize(['REPARTIDOR', 'ADMIN']), async (req, res) => {
  res.json({
    success: true,
    message: 'Delivery service not implemented yet',
    data: []
  })
})

router.patch('/:id/status', authMiddleware, authorize(['REPARTIDOR']), async (req, res) => {
  res.json({
    success: true,
    message: 'Delivery service not implemented yet',
    data: {}
  })
})

module.exports = router