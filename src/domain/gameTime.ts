import type { GameState, TemporalCheckpoint, TemporalEvent } from './gameState'
import type { FeeMonth, PlayerFeePlan } from './playerFinance'
import type { StaffPerson, StaffSearchRequest } from './staff'

const USER_TEAM_ID = 'fc-poblenou'
const FEE_MONTHS: Record<number, FeeMonth> = { 9: 'septiembre', 10: 'octubre', 11: 'noviembre', 12: 'diciembre', 1: 'enero', 2: 'febrero', 3: 'marzo', 4: 'abril', 5: 'mayo' }
const instant = (date: string, time: string) => `${date}T${time}:00`
const dateOnly = (value: string) => value.slice(0, 10)
const addDays = (value: string, days: number) => { const date = new Date(`${dateOnly(value)}T12:00:00Z`); date.setUTCDate(date.getUTCDate() + days); return date.toISOString().slice(0, 10) }
const hash = (value: string, seed: number) => [...value].reduce((result, character) => Math.imul(result ^ character.charCodeAt(0), 16777619) >>> 0, seed >>> 0)

export function scheduleStaffSearch(request: StaffSearchRequest, now: string, seed: number): StaffSearchRequest {
  const duration = 2 + (hash(request.id, seed) % 4)
  return { ...request, requestedAt: now, resolvesAt: instant(addDays(now, duration), '12:00') }
}

export function resolveStaffAvailability(members: StaffPerson[], activityId: string, at: string, seed: number) {
  const availableStaffIds: string[] = []
  const staffAbsenceNotes: string[] = []
  members.filter((member) => member.role !== 'PRIMER_ENTRENADOR').forEach((member) => {
    const base = { VERY_HIGH: 96, HIGH: 86, MEDIUM: 70, LOW: 48 }[member.availability]
    const capabilities = member.capabilities
    const reliability = capabilities ? (capabilities.reliability + capabilities.commitment + capabilities.availability) / 3 : base
    const threshold = Math.round(base * .55 + reliability * .45)
    if (member.isUsuallyAvailable && hash(`${member.id}:${activityId}:${at}`, seed) % 100 < threshold) availableStaffIds.push(member.id)
    else staffAbsenceNotes.push(`${member.name} hoy no puede venir por sus compromisos habituales.`)
  })
  return { availableStaffIds, staffAbsenceNotes }
}

function trainingCandidates(state: GameState): TemporalCheckpoint[] {
  const current = state.temporal.currentDateTime
  const monday = new Date(`${dateOnly(current)}T12:00:00Z`)
  const day = monday.getUTCDay()
  monday.setUTCDate(monday.getUTCDate() - ((day + 6) % 7))
  const mondayDate = monday.toISOString().slice(0, 10)
  return [0, 7].flatMap((weekOffset) => [{ id: 'tuesday', offset: 1, label: 'Entrenamiento · martes 19:30' }, { id: 'thursday', offset: 3, label: 'Entrenamiento · jueves 19:30' }]
    .filter(({ id }) => state.temporal.activeCheckpoint?.relatedId !== id)
    .map(({ id, offset, label }) => ({ type: 'TRAINING' as const, at: instant(addDays(mondayDate, offset + weekOffset), '19:30'), label, relatedId: id })))
    .filter((checkpoint) => checkpoint.at > current)
}

export function findNextCheckpoint(state: GameState, completedTrainingSessionIds: string[]): TemporalCheckpoint | undefined {
  const current = state.temporal.currentDateTime
  const pendingConversation = state.temporal.pendingConversations[0]
  if (pendingConversation) return { type: 'CONVERSATION', at: current, label: 'Manolo quiere hablar contigo.', relatedId: pendingConversation.id }
  const candidates: TemporalCheckpoint[] = trainingCandidates(state).filter((checkpoint) => !completedTrainingSessionIds.includes(checkpoint.relatedId ?? ''))
  state.temporal.events.filter((event) => event.status !== 'RESOLVED' && event.at >= current).forEach((event) => candidates.push({ type: event.requiresDecision ? 'EVENT' : 'EVENT', at: event.at, label: event.type === 'STAFF_SEARCH_RESULT' ? 'Manolo tiene noticias sobre el Staff.' : 'Hay un asunto pendiente.', relatedId: event.id }))
  const match = state.temporal.calendar.filter((item) => item.status === 'scheduled' && (item.homeTeamId === USER_TEAM_ID || item.awayTeamId === USER_TEAM_ID)).sort((a, b) => instant(a.date, a.time).localeCompare(instant(b.date, b.time)))[0]
  if (match) candidates.push({ type: 'PRE_MATCH', at: instant(match.date, match.time), label: match.competitionType === 'FRIENDLY' ? `Amistoso · ${match.date} ${match.time}` : `Jornada ${match.matchday} · ${match.date} ${match.time}`, relatedId: match.id })
  return candidates.filter((candidate) => candidate.at >= current).sort((a, b) => a.at.localeCompare(b.at) || ({ CONVERSATION: 0, EVENT: 1, PRE_MATCH: 2, TRAINING: 3 }[a.type] - { CONVERSATION: 0, EVENT: 1, PRE_MATCH: 2, TRAINING: 3 }[b.type]))[0]
}

function processFees(state: GameState, until: string): GameState {
  const temporal = { ...state.temporal, processedFeeMonths: [...state.temporal.processedFeeMonths] }
  const clubFinances = { ...state.clubFinances, playerFees: { ...state.clubFinances.playerFees } }
  const date = new Date(`${dateOnly(until)}T12:00:00Z`)
  const key = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`
  const month = FEE_MONTHS[date.getUTCMonth() + 1]
  if (!month || temporal.processedFeeMonths.includes(key)) return state
  Object.entries(clubFinances.playerFees).forEach(([rawId, original]) => {
    const playerId = Number(rawId); const plan: PlayerFeePlan = { ...original, payments: original.payments.map((payment) => ({ ...payment })), missingMonths: [...original.missingMonths] }
    if (plan.type === 'STANDARD' && plan.paymentMethod === 'INSTALLMENTS' && !plan.payments.some((payment) => payment.month === month) && !plan.missingMonths.includes(month)) {
      if (hash(`${playerId}:${key}:fee`, temporal.seed) % 100 < 5) plan.missingMonths.push(month)
      else plan.payments.push({ id: `fee-${playerId}-${key}`, amount: 50, month })
    }
    clubFinances.playerFees[playerId] = plan
  })
  temporal.processedFeeMonths.push(key)
  return { ...state, temporal, clubFinances }
}

function processStaffSearches(state: GameState, until: string): GameState {
  let temporal = { ...state.temporal, events: state.temporal.events.map((event) => ({ ...event })), pendingConversations: [...state.temporal.pendingConversations] }
  const requests = state.staffSearchRequests.map((request) => {
    if (request.status !== 'PENDING' || !request.resolvesAt || request.resolvesAt > until) return request
    const candidateIds = state.staff.candidates.filter((candidate) => request.requestedRole === 'ANY_HELP' || candidate.role === request.requestedRole).map((candidate) => candidate.id)
    const eventId = `event-${request.id}`
    if (!temporal.events.some((event) => event.id === eventId)) temporal.events.push({ id: eventId, at: request.resolvesAt, type: 'STAFF_SEARCH_RESULT', priority: 80, requiresDecision: true, sourceCharacterId: state.president.id, relatedId: request.id, status: 'PENDING' })
    return { ...request, status: 'CANDIDATES_FOUND' as const, candidateIds }
  })
  return { ...state, temporal, staffSearchRequests: requests }
}

export function advanceGame(state: GameState, completedTrainingSessionIds: string[]) {
  const next = findNextCheckpoint(state, completedTrainingSessionIds)
  if (!next) return { state, checkpoint: undefined }
  let advanced = processFees(state, next.at)
  advanced = processStaffSearches(advanced, next.at)
  const generatedEvent = advanced.temporal.events.find((event) => event.status === 'PENDING' && event.at <= next.at && event.type === 'STAFF_SEARCH_RESULT')
  let checkpoint = generatedEvent ? { type: 'CONVERSATION' as const, at: generatedEvent.at, label: 'Manolo quiere hablar contigo.', relatedId: generatedEvent.relatedId } : next
  let pendingConversations = advanced.temporal.pendingConversations
  let events: TemporalEvent[] = advanced.temporal.events
  if (generatedEvent && !pendingConversations.some((item) => item.relatedId === generatedEvent.relatedId)) {
    pendingConversations = [...pendingConversations, { id: `conversation-${generatedEvent.relatedId}`, sceneId: 'MANOLO_STAFF_SEARCH_RESULT', sourceCharacterId: advanced.president.id, relatedId: generatedEvent.relatedId, createdAt: generatedEvent.at }]
    events = events.map((event) => event.id === generatedEvent.id ? { ...event, status: 'RESOLVED' as const } : event)
  }
  if (checkpoint.type === 'TRAINING') checkpoint = { ...checkpoint, ...resolveStaffAvailability(advanced.staff.members, checkpoint.relatedId ?? 'training', checkpoint.at, advanced.temporal.seed) }
  advanced = { ...advanced, temporal: { ...advanced.temporal, currentDateTime: checkpoint.at, phase: checkpoint.at.includes('19:30') ? 'EVENING' : 'AFTERNOON', activeCheckpoint: checkpoint, pendingConversations, events } }
  return { state: advanced, checkpoint }
}

export const getCurrentMatchday = (state: GameState) => state.temporal.calendar.filter((match) => match.status === 'played' && match.competitionType !== 'FRIENDLY').reduce((maximum, match) => Math.max(maximum, match.matchday), 0)
export const canRequestStaffSearch = (state: GameState, hasCompletedTraining: boolean) => hasCompletedTraining && new Date(`${state.temporal.currentDateTime}Z`).getTime() - new Date(`${state.temporal.startedAt}Z`).getTime() >= 24 * 60 * 60 * 1000
export const formatGameDateTime = (value: string) => new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit', timeZone: 'UTC' }).format(new Date(`${value}Z`))
