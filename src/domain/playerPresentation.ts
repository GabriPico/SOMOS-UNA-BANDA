import type { PlayerSeasonStats } from './gameState'

export function getQualityStars(value: number) {
  if (value < 58) return 1
  if (value < 63) return 1.5
  if (value < 67) return 2
  if (value < 71) return 2.5
  if (value < 75) return 3
  if (value < 79) return 3.5
  if (value < 83) return 4
  if (value < 87) return 4.5
  return 5
}

export function formatQualityStars(stars: number) {
  const full = Math.floor(stars)
  const half = stars % 1 !== 0
  return `${'★'.repeat(full)}${half ? '½' : ''}${'☆'.repeat(Math.max(0, 5 - full - (half ? 1 : 0)))}`
}

export const getFormLabel = (value: number) => value >= 85 ? 'Muy buena' : value >= 70 ? 'Buena' : value >= 55 ? 'Normal' : value >= 40 ? 'Mala' : 'Muy mala'

export const getAverageMatchRating = (stats?: PlayerSeasonStats) => stats?.ratings?.length
  ? stats.ratings.reduce((sum, item) => sum + item.rating, 0) / stats.ratings.length
  : null

export const getLastMatchRatings = (stats?: PlayerSeasonStats, limit = 5) => (stats?.ratings ?? []).slice(-limit)
export const formatMatchRating = (value: number) => value.toLocaleString('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
export const hasValidMatchRating = (minutesPlayed: number) => minutesPlayed > 0
