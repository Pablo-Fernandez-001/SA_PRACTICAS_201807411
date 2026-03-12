process.env.NODE_ENV = 'test'

const request = require('supertest')

jest.mock('axios', () => ({
  get: jest.fn()
}))

const axios = require('axios')
const app = require('../src/index')

describe('Catalog search endpoint', () => {
  test('returns filtered results for category', async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        restaurants: [{ id: 1, name: 'Top Place', avg_rating: 4.8 }],
        menuItems: []
      }
    })

    const res = await request(app)
      .get('/api/catalog/search')
      .query({ category: 'top' })

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.restaurants.length).toBe(1)
    expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/api/search'), { params: { category: 'top' } })
  })
})
