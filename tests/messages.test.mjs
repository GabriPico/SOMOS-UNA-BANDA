import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import { createServer } from 'vite'

let vite
let gameStateData
let messages
let trainingReports

before(async () => {
  vite = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'silent' })
  gameStateData = await vite.ssrLoadModule('/src/data/gameState.ts')
  messages = await vite.ssrLoadModule('/src/domain/messages.ts')
  trainingReports = await vite.ssrLoadModule('/src/domain/trainingReports.ts')
})

after(async () => vite?.close())

test('los mensajes iniciales de Manolo comparten una Ãºnica conversaciÃ³n por identidad', () => {
  const state = gameStateData.createNewGameState(84731)
  const manolo = state.conversations.filter((conversation) => conversation.participantId === 'manolo-escudero')
  assert.equal(manolo.length, 1)
  assert.equal(manolo[0].messages.length, 2)
})

test('la normalizaciÃ³n fusiona alias antiguos de Manolo', () => {
  const source = [
    { id: 'one', participantId: 'manolo', participantName: 'Manolo Escudero', participantType: 'PRESIDENT', type: 'DIRECT', messages: [{ id: 'm1', senderType: 'PRESIDENT', senderName: 'Manolo Escudero', timestamp: '2026-01-01T10:00:00', text: 'Uno', read: true }] },
    { id: 'two', participantId: 'contact-manolo', participantName: 'Manolo Escudero', participantType: 'PRESIDENT', type: 'DIRECT', messages: [{ id: 'm2', senderType: 'PRESIDENT', senderName: 'Manolo Escudero', timestamp: '2026-01-01T10:01:00', text: 'Dos', read: false }] },
  ]
  const normalized = messages.normalizeConversations(source)
  assert.equal(normalized.length, 1)
  assert.deepEqual(normalized[0].messages.map((message) => message.id), ['m1', 'm2'])
})

test('una partida antigua restaura el buzÃ³n legado como conversaciones serializables', () => {
  const restored = messages.restoreConversations({ inboxMessages: [{ id: 'legacy', senderType: 'president', senderId: 'manolo', senderName: 'Manolo Escudero', subject: 'Aviso', body: 'Tenemos que hablar.', status: 'new', createdAt: '2026-01-01T10:00:00' }] })
  assert.equal(restored[0].participantId, 'manolo-escudero')
  const serialized = JSON.parse(JSON.stringify(restored))
  assert.equal(serialized[0].participantId, 'manolo-escudero')
  assert.equal(serialized[0].messages[0].text, 'Tenemos que hablar.')
})

test('un informe tÃ©cnico usa al ayudante presente y nunca cae por defecto en Manolo', () => {
  const session = { id: 'tuesday', day: 'Martes', intensity: 'Media', blocks: ['TÃ¡ctica', 'BalÃ³n parado'], status: 'completed', attendance: 16, totalPlayers: 20, absentPlayerIds: [], result: { quality: 60, qualityLabel: 'Correcta', tacticalPlan: {}, attendees: Array.from({ length: 16 }, (_, index) => index + 1), effects: [], highlights: [], injuryRisk: 'Bajo', events: [], presentStaffIds: ['staff-toni'] } }
  const toni = { id: 'staff-toni', role: 'SEGUNDO_ENTRENADOR', name: 'Toni Casals', capabilities: { training: 60, footballKnowledge: 60 } }
  const reports = trainingReports.createTrainingReportMessages(session, [toni], '2026-08-25T19:30:00', true)
  assert.equal(reports[0].conversation.participantId, 'staff-toni')
  assert.equal(reports[0].messages[0].senderName, 'Toni Casals')
  const withoutStaff = trainingReports.createTrainingReportMessages(session, [], '2026-08-25T19:30:00', true)
  assert.equal(withoutStaff.length, 1)
  assert.equal(withoutStaff[0].conversation.participantId, 'training-follow-up')
  assert.notEqual(withoutStaff[0].messages[0].senderName, 'Manolo Escudero')
})

test('cada sesión añade como máximo un informe y martes y jueves comparten conversación', () => {
  const toni = { id: 'staff-toni', role: 'SEGUNDO_ENTRENADOR', name: 'Toni Casals', isUsuallyAvailable: true, capabilities: { training: 60, footballKnowledge: 60 } }
  const makeSession = (id, day, timestamp) => ({ id, day, intensity: 'Media', blocks: ['Táctica', 'Balón parado'], status: 'completed', attendance: 16, totalPlayers: 20, absentPlayerIds: [], result: { quality: 60, qualityLabel: 'Correcta', tacticalPlan: {}, attendees: Array.from({ length: 16 }, (_, index) => index + 1), effects: [], highlights: [], injuryRisk: 'Bajo', events: [], presentStaffIds: ['staff-toni'], completedAt: timestamp } })
  const tuesday = trainingReports.createTrainingReportMessages(makeSession('tuesday', 'Martes', '2026-08-25T19:30:00'), [toni], '2026-08-25T19:30:00', true)
  const thursday = trainingReports.createTrainingReportMessages(makeSession('thursday', 'Jueves', '2026-08-27T19:30:00'), [toni], '2026-08-27T19:30:00', false)
  let conversations = trainingReports.appendTrainingReport([], tuesday)
  conversations = trainingReports.appendTrainingReport(conversations, tuesday)
  assert.equal(conversations[0].messages.filter((message) => message.id === 'training-report-tuesday').length, 1)
  conversations = trainingReports.appendTrainingReport(conversations, thursday)
  assert.equal(conversations.length, 1)
  assert.deepEqual(conversations[0].messages.map((message) => message.id), ['training-report-tuesday', 'training-report-thursday'])
})

test('los mensajes conservan un orden estable dentro del mismo minuto', () => {
  const participant = { participantId: 'manolo-escudero', participantName: 'Manolo Escudero', participantType: 'PRESIDENT', type: 'DIRECT' }
  const conversation = messages.appendConversationMessages([], participant, [
    { id: 'one', senderType: 'PRESIDENT', senderName: 'Manolo Escudero', timestamp: '2026-08-25T18:10:00', text: 'Primero', read: true },
    { id: 'two', senderType: 'PRESIDENT', senderName: 'Manolo Escudero', timestamp: '2026-08-25T18:10:00', text: 'Segundo', read: true },
  ])[0]
  assert.deepEqual(conversation.messages.map((message) => message.order), [1, 2])
  assert.deepEqual(JSON.parse(JSON.stringify(conversation)).messages.map((message) => message.id), ['one', 'two'])
})

test('un mensaje nuevo nunca se inserta antes del historial existente', () => {
  const participant = { participantId: 'manolo-escudero', participantName: 'Manolo Escudero', participantType: 'PRESIDENT', type: 'DIRECT' }
  const initial = messages.appendConversationMessages([], participant, [{ id: 'existing', senderType: 'PRESIDENT', senderName: 'Manolo Escudero', timestamp: '2026-08-25T18:10:00', text: 'Existente', read: true }])
  const appended = messages.appendConversationMessages(initial, participant, [{ id: 'late-action', senderType: 'COACH', senderName: 'Míster', timestamp: '2026-08-25T18:00:00', text: 'Nueva acción', read: true }])
  assert.deepEqual(appended[0].messages.map((message) => message.id), ['existing', 'late-action'])
  assert.equal(appended[0].messages[1].timestamp, '2026-08-25T18:10:00')
})

test('una respuesta contextual se registra una vez y puede recibir réplica posterior', () => {
  const conversation = [{ id: 'conversation-manolo-escudero', participantId: 'manolo-escudero', participantName: 'Manolo Escudero', participantType: 'PRESIDENT', type: 'DIRECT', messages: [{ id: 'question', senderType: 'PRESIDENT', senderId: 'manolo-escudero', senderName: 'Manolo Escudero', timestamp: '2026-08-25T18:10:00', order: 1, text: '¿Qué hacemos?', read: false, responseOptions: [{ id: 'wait', label: 'Dale otra semana', replyText: 'Vale, le damos una semana.' }] }] }]
  const answered = messages.chooseMessageResponse(conversation, conversation[0].id, 'question', 'wait', 'Míster', '2026-08-25T18:10:00')
  assert.deepEqual(answered[0].messages.map((message) => message.order), [1, 2, 3])
  assert.equal(answered[0].messages.at(-1).text, 'Vale, le damos una semana.')
  assert.deepEqual(messages.chooseMessageResponse(answered, conversation[0].id, 'question', 'wait', 'Míster', '2026-08-25T18:11:00'), answered)
})
