import type { CoachEvidenceAxis, GameState } from './gameState'
import type { BetaPersonality, HappinessComponents, TrainingPlayerState } from './trainingTypes'
import type { StaffSearchRequestRole } from './staff'
import { scheduleStaffSearch } from './gameTime'
import { recordPrematchTalkBeat } from './preMatchTalk'
import type { TalkBeat } from './preMatchTalkTypes'

export const CONSEQUENCE_MAGNITUDES = { MINOR: 2, SMALL: 4, MEDIUM: 7, MAJOR: 12, EXTREME: 20 } as const
export type ConsequenceMagnitude = keyof typeof CONSEQUENCE_MAGNITUDES
export type ConsequenceFeedbackType = 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' | 'MEMORY' | 'WARNING'
export type ConsequenceEffectType = 'PLAYER_HAPPINESS' | 'PLAYER_MANAGER_RELATIONSHIP' | 'PLAYER_MANAGER_AUTHORITY' | 'GENERAL_AUTHORITY' | 'TEAM_COHESION' | 'STAFF_MANAGER_RELATIONSHIP'
export type ConsequenceContext = 'JUSTIFIED_DISCIPLINE' | 'PUBLIC_CRITICISM' | 'SUPPORT' | 'GENERAL'

export type ConsequenceEffect = {
  type: ConsequenceEffectType
  targetId?: string | number
  magnitude: ConsequenceMagnitude | number
  direction?: 1 | -1
  context?: ConsequenceContext
}
export type CharacterMemory = { id: string; characterId: string; eventId?: string; sentiment?: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL'; importance?: 'LOW' | 'MEDIUM' | 'HIGH'; createdAt: string; metadata?: Record<string, unknown> }
export type ConsequenceFeedbackTiming = 'IMMEDIATE' | 'DEFERRED'
export type ConsequenceFeedback = { id: string; type: ConsequenceFeedbackType; text: string; status: 'PENDING' | 'READY' | 'CONSUMED' }
export type DecisionLogEntry = { id: string; date: string; source: string; decisionId: string; effectsApplied: AppliedConsequenceEffect[]; memoriesCreated: string[]; flagsChanged: Record<string, boolean> }
export type AppliedConsequenceEffect = ConsequenceEffect & { requestedDelta: number; appliedDelta: number }
export type ConsequenceState = { memories: CharacterMemory[]; flags: Record<string, boolean>; decisionLog: DecisionLogEntry[]; feedbackQueue: ConsequenceFeedback[] }
export type ApplyConsequencesInput = { prematchTalkBeat?: { matchId: string; beat: TalkBeat }; source: string; decisionId: string; effects?: ConsequenceEffect[]; memories?: Omit<CharacterMemory, 'createdAt'>[]; flags?: Array<{ id: string; value?: boolean }>; feedbackTiming?: ConsequenceFeedbackTiming; feedback?: Array<{ type: ConsequenceFeedbackType; text: string }>; coachEvidence?: { axis: CoachEvidenceAxis; value: number; source: string }; promise?: { id: string; subjectId?: string; description: string; kind: 'LOWER_TRAINING_LOAD' | 'MORE_BALL' }; narrativeFacts?: Array<{ id: string; subjectId?: string; relatedEventId?: string }>; staffSearchRequest?: StaffSearchRequestRole; clearPendingConversationId?: string }

export const createInitialConsequenceState = (): ConsequenceState => ({ memories: [], flags: {}, decisionLog: [], feedbackQueue: [] })
export const clampHumanState = (value: number) => Math.max(0, Math.min(100, value))
const average = (values: number[]) => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 50
export const getOverallHappiness = (player: Pick<TrainingPlayerState, 'happiness'>) => average(Object.values(player.happiness))
const shiftHappiness = (happiness: HappinessComponents, delta: number): HappinessComponents => Object.fromEntries(Object.entries(happiness).map(([key, value]) => [key, clampHumanState(value + delta)])) as HappinessComponents

const PERSONALITY_EFFECT_MODIFIERS: Partial<Record<BetaPersonality, Partial<Record<ConsequenceContext, { relationship?: number; authority?: number }>>>> = {
  'Profesional': { JUSTIFIED_DISCIPLINE: { relationship: .7, authority: 1.15 } },
  'Veterano': { JUSTIFIED_DISCIPLINE: { relationship: .8, authority: 1.1 } },
  'Caliente': { PUBLIC_CRITICISM: { relationship: 1.35 } },
  'Individualista': { PUBLIC_CRITICISM: { relationship: 1.2 } },
}

function effectDelta(effect: ConsequenceEffect, player?: TrainingPlayerState) {
  const base = typeof effect.magnitude === 'number' ? Math.abs(effect.magnitude) : CONSEQUENCE_MAGNITUDES[effect.magnitude]
  const direction = effect.direction ?? (typeof effect.magnitude === 'number' && effect.magnitude < 0 ? -1 : 1)
  if (!player || !effect.context) return base * direction
  const modifiers = PERSONALITY_EFFECT_MODIFIERS[player.personality]?.[effect.context]
  const multiplier = effect.type === 'PLAYER_MANAGER_RELATIONSHIP' ? modifiers?.relationship : effect.type === 'PLAYER_MANAGER_AUTHORITY' ? modifiers?.authority : undefined
  return base * direction * (multiplier ?? 1)
}

export const calculateWeightedPlayerAuthority = (game: GameState) => {
  const weights = { LOW: .5, MEDIUM: 1, HIGH: 1.5, LEADER: 2 } as const
  const players = Object.values(game.training.players)
  const totalWeight = players.reduce((sum, player) => sum + weights[player.lockerRoomInfluence], 0)
  return totalWeight ? players.reduce((sum, player) => sum + player.managerAuthority * weights[player.lockerRoomInfluence], 0) / totalWeight : 50
}

export const calculateTeamMorale = (game: GameState) => clampHumanState(average(Object.values(game.training.players).map(getOverallHappiness)) * .5 + game.team.cohesion * .25 + game.team.recentResultsMood * .25)
export const normalizeGeneralAuthority = (game: GameState, rate = .05): GameState => ({ ...game, manager: { generalAuthority: clampHumanState(game.manager.generalAuthority + (calculateWeightedPlayerAuthority(game) - game.manager.generalAuthority) * rate) } })

export function applyConsequences(game: GameState, input: ApplyConsequencesInput): GameState {
  if (input.prematchTalkBeat) return recordPrematchTalkBeat(game, input.prematchTalkBeat.matchId, input.prematchTalkBeat.beat)
  const next = structuredClone(game)
  const applied: AppliedConsequenceEffect[] = []
  for (const effect of input.effects ?? []) {
    const player = typeof effect.targetId === 'number' ? next.training.players[effect.targetId] : undefined
    const requestedDelta = effectDelta(effect, player)
    let before = 0
    let after = 0
    if (effect.type === 'PLAYER_HAPPINESS' && player) { before = getOverallHappiness(player); player.happiness = shiftHappiness(player.happiness, requestedDelta); after = getOverallHappiness(player) }
    else if (effect.type === 'PLAYER_MANAGER_RELATIONSHIP' && player) { before = player.managerRelationship; player.managerRelationship = clampHumanState(before + requestedDelta); after = player.managerRelationship }
    else if (effect.type === 'PLAYER_MANAGER_AUTHORITY' && player) { before = player.managerAuthority; player.managerAuthority = clampHumanState(before + requestedDelta); after = player.managerAuthority }
    else if (effect.type === 'GENERAL_AUTHORITY') { before = next.manager.generalAuthority; next.manager.generalAuthority = clampHumanState(before + requestedDelta); after = next.manager.generalAuthority }
    else if (effect.type === 'TEAM_COHESION') { before = next.team.cohesion; next.team.cohesion = clampHumanState(before + requestedDelta); after = next.team.cohesion }
    else if (effect.type === 'STAFF_MANAGER_RELATIONSHIP' && typeof effect.targetId === 'string') {
      const staff = next.staff.members.find((member) => member.id === effect.targetId)
      const personnel = next.staff.clubPersonnel.id === effect.targetId ? next.staff.clubPersonnel : undefined
      const isPresident = next.president.id === effect.targetId
      if (staff) { before = staff.relationshipWithManager ?? 50; if (!staff.relationshipLocked) staff.relationshipWithManager = clampHumanState(before + requestedDelta); after = staff.relationshipWithManager ?? before }
      else if (personnel) { before = personnel.relationshipWithManager ?? 50; if (!personnel.relationshipLocked) personnel.relationshipWithManager = clampHumanState(before + requestedDelta); after = personnel.relationshipWithManager ?? before }
      else if (isPresident) { before = next.presidentRelationship.relationshipWithManager; next.presidentRelationship.relationshipWithManager = clampHumanState(before + requestedDelta); after = next.presidentRelationship.relationshipWithManager }
      else continue
    } else continue
    applied.push({ ...effect, requestedDelta, appliedDelta: after - before })
  }
  const date = next.temporal.currentDateTime
  for (const fact of input.narrativeFacts ?? []) if (!next.narrativeFacts.some((item) => item.id === fact.id && item.subjectId === fact.subjectId)) next.narrativeFacts.push({ ...fact, occurredAt: date })
  if (input.promise && !next.promises.some((item) => item.id === input.promise?.id)) next.promises.push({ ...input.promise, status: 'active' })
  if (input.staffSearchRequest && !next.staffSearchRequests.some((request) => request.status === 'PENDING')) next.staffSearchRequests.push(scheduleStaffSearch({ id: `staff-search-${next.staffSearchRequests.length + 1}`, requestedRole: input.staffSearchRequest, status: 'PENDING', origin: 'MANOLO', candidateIds: [] }, date, next.temporal.seed))
  if (input.clearPendingConversationId) next.temporal.pendingConversations = next.temporal.pendingConversations.filter((item) => item.relatedId !== input.clearPendingConversationId)
  const memories = (input.memories ?? []).filter((memory) => !next.consequences.memories.some((item) => item.characterId === memory.characterId && item.id === memory.id)).map((memory) => ({ ...memory, createdAt: date }))
  next.consequences.memories.push(...memories)
  const flagsChanged: Record<string, boolean> = {}
  for (const flag of input.flags ?? []) { const value = flag.value ?? true; if (next.consequences.flags[flag.id] !== value) flagsChanged[flag.id] = value; next.consequences.flags[flag.id] = value }
  const entryId = `${input.source}:${input.decisionId}:${next.consequences.decisionLog.length + 1}`
  next.consequences.decisionLog.push({ id: entryId, date, source: input.source, decisionId: input.decisionId, effectsApplied: applied, memoriesCreated: memories.map((memory) => memory.id), flagsChanged })
  if (input.coachEvidence && !next.coachEvidence.some((item) => item.source === input.coachEvidence?.source)) next.coachEvidence.push(input.coachEvidence)
  const feedbackStatus = input.feedbackTiming === 'DEFERRED' ? 'PENDING' as const : 'READY' as const
  next.consequences.feedbackQueue.push(...(input.feedback ?? []).map((feedback, index) => ({ ...feedback, id: `${entryId}:feedback:${index}`, status: feedbackStatus })))
  return next
}

export const flushConsequenceFeedback = (game: GameState): GameState => ({ ...game, consequences: { ...game.consequences, feedbackQueue: game.consequences.feedbackQueue.map((item) => item.status === 'PENDING' ? { ...item, status: 'READY' } : item) } })
export const consumeConsequenceFeedback = (game: GameState, ids: string[]): GameState => {
  const consumed = new Set(ids)
  return { ...game, consequences: { ...game.consequences, feedbackQueue: game.consequences.feedbackQueue.map((item) => consumed.has(item.id) && item.status === 'READY' ? { ...item, status: 'CONSUMED' } : item) } }
}
export const dismissConsequenceFeedback = (game: GameState, id: string): GameState => ({ ...game, consequences: { ...game.consequences, feedbackQueue: game.consequences.feedbackQueue.filter((item) => item.id !== id) } })
export const addMemory = (state: ConsequenceState, memory: CharacterMemory): ConsequenceState => state.memories.some((item) => item.characterId === memory.characterId && item.id === memory.id) ? state : { ...state, memories: [...state.memories, memory] }
export const hasMemory = (state: ConsequenceState, characterId: string, memoryId: string) => state.memories.some((item) => item.characterId === characterId && item.id === memoryId)
export const getMemories = (state: ConsequenceState, characterId: string) => state.memories.filter((item) => item.characterId === characterId)
export const setFlag = (state: ConsequenceState, id: string, value = true): ConsequenceState => ({ ...state, flags: { ...state.flags, [id]: value } })
export const hasFlag = (state: ConsequenceState, id: string) => state.flags[id] === true

export const getHappinessStateLabel = (value: number) => value <= 15 ? 'Hundido' : value <= 30 ? 'Muy descontento' : value <= 45 ? 'Descontento' : value <= 60 ? 'Normal' : value <= 75 ? 'Contento' : value <= 90 ? 'Muy contento' : 'Encantado'
export const getAuthorityStateLabel = (value: number) => value <= 15 ? 'Nula' : value <= 30 ? 'Muy baja' : value <= 45 ? 'Baja' : value <= 60 ? 'Normal' : value <= 75 ? 'Alta' : value <= 90 ? 'Muy alta' : 'Total'
export const getRelationshipStateLabel = (value: number) => value <= 15 ? 'Muy mala' : value <= 30 ? 'Mala' : value <= 45 ? 'Fría' : value <= 60 ? 'Normal' : value <= 75 ? 'Buena' : value <= 90 ? 'Muy buena' : 'Excelente'
export const getMoraleStateLabel = (value: number) => value <= 15 ? 'Hundido' : value <= 30 ? 'Muy bajo' : value <= 45 ? 'Bajo' : value <= 60 ? 'Normal' : value <= 75 ? 'Bueno' : value <= 90 ? 'Muy bueno' : 'Eufórico'

export const updateRecentResultsMood = (current: number, outcome: 'WIN' | 'DRAW' | 'LOSS', official: boolean) => {
  const target = outcome === 'WIN' ? 78 : outcome === 'LOSS' ? 28 : 52
  const weight = official ? .3 : .12
  return clampHumanState(current + (target - current) * weight)
}

export const recoverHappinessToward = (value: number, stableLevel = 55, rate = .03) => clampHumanState(value + (stableLevel - value) * rate)
