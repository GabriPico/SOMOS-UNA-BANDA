import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import { createServer } from 'vite'

let vite, mock, initial, engine, reports, postMatch, migration
before(async () => {
  vite = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom', logLevel: 'silent' })
  ;[mock, initial, engine, reports, postMatch, migration] = await Promise.all([
    '/src/data/mockData.ts', '/src/data/gameState.ts', '/src/domain/matchEngine.ts',
    '/src/domain/matchReport.ts', '/src/domain/postMatch.ts', '/src/domain/gameStateMigration.ts',
  ].map(path => vite.ssrLoadModule(path)))
})
after(async () => vite?.close())

function fixture(away = false) {
  const game = initial.createNewGameState(84731)
  const match = game.temporal.calendar[0]
  if (away) [match.homeTeamId, match.awayTeamId] = [match.awayTeamId, match.homeTeamId]
  const state = engine.startMatch(engine.createMatchState({
    match, homeName: match.homeTeamId, awayName: match.awayTeamId, clubPlayers: mock.players,
    rivalPlayers: mock.rivalPlayers, lineupIds: game.lineupIds, plan: game.tacticalPlan,
    training: game.training, opponentFormation: '4-4-2', seed: 84731, cohesion: 58,
  }))
  return { game, state, match }
}
function finish(state) {
  for (let count = 0; state.phase !== 'FINISHED' && count < 200; count++) {
    state = ['FIRST_HALF', 'SECOND_HALF'].includes(state.phase) ? engine.advanceMatch(state) : engine.resumeMatch(state)
  }
  assert.equal(state.phase, 'FINISHED')
  return state
}

test('el acta conserva titulares, suplentes y reentradas aunque cambie el once final', () => {
  for (const away of [false, true]) {
    const { state } = fixture(away)
    const side = away ? 'away' : 'home'
    const original = structuredClone(state[side].initialLineup)
    const out = original.starters[1], incoming = original.bench[0]
    const paused = engine.requestIntervention(state)
    const first = engine.applyMatchIntervention(paused, 'fc-poblenou', { plan: state[side].tactics, lineupIds: original.starters.map(id => id === out ? incoming : id) })
    assert.deepEqual(first.errors, [])
    const returned = engine.applyMatchIntervention(first.state, 'fc-poblenou', { plan: state[side].tactics, lineupIds: original.starters })
    assert.deepEqual(returned.errors, [])
    const report = reports.createMatchReport(finish(returned.state), 'Míster')
    assert.deepEqual(report[side].players.filter(player => player.started).map(player => player.id).sort((a, b) => a - b), [...original.starters].sort((a, b) => a - b))
    assert.equal(report[side].players.find(player => player.id === incoming).started, false)
    assert.deepEqual(report[side].players.find(player => player.id === out).incidents.filter(event => event.kind === 'IN' || event.kind === 'OUT').slice(0, 2).map(event => event.kind), ['OUT', 'IN'])
    assert.equal(report[side].coach, 'Míster')
    assert.equal(report.substitutions.filter(sub => sub.teamId === 'fc-poblenou').length, 2)
    assert.deepEqual(state[side].initialLineup, original)
  }
})

test('archiva una sola vez, soporta serialización y no depende del siguiente partido', () => {
  const { game, state, match } = fixture()
  const final = finish(state)
  const result = postMatch.applyPostMatch(game, game.training, final, mock.players, mock.rivalPlayers)
  const report = result.gameState.matchReports[match.id]
  assert.ok(report.complete)
  assert.deepEqual(report, reports.createMatchReport(final, game.coachName))
  assert.equal(result.gameState.activeMatch, undefined)
  assert.equal(game.matchReports?.[match.id], undefined)
  const restored = migration.hydrateGameState(JSON.parse(JSON.stringify(result.gameState)))
  assert.deepEqual(restored.matchReports[match.id], JSON.parse(JSON.stringify(report)))
  const again = postMatch.applyPostMatch(result.gameState, result.trainingState, final, mock.players, mock.rivalPlayers)
  assert.equal(again.gameState, result.gameState)
  assert.equal(again.trainingState, result.trainingState)
  assert.equal(again.gameState.goalEvents.length, result.gameState.goalEvents.length)
  const originalName = report.home.players[0].name
  final.home.players[report.home.players[0].id].name = 'Changed after archival'
  assert.equal(report.home.players[0].name, originalName)
  const played = result.gameState.temporal.calendar.find(item => item.id === match.id)
  assert.equal(reports.getMatchReport(played, restored.matchReports, [], [], []), restored.matchReports[match.id])
})

test('los goles usan al autor real del motor y conservan minuto y marcador progresivo', () => {
  const { state } = fixture()
  const rival = state.away.players[state.away.lineup.starters[9]]
  assert.notEqual(rival.id, rival.canonicalScorerId)
  state.events.push({ id: 'goal-a', kind: 'GOAL', minute: 15, teamId: state.away.teamId, playerId: rival.id, text: '' })
  state.goalEvents.push({ id: 'g-a', matchId: state.matchId, teamId: state.away.teamId, scorerId: rival.canonicalScorerId, minute: 15, isPenalty: false })
  const report = reports.createMatchReport(state)
  assert.equal(report.goals[0].playerName, rival.name)
  assert.deepEqual([report.goals[0].homeGoals, report.goals[0].awayGoals, report.goals[0].minute], [0, 1, 15])
  assert.ok(report.away.players.find(player => player.id === rival.id).incidents.some(event => event.kind === 'GOAL'))
})

test('los resultados antiguos muestran solo hechos registrados sin fabricar alineaciones', () => {
  const match = mock.leagueSeason.matches.find(match => match.status === 'played' && match.homeGoals + match.awayGoals > 0)
  const before = JSON.stringify(mock.goalEvents)
  const report = reports.getMatchReport(match, undefined, mock.goalEvents, mock.players, mock.rivalPlayers)
  assert.equal(report.complete, false)
  assert.equal(report.home.players.length, 0)
  assert.equal(report.statistics, undefined)
  assert.equal(report.goals.length, match.homeGoals + match.awayGoals)
  assert.deepEqual([report.goals.at(-1).homeGoals, report.goals.at(-1).awayGoals], [match.homeGoals, match.awayGoals])
  assert.equal(JSON.stringify(mock.goalEvents), before)
  const old = fixture().game
  delete old.matchReports
  assert.deepEqual(migration.hydrateGameState(old).matchReports, {})
})

test('un partido sin terminar no se archiva ni aplica sus consecuencias', () => {
  const { game, state } = fixture()
  const result = postMatch.applyPostMatch(game, game.training, state, mock.players, mock.rivalPlayers)
  assert.equal(result.gameState, game)
  assert.equal(result.trainingState, game.training)
})
