const computeDiscountAmount = (type, value, subtotal) => {
  const base = Number(subtotal || 0)
  const numericValue = Number(value || 0)
  if (!base || base <= 0) return 0

  const normalized = String(type || '').toUpperCase()
  if (normalized === 'PERCENT') {
    return (base * numericValue) / 100
  }
  if (normalized === 'FIXED') {
    return numericValue
  }
  return 0
}

module.exports = { computeDiscountAmount }
