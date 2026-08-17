import type { Formation, PlayerPosition, TacticalPlan } from './models'
import type { AttackRoute, MatchTeamState } from './matchTypes'

export const FORMATION_SLOTS: Record<Formation, PlayerPosition[]> = {
  '4-4-2': ['POR', 'LD', 'DFC', 'DFC', 'LI', 'MC', 'MC', 'MD', 'DC', 'MI', 'DC'],
  '4-3-3': ['POR', 'LD', 'DFC', 'DFC', 'LI', 'MC', 'MC', 'ED', 'MC', 'EI', 'DC'],
  '4-2-3-1': ['POR', 'LD', 'DFC', 'DFC', 'LI', 'MC', 'MC', 'ED', 'MP', 'EI', 'DC'],
  '3-5-2': ['POR', 'CAD', 'DFC', 'DFC', 'DFC', 'MC', 'MC', 'MC', 'DC', 'CAI', 'DC'],
  '5-4-1': ['POR', 'LD', 'DFC', 'DFC', 'LI', 'DFC', 'MC', 'MD', 'MC', 'MI', 'DC'],
}

export function tacticalSignature(plan: TacticalPlan) { return Object.values(plan).join('|') }
const add = (weights: Record<AttackRoute, number>, route: AttackRoute, value: number) => { weights[route] += value }
export function getAttackRouteWeights(team: MatchTeamState, scoreDifference: number): Record<AttackRoute, number> {
  const plan = team.tactics
  const weights: Record<AttackRoute, number> = { LEFT_WING: 12, RIGHT_WING: 12, CENTRAL: 16, DIRECT_TARGET: 8, IN_BEHIND: 8, COUNTER: 5, SET_PIECE: 3 }
  const positions = team.lineup.slots
  if (positions.some((p) => p === 'MI' || p === 'EI' || p === 'CAI')) add(weights, 'LEFT_WING', 7)
  if (positions.some((p) => p === 'MD' || p === 'ED' || p === 'CAD')) add(weights, 'RIGHT_WING', 7)
  if (positions.filter((p) => p === 'MC' || p === 'MCD' || p === 'MP').length >= 3) add(weights, 'CENTRAL', 8)
  if (plan.passingStyle === 'Directo') { add(weights, 'DIRECT_TARGET', 15); add(weights, 'IN_BEHIND', 11) }
  if (plan.passingStyle === 'En corto') add(weights, 'CENTRAL', 12)
  if (plan.afterRecovery === 'Contraataque') { add(weights, 'COUNTER', 15); add(weights, 'IN_BEHIND', 7) }
  if (plan.afterRecovery === 'Mantener posición') add(weights, 'CENTRAL', 7)
  if (scoreDifference < 0 && plan.mentality === 'Ofensiva') { add(weights, 'IN_BEHIND', 5); add(weights, 'LEFT_WING', 3); add(weights, 'RIGHT_WING', 3) }
  for (const route of Object.keys(weights) as AttackRoute[]) {
    const attempts = team.routeAttempts[route] ?? 0
    const success = team.routeSuccess[route] ?? 0
    if (attempts >= 2) weights[route] *= 1 + Math.min(.18, (success / attempts - .35) * .3)
  }
  return weights
}

export function coordinationFor(team: MatchTeamState, phase: 'attack' | 'transitionAttack' | 'defense' | 'transitionDefense') {
  return team.familiarity[phase] * .8 + team.familiarity.formation * .2
}
