import type { PlayerAttribute } from './models'
import type { AttackRoute, MatchPlayer, MatchTeamState } from './matchTypes'
import { coordinationFor } from './matchTactics'
import { PREMATCH_TALK_BALANCE as talkBalance } from './preMatchTalkBalance'

export type DuelKind = 'DRIBBLE' | 'SPACE' | 'AERIAL' | 'BUILD_UP' | 'FINISH'
type Weight = readonly [PlayerAttribute, number]
const WEIGHTS: Record<DuelKind, { attack: Weight[]; defense: Weight[] }> = {
  DRIBBLE: { attack: [['regate', .3], ['tecnica', .2], ['rapidez', .22], ['agilidad', .18], ['mentalidad', .1]], defense: [['entradas', .28], ['marcaje', .26], ['rapidez', .18], ['agilidad', .14], ['mentalidad', .14]] },
  SPACE: { attack: [['rapidez', .55], ['mentalidad', .25], ['agilidad', .2]], defense: [['rapidez', .48], ['marcaje', .32], ['mentalidad', .2]] },
  AERIAL: { attack: [['alcanceAereo', .45], ['fuerza', .3], ['mentalidad', .25]], defense: [['alcanceAereo', .35], ['fuerza', .25], ['marcaje', .25], ['mentalidad', .15]] },
  BUILD_UP: { attack: [['tecnica', .32], ['pases', .43], ['mentalidad', .25]], defense: [['intensidad', .32], ['rapidez', .2], ['entradas', .23], ['mentalidad', .25]] },
  FINISH: { attack: [['remate', .5], ['tecnica', .25], ['mentalidad', .25]], defense: [['paradas', .78], ['mentalidad', .22]] },
}
const weighted = (player: MatchPlayer, weights: Weight[]) => weights.reduce((sum, [key, weight]) => sum + player.attributes[key] * weight, 0)
const personalityFrustration = (player: MatchPlayer) => player.personality === 'Caliente' ? 1.5 : player.personality === 'Profesional' ? .35 : player.personality === 'Pasota' ? .8 : 1
export function behavioralState(player: MatchPlayer) {
  const unhappiness = Math.max(0, 55 - player.happiness) / 55
  const lowAuthority = Math.max(0, 55 - player.authority) / 55
  const fatigue = Math.max(0, player.fatigue - 45) / 55
  const fade = Math.max(0, 1 - player.minutesPlayed / talkBalance.decayMinutes)
  const emotions = player.prematchEmotions
  const focus = emotions ? (emotions.concentration + emotions.confidence - emotions.nerves - emotions.tension) * talkBalance.concentrationPerPoint * fade : 0
  const effort = emotions ? (emotions.motivation + emotions.involvement) * talkBalance.effortPerPoint * fade : 0
  const adherence = emotions ? emotions.involvement * talkBalance.adherencePerPoint * fade : 0
  return { concentrationError: Math.max(0, unhappiness * .09 * personalityFrustration(player) + fatigue * .12 - focus), disobedience: Math.max(0, lowAuthority * (.05 + unhappiness * .08) * personalityFrustration(player) - adherence), effort: Math.max(.88, 1 + (player.happiness - 55) / 500 - fatigue * .12 + effort) }
}
export function duelScore(player: MatchPlayer, kind: DuelKind, side: 'attack' | 'defense') {
  const behavior = behavioralState(player)
  const base = weighted(player, WEIGHTS[kind][side])
  const speedFatigue = kind === 'SPACE' || kind === 'DRIBBLE' ? Math.max(0, player.fatigue - 45) * .035 : 0
  return base * behavior.effort - speedFatigue - behavior.concentrationError * 4
}
export function contextForRoute(attacking: MatchTeamState, defending: MatchTeamState, route: AttackRoute) {
  const lowBlock = defending.tactics.pressingHeight === 'Baja'
  const highLine = defending.tactics.pressingHeight === 'Alta'
  const defenseCoordination = coordinationFor(defending, 'defense')
  const cohesion = defending.cohesion
  const help = (defenseCoordination * .55 + cohesion * .45) / 100
  const kind: DuelKind = route === 'DIRECT_TARGET' || route === 'SET_PIECE' ? 'AERIAL' : route === 'IN_BEHIND' || route === 'COUNTER' ? 'SPACE' : route === 'CENTRAL' ? 'BUILD_UP' : 'DRIBBLE'
  const space = highLine ? 1.22 : lowBlock ? .72 : 1
  const coverage = lowBlock ? .8 + help * .45 : .65 + help * .3
  const pressing = ({ Alta: 1.2, Media: 1, Baja: .78 } as const)[defending.tactics.pressingIntensity]
  return { kind, space, coverage, pressing, attackingCoordination: coordinationFor(attacking, route === 'COUNTER' ? 'transitionAttack' : 'attack') }
}
