import type { Player, PlayerPosition } from './models'
import type { TrainingPlayerState } from './trainingTypes'
import { getPositionFamiliarity, calculateTacticalRating } from './positionFamiliarity'
import { getConditionLabel } from './humanState'

export type TacticalSubstituteSuggestion = { player: Player; reason: string }

function positionFit(player: Player, position: PlayerPosition) {
  if (player.primaryPosition === position) return { rank: 4, label: 'Posición habitual' }
  if (player.secondaryPositions.includes(position)) return { rank: 3, label: 'Posición secundaria' }
  if (getPositionFamiliarity(player, position) === 'COMPATIBLE') return { rank: 2, label: 'Puesto compatible' }
  return { rank: 1, label: 'Fuera de posición' }
}

/** Caller supplies only players allowed by the existing lineup and eligibility rules. */
export function rankTacticalSubstitutes(players: Player[], position: PlayerPosition, training: Record<number, TrainingPlayerState>): TacticalSubstituteSuggestion[] {
  const ranked = players.map(player => {
    const state = training[player.id]
    const fit = positionFit(player, position)
    const condition = state?.fitness ?? player.fitness
    const effectivePlayer = state ? { ...player, attributes: state.baseAttributes } : player
    return { player, fit, condition, quality: calculateTacticalRating(effectivePlayer, position) }
  }).sort((left, right) => right.fit.rank - left.fit.rank || right.condition - left.condition || right.quality - left.quality || left.player.name.localeCompare(right.player.name, 'es'))

  return ranked.map(({ player, fit, condition }) => ({
    player,
    reason: `${fit.label} · condición ${getConditionLabel(condition).toLowerCase()}`,
  }))
}
