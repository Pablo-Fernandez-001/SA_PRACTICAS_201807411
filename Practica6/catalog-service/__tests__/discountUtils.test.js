const { computeDiscountAmount } = require('../src/utils/discountUtils')

describe('computeDiscountAmount', () => {
  test('calculates percentage discount', () => {
    expect(computeDiscountAmount('PERCENT', 10, 200)).toBe(20)
  })

  test('calculates fixed discount', () => {
    expect(computeDiscountAmount('FIXED', 15, 200)).toBe(15)
  })

  test('returns 0 for invalid subtotal or type', () => {
    expect(computeDiscountAmount('UNKNOWN', 10, 100)).toBe(0)
    expect(computeDiscountAmount('PERCENT', 10, 0)).toBe(0)
  })
})
