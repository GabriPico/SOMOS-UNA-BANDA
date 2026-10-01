import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import { createServer } from 'vite'

let vite, mock, initial, portal, appearance, standings
before(async () => {
  vite = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom', logLevel: 'silent' })
  ;[mock, initial, portal, appearance, standings] = await Promise.all([
    '/src/data/mockData.ts', '/src/data/gameState.ts', '/src/domain/competitionPortal.ts',
    '/src/domain/clubAppearance.ts', '/src/domain/leagueStandings.ts',
  ].map(path => vite.ssrLoadModule(path)))
})
after(async () => vite?.close())
const metadata = { name: '4a Catalana', modality: 'Fútbol 11' }
function project(game) { return portal.getCompetitionPortalData(game, mock.leagueTeams, mock.players, mock.rivalPlayers, mock.leagueSanctions, metadata) }

test('portal y fichas comparten la clasificación real, excluyen amistosos y no mutan la partida', () => {
  const game = initial.createNewGameState(84731)
  assert.deepEqual(game.goalEvents, [])
  const league = game.temporal.calendar.find(match => match.matchday === 1 && match.homeTeamId === 'fc-poblenou')
    ?? game.temporal.calendar.find(match => match.matchday === 1 && match.awayTeamId === 'fc-poblenou')
  Object.assign(league, { status: 'played', homeGoals: 2, awayGoals: 1 })
  Object.assign(game.temporal.calendar[0], { status: 'played', homeGoals: 9, awayGoals: 0 })
  const before = structuredClone(game)
  const view = project(game)
  assert.deepEqual(game, before)
  assert.deepEqual(view.standings, standings.calculateStandings(mock.leagueTeams, game.temporal.calendar, 22))
  for (const club of view.clubs) assert.deepEqual(club.standing, view.standings.find(row => row.teamId === club.id))
  const club = view.clubs.find(club => club.id === 'fc-poblenou')
  assert.equal(club.standing.played, 1)
  assert.equal(club.ground, 'Municipal del Poblenou')
  assert.equal(view.season, '2026 / 27')
  assert.equal(view.rounds.length, 22)
  assert.equal(view.rounds.reduce((sum, round) => sum + round.matches.length, 0), 132)
  assert.ok(view.rounds.every(round => round.matches.every(match => match.competitionType !== 'FRIENDLY')))
  assert.ok(club.squad.every(publicPlayer => mock.players.find(player => player.id === publicPlayer.id).clubStatus !== 'TRIAL'))
  assert.equal(view.metadata.group, undefined)
})

test('los goles no inventan partidos individuales ni confunden identidades agregadas con participantes del motor', () => {
  const game = initial.createNewGameState(84731)
  game.goalEvents = []
  const match = game.temporal.calendar.find(match => match.matchday === 1)
  Object.assign(match, { status: 'played', homeGoals: 1, awayGoals: 0 })
  const scorer = mock.rivalPlayers.find(player => player.teamId === match.homeTeamId)
  assert.ok(scorer)
  game.goalEvents.push({ id: 'test-goal', matchId: match.id, teamId: scorer.teamId, scorerId: scorer.id, minute: 20, isPenalty: true })
  let row = project(game).scorers[0]
  assert.equal(row.goals, 1)
  assert.equal(row.penaltyGoals, 1)
  assert.equal(row.played, undefined)
  assert.equal(row.goalsPerMatch, undefined)
  const reportPlayer = { id: scorer.id * 100, name: scorer.name, minutes: 90 }
  game.matchReports = { [match.id]: { complete: true, home: { teamId: scorer.teamId, players: [reportPlayer] }, away: { teamId: match.awayTeamId, players: [] } } }
  assert.equal(project(game).scorers[0].played, undefined)
  reportPlayer.id = scorer.id
  row = project(game).scorers[0]
  assert.equal(row.played, 1)
  assert.equal(row.goalsPerMatch, 1)
})

test('fichas usan identificadores y el siguiente partido cronológico, con kits reproducibles y personalizables', () => {
  const game = initial.createNewGameState(84731)
  const snapshot = JSON.stringify(project(game).clubs.map(club => club.kits))
  game.temporal.calendar.reverse()
  const view = project(game)
  const club = view.clubs.find(club => club.id === 'fc-poblenou')
  assert.equal(club.nextMatchId, 'friendly-1')
  assert.equal(club.fixtures[0].id, 'friendly-1')
  assert.equal(snapshot, JSON.stringify(view.clubs.map(club => club.kits)))
  const custom = { home: { shirt: '#123456', shorts: '#112233', socks: '#445566', trim: '#ffffff' }, away: { shirt: '#ffffff', shorts: '#112233', socks: '#ffffff', trim: '#123456' } }
  assert.deepEqual(appearance.getClubKits({ id: 'example', name: 'Example', kits: custom }), custom)
  for (const [screen, tab] of [['standings', 'standings'], ['league-results', 'results'], ['league-sanctions', 'sanctions'], ['league-scorers', 'scorers']]) {
    assert.ok(portal.isCompetitionScreen(screen))
    assert.equal(portal.competitionTabForScreen(screen), tab)
  }
})

test('las participaciones del acta prevalecen sobre el histórico mock inicial del club', () => {
  const game = initial.createNewGameState(84731)
  const match = game.temporal.calendar.find(match => match.matchday === 1 && (match.homeTeamId === 'fc-poblenou' || match.awayTeamId === 'fc-poblenou'))
  match.status = 'played'
  game.goalEvents = [{ id: 'club-goal', matchId: match.id, teamId: 'fc-poblenou', scorerId: mock.players[0].id, minute: 8, isPenalty: false }]
  game.playerSeasonStats[mock.players[0].id].appearances = 4
  assert.equal(project(game).scorers[0].played, undefined)
  const club = { teamId: 'fc-poblenou', players: [{ id: mock.players[0].id, minutes: 90 }] }
  const rival = { teamId: match.homeTeamId === club.teamId ? match.awayTeamId : match.homeTeamId, players: [] }
  game.matchReports = { [match.id]: { complete: true, home: match.homeTeamId === club.teamId ? club : rival, away: match.awayTeamId === club.teamId ? club : rival } }
  const row = project(game).scorers[0]
  assert.equal(row.played, 1)
  assert.equal(row.goalsPerMatch, 1)
})
