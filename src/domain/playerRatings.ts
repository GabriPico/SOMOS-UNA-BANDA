import type { Player, PlayerAttribute, PlayerPosition } from './models'

export type RatingProfile = 'POR' | 'DFC' | 'LAT' | 'CAR' | 'MCD' | 'MC' | 'MP' | 'MD_MI' | 'EXT' | 'DC'
type Weights = Partial<Record<PlayerAttribute, number>>

export const POSITION_RATING_WEIGHTS: Record<RatingProfile, Weights> = {
  POR: { paradas: .5, juegoPiesPortero: .1, juegoAereoPortero: .15, comunicacion: .1, mentalidad: .15 },
  DFC: { comunicacion: .075, intensidad: .1, mentalidad: .1, rapidez: .1, alcanceAereo: .1875, fuerza: .1, resistencia: .025, agilidad: .025, tecnica: .025, regate: .0125, pases: .05, entradas: .1, marcaje: .1 },
  LAT: { comunicacion: .025, intensidad: .1, mentalidad: .075, rapidez: .2, alcanceAereo: .025, fuerza: .05, resistencia: .15, agilidad: .05, tecnica: .025, regate: .025, pases: .075, entradas: .1, marcaje: .1 },
  CAR: { comunicacion: .025, intensidad: .1, mentalidad: .075, rapidez: .2, alcanceAereo: .0125, fuerza: .0375, resistencia: .1875, agilidad: .075, tecnica: .05, regate: .0625, pases: .075, remate: .0125, entradas: .05, marcaje: .0375 },
  MCD: { comunicacion: .05, intensidad: .125, mentalidad: .125, rapidez: .075, alcanceAereo: .05, fuerza: .075, resistencia: .1, agilidad: .025, tecnica: .05, regate: .025, pases: .125, entradas: .1, marcaje: .075 },
  MC: { comunicacion: .05, intensidad: .1, mentalidad: .1, rapidez: .05, alcanceAereo: .025, fuerza: .025, resistencia: .15, agilidad: .05, tecnica: .1, regate: .05, pases: .2, remate: .025, entradas: .05, marcaje: .025 },
  MP: { comunicacion: .025, intensidad: .075, mentalidad: .1, rapidez: .075, alcanceAereo: .0125, fuerza: .0125, resistencia: .075, agilidad: .1, tecnica: .15, regate: .125, pases: .175, remate: .075 },
  MD_MI: { comunicacion: .025, intensidad: .1, mentalidad: .0875, rapidez: .15, alcanceAereo: .0125, fuerza: .0375, resistencia: .15, agilidad: .075, tecnica: .075, regate: .0875, pases: .1, remate: .025, entradas: .05, marcaje: .025 },
  EXT: { comunicacion: .0125, intensidad: .075, mentalidad: .075, rapidez: .2, alcanceAereo: .0125, fuerza: .025, resistencia: .1, agilidad: .125, tecnica: .1, regate: .15, pases: .075, remate: .05 },
  DC: { comunicacion: .0125, intensidad: .1, mentalidad: .1, rapidez: .15, alcanceAereo: .1, fuerza: .1, resistencia: .05, agilidad: .05, tecnica: .075, regate: .05, pases: .025, remate: .1875 },
}

export const POSITION_TO_RATING_PROFILE: Record<PlayerPosition, RatingProfile> = {
  POR: 'POR', DFC: 'DFC', LD: 'LAT', LI: 'LAT', CAD: 'CAR', CAI: 'CAR',
  MCD: 'MCD', MC: 'MC', MP: 'MP', MD: 'MD_MI', MI: 'MD_MI',
  ED: 'EXT', EI: 'EXT', DC: 'DC',
}

export function validateRatingWeights() {
  for (const [profile, weights] of Object.entries(POSITION_RATING_WEIGHTS)) {
    const total = Object.values(weights).reduce((sum, weight) => sum + weight, 0)
    if (Math.abs(total - 1) > 0.00001) throw new Error(`Las ponderaciones de ${profile} suman ${total * 100}%`)
  }
  return true
}

export function calculatePositionRating(player: Pick<Player, 'attributes'>, position: PlayerPosition) {
  const weights = POSITION_RATING_WEIGHTS[POSITION_TO_RATING_PROFILE[position]]
  const rating = Object.entries(weights).reduce((sum, [attribute, weight]) =>
    sum + player.attributes[attribute as PlayerAttribute] * weight, 0) * 5
  return Math.max(0, Math.min(100, rating))
}

export function getPlayerPositions(player: Player) { return [player.primaryPosition, ...player.secondaryPositions] }
export function getRatingsByPosition(player: Player) {
  return Object.fromEntries(getPlayerPositions(player).map((position) => [position, calculatePositionRating(player, position)])) as Partial<Record<PlayerPosition, number>>
}
export function calculateGeneralRating(player: Player) { return Math.max(...Object.values(getRatingsByPosition(player))) }
export function getBestRatedPosition(player: Player) {
  return getPlayerPositions(player).reduce((best, position) =>
    calculatePositionRating(player, position) > calculatePositionRating(player, best) ? position : best,
  player.primaryPosition)
}

validateRatingWeights()
