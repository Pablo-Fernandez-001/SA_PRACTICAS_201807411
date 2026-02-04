const express = require('express')
const { authMiddleware, authorize } = require('../middleware/auth')

const router = express.Router()

// Placeholder routes for catalog service
router.get('/restaurants', async (req, res) => {
  res.json({
    success: true,
    message: 'Catalog service not implemented yet',
    data: []
  })
})

router.get('/restaurants/:id', async (req, res) => {
  res.json({
    success: true,
    message: 'Catalog service not implemented yet',
    data: {}
  })
})

router.get('/restaurants/:id/menu', async (req, res) => {
  res.json({
    success: true,
    message: 'Catalog service not implemented yet',
    data: []
  })
})

module.exports = router