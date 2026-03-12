const { getPool } = require('../config/database')
const logger = require('../utils/logger')
const { computeDiscountAmount } = require('../utils/discountUtils')

const db = () => getPool()

const nowSql = () => new Date().toISOString().slice(0, 19).replace('T', ' ')

exports.getPromotions = async (req, res) => {
  try {
    const { restaurantId, active } = req.query
    const params = []
    let sql = 'SELECT * FROM promotions'
    const where = []

    if (restaurantId) {
      where.push('restaurant_id = ?')
      params.push(restaurantId)
    }
    if (active === 'true') {
      where.push('is_active = true')
    }

    if (where.length) sql += ` WHERE ${where.join(' AND ')}`
    sql += ' ORDER BY created_at DESC'

    const [rows] = await db().query(sql, params)
    res.json(rows)
  } catch (error) {
    logger.error('Error fetching promotions:', error)
    res.status(500).json({ error: 'Error fetching promotions' })
  }
}

exports.createPromotion = async (req, res) => {
  try {
    const {
      restaurantId,
      title,
      description,
      discountType,
      discountValue,
      minOrder,
      maxUses,
      restrictions,
      startsAt,
      expiresAt,
      isActive
    } = req.body

    if (!restaurantId || !title || !discountType || discountValue === undefined) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const [result] = await db().query(
      `INSERT INTO promotions
        (restaurant_id, title, description, discount_type, discount_value, min_order, max_uses, restrictions, starts_at, expires_at, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      , [
        restaurantId,
        title,
        description || null,
        discountType,
        discountValue,
        minOrder || null,
        maxUses || null,
        restrictions || null,
        startsAt || null,
        expiresAt || null,
        isActive !== undefined ? !!isActive : true
      ])

    const [rows] = await db().query('SELECT * FROM promotions WHERE id = ?', [result.insertId])
    res.status(201).json(rows[0])
  } catch (error) {
    logger.error('Error creating promotion:', error)
    res.status(500).json({ error: 'Error creating promotion' })
  }
}

exports.togglePromotion = async (req, res) => {
  try {
    const { id } = req.params
    const [rows] = await db().query('SELECT is_active FROM promotions WHERE id = ?', [id])
    if (!rows.length) return res.status(404).json({ error: 'Promotion not found' })

    const newStatus = !rows[0].is_active
    await db().query('UPDATE promotions SET is_active = ? WHERE id = ?', [newStatus, id])
    res.json({ id: parseInt(id), is_active: newStatus })
  } catch (error) {
    logger.error('Error toggling promotion:', error)
    res.status(500).json({ error: 'Error toggling promotion' })
  }
}

exports.deletePromotion = async (req, res) => {
  try {
    const { id } = req.params
    await db().query('DELETE FROM promotions WHERE id = ?', [id])
    res.json({ message: 'Promotion deleted' })
  } catch (error) {
    logger.error('Error deleting promotion:', error)
    res.status(500).json({ error: 'Error deleting promotion' })
  }
}

exports.validatePromotion = async (req, res) => {
  try {
    const { restaurantId, subtotal } = req.body
    if (!restaurantId || subtotal === undefined) {
      return res.status(400).json({ error: 'Missing restaurantId or subtotal' })
    }

    const now = nowSql()
    const [rows] = await db().query(
      `SELECT * FROM promotions
       WHERE restaurant_id = ?
         AND is_active = true
         AND (starts_at IS NULL OR starts_at <= ?)
         AND (expires_at IS NULL OR expires_at >= ?)
         AND (max_uses IS NULL OR used_count < max_uses)
         AND (min_order IS NULL OR min_order <= ?)`
      , [restaurantId, now, now, subtotal]
    )

    if (!rows.length) {
      return res.json({ valid: false, discountAmount: 0, promotion: null })
    }

    let best = null
    let bestDiscount = 0
    rows.forEach((promo) => {
      const discount = computeDiscountAmount(promo.discount_type, parseFloat(promo.discount_value), parseFloat(subtotal))
      if (discount > bestDiscount) {
        bestDiscount = discount
        best = promo
      }
    })

    if (!best) {
      return res.json({ valid: false, discountAmount: 0, promotion: null })
    }

    const capped = Math.min(bestDiscount, parseFloat(subtotal))
    res.json({ valid: true, discountAmount: parseFloat(capped.toFixed(2)), promotion: best })
  } catch (error) {
    logger.error('Error validating promotion:', error)
    res.status(500).json({ error: 'Error validating promotion' })
  }
}
