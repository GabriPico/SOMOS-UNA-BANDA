import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { before, after, test } from 'node:test'
import { createServer } from 'vite'

let vite, environment, assets, panel, data
before(async () => {
  vite = await createServer({ server: { middlewareMode: true, hmr: false, watch: null }, appType: 'custom', logLevel: 'silent' })
  environment = await vite.ssrLoadModule('/src/presentation/environment.ts')
  assets = await vite.ssrLoadModule('/src/data/clubEnvironments.ts')
  panel = await vite.ssrLoadModule('/src/presentation/clubPanelPresentation.ts')
  data = await vite.ssrLoadModule('/src/data/gameState.ts')
})
after(async () => vite?.close())

test('la iluminación respeta los límites del reloj civil de partida, incluso con zona horaria', () => {
  for (const [time, expected] of [['00:00','night'], ['06:59','night'], ['07:00','day'], ['19:29','day'], ['19:30','night'], ['23:59','night']]) {
    for (const suffix of ['', 'Z', '+02:00']) assert.equal(environment.getEnvironmentMode('2026-08-25T' + time + ':00' + suffix), expected)
  }
})

test('cada localización dispone de las dos variantes y un fallback existente', () => {
  for (const [location, pair] of Object.entries(assets.CLUB_ENVIRONMENTS)) {
    assert.notEqual(pair.day, pair.night, location)
    for (const path of Object.values(pair)) assert.ok(existsSync('public' + path), path)
    for (const mode of ['day','night']) assert.equal(assets.getEnvironmentAsset(location, mode), pair[mode])
  }
  assert.equal(assets.getClubLocation('player-profile'), assets.getClubLocation('squad'))
  assert.equal(assets.getClubLocation('next-match'), assets.getClubLocation('training'))
})

test('el hub refleja cambios reales en estados, calendario y pendientes sin alterar la partida', () => {
  const game = data.createNewGameState(84731)
  const snapshot = JSON.stringify(game)
  const before = panel.getClubPanelPresentation(game, 1)
  assert.equal(JSON.stringify(game), snapshot)
  game.team.cohesion = 10
  game.temporal.calendar = []
  game.training.sessions = game.training.sessions.map(session => ({...session, planningStatus: 'PLANNED'}))
  const after = panel.getClubPanelPresentation(game, 1)
  assert.equal(after.states[0].level, 10)
  assert.notEqual(before.states[0].value, after.states[0].value)
  assert.equal(after.match, undefined)
  assert.equal(after.callUpPending, false)
  assert.ok(after.pending <= before.pending)
  assert.equal(JSON.stringify(game.training.sessions.map(session=>session.planningStatus)), '["PLANNED","PLANNED"]')
})

