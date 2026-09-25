import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import { createServer } from 'vite'

let vite, messages, phone, data, migration
before(async () => {
  vite = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom', logLevel: 'silent' })
  messages = await vite.ssrLoadModule('/src/domain/messages.ts')
  phone = await vite.ssrLoadModule('/src/domain/clubPhone.ts')
  data = await vite.ssrLoadModule('/src/data/gameState.ts')
  migration = await vite.ssrLoadModule('/src/domain/gameStateMigration.ts')
})
after(async () => vite?.close())

const notification = {
  id: 'tutorial-tactics-1', conversationId: 'conversation-tutorial',
  participant: { participantId: 'tutorial', participantName: 'Tutorial', participantType: 'CLUB', type: 'DIRECT' },
  sender: { type: 'SYSTEM', id: 'tutorial', name: 'Tutorial' },
  body: 'Puedes cambiar la mentalidad desde Tácticas.', timestamp: '2026-08-24T19:30:00',
}

test('cualquier sistema puede crear un hilo sin duplicar mensajes ni modificar los anteriores', () => {
  const original = data.createNewGameState(84731).conversations
  const snapshot = JSON.stringify(original)
  const delivered = messages.addMessage(original, notification)
  assert.equal(JSON.stringify(original), snapshot)
  assert.equal(messages.countUnreadMessages(delivered), messages.countUnreadMessages(original) + 1)
  assert.equal(messages.addMessage(delivered, notification), delivered)
  const read = messages.markConversationRead(delivered, notification.conversationId)
  assert.equal(messages.countUnreadMessages(read), messages.countUnreadMessages(original))
  const next = messages.addMessage(read, { ...notification, id: 'tutorial-tactics-2', participant: undefined })
  assert.equal(messages.getUnreadCount(next.find(item => item.id === notification.conversationId)), 1)
  assert.equal(next.find(item => item.id === notification.conversationId).messages.length, 2)
  assert.throws(() => messages.addMessage([], { ...notification, conversationId: 'unknown' }), /Unknown or mismatched/)
})

test('una respuesta propia no crea pendientes y la réplica usa el contador compartido', () => {
  let current = messages.addMessage([], { ...notification, responseOptions: [{ id: 'ok', label: 'Entendido', replyText: 'Perfecto, míster.' }] })
  current = messages.markConversationRead(current, notification.conversationId)
  current = messages.chooseMessageResponse(current, notification.conversationId, notification.id, 'ok', 'Míster', notification.timestamp)
  assert.equal(messages.countUnreadMessages(current), 1)
  assert.equal(current[0].messages.at(-2).senderType, 'COACH')
  assert.equal(current[0].messages.at(-2).read, true)
  assert.equal(messages.countPendingResponses(current), 0)
})

test('responder desde el teléfono conserva la decisión de entrenamiento y no permite repetir efectos', () => {
  const game = data.createNewGameState(84731)
  game.conversations = messages.addMessage([], { ...notification, responseOptions: [
    { id: 'REVIEW_SECOND_SESSION', label: 'Revisar' }, { id: 'KEEP_SECOND_SESSION', label: 'Mantener' },
  ] })
  game.selectedConversationId = notification.conversationId
  game.secondSessionPlanningDecision = { week: 1, firstSessionId: 'one', targetSessionId: 'two', messageId: notification.id, status: 'PENDING' }
  assert.equal(phone.respondFromPhone(game, notification.id, 'invalid'), game)
  const answered = phone.respondFromPhone(game, notification.id, 'REVIEW_SECOND_SESSION')
  assert.equal(answered.secondSessionPlanningDecision.status, 'REVIEW_REQUIRED')
  assert.equal(phone.respondFromPhone(answered, notification.id, 'KEEP_SECOND_SESSION'), answered)
  assert.deepEqual(answered.training, game.training)
  assert.deepEqual(answered.temporal, game.temporal)
})

test('tutorial y Continuar localizan el mensaje del presidente, el informe o la convocatoria', () => {
  const game = data.createNewGameState(84731)
  game.onboarding.active = 'MANOLO_MESSAGE'
  game.conversations = game.conversations.map(conversation => ({ ...conversation, messages: conversation.messages.map(message => ({ ...message, read: false })) }))
  let guide = phone.getPhoneGuide(game)
  assert.equal(guide.conversationId, 'conversation-manolo-escudero')
  assert.equal(guide.canContinue, false)
  game.conversations = messages.markConversationRead(game.conversations, guide.conversationId)
  assert.equal(phone.getPhoneGuide(game).canContinue, true)
  game.onboarding.active = 'FIRST_TRAINING_REPORT'
  game.secondSessionPlanningDecision = { messageId: notification.id }
  game.conversations = messages.addMessage(game.conversations, notification)
  assert.equal(phone.getPhoneAttentionTarget(game).conversationId, notification.conversationId)
  game.onboarding.active = 'TEAM_CHAT'
  game.conversations = messages.appendConversationMessages(game.conversations, { participantId: 'team-group', participantName: 'Plantilla', participantType: 'GROUP', type: 'GROUP' }, [{ id: 'call-up', senderType: 'COACH', senderName: 'Míster', timestamp: notification.timestamp, text: 'Convocatoria', read: true }])
  assert.equal(phone.getPhoneAttentionTarget(game).conversationId, 'conversation-team-group')
  game.onboarding.active = 'COMPLETE'
  assert.equal(phone.getPhoneGuide(game), undefined)
})

test('el historial de llamadas es reproducible y la hidratación respeta datos guardados o vacíos', () => {
  const game = data.createNewGameState(84731)
  const restored = migration.hydrateGameState(game)
  assert.deepEqual(migration.hydrateGameState(game).calls, restored.calls)
  assert.ok(restored.calls.some(call => call.status === 'MISSED'))
  assert.ok(restored.calls.some(call => call.direction === 'INCOMING' && call.status === 'COMPLETED'))
  assert.ok(restored.calls.some(call => call.direction === 'OUTGOING'))
  assert.ok(restored.calls.some(call => call.medium === 'VIDEO'))
  assert.ok(restored.calls.every(call => call.timestamp <= game.temporal.startedAt))
  assert.deepEqual(migration.hydrateGameState(JSON.parse(JSON.stringify(restored))).calls, restored.calls)
  assert.deepEqual(migration.hydrateGameState({ ...game, calls: [] }).calls, [])
  assert.deepEqual(restored.conversations, game.conversations)
})
