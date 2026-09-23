import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import { createServer } from 'vite'

let vite, data, onboarding, preseason, squads, chat, mock
before(async () => {
  vite = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'silent' })
  ;[data, onboarding, preseason, squads, chat, mock] = await Promise.all([
    vite.ssrLoadModule('/src/data/gameState.ts'), vite.ssrLoadModule('/src/domain/onboarding.ts'), vite.ssrLoadModule('/src/domain/preseasonOnboarding.ts'),
    vite.ssrLoadModule('/src/domain/squadSelection.ts'), vite.ssrLoadModule('/src/domain/teamChat.ts'), vite.ssrLoadModule('/src/data/mockData.ts'),
  ])
})
after(async () => vite?.close())

const completedSession = (state, overrides = {}) => ({ ...state.training.sessions[0], status: 'completed', intensity: 'Media', blocks: ['Táctica', 'Balón parado'], ...overrides })

test('un entrenamiento normal sin Físico no dispara la incidencia', () => {
  const state = data.createNewGameState(84731)
  assert.equal(preseason.shouldTriggerVeteranComplaint(state, completedSession(state)), false)
})

test('la intensidad alta y el bloque Físico disparan la primera incidencia', () => {
  const state = data.createNewGameState(84731)
  assert.equal(preseason.shouldTriggerVeteranComplaint(state, completedSession(state, { intensity: 'Alta' })), true)
  assert.equal(preseason.shouldTriggerVeteranComplaint(state, completedSession(state, { blocks: ['Físico', 'Táctica'] })), true)
  assert.equal(preseason.shouldTriggerVeteranComplaint(state, completedSession(state, { intensity: 'Alta', blocks: ['Físico', 'Físico'] })), true)
})

test('el hecho serializado impide que la incidencia vuelva a aparecer', () => {
  const state = data.createNewGameState(84731)
  const demanding = completedSession(state, { intensity: 'Alta' })
  const triggered = preseason.markVeteranComplaintTriggered(state, demanding)
  const restored = JSON.parse(JSON.stringify(triggered))
  assert.equal(preseason.shouldTriggerVeteranComplaint(restored, completedSession(restored, { blocks: ['Físico', 'Táctica'] })), false)
  assert.equal(restored.narrativeFacts.filter((fact) => fact.id === preseason.VETERAN_COMPLAINT_TRIGGERED_FACT).length, 1)
})

test('el onboarding no presupone una incidencia entre ambos entrenamientos', () => {
  let state = data.createNewGameState(84731)
  state = onboarding.completeOnboardingMilestone(state, 'FIRST_TRAINING')
  assert.equal(state.onboarding.active, 'FIRST_TRAINING_REPORT')
  state = onboarding.completeOnboardingMilestone(state, 'FIRST_TRAINING_REPORT')
  state = onboarding.completeOnboardingMilestone(state, 'SECOND_TRAINING')
  assert.equal(state.onboarding.active, 'FRIENDLY_CALL_UP')
})

test('el gracioso aparece en el primer entrenamiento normal y no se repite', () => {
  const state = data.createNewGameState(84731)
  const session = completedSession(state)
  assert.equal(preseason.shouldTriggerLockerRoomJoker(state, 'FIRST_TRAINING', false), true)
  const joker = preseason.selectLockerRoomJoker(state, mock.players)
  const triggered = preseason.markLockerRoomJokerTriggered(state, session, joker.id)
  assert.equal(preseason.shouldTriggerLockerRoomJoker(triggered, 'SECOND_TRAINING', false), false)
  assert.equal(triggered.narrativeFacts.find((fact) => fact.id === preseason.LOCKER_ROOM_JOKER_TRIGGERED_FACT).subjectId, String(joker.id))
})

test('el veterano desplaza al gracioso del primer al segundo entrenamiento', () => {
  const state = data.createNewGameState(84731)
  assert.equal(preseason.shouldTriggerLockerRoomJoker(state, 'FIRST_TRAINING', true), false)
  assert.equal(preseason.shouldTriggerLockerRoomJoker(state, 'SECOND_TRAINING', false), true)
})

test('en el segundo entrenamiento el veterano mantiene prioridad sin cancelar al gracioso pendiente', () => {
  const state = data.createNewGameState(84731)
  const demanding = completedSession(state, { intensity: 'Alta' })
  assert.equal(preseason.shouldTriggerVeteranComplaint(state, demanding), true)
  assert.equal(preseason.shouldTriggerLockerRoomJoker(state, 'SECOND_TRAINING', true), true)
  const veteranTriggered = preseason.markVeteranComplaintTriggered(state, demanding)
  const joker = preseason.selectLockerRoomJoker(veteranTriggered, mock.players)
  const bothTriggered = preseason.markLockerRoomJokerTriggered(veteranTriggered, demanding, joker.id)
  const restored = JSON.parse(JSON.stringify(bothTriggered))
  assert.equal(preseason.shouldTriggerVeteranComplaint(restored, demanding), false)
  assert.equal(preseason.shouldTriggerLockerRoomJoker(restored, 'SECOND_TRAINING', false), false)
})

test('la promesa se resuelve una sola vez en el siguiente entrenamiento completado', () => {
  const state = data.createNewGameState(84731)
  const veteran = preseason.selectVeteranForTrainingComplaint(mock.players)
  state.promises.push({ id: 'p', subjectId: String(veteran.id), description: 'Bajar carga', status: 'active', kind: 'LOWER_TRAINING_LOAD' })
  const session = { ...state.training.sessions[1], intensity: 'Alta', blocks: ['Físico', 'Físico'] }
  const first = preseason.resolveVeteranTrainingPromises(state, session)
  assert.equal(first.state.promises[0].status, 'broken')
  const second = preseason.resolveVeteranTrainingPromises(first.state, session)
  assert.equal(second.state.narrativeFacts.length, first.state.narrativeFacts.length)
})

test('convocatoria y chat son serializables e idempotentes', () => {
  const state = data.createNewGameState(84731)
  const match = state.temporal.calendar.find((item) => item.competitionType === 'FRIENDLY')
  const ids = mock.players.map((player) => player.id)
  const selected = squads.resolveFriendlySquadAnnouncement(state, match, ids, mock.players, state.temporal.currentDateTime).state
  const message = { id: `call-up-${match.id}`, senderType: 'COACH', senderName: 'Míster', timestamp: state.temporal.currentDateTime, type: 'CALL_UP', content: 'Convocatoria', reactions: [{ emoji: '👍', count: 6 }], relatedEventId: match.id }
  const once = chat.appendTeamChatMessage(selected, message)
  const restored = JSON.parse(JSON.stringify(chat.appendTeamChatMessage(once, message)))
  assert.deepEqual(restored.squadSelections[match.id].playerIds, ids)
  assert.equal(restored.teamChat.messages.length, 1)
})
