const calculateAverageRating = (ratings) => {
  if (!Array.isArray(ratings) || ratings.length === 0) return 0
  const sum = ratings.reduce((acc, value) => acc + Number(value || 0), 0)
  const avg = sum / ratings.length
  return Number(avg.toFixed(2))
}

const isFeaturedRestaurant = (averageRating, hasActivePromotion = false, minRating = 4.3) => {
  if (hasActivePromotion) return true
  return Number(averageRating || 0) >= minRating
}

module.exports = { calculateAverageRating, isFeaturedRestaurant }
