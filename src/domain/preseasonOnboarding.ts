import type { GameState, PromiseState } from './gameState'
import type { LeagueMatch, Player } from './models'
import type { FunctionalTrainingSession } from './trainingTypes'

const clamp = (value: number) => Math.max(0, Math.min(100, value))
export const VETERAN_COMPLAINT_TRIGGERED_FACT = 'veteranTrainingComplaintTriggered'
export const LOCKER_ROOM_JOKER_TRIGGERED_FACT = 'lockerRoomJokerIncidentTriggered'

export function shouldTriggerVeteranComplaint(state: GameState, session: FunctionalTrainingSession) {
  return session.status === 'completed'
    && !state.narrativeFacts.some((fact) => fact.id === VETERAN_COMPLAINT_TRIGGERED_FACT)
    && (session.intensity === 'Alta' || session.blocks.includes('Físico'))
}

export function markVeteranComplaintTriggered(current: GameState, session: FunctionalTrainingSession) {
  if (!shouldTriggerVeteranComplaint(current, session)) return current
  return { ...current, narrativeFacts: [...current.narrativeFacts, { id: VETERAN_COMPLAINT_TRIGGERED_FACT, occurredAt: current.temporal.currentDateTime, relatedEventId: session.id }] }
}

export function selectVeteranForTrainingComplaint(players: Player[]) {
  return [...players].filter((player) => player.clubStatus !== 'TRIAL').sort((a, b) => Number(b.traits.includes('VETERANO')) - Number(a.traits.includes('VETERANO')) || b.age - a.age || a.id - b.id)[0]
}

export function selectLockerRoomJoker(state: GameState, players: Player[]) {
  const preferred = ['Sociable', 'Fiestero', 'Caliente', 'Competitivo']
  return [...players].filter((player) => player.clubStatus !== 'TRIAL').sort((a, b) => {
    const aPersonality = state.training.players[a.id]?.personality ?? a.personality
    const bPersonality = state.training.players[b.id]?.personality ?? b.personality
    const aScore = preferred.includes(aPersonality) ? preferred.length - preferred.indexOf(aPersonality) : 0
    const bScore = preferred.includes(bPersonality) ? preferred.length - preferred.indexOf(bPersonality) : 0
    return bScore - aScore || a.age - b.age || a.id - b.id
  })[0]
}

export function shouldTriggerLockerRoomJoker(state: GameState, guidedTraining: 'FIRST_TRAINING' | 'SECOND_TRAINING', veteranTriggersNow: boolean) {
  if (state.narrativeFacts.some((fact) => fact.id === LOCKER_ROOM_JOKER_TRIGGERED_FACT)) return false
  return guidedTraining === 'FIRST_TRAINING' ? !veteranTriggersNow : true
}

export function markLockerRoomJokerTriggered(current: GameState, session: FunctionalTrainingSession, playerId: number) {
  if (current.narrativeFacts.some((fact) => fact.id === LOCKER_ROOM_JOKER_TRIGGERED_FACT)) return current
  return { ...current, narrativeFacts: [...current.narrativeFacts, { id: LOCKER_ROOM_JOKER_TRIGGERED_FACT, occurredAt: current.temporal.currentDateTime, subjectId: String(playerId), relatedEventId: session.id }] }
}

function promiseKept(promise: PromiseState, session: FunctionalTrainingSession) {
  if (promise.kind === 'LOWER_TRAINING_LOAD') return session.intensity === 'Baja' || session.blocks.includes('Descanso') || session.blocks.includes('Lúdico')
  if (promise.kind === 'MORE_BALL') return session.blocks.some((block) => !['Físico', 'Descanso'].includes(block))
  return true
}

export function resolveVeteranTrainingPromises(current: GameState, session: FunctionalTrainingSession) {
  const state = structuredClone(current)
  let narrative: string | undefined
  for (const promise of state.promises.filter((item) => item.status === 'active' && (item.kind === 'LOWER_TRAINING_LOAD' || item.kind === 'MORE_BALL'))) {
    const kept = promiseKept(promise, session)
    promise.status = kept ? 'fulfilled' : 'broken'; promise.resolvedAt = state.temporal.currentDateTime
    const human = promise.subjectId ? state.training.players[Number(promise.subjectId)] : undefined
    if (human) { human.managerAuthority = clamp(human.managerAuthority + (kept ? 2 : -4)); human.happiness.training = clamp(human.happiness.training + (kept ? 2 : -3)) }
    const factId = kept ? 'nextTrainingPromiseFulfilled' : 'nextTrainingPromiseBroken'
    if (!state.narrativeFacts.some((fact) => fact.id === factId && fact.relatedEventId === promise.id)) state.narrativeFacts.push({ id: factId, occurredAt: state.temporal.currentDateTime, subjectId: promise.subjectId, relatedEventId: promise.id })
    narrative = kept ? 'El veterano parece satisfecho con cómo ha ido la sesión. Has cumplido lo que hablasteis.' : 'El veterano no dice nada hasta pasar junto a ti: «Menos carga, decías…». La promesa no se ha cumplido.'
  }
  return { state, narrative }
}

export function friendlyCallUpMessage(_state: GameState, match: LeagueMatch, playerIds: number[], players: Player[], clubName: string, rivalName: string) {
  const names = playerIds.map((id) => players.find((player) => player.id === id)?.name).filter(Boolean).join('\n')
  const date = new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Europe/Madrid' }).format(new Date(`${match.date}T12:00:00`))
  return `AMISTOSO\n\n${clubName} - ${rivalName}\n${date.charAt(0).toUpperCase()}${date.slice(1)}\n📍 ${match.venue ?? 'Campo por confirmar'}\n\nHora partido: ${match.time}\nConvocatoria: ${match.callUpTime ?? 'Por confirmar'}\n\nConvocados:\n${names}\n\nTraed las dos equipaciones.\n\nVamos equipo 💪`
}
