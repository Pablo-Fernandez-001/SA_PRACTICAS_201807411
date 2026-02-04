const express = require('express')
const { authMiddleware, authorize } = require('../middleware/auth')

const router = express.Router()

// Placeholder routes for orders service
router.get('/', authMiddleware, async (req, res) => {
  res.json({
    success: true,
    message: 'Orders service not implemented yet',
    data: []
  })
})

router.post('/', authMiddleware, authorize(['CLIENTE']), async (req, res) => {
  res.json({
    success: true,
    message: 'Orders service not implemented yet',
    data: {}
  })
})

router.get('/:id', authMiddleware, async (req, res) => {
  res.json({
    success: true,
    message: 'Orders service not implemented yet',
    data: {}
  })
})

module.exports = router