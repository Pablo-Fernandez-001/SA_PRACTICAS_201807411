process.env.NODE_ENV = 'test'

const request = require('supertest')

jest.mock('../src/middleware/auth', () => ({
  authMiddleware: (req, res, next) => {
    req.user = { id: 123, role: 'CLIENTE' }
    next()
  },
  authorize: () => (req, res, next) => next()
}))

jest.mock('axios', () => ({
  post: jest.fn()
}))

const axios = require('axios')
const app = require('../src/index')

describe('Orders create endpoint', () => {
  test('rejects invalid payload before queue', async () => {
    const res = await request(app)
      .post('/api/orders')
      .send({ restaurantId: 1, items: [] })

    expect(res.status).toBe(400)
    expect(res.body.success).toBe(false)
    expect(axios.post).not.toHaveBeenCalled()
  })

  test('accepts valid payload and forwards to service', async () => {
    axios.post.mockResolvedValueOnce({ data: { order: { id: 99 } } })

    const res = await request(app)
      .post('/api/orders')
      .send({
        restaurantId: 1,
        items: [{ menuItemId: 10, quantity: 2 }]
      })

    expect(res.status).toBe(201)
    expect(axios.post).toHaveBeenCalled()
    const payloadSent = axios.post.mock.calls[0][1]
    expect(payloadSent.userId).toBe(123)
  })
})
