import type { Player, TacticalPlan } from './models'
import type { StaffPerson } from './staff'
import { executeTrainingSession, getTeamAuthority, getTeamFatigue, getTeamFitness, getTeamHappiness, calculateOverallFamiliarity } from './trainingEngine'
import type { TrainingGameState, TrainingSessionEvent } from './trainingTypes'
import { getUnwarnedAbsenceChance } from './trainingPresentation'

const hash = (value: string, seed: number) => [...value].reduce((result, character) => Math.imul(result ^ character.charCodeAt(0), 16777619) >>> 0, seed >>> 0)
const round = (value: number) => Math.round(value * 10) / 10

export function resolveTrainingSession(current: TrainingGameState, sessionId: string, plan: TacticalPlan, players: Player[], staff: StaffPerson[]) {
  const existing = current.sessions.find((session) => session.id === sessionId)
  if (!existing || existing.result) return current
  const state = structuredClone(current)
  const session = state.sessions.find((item) => item.id === sessionId)!
  const sessionPlan = session.plannedTacticalPlan ?? plan
  const plannedAbsences = session.plannedAbsentPlayerIds ?? session.absentPlayerIds
  session.plannedAbsentPlayerIds = [...plannedAbsences]
  session.plannedStaffIds ??= staff.filter((member) => member.role !== 'PRIMER_ENTRENADOR' && member.isUsuallyAvailable).map((member) => member.id)
  const events: TrainingSessionEvent[] = []
  const expected = players.filter((player) => !plannedAbsences.includes(player.id))
  const surprise = expected.find((player) => (hash(`${state.week}:${sessionId}:${player.id}:absence`, state.seed) % 10000) / 100 < getUnwarnedAbsenceChance(state.players[player.id]))
  if (surprise) { session.absentPlayerIds = [...plannedAbsences, surprise.id]; events.push({ type: 'PLAYER_ABSENCE', playerId: surprise.id, planned: false, warned: false, reason: 'No avisó antes de la sesión.' }) }
  else session.absentPlayerIds = [...plannedAbsences]
  const attendees = players.filter((player) => !session.absentPlayerIds.includes(player.id))
  const late = attendees.find((player) => hash(`${state.week}:${sessionId}:${player.id}:late`, state.seed) % 100 < 6)
  if (late) events.push({ type: 'PLAYER_LATE', playerId: late.id, minutes: 5 + hash(`${late.id}:minutes`, state.seed) % 16 })
  const performance = [...attendees].sort((a, b) => hash(`${sessionId}:${a.id}:performance`, state.seed) - hash(`${sessionId}:${b.id}:performance`, state.seed))[0]
  if (performance && hash(`${sessionId}:performance-event`, state.seed) % 100 < 48) events.push({ type: 'PLAYER_PERFORMANCE', playerId: performance.id, level: hash(`${performance.id}:level`, state.seed) % 4 ? 'GOOD' : 'POOR' })
  const discomfort = attendees.find((player) => hash(`${sessionId}:${player.id}:discomfort`, state.seed) % 1000 < 18)
  if (discomfort) events.push({ type: 'PLAYER_DISCOMFORT', playerId: discomfort.id, area: 'gemelo' })
  const injury = attendees.find((player) => hash(`${state.week}:${sessionId}:${player.id}:injury`, state.seed) % 10000 < 12)
  if (injury) events.push({ type: 'PLAYER_INJURY', playerId: injury.id, severity: hash(`${injury.id}:severity`, state.seed) % 10 ? 'MINOR' : 'SERIOUS' })
  const presentStaffId = session.availableStaffIds?.[0]
  if (presentStaffId && hash(`${sessionId}:${presentStaffId}:comment`, state.seed) % 100 < 28) events.push({ type: 'STAFF_EVENT', staffId: presentStaffId, note: `${presentStaffId} insiste en corregir las distancias entre líneas.` })
  const before = { fitness: getTeamFitness(state), fatigue: getTeamFatigue(state), happiness: getTeamHappiness(state), authority: getTeamAuthority(state), familiarity: calculateOverallFamiliarity(state.familiarity, sessionPlan) }
  const resolved = executeTrainingSession(state, sessionId, sessionPlan, players, staff)
  const completed = resolved.sessions.find((item) => item.id === sessionId)!
  if (!completed.result) return resolved
  completed.planningStatus = 'COMPLETED'
  completed.result.absentPlayerIds = [...completed.absentPlayerIds]
  completed.result.presentStaffIds = [...(completed.availableStaffIds ?? [])]
  completed.result.events = events
  completed.result.appliedEffects = { teamFitnessDelta: round(getTeamFitness(resolved) - before.fitness), teamFatigueDelta: round(getTeamFatigue(resolved) - before.fatigue), teamHappinessDelta: round(getTeamHappiness(resolved) - before.happiness), teamAuthorityDelta: round(getTeamAuthority(resolved) - before.authority), tacticalFamiliarityDelta: round(calculateOverallFamiliarity(resolved.familiarity, sessionPlan) - before.familiarity), individualPlayerIds: [...completed.result.attendees] }
  completed.result.summary = `${completed.result.attendees.length} jugadores completaron una sesión ${completed.qualityLabel?.toLowerCase() ?? 'normal'}.`
  return resolved
}
