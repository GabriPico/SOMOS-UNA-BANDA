import type { DressingRoomState } from './humanState'
import { getAuthorityLabel, getCoachRelationshipLabel, getHappinessLabel, getInfluenceLabel } from './humanState'
import type { PromiseState } from './gameState'
import { getPlayerHappiness } from './trainingEngine'
import type { TrainingGameState, TrainingPlayerState } from './trainingTypes'
import type { Player } from './models'
import type { PlayerFeePlan, TeamFeeSummary } from './playerFinance'
import { getPlayerFeeLabel } from './playerFinance'

const influenceScore = { LOW: .5, MEDIUM: 1, HIGH: 1.5, LEADER: 2 } as const
const individualAuthorityLabels: Record<string, string> = {
  'Muy respetada': 'Te respeta mucho', Respetada: 'Te respeta', Aceptada: 'Neutral',
  Cuestionada: 'Te cuestiona', 'Muy cuestionada': 'Te cuestiona mucho',
}

export const getIndividualAuthorityLabel = (value: number) => individualAuthorityLabels[getAuthorityLabel(value)]
export const getPlayerInfluenceLabel = (influence: TrainingPlayerState['lockerRoomInfluence']) => getInfluenceLabel(influenceScore[influence] * 40)

export type DressingRoomProblem = {
  id: string
  playerId?: Player['id']
  severity: 'MINOR' | 'RELEVANT' | 'SEVERE'
  subject: string
  status: 'Activo' | 'Pendiente' | 'Restricción activa'
}

export const DRESSING_ROOM_PROBLEM_SEVERITY_LABELS = { MINOR: 'Leve', RELEVANT: 'Moderada', SEVERE: 'Alta' } as const
const problemPriority = { SEVERE: 0, RELEVANT: 1, MINOR: 2 } as const
// Reuse the current domain categories instead of introducing numeric thresholds.
const relationshipProblemSeverity: Partial<Record<string, DressingRoomProblem['severity']>> = { Mala: 'RELEVANT', 'Muy mala': 'SEVERE' }
const authorityProblemSeverity: Partial<Record<string, DressingRoomProblem['severity']>> = { Cuestionada: 'RELEVANT', 'Muy cuestionada': 'SEVERE' }

/** A read-only view of present concerns; no incident lifecycle or consequences. */
export function getDressingRoomProblems(
  room: DressingRoomState,
  training: TrainingGameState,
  roster: readonly Pick<Player, 'id'>[],
  feeSummary: TeamFeeSummary,
  playerFees: Record<number, PlayerFeePlan>,
): DressingRoomProblem[] {
  const rosterIds = new Set(roster.map((player) => player.id))
  const issuesById = new Map(room.issues.map((issue) => [issue.id, issue]))
  const representedIssues = new Set<string>()
  const problems: DressingRoomProblem[] = []

  for (const profile of room.players) {
    if (!rosterIds.has(profile.playerId) || !profile.situation?.trim()) continue
    const issue = profile.situationIssueId ? issuesById.get(profile.situationIssueId) : undefined
    if (issue?.severity === 'positive') continue
    problems.push({ id: `situation:${profile.playerId}`, playerId: profile.playerId, severity: issue?.severity === 'negative' ? 'SEVERE' : 'RELEVANT', subject: profile.situation, status: 'Activo' })
    if (issue) representedIssues.add(issue.id)
  }

  for (const issue of room.issues) {
    if (issue.severity === 'positive' || representedIssues.has(issue.id)) continue
    problems.push({ id: `issue:${issue.id}`, severity: issue.severity === 'negative' ? 'SEVERE' : 'RELEVANT', subject: issue.title, status: 'Activo' })
  }

  for (const player of roster) {
    const human = training.players[player.id]
    if (!human) continue
    const relationshipSeverity = relationshipProblemSeverity[getCoachRelationshipLabel(human.managerRelationship)]
    if (relationshipSeverity) problems.push({ id: `relationship:${player.id}`, playerId: player.id, severity: relationshipSeverity, subject: 'Mala relación contigo', status: 'Activo' })
    const authoritySeverity = authorityProblemSeverity[getAuthorityLabel(human.managerAuthority)]
    if (authoritySeverity) problems.push({ id: `authority:${player.id}`, playerId: player.id, severity: authoritySeverity, subject: 'Cuestiona tu autoridad', status: 'Activo' })
  }

  for (const fee of feeSummary.attention) {
    const plan = playerFees[fee.playerId]
    if (!rosterIds.has(fee.playerId) || !plan) continue
    const restriction = plan.eligibilityRestriction
    problems.push({ id: `fee:${fee.playerId}`, playerId: fee.playerId, severity: fee.severity, subject: restriction?.active ? restriction.reason : `Cuota · ${getPlayerFeeLabel(plan)}`, status: restriction?.active ? 'Restricción activa' : 'Pendiente' })
  }

  return problems.sort((a, b) => problemPriority[a.severity] - problemPriority[b.severity])
}

export function getDressingRoomPresentation(room: DressingRoomState, training: TrainingGameState) {
  return {
    unhappyPlayers: Object.values(training.players).filter((player) => getPlayerHappiness(player) < 58).length,
    issues: [...room.issues].sort((a, b) => {
      const priority = { negative: 0, warning: 1, positive: 2 }
      return priority[a.severity] - priority[b.severity]
    }).slice(0, 4),
    influentialPlayers: room.players.filter((profile) => {
      const player = training.players[profile.playerId]
      return profile.socialRole && player && ['HIGH', 'LEADER'].includes(player.lockerRoomInfluence)
    }).sort((a, b) => influenceScore[training.players[b.playerId].lockerRoomInfluence] - influenceScore[training.players[a.playerId].lockerRoomInfluence]).slice(0, 4),
  }
}

type RoomInfluence = TrainingPlayerState['lockerRoomInfluence']
export const ROOM_INFLUENCE_LABELS: Record<RoomInfluence, string> = { LOW: 'Baja', MEDIUM: 'Media', HIGH: 'Alta', LEADER: 'Alta' }
export const ROOM_PRIORITY_LABELS = { SEVERE: 'Alta', RELEVANT: 'Media', MINOR: 'Baja', SUPPORT: 'Positiva' } as const
const hierarchyGroups = [
  { influence: 'LEADER', label: 'Líderes' },
  { influence: 'HIGH', label: 'Influyentes' },
  { influence: 'MEDIUM', label: 'Núcleo del grupo' },
  { influence: 'LOW', label: 'Periféricos' },
] as const

export type DressingRoomWatchPlayer = {
  playerId: number
  situation: string
  influence: RoomInfluence
  priority: keyof typeof ROOM_PRIORITY_LABELS
}

/** Compact, derived social overview. Does not create incidents or change influence. */
export function getDressingRoomOverview(room: DressingRoomState, training: TrainingGameState, roster: readonly Pick<Player, 'id'>[], problems: readonly DressingRoomProblem[]) {
  const rosterIds = new Set(roster.map(player => player.id))
  const profiles = new Map(room.players.map(profile => [profile.playerId, profile]))
  const concerns = new Map<number, DressingRoomProblem>()
  for (const problem of [...problems].sort((a, b) => problemPriority[a.severity] - problemPriority[b.severity])) {
    if (problem.playerId !== undefined && rosterIds.has(problem.playerId) && !concerns.has(problem.playerId)) concerns.set(problem.playerId, problem)
  }
  const influenceOf = (id: number): RoomInfluence => training.players[id]?.lockerRoomInfluence ?? 'LOW'
  const influenceOrder = (a: { id: number }, b: { id: number }) => influenceScore[influenceOf(b.id)] - influenceScore[influenceOf(a.id)] || a.id - b.id
  const supporters = roster.filter(player => {
    const human = training.players[player.id]
    return human && !concerns.has(player.id) && ['HIGH', 'LEADER'].includes(human.lockerRoomInfluence)
      && ['Respetada', 'Muy respetada'].includes(getAuthorityLabel(human.managerAuthority))
      && !relationshipProblemSeverity[getCoachRelationshipLabel(human.managerRelationship)]
  }).sort(influenceOrder)
  const watchPlayers: DressingRoomWatchPlayer[] = [...concerns].map(([playerId, problem]) => ({
    playerId, situation: problem.subject, influence: influenceOf(playerId), priority: problem.severity,
  })).slice(0, supporters.length ? 5 : 6)
  if (supporters[0]) watchPlayers.push({ playerId: supporters[0].id, situation: 'Respalda al entrenador', influence: influenceOf(supporters[0].id), priority: 'SUPPORT' })

  const hierarchy = hierarchyGroups.map(group => ({ ...group, count: roster.filter(player => influenceOf(player.id) === group.influence).length }))
  const relevantVoices = roster.filter(player => profiles.get(player.id)?.socialRole || ['HIGH', 'LEADER'].includes(influenceOf(player.id))).sort(influenceOrder)
  // Leave room for a concerned voice alongside the group's influential players.
  const concernedPlayerId = concerns.keys().next().value
  const voiceIds = [...new Set([...relevantVoices.slice(0, 2).map(player => player.id), concernedPlayerId, ...relevantVoices.map(player => player.id)])]
    .filter((id): id is number => id !== undefined).slice(0, 3)
  const voices = voiceIds.map(playerId => {
    const human = training.players[playerId]
    const profile = profiles.get(playerId)
    let quote = 'Vamos trabajando juntos, poco a poco.'
    if (concerns.has(playerId)) quote = profile?.situationIssueId === 'playing-time' || profile?.situationIssueId === 'oriol-roca'
      ? 'Creo que puedo aportar más si tengo oportunidades.' : 'Me gustaría hablar contigo de mi situación.'
    else if (human && ['Cuestionada', 'Muy cuestionada'].includes(getAuthorityLabel(human.managerAuthority))) quote = 'Todavía hay decisiones que me cuesta entender.'
    else if (human && ['Descontento', 'Muy descontento'].includes(getHappinessLabel(getPlayerHappiness(human)))) quote = 'Nos está costando encontrar buenas sensaciones.'
    else if (human && ['Feliz', 'Muy feliz'].includes(getHappinessLabel(human.happiness.training))) quote = 'Hay buen ambiente y la gente responde en los entrenamientos.'
    else if (human && ['Feliz', 'Muy feliz'].includes(getHappinessLabel(getPlayerHappiness(human)))) quote = 'El grupo va en la buena dirección.'
    return { playerId, role: profile?.socialRole ?? (['HIGH', 'LEADER'].includes(influenceOf(playerId)) ? 'Jugador influyente' : 'Jugador del equipo'), quote }
  })
  return { watchPlayers, hierarchy, voices }
}

/** Reuses persisted promises; never turns a concern into a promise the coach did not make. */
export function getDressingRoomCommitments(promises: readonly PromiseState[], roster: readonly Pick<Player, 'id'>[]) {
  const rosterIds = new Set(roster.map(player => String(player.id)))
  return promises.filter(promise => promise.status === 'active' && (!promise.subjectId || rosterIds.has(promise.subjectId))).map(promise => ({
    id: promise.id, playerId: promise.subjectId ? Number(promise.subjectId) : undefined, description: promise.description,
    deadline: promise.kind === 'LOWER_TRAINING_LOAD' || promise.kind === 'MORE_BALL' ? 'En el próximo entrenamiento' : 'Pendiente',
  }))
}
