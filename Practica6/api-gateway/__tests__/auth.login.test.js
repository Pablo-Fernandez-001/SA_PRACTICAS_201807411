process.env.NODE_ENV = 'test'

const request = require('supertest')

jest.mock('../src/services/authService', () => ({
  login: jest.fn()
}))

const authService = require('../src/services/authService')
const app = require('../src/index')

describe('Auth login endpoint', () => {
  test('rejects invalid credentials', async () => {
    authService.login.mockRejectedValueOnce(new Error('Invalid credentials'))

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'bad@example.com', password: 'wrong' })

    expect(res.status).toBe(401)
    expect(res.body.success).toBe(false)
  })

  test('accepts valid credentials', async () => {
    authService.login.mockResolvedValueOnce({
      user: { id: 1, email: 'user@example.com' },
      token: 'token-123'
    })

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@example.com', password: 'correct' })

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.token).toBe('token-123')
  })
})
