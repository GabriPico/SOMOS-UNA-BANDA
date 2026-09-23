import { getConditionAlert, getConditionLabel, getFatigueLabel, getHappinessLabel, getTrainingSatisfactionLabel } from './humanState'
import { getPlayerHappiness } from './trainingEngine'
import { PERSONALITY_MODIFIERS } from './trainingPersonality'
import type { TrainingGameState, TrainingPlayerState, TrainingSessionEvent } from './trainingTypes'
import { getPhysicalIssueEffects, getPhysicalIssueLabel } from './physicalIssues'

export type PlayerWatchReason = { label: string; severity: number }
export type PlayerToWatch = { playerId: number; reasons: PlayerWatchReason[] }

export function getPlayerWatchReasons(state: TrainingPlayerState, injured = false): PlayerWatchReason[] {
  const reasons: PlayerWatchReason[] = []
  if (injured) reasons.push({ label: 'Lesionado', severity: 100 })
  if (state.currentIssue) reasons.push({ label: getPhysicalIssueLabel(state.currentIssue)!, severity: 55 + (getPhysicalIssueEffects(state.currentIssue)?.recommendationPenalty ?? 0) * 4 })
  if (state.fatigue >= 85) reasons.push({ label: 'Muy cansado', severity: state.fatigue })
  else if (state.fatigue >= 70) reasons.push({ label: 'Carga elevada', severity: state.fatigue })
  if (state.fitness < 40) reasons.push({ label: 'Condición física muy baja', severity: 100 - state.fitness })
  else if (state.fitness < 55) reasons.push({ label: 'Condición física baja', severity: 100 - state.fitness })
  if (state.happiness.training < 40) reasons.push({ label: 'Muy descontento con los entrenamientos', severity: 100 - state.happiness.training })
  else if (state.happiness.training < 50) reasons.push({ label: 'Descontento con los entrenamientos', severity: 100 - state.happiness.training })
  return reasons.sort((a, b) => b.severity - a.severity)
}

export function getPlayersToWatch(state: TrainingGameState, injuredPlayerIds: number[] = []): PlayerToWatch[] {
  return Object.values(state.players).map((player) => ({ playerId: player.playerId, reasons: getPlayerWatchReasons(player, injuredPlayerIds.includes(player.playerId)) })).filter((item) => item.reasons.length).sort((a, b) => b.reasons[0].severity - a.reasons[0].severity)
}

export function getTacticalHumanLabels(state: TrainingPlayerState) {
  return { fatigue: getFatigueLabel(state.fatigue), condition: `Condición ${getConditionLabel(state.fitness).toLowerCase()}`, conditionAlert: getConditionAlert(state.fitness), issue: getPhysicalIssueLabel(state.currentIssue) }
}

export function isRelevantTrainingIncident(event: TrainingSessionEvent) {
  return event.type === 'PLAYER_INJURY' || event.type === 'PLAYER_DISCOMFORT' || (event.type === 'PLAYER_ABSENCE' && !event.planned)
}

export function getUnwarnedAbsenceChance(state: TrainingPlayerState) {
  const personality = PERSONALITY_MODIFIERS[state.personality]
  const unhappiness = Math.max(0, 45 - getPlayerHappiness(state))
  const poorRelationship = Math.max(0, 45 - state.managerRelationship)
  const problematic = Math.max(0, personality.conflictProneness) + Math.max(0, personality.demandRespect)
  return Math.min(1.5, .05 + unhappiness * .025 + poorRelationship * .025 + problematic * .08)
}

export const describePlayerState = (state: TrainingPlayerState) => ({
  condition: getConditionLabel(state.fitness), fatigue: getFatigueLabel(state.fatigue), happiness: getHappinessLabel(getPlayerHappiness(state)), trainingSatisfaction: getTrainingSatisfactionLabel(state.happiness.training),
})
