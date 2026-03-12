const { calculateAverageRating, isFeaturedRestaurant } = require('../src/utils/ratingUtils')

describe('ratingUtils', () => {
  test('calculates average rating with rounding', () => {
    const avg = calculateAverageRating([5, 4, 3, 5])
    expect(avg).toBe(4.25)
  })

  test('returns 0 when ratings list is empty', () => {
    expect(calculateAverageRating([])).toBe(0)
  })

  test('determines featured restaurants based on rating or promo', () => {
    expect(isFeaturedRestaurant(4.4, false)).toBe(true)
    expect(isFeaturedRestaurant(4.2, true)).toBe(true)
    expect(isFeaturedRestaurant(4.2, false)).toBe(false)
  })
})
