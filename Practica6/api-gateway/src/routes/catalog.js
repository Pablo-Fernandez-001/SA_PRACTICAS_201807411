const express = require('express')
const axios = require('axios')
const { authMiddleware, authorize } = require('../middleware/auth')
const logger = require('../utils/logger')

const router = express.Router()

const CATALOG_URL = `http://${process.env.CATALOG_SERVICE_URL || 'catalog-service:3002'}`
  .replace(':50052', ':3002') // ensure REST port, not gRPC

// ─── Public routes (no auth needed to browse catalog) ────────────────────────

// Get all restaurants
router.get('/restaurants', async (req, res) => {
  try {
    const { data } = await axios.get(`${CATALOG_URL}/api/restaurants`)
    res.json({ success: true, data })
  } catch (error) {
    logger.error('Catalog proxy error (restaurants):', error.message)
    res.status(error.response?.status || 502).json({ success: false, message: 'Error al obtener restaurantes' })
  }
})

// Get restaurant by ID (with menu)
router.get('/restaurants/:id', async (req, res) => {
  try {
    const { data } = await axios.get(`${CATALOG_URL}/api/restaurants/${req.params.id}`)
    res.json({ success: true, data })
  } catch (error) {
    logger.error('Catalog proxy error (restaurant):', error.message)
    res.status(error.response?.status || 502).json({ success: false, message: 'Error al obtener restaurante' })
  }
})

// Get menu items by restaurant
router.get('/restaurants/:id/menu', async (req, res) => {
  try {
    const allParam = req.query.all === 'true' ? '?all=true' : ''
    const { data } = await axios.get(`${CATALOG_URL}/api/menu-items/restaurant/${req.params.id}${allParam}`)
    res.json({ success: true, data })
  } catch (error) {
    logger.error('Catalog proxy error (menu):', error.message)
    res.status(error.response?.status || 502).json({ success: false, message: 'Error al obtener menú' })
  }
})

// Get all menu items
router.get('/menu-items', async (req, res) => {
  try {
    const { data } = await axios.get(`${CATALOG_URL}/api/menu-items`)
    res.json({ success: true, data })
  } catch (error) {
    logger.error('Catalog proxy error (menu-items):', error.message)
    res.status(error.response?.status || 502).json({ success: false, message: 'Error al obtener items del menú' })
  }
})

// ─── Protected routes ────────────────────────────────────────────────────────

// Create restaurant (RESTAURANTE role)
router.post('/restaurants', authMiddleware, authorize(['RESTAURANTE', 'ADMIN']), async (req, res) => {
  try {
    const { data } = await axios.post(`${CATALOG_URL}/api/restaurants`, req.body)
    res.status(201).json({ success: true, data })
  } catch (error) {
    logger.error('Catalog proxy error (create restaurant):', error.message)
    res.status(error.response?.status || 502).json({ success: false, message: error.response?.data?.error || 'Error al crear restaurante' })
  }
})

// Create menu item (RESTAURANTE role)
router.post('/menu-items', authMiddleware, authorize(['RESTAURANTE', 'ADMIN']), async (req, res) => {
  try {
    const { data } = await axios.post(`${CATALOG_URL}/api/menu-items`, req.body)
    res.status(201).json({ success: true, data })
  } catch (error) {
    logger.error('Catalog proxy error (create menu item):', error.message)
    res.status(error.response?.status || 502).json({ success: false, message: error.response?.data?.error || 'Error al crear item de menú' })
  }
})

// Update restaurant
router.put('/restaurants/:id', authMiddleware, authorize(['RESTAURANTE', 'ADMIN']), async (req, res) => {
  try {
    const { data } = await axios.put(`${CATALOG_URL}/api/restaurants/${req.params.id}`, req.body)
    res.json({ success: true, data })
  } catch (error) {
    logger.error('Catalog proxy error (update restaurant):', error.message)
    res.status(error.response?.status || 502).json({ success: false, message: error.response?.data?.error || 'Error al actualizar restaurante' })
  }
})

// Delete restaurant
router.delete('/restaurants/:id', authMiddleware, authorize(['ADMIN']), async (req, res) => {
  try {
    const { data } = await axios.delete(`${CATALOG_URL}/api/restaurants/${req.params.id}`)
    res.json({ success: true, data })
  } catch (error) {
    logger.error('Catalog proxy error (delete restaurant):', error.message)
    res.status(error.response?.status || 502).json({ success: false, message: error.response?.data?.error || 'Error al eliminar restaurante' })
  }
})

// Toggle restaurant status
router.patch('/restaurants/:id/toggle', authMiddleware, authorize(['RESTAURANTE', 'ADMIN']), async (req, res) => {
  try {
    const { data } = await axios.patch(`${CATALOG_URL}/api/restaurants/${req.params.id}/toggle`)
    res.json({ success: true, data })
  } catch (error) {
    logger.error('Catalog proxy error (toggle restaurant):', error.message)
    res.status(error.response?.status || 502).json({ success: false, message: error.response?.data?.error || 'Error al cambiar estado' })
  }
})

// Update menu item
router.put('/menu-items/:id', authMiddleware, authorize(['RESTAURANTE', 'ADMIN']), async (req, res) => {
  try {
    const { data } = await axios.put(`${CATALOG_URL}/api/menu-items/${req.params.id}`, req.body)
    res.json({ success: true, data })
  } catch (error) {
    logger.error('Catalog proxy error (update menu item):', error.message)
    res.status(error.response?.status || 502).json({ success: false, message: error.response?.data?.error || 'Error al actualizar item' })
  }
})

// Delete menu item
router.delete('/menu-items/:id', authMiddleware, authorize(['RESTAURANTE', 'ADMIN']), async (req, res) => {
  try {
    const { data } = await axios.delete(`${CATALOG_URL}/api/menu-items/${req.params.id}`)
    res.json({ success: true, data })
  } catch (error) {
    logger.error('Catalog proxy error (delete menu item):', error.message)
    res.status(error.response?.status || 502).json({ success: false, message: error.response?.data?.error || 'Error al eliminar item' })
  }
})

// Toggle menu item availability
router.patch('/menu-items/:id/toggle', authMiddleware, authorize(['RESTAURANTE', 'ADMIN']), async (req, res) => {
  try {
    const { data } = await axios.patch(`${CATALOG_URL}/api/menu-items/${req.params.id}/toggle`)
    res.json({ success: true, data })
  } catch (error) {
    logger.error('Catalog proxy error (toggle menu item):', error.message)
    res.status(error.response?.status || 502).json({ success: false, message: error.response?.data?.error || 'Error al cambiar disponibilidad' })
  }
})

// ─── Promotions ──────────────────────────────────────────────────────────────

// Get all promotions
router.get('/promotions', async (req, res) => {
  try {
    const { data } = await axios.get(`${CATALOG_URL}/api/promotions`)
    res.json({ success: true, data })
  } catch (error) {
    logger.error('Catalog proxy error (promotions):', error.message)
    res.status(error.response?.status || 502).json({ success: false, message: 'Error al obtener promociones' })
  }
})

// Get active promotions
router.get('/promotions/active', async (req, res) => {
  try {
    const { data } = await axios.get(`${CATALOG_URL}/api/promotions/active`)
    res.json({ success: true, data })
  } catch (error) {
    logger.error('Catalog proxy error (active promotions):', error.message)
    res.status(error.response?.status || 502).json({ success: false, message: 'Error al obtener promociones activas' })
  }
})

// Get promotions by restaurant
router.get('/promotions/restaurant/:restaurantId', async (req, res) => {
  try {
    const { data } = await axios.get(`${CATALOG_URL}/api/promotions/restaurant/${req.params.restaurantId}`)
    res.json({ success: true, data })
  } catch (error) {
    logger.error('Catalog proxy error (restaurant promotions):', error.message)
    res.status(error.response?.status || 502).json({ success: false, message: 'Error al obtener promociones del restaurante' })
  }
})

// Create promotion
router.post('/promotions', authMiddleware, authorize(['RESTAURANTE', 'ADMIN']), async (req, res) => {
  try {
    const { data } = await axios.post(`${CATALOG_URL}/api/promotions`, req.body)
    res.status(201).json({ success: true, data })
  } catch (error) {
    logger.error('Catalog proxy error (create promotion):', error.message)
    res.status(error.response?.status || 502).json({ success: false, message: error.response?.data?.error || 'Error al crear promocion' })
  }
})

// Update promotion
router.put('/promotions/:id', authMiddleware, authorize(['RESTAURANTE', 'ADMIN']), async (req, res) => {
  try {
    const { data } = await axios.put(`${CATALOG_URL}/api/promotions/${req.params.id}`, req.body)
    res.json({ success: true, data })
  } catch (error) {
    logger.error('Catalog proxy error (update promotion):', error.message)
    res.status(error.response?.status || 502).json({ success: false, message: error.response?.data?.error || 'Error al actualizar promocion' })
  }
})

// Delete promotion
router.delete('/promotions/:id', authMiddleware, authorize(['RESTAURANTE', 'ADMIN']), async (req, res) => {
  try {
    const { data } = await axios.delete(`${CATALOG_URL}/api/promotions/${req.params.id}`)
    res.json({ success: true, data })
  } catch (error) {
    logger.error('Catalog proxy error (delete promotion):', error.message)
    res.status(error.response?.status || 502).json({ success: false, message: error.response?.data?.error || 'Error al eliminar promocion' })
  }
})

// ─── Coupons ─────────────────────────────────────────────────────────────────

// Get all coupons
router.get('/coupons', async (req, res) => {
  try {
    const { data } = await axios.get(`${CATALOG_URL}/api/coupons`)
    res.json({ success: true, data })
  } catch (error) {
    logger.error('Catalog proxy error (coupons):', error.message)
    res.status(error.response?.status || 502).json({ success: false, message: 'Error al obtener cupones' })
  }
})

// Validate coupon
router.post('/coupons/validate', authMiddleware, async (req, res) => {
  try {
    const { data } = await axios.post(`${CATALOG_URL}/api/coupons/validate`, req.body)
    res.json({ success: true, data })
  } catch (error) {
    logger.error('Catalog proxy error (validate coupon):', error.message)
    res.status(error.response?.status || 502).json({ success: false, message: error.response?.data?.error || 'Error al validar cupon' })
  }
})

// Apply coupon (increment uses)
router.post('/coupons/apply', authMiddleware, async (req, res) => {
  try {
    const { data } = await axios.post(`${CATALOG_URL}/api/coupons/apply`, req.body)
    res.json({ success: true, data })
  } catch (error) {
    logger.error('Catalog proxy error (apply coupon):', error.message)
    res.status(error.response?.status || 502).json({ success: false, message: error.response?.data?.error || 'Error al aplicar cupon' })
  }
})

// Create coupon
router.post('/coupons', authMiddleware, authorize(['ADMIN']), async (req, res) => {
  try {
    const { data } = await axios.post(`${CATALOG_URL}/api/coupons`, req.body)
    res.status(201).json({ success: true, data })
  } catch (error) {
    logger.error('Catalog proxy error (create coupon):', error.message)
    res.status(error.response?.status || 502).json({ success: false, message: error.response?.data?.error || 'Error al crear cupon' })
  }
})

// Update coupon
router.put('/coupons/:id', authMiddleware, authorize(['ADMIN']), async (req, res) => {
  try {
    const { data } = await axios.put(`${CATALOG_URL}/api/coupons/${req.params.id}`, req.body)
    res.json({ success: true, data })
  } catch (error) {
    logger.error('Catalog proxy error (update coupon):', error.message)
    res.status(error.response?.status || 502).json({ success: false, message: error.response?.data?.error || 'Error al actualizar cupon' })
  }
})

// Delete coupon
router.delete('/coupons/:id', authMiddleware, authorize(['ADMIN']), async (req, res) => {
  try {
    const { data } = await axios.delete(`${CATALOG_URL}/api/coupons/${req.params.id}`)
    res.json({ success: true, data })
  } catch (error) {
    logger.error('Catalog proxy error (delete coupon):', error.message)
    res.status(error.response?.status || 502).json({ success: false, message: error.response?.data?.error || 'Error al eliminar cupon' })
  }
})

module.exports = router