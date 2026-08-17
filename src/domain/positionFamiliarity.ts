import type { Player, PlayerAttribute, PlayerAttributes, PlayerPosition } from './models'
import { calculatePositionRating, POSITION_RATING_WEIGHTS, POSITION_TO_RATING_PROFILE } from './playerRatings'

export type PositionFamiliarity = 'PREFERRED' | 'COMPATIBLE' | 'IMPROVISED'

export const POSITION_FAMILIARITY_LABELS: Record<PositionFamiliarity, string> = {
  PREFERRED: 'Preferido',
  COMPATIBLE: 'Compatible',
  IMPROVISED: 'Improvisado',
}

export const POSITION_FAMILIARITY_PENALTIES: Record<PositionFamiliarity, number> = {
  PREFERRED: 0,
  COMPATIBLE: 0,
  IMPROVISED: 2,
}

const RELATED_POSITION_PAIRS: ReadonlyArray<readonly [PlayerPosition, PlayerPosition]> = [
  ['DFC', 'LD'], ['DFC', 'LI'], ['DFC', 'MCD'],
  ['LD', 'CAD'], ['LI', 'CAI'],
  ['CAD', 'MD'], ['CAD', 'ED'], ['CAI', 'MI'], ['CAI', 'EI'],
  ['MD', 'MC'], ['MD', 'ED'], ['MI', 'MC'], ['MI', 'EI'],
  ['MCD', 'MC'], ['MC', 'MP'],
  ['MP', 'DC'], ['MP', 'ED'], ['MP', 'EI'],
  ['ED', 'DC'], ['EI', 'DC'],
]

const WIDE_COMPATIBILITY: Partial<Record<PlayerPosition, PlayerPosition[]>> = {
  LD: ['LI', 'CAD', 'CAI', 'MD', 'MI'], LI: ['LD', 'CAD', 'CAI', 'MD', 'MI'],
  CAD: ['CAI', 'LD', 'LI', 'MD', 'MI'], CAI: ['CAD', 'LD', 'LI', 'MD', 'MI'],
  MD: ['MI', 'LD', 'LI', 'CAD', 'CAI', 'ED', 'EI'], MI: ['MD', 'LD', 'LI', 'CAD', 'CAI', 'ED', 'EI'],
  ED: ['EI', 'MD', 'MI'], EI: ['ED', 'MD', 'MI'],
}

export const RELATED_POSITIONS = RELATED_POSITION_PAIRS.reduce((graph, [left, right]) => {
  graph[left].add(right)
  graph[right].add(left)
  return graph
}, Object.fromEntries((Object.keys(POSITION_TO_RATING_PROFILE) as PlayerPosition[]).map((position) => [position, new Set<PlayerPosition>()])) as Record<PlayerPosition, Set<PlayerPosition>>)

function getPositionDistance(from: PlayerPosition, to: PlayerPosition) {
  if (from === to) return 0
  if (from === 'POR' || to === 'POR') return Number.POSITIVE_INFINITY
  const visited = new Set<PlayerPosition>([from])
  let frontier: PlayerPosition[] = [from]
  for (let distance = 1; frontier.length > 0; distance++) {
    const next: PlayerPosition[] = []
    for (const position of frontier) for (const related of RELATED_POSITIONS[position]) {
      if (related === to) return distance
      if (!visited.has(related)) {
        visited.add(related)
        next.push(related)
      }
    }
    frontier = next
  }
  return Number.POSITIVE_INFINITY
}

export function getPositionFamiliarity(player: Pick<Player, 'primaryPosition' | 'secondaryPositions'>, tacticalPosition: PlayerPosition): PositionFamiliarity {
  const naturalPositions = [player.primaryPosition, ...player.secondaryPositions]
  if (naturalPositions.includes(tacticalPosition)) return 'PREFERRED'
  if (naturalPositions.some((position) => WIDE_COMPATIBILITY[position]?.includes(tacticalPosition))) return 'COMPATIBLE'
  const distance = Math.min(...naturalPositions.map((position) => getPositionDistance(position, tacticalPosition)))
  return distance === 1 ? 'COMPATIBLE' : 'IMPROVISED'
}

export function getPositionPenalty(player: Pick<Player, 'primaryPosition' | 'secondaryPositions'>, tacticalPosition: PlayerPosition) {
  return POSITION_FAMILIARITY_PENALTIES[getPositionFamiliarity(player, tacticalPosition)]
}

export function getEffectiveAttributesForPosition(player: Player, tacticalPosition: PlayerPosition): PlayerAttributes {
  const penalty = getPositionPenalty(player, tacticalPosition)
  if (penalty === 0) return { ...player.attributes }
  const effectiveAttributes = { ...player.attributes }
  const relevantAttributes = Object.keys(POSITION_RATING_WEIGHTS[POSITION_TO_RATING_PROFILE[tacticalPosition]]) as PlayerAttribute[]
  for (const attribute of relevantAttributes) effectiveAttributes[attribute] = Math.max(1, effectiveAttributes[attribute] - penalty)
  return effectiveAttributes
}

export function calculateTacticalRating(player: Player, tacticalPosition: PlayerPosition) {
  const rating = calculatePositionRating({ attributes: getEffectiveAttributesForPosition(player, tacticalPosition) }, tacticalPosition)
  return Math.min(100, rating + (getPositionFamiliarity(player, tacticalPosition) === 'PREFERRED' ? 1 : 0))
}
