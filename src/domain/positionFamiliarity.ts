import type { Player, PlayerAttribute, PlayerAttributes, PlayerPosition } from './models'
import { calculatePositionRating, POSITION_RATING_WEIGHTS, POSITION_TO_RATING_PROFILE } from './playerRatings'

export type PositionFamiliarity = 'NATURAL' | 'RELATED' | 'UNFAMILIAR' | 'VERY_UNFAMILIAR'

export const POSITION_FAMILIARITY_LABELS: Record<PositionFamiliarity, string> = {
  NATURAL: 'Natural',
  RELATED: 'Posición relacionada',
  UNFAMILIAR: 'Fuera de posición',
  VERY_UNFAMILIAR: 'Muy fuera de posición',
}

export const POSITION_FAMILIARITY_PENALTIES: Record<PositionFamiliarity, number> = {
  NATURAL: 0,
  RELATED: 1,
  UNFAMILIAR: 2,
  VERY_UNFAMILIAR: 3,
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
  const distance = Math.min(...naturalPositions.map((position) => getPositionDistance(position, tacticalPosition)))
  if (distance === 0) return 'NATURAL'
  if (distance === 1) return 'RELATED'
  if (distance === 2) return 'UNFAMILIAR'
  return 'VERY_UNFAMILIAR'
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
  return calculatePositionRating({ attributes: getEffectiveAttributesForPosition(player, tacticalPosition) }, tacticalPosition)
}
