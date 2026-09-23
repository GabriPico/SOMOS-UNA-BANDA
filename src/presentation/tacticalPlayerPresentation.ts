import type { Player, PlayerPosition } from '../domain/models'
import { getPositionFamiliarity } from '../domain/positionFamiliarity'
import type { PlayerEligibility } from '../domain/squadSelection'
import type { TrainingPlayerState } from '../domain/trainingTypes'
import { getConditionLabel, getFatigueLabel } from '../domain/humanState'
import { getPhysicalIssueLabel } from '../domain/physicalIssues'
import { getApproximateStatusLevel, type StatusTone } from './managementPresentation'

export type TacticalCardIndicators = {
  condition: { label: string; tone: StatusTone }
  stamina?: { label: string; level: number; tone: StatusTone }
  special?: { icon: string; label: string; tone: StatusTone }
}

export type TacticalPositionFit = { tone: 'primary' | 'secondary' | 'compatible' | 'warning'; label: string }

export function getTacticalPositionFit(player: Pick<Player, 'primaryPosition' | 'secondaryPositions'>, position: PlayerPosition): TacticalPositionFit {
  if (position === player.primaryPosition) return { tone: 'primary', label: 'Posición habitual' }
  if (player.secondaryPositions.includes(position)) return { tone: 'secondary', label: 'Posición secundaria' }
  return getPositionFamiliarity(player, position) === 'IMPROVISED'
    ? { tone: 'warning', label: 'Fuera de posición · puesto improvisado' }
    : { tone: 'compatible', label: 'Puesto compatible' }
}

/** Presentation only: condition and remaining energy have independent sources. */
export function getTacticalCardIndicators(player: Pick<Player, 'fitness'>, training?: TrainingPlayerState, context: { injured?: boolean; redCard?: boolean; eligibility?: PlayerEligibility } = {}): TacticalCardIndicators {
  const conditionLabel = getConditionLabel(training?.fitness ?? player.fitness)
  const fatigueLabel = training ? getFatigueLabel(training.fatigue) : undefined
  const conditionTone = conditionLabel === 'Óptima' || conditionLabel === 'Buena' ? 'positive' : conditionLabel === 'Justa' ? 'warning' : 'negative'
  const staminaTone = fatigueLabel === 'Fresco' || fatigueLabel === 'Bien' ? 'positive' : fatigueLabel === 'Algo cansado' ? 'warning' : 'negative'
  let special: TacticalCardIndicators['special']
  if (context.redCard) special = { icon: '🟥', label: 'Expulsado', tone: 'negative' }
  else if (context.injured || context.eligibility?.status === 'INJURED') special = { icon: '🤕', label: 'Lesionado', tone: 'negative' }
  else if (context.eligibility?.eligible === false) special = { icon: '⚠', label: context.eligibility.reason ?? 'No disponible', tone: 'negative' }
  else if (training?.currentIssue) {
    const issue = training.currentIssue
    const discomfort = issue.type === 'MUSCLE_DISCOMFORT' || issue.type === 'MINOR_KNOCK' || issue.type === 'SORENESS'
    special = { icon: discomfort ? '🩹' : '⚠', label: getPhysicalIssueLabel(issue)!, tone: 'warning' }
  }
  return {
    condition: { label: conditionLabel, tone: conditionTone },
    stamina: training ? { label: fatigueLabel!, level: getApproximateStatusLevel(100 - training.fatigue), tone: staminaTone } : undefined,
    special,
  }
}

/** A bench only exists after a call-up. Before that, candidates remain in a disclosure. */
export function getTacticsSquad(players: Player[], lineupIds: number[], calledUpIds?: number[]) {
  const outsideLineup = players.filter(player => !lineupIds.includes(player.id))
  return {
    starters: lineupIds.map(id => players.find(player => player.id === id)),
    bench: calledUpIds ? outsideLineup.filter(player => calledUpIds.includes(player.id)) : [],
    candidates: calledUpIds ? outsideLineup.filter(player => !calledUpIds.includes(player.id)) : outsideLineup,
  }
}
