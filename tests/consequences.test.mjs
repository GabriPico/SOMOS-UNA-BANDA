import assert from 'node:assert/strict'
import test, { after, before } from 'node:test'
import { createServer } from 'vite'

let vite, data, consequences, migration
before(async () => {
  vite = await createServer({ server: { middlewareMode: true }, appType: 'custom' })
  ;[data, consequences, migration] = await Promise.all([
    vite.ssrLoadModule('/src/data/gameState.ts'),
    vite.ssrLoadModule('/src/domain/consequences.ts'),
    vite.ssrLoadModule('/src/domain/gameStateMigration.ts'),
  ])
})
after(async () => vite?.close())

test('el resolver aplica clamps, memoria, flag, log y feedback inmediato', () => {
  const initial = data.createNewGameState(84731)
  initial.training.players[1].managerRelationship = 99
  const next = consequences.applyConsequences(initial, {
    source: 'test', decisionId: 'decision',
    effects: [{ type: 'PLAYER_MANAGER_RELATIONSHIP', targetId: 1, magnitude: 'MAJOR' }],
    memories: [{ id: 'REMEMBERED', characterId: 'player-1' }], flags: [{ id: 'fact' }],
    feedback: [{ type: 'MEMORY', text: 'Lo recordará.' }],
  })
  assert.equal(next.training.players[1].managerRelationship, 100)
  assert.equal(next.consequences.memories.length, 1)
  assert.equal(consequences.hasFlag(next.consequences, 'fact'), true)
  assert.equal(next.consequences.decisionLog[0].effectsApplied[0].appliedDelta, 1)
  assert.equal(next.consequences.feedbackQueue[0].status, 'READY')
  const consumed = consequences.consumeConsequenceFeedback(next, [next.consequences.feedbackQueue[0].id])
  assert.equal(consumed.consequences.feedbackQueue[0].status, 'CONSUMED')
})

test('el feedback diferido sigue disponible solo cuando se solicita expresamente', () => {
  const initial = data.createNewGameState(84731)
  const next = consequences.applyConsequences(initial, { source: 'test', decisionId: 'deferred', feedbackTiming: 'DEFERRED', feedback: [{ type: 'WARNING', text: 'Más tarde.' }] })
  assert.equal(next.consequences.feedbackQueue[0].status, 'PENDING')
  assert.equal(consequences.flushConsequenceFeedback(next).consequences.feedbackQueue[0].status, 'READY')
})

test('la moral deriva de felicidad, cohesión y resultados recientes', () => {
  const state = data.createNewGameState(84731)
  for (const player of Object.values(state.training.players)) player.happiness = { teammates: 60, playingTime: 60, training: 60, results: 60 }
  state.team.cohesion = 80
  state.team.recentResultsMood = 40
  assert.equal(consequences.calculateTeamMorale(state), 60)
})

test('la hidratación migra autoridad y cohesión de una partida anterior', () => {
  const legacy = data.createNewGameState(84731)
  legacy.dressingRoomCohesion = 73
  delete legacy.team
  legacy.training.players[1].authorityWithCoach = 81
  delete legacy.training.players[1].managerAuthority
  delete legacy.training.players[1].managerRelationship
  delete legacy.consequences
  const migrated = migration.hydrateGameState(legacy)
  assert.equal(migrated.team.cohesion, 73)
  assert.equal(migrated.training.players[1].managerAuthority, 81)
  assert.equal(migrated.training.players[1].managerRelationship, 55)
  assert.deepEqual(migrated.consequences.decisionLog, [])
})
