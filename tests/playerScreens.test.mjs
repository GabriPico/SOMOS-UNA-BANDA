import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'

let generation, playerPresentation, AppShell, vite, players, game, TeamScreen, DressingRoomScreen, PlayerDetail, PlayerProfileScreen, portraits, roomPresentation, finance, roomData, DressingRoomProblems, presentation, PlayerUi, ChangeHistory

before(async () => {
  vite = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom', logLevel: 'silent' })
  ;({ players } = await vite.ssrLoadModule('/src/data/mockData.ts'))
  const { createNewGameState } = await vite.ssrLoadModule('/src/data/gameState.ts')
  game = createNewGameState(84731)
  ;({ TeamScreen } = await vite.ssrLoadModule('/src/screens/TeamScreen.tsx'))
  ;({ DressingRoomScreen } = await vite.ssrLoadModule('/src/screens/DressingRoomScreen.tsx'))
  ;({ PlayerDetail } = await vite.ssrLoadModule('/src/components/PlayerDetail.tsx'))
  ;({ PlayerProfileScreen } = await vite.ssrLoadModule('/src/screens/PlayerProfileScreen.tsx'))
  portraits = await vite.ssrLoadModule('/src/data/playerPortraits.ts')
  roomPresentation = await vite.ssrLoadModule('/src/domain/dressingRoomPresentation.ts')
  finance = await vite.ssrLoadModule('/src/domain/playerFinance.ts')
  ;({ initialDressingRoomState: roomData } = await vite.ssrLoadModule('/src/data/dressingRoomData.ts'))
  ;({ DressingRoomProblems } = await vite.ssrLoadModule('/src/components/DressingRoomProblems.tsx'))
  presentation = await vite.ssrLoadModule('/src/presentation/managementPresentation.ts')
  generation = await vite.ssrLoadModule('/src/domain/playerGeneration.ts')
  playerPresentation = await vite.ssrLoadModule('/src/presentation/playerPresentation.ts')
  ;({ AppShell } = await vite.ssrLoadModule('/src/components/AppShell.tsx'))
  PlayerUi = await vite.ssrLoadModule('/src/components/PlayerUi.tsx')
  ;({ ChangeHistory } = await vite.ssrLoadModule('/src/components/ChangeHistory.tsx'))
})

after(async () => vite?.close())

const screenProps = () => ({
  playerSeasonStats: game.playerSeasonStats, trainingState: game.training,
  injuredPlayerIds: game.injuredPlayerIds, ...game.clubFinances, onBack() {},
})
const render = (Component, props) => renderToStaticMarkup(createElement(Component, props))

test('Equipo conserva toda la plantilla, los jugadores a prueba, filtros y ficha permanente', () => {
  const html = render(TeamScreen, screenProps())
  assert.equal((html.match(/<th scope=/g) ?? []).length, 10)
  assert.equal((html.match(/class="player-identity-button"/g) ?? []).length, players.length)
  assert.equal((html.match(/>A prueba</g) ?? []).length, players.filter((player) => player.clubStatus === 'TRIAL').length)
  assert.match(html, /PJ\(TIT\)/)
  assert.match(html, />Min</)
  assert.match(html, /player-detail--inline/)
  assert.doesNotMatch(html, /player-attributes-panel|position-pitch|player-profile-extra/)
  for (const label of ['Calidad general', 'Rol en el equipo', 'Personalidad', 'Posiciones', 'Estado']) assert.ok(html.includes(label))
  assert.doesNotMatch(html, /role="dialog"|player-modal-backdrop/)
  assert.match(html, /Filtrar por posición|Buscar jugador/)
})

test('el perfil es una pantalla propia, con retorno al origen y los mismos atributos y estadísticas de la ficha', () => {
  const player = players[5]
  const props = { player, trainingState: game.training.players[player.id], seasonStats: { appearances: 13, starts: 11, goals: 4, ratings: [] }, onBack() {} }
  const page = render(PlayerProfileScreen, { ...props, origin: 'tactics' })
  const teamPage = render(PlayerProfileScreen, { ...props, origin: 'squad' })
  const detail = render(PlayerDetail, props)
  assert.match(page, /Volver a Tácticas/)
  assert.match(teamPage, /Volver a Equipo/)
  assert.match(page, /player-detail--page/)
  assert.doesNotMatch(page, /role="dialog"|aria-modal|player-modal-backdrop/)
  assert.match(page, /13\(11\)/)
  assert.match(page, /<dt>Goles<\/dt><dd>4<\/dd>/)
  for (const label of ['Posiciones', 'Calidad general', 'Rol en el equipo', 'Personalidad', 'Observaciones', 'Condición · Stamina']) assert.ok(page.includes(label))
  const attributes = html => [...html.matchAll(/class="star-rating attribute-stars"[^>]*aria-label="([^"]+)"/g)].map(match => match[1])
  assert.ok(attributes(page).length > 0)
  assert.deepEqual(attributes(page), attributes(detail))
})

test('Equipo separa el enlace del nombre del control del retrato sin botones anidados', () => {
  const html = render(TeamScreen, { ...screenProps(), onOpenPlayer() {} })
  assert.equal((html.match(/class="player-portrait-select"/g) ?? []).length, players.length)
  assert.match(html, /class="player-summary-full"[^>]*>Ver ficha completa/)
  assert.ok((html.match(/class="player-profile-link"/g) ?? []).length >= players.length)
  assert.doesNotMatch(html, /<button[^>]*>(?:(?!<\/button>)[\s\S])*<button/)
})

test('las tres superficies resuelven cada retrato por ID y cambiar el nombre no cambia el archivo', () => {
  const team = render(TeamScreen, screenProps())
  const room = render(DressingRoomScreen, { ...screenProps(), cohesion: game.team.cohesion, morale: 60 })
  for (const player of players) {
    const source = portraits.getPlayerPortraitSource(player)
    assert.equal(source, portraits.getPlayerPortraitSource({ ...player, name: 'Nombre cambiado' }))
    assert.match(source, new RegExp('/' + player.id + '\\.png$'))
    const detail = render(PlayerDetail, { player, onClose() {} })
    for (const html of [team, detail]) assert.ok(html.includes('src="' + source + '"'))
  }
  // The social overview now shows a selected subset, not the entire squad.
  const roomPortraits = [...room.matchAll(/src="([^"]*\/players\/[^"]+)"/g)].map(match => match[1])
  assert.ok(roomPortraits.length > 0)
  assert.ok(roomPortraits.every(source => players.some(player => portraits.getPlayerPortraitSource(player) === source)))
})

test('la ficha conserva estadísticas vivas, lesiones y contexto táctico sin inventar histórico', () => {
  const player = players[0]
  const beforeState = JSON.stringify(game)
  const html = render(PlayerDetail, {
    player, trainingState: game.training.players[player.id], onClose() {}, injured: true,
    currentTacticalPosition: 'POR', seasonStats: { appearances: 17, starts: 11, goals: 3, ratings: [] },
  })
  assert.match(html, /17\(11\)/)
  assert.match(html, /<dt>Goles<\/dt><dd>3<\/dd>/)
  assert.match(html, /Lesionado/)
  assert.match(html, /Contexto táctico/)
  assert.doesNotMatch(html, /Últimos 5/)
  assert.equal(JSON.stringify(game), beforeState)
})

test('los atributos conservan el dominio y se presentan con estrellas, también con bonus', () => {
  for (const player of players) {
    const before = JSON.stringify(player)
    const html = render(PlayerDetail, { player, onClose() {}, provisionalProgress: { pases: 1.75 } })
    const keeper = [player.primaryPosition, ...player.secondaryPositions].includes('POR')
    assert.equal((html.match(/class="star-rating attribute-stars"/g) ?? []).length, keeper ? 17 : 15)
    if (keeper) { assert.match(html, /Paradas/); assert.doesNotMatch(html, /Alcance aéreo/) }
    else { assert.match(html, /Alcance aéreo/); assert.doesNotMatch(html, /Paradas/) }
    assert.doesNotMatch(html, /max="20"|de 20|player-attribute-value|Bonus provisional:/)
    assert.equal(JSON.stringify(player), before)
  }
  assert.equal(render(PlayerUi.AttributeStars, { label: 'Pases', value: 12 }), render(PlayerUi.AttributeStars, { label: 'Pases', value: 13 }))
  const starValues = Array.from({ length: 20 }, (_, index) => playerPresentation.getAttributePresentation(index + 1).stars)
  assert.equal(starValues[0], 0)
  assert.equal(starValues.at(-1), 5)
  assert.ok(starValues.every((stars, index) => stars * 2 === Math.round(stars * 2) && (!index || stars >= starValues[index - 1])))
})

test('altura y peso son reproducibles y no modifican atributos ni tiradas deportivas', () => {
  for (const player of players) {
    assert.ok(player.heightCm >= 165 && player.heightCm <= 195)
    assert.ok(player.weightKg >= 55 && player.weightKg <= 98)
    const seed = { ...player, seed: 1234, targetRating: 72, heightCm: undefined, weightKg: undefined }
    const generated = generation.generatePlayer(seed)
    assert.deepEqual(generated, generation.generatePlayer(seed))
    const explicit = generation.generatePlayer({ ...seed, heightCm: 181, weightKg: 76 })
    assert.equal(explicit.heightCm, 181)
    assert.equal(explicit.weightKg, 76)
    assert.deepEqual(generated.attributes, explicit.attributes)
  }
})

test('calidad, rol descrito y personalidad están al principio de la ficha', () => {
  const player = players[0]
  const html = render(PlayerDetail, { player, trainingState: game.training.players[player.id], variant: 'inline' })
  const positions = html.indexOf('<h4>Posiciones</h4>')
  for (const label of ['Calidad general', 'Rol en el equipo', 'Personalidad']) assert.ok(html.indexOf(label) < positions)
  assert.match(html, /Capitán · Titular/)
  assert.match(html, /Espera salir de inicio habitualmente/)
  assert.doesNotMatch(html, /Altura —|Peso —|attribute-bar/)
})

test('el vestuario conserva autoridad y sustituye la plantilla completa y cuotas por seguimiento y compromisos', () => {
  const html = render(DressingRoomScreen, { ...screenProps(), cohesion: game.team.cohesion, morale: 60 })
  assert.match(html, />Autoridad</)
  assert.match(html, /Jugadores a seguir/)
  assert.match(html, /Compromisos/)
  assert.doesNotMatch(html, />Expectativa<|>Cuotas<|<th[^>]*>Felicidad</)
  assert.ok((html.match(/<tr class=/g) ?? []).length <= 6)
  assert.doesNotMatch(html, /Expectativas del club|Confianza del presidente|Objetivo de clasificación/)
  const empty = { players: [], issues: [], changes: [], cohesion: 60 }
  assert.deepEqual(roomPresentation.getDressingRoomPresentation(empty, game.training).issues, [])
})

const healthyTraining = () => {
  const training = structuredClone(game.training)
  for (const player of Object.values(training.players)) {
    player.managerRelationship = 70
    player.managerAuthority = 70
  }
  return training
}
const emptyRoom = () => ({ players: [], issues: [], changes: [], cohesion: 60 })
const feePlan = () => ({ type: 'STANDARD', seasonTotal: finance.STANDARD_PLAYER_SEASON_FEE, paymentMethod: 'INSTALLMENTS', payments: [], missingMonths: ['octubre'], visibility: 'COACH_ONLY' })
const problemsFor = (room, training, fees = {}, compensations = {}, roster = players) => roomPresentation.getDressingRoomProblems(room, training, roster, finance.getTeamFeeSummary(fees, compensations), fees)

test('las barras reflejan el estado vivo y el vestuario conserva todos los paneles humanos', () => {
  const training = healthyTraining()
  const html = render(DressingRoomScreen, { ...screenProps(), trainingState: training, cohesion: 42, morale: 80 })
  assert.match(html, /<meter min="0" max="100" value="40" aria-label="Cohesión" aria-valuetext="Baja"/)
  assert.match(html, /aria-label="Felicidad"/)
  assert.match(html, /<meter min="0" max="100" value="70" aria-label="Autoridad" aria-valuetext="Respetada"/)
  const headings = [...html.matchAll(/<h[23][^>]*>(.*?)<\/h[23]>/g)].map((match) => match[1].replace(/<svg.*?<\/svg>|<span.*?<\/span>/g, ''))
  assert.deepEqual(headings, ['Estado del vestuario', 'Jugadores a seguir', 'Problemas', 'Jerarquía del vestuario', 'Voces del vestuario', 'Compromisos', 'Cambios recientes'])
  const changed = render(DressingRoomScreen, { ...screenProps(), trainingState: training, cohesion: 90, morale: 30 })
  assert.match(changed, /value="90" aria-label="Cohesión" aria-valuetext="Muy alta"/)
  assert.match(changed, /aria-label="Felicidad"/)
})

test('un vestuario sin asuntos, deuda ni estados humanos negativos muestra el estado vacío', () => {
  const problems = problemsFor(emptyRoom(), healthyTraining())
  assert.deepEqual(problems, [])
  const html = render(DressingRoomProblems, { problems, players, onSelectPlayer() {} })
  assert.match(html, /No hay problemas relevantes ahora mismo\./)
  assert.doesNotMatch(html, /<table/)
})

test('los problemas usan situaciones existentes sin duplicar sus avisos colectivos ni incluir los positivos', () => {
  const before = JSON.stringify(roomData)
  const problems = problemsFor(roomData, healthyTraining())
  assert.deepEqual(problems.map((problem) => problem.id).sort(), ['situation:2', 'situation:20', 'situation:5', 'situation:9'])
  assert.equal(problems[0].playerId, 5)
  assert.equal(problems[0].severity, 'SEVERE')
  assert.equal(problems[0].subject, 'Molesto por sus minutos')
  assert.deepEqual(problemsFor(JSON.parse(JSON.stringify(roomData)), healthyTraining()), problems)
  assert.equal(JSON.stringify(roomData), before)
  // An unlinked negative record is still displayed as an existing collective concern.
  const room = emptyRoom()
  room.issues.push({ id: 'existing-issue', severity: 'negative', title: 'Asunto registrado', description: '' })
  assert.deepEqual(problemsFor(room, healthyTraining()).map((problem) => problem.subject), ['Asunto registrado'])
})

test('relación y autoridad negativas aparecen y desaparecen al cruzar sus umbrales actuales', () => {
  const training = healthyTraining()
  training.players[1].managerRelationship = 51
  training.players[1].managerAuthority = 54
  assert.deepEqual(problemsFor(emptyRoom(), training).map((problem) => problem.id), ['relationship:1', 'authority:1'])
  training.players[1].managerRelationship = 39
  training.players[1].managerAuthority = 39
  assert.ok(problemsFor(emptyRoom(), training).every((problem) => problem.severity === 'SEVERE'))
  training.players[1].managerRelationship = 52
  training.players[1].managerAuthority = 55
  assert.deepEqual(problemsFor(emptyRoom(), training), [])
})

test('las deudas reutilizan finanzas: excluyen acuerdos, exentos, compensaciones y jugadores ajenos', () => {
  const training = healthyTraining()
  const fees = { 1: feePlan(), 2: { ...feePlan(), type: 'EXEMPT', seasonTotal: 0 }, 3: feePlan(), 4: { ...feePlan(), type: 'SPECIAL_AGREEMENT' }, 999: feePlan() }
  const compensations = { 3: { playerId: 3, monthlyAmount: 50, funding: 'SPORTS_BUDGET', context: 'Acuerdo existente', visibility: 'COACH_ONLY' } }
  const problems = problemsFor(emptyRoom(), training, fees, compensations)
  assert.equal(problems.length, 1)
  assert.equal(problems[0].id, 'fee:1')
  assert.equal(problems[0].status, 'Pendiente')
  assert.match(problems[0].subject, /octubre/)
  fees[1].missingMonths = []
  assert.deepEqual(problemsFor(emptyRoom(), training, fees, compensations), [])
  fees[1].eligibilityRestriction = { type: 'CLUB_FEE_DEBT', active: true, imposedBy: 'PRESIDENT', reason: 'Restricción del club vigente' }
  const restricted = problemsFor(emptyRoom(), training, fees, compensations)[0]
  assert.equal(restricted.severity, 'SEVERE')
  assert.equal(restricted.status, 'Restricción activa')
  assert.equal(restricted.subject, 'Restricción del club vigente')
})

test('el piloto usa tonos semánticos y comunica niveles aproximados sin revelar el estado exacto', () => {
  for (const [label, tone] of [['Bueno', 'positive'], ['Normal', 'neutral'], ['Aceptada', 'info'], ['Descontento', 'warning'], ['Muy descontento', 'negative'], ['Te cuestiona', 'warning']]) {
    assert.equal(presentation.getManagementStatusTone(label), tone)
  }
  const props = { label: 'Cohesión', value: 'Baja', description: 'Estado actual' }
  const first = render(PlayerUi.CompactIndicator, { ...props, level: 42.3 })
  const second = render(PlayerUi.CompactIndicator, { ...props, level: 44.1 })
  assert.equal(first, second)
  assert.match(first, /management-status-bar is-warning/)
  assert.doesNotMatch(first, /42\.3|44\.1|%/)
  for (const [input, expected] of [[-20, 0], [120, 100], [NaN, 0]]) assert.equal(presentation.getApproximateStatusLevel(input), expected)
})

test('el historial conserva todas las entradas y solo muestra fechas cuando se proporcionan', () => {
  const before = JSON.stringify(roomData.changes)
  const html = render(ChangeHistory, { changes: roomData.changes })
  assert.match(html, /Cambios positivos/)
  assert.match(html, /Cambios negativos/)
  const entries = [...html.matchAll(/<p>(.*?)<\/p>/g)].map((match) => match[1])
  assert.deepEqual(entries.sort(), roomData.changes.map((change) => change.text).sort())
  assert.doesNotMatch(html, /<small>|Hace \d|Últimas \d/)
  assert.equal(JSON.stringify(roomData.changes), before)
  const dated = render(ChangeHistory, { changes: [{ ...roomData.changes[0], dateLabel: 'Fecha disponible' }] })
  assert.match(dated, /<small>Fecha disponible<\/small>/)
})

test('la identidad fija conserva CONTINUAR y retorno al Panel sin barra lateral ni selector de modo', () => {
  const html = render(AppShell, { activeScreen: 'squad', onNavigate() {}, onContinue() {}, dateLabel: '25 agosto', matchday: 0, continueLabel: 'Siguiente actividad' })
  assert.match(html, /app-shell management-theme/)
  assert.doesNotMatch(html, /theme-toggle|Activar modo claro|Activar modo oscuro/)
  assert.match(html, /CONTINUAR/)
  assert.match(html, /aria-label="Volver al Panel del club"/)
  assert.doesNotMatch(html, /class="sidebar"|class="main-nav"/)
})

test('la tabla filtra también por posiciones secundarias y nombres con tildes sin mutar la plantilla', () => {
  const before = JSON.stringify(players)
  const player = players.find(p => p.secondaryPositions.length)
  assert.ok(playerPresentation.filterAndSortSquad(players, player.secondaryPositions[0], '', 'position', game.playerSeasonStats).some(p => p.id === player.id))
  const normalized = player.name.normalize('NFD').replace(/\p{Diacritic}/gu, '')
  assert.equal(playerPresentation.filterAndSortSquad(players, '', normalized, 'name', game.playerSeasonStats)[0].id, player.id)
  assert.equal(playerPresentation.filterAndSortSquad(players, '', 'inexistente', 'name', game.playerSeasonStats).length, 0)
  assert.equal(JSON.stringify(players), before)
})

test('PJ(TIT) y minutos usan la misma competición y no inventan el histórico antiguo', () => {
  const player = players[0]
  const stats = { appearances: 2, starts: 1, goals: 4, ratings: [
    { matchId: 'l1', rating: 7, competitionType: 'LEAGUE', minutesPlayed: 90, started: true },
    { matchId: 'l2', rating: 6, competitionType: 'LEAGUE', minutesPlayed: 18, started: false },
    { matchId: 'f1', rating: 6, competitionType: 'FRIENDLY', minutesPlayed: 90, started: true },
  ] }
  const result = playerPresentation.getSeasonStatsPresentation(player, stats)
  assert.equal(result.played, '2(1)')
  assert.equal(result.minutes, 108)
  assert.equal(playerPresentation.getSeasonStatsPresentation(player, { appearances: 0, goals: 0 }).played, '0(0)')
  const legacy = playerPresentation.getSeasonStatsPresentation(player, { appearances: 13, goals: 0 })
  assert.equal(legacy.played, '13(—)')
  assert.equal(legacy.minutes, undefined)
  assert.equal(playerPresentation.getSeasonLabel('2026-08-25'), 'Temporada 2026/27')
})

test('los estados visibles distinguen lesión, sanción, incidencia y condición sin inferir causas', () => {
  const player = players[0], training = { ...game.training.players[player.id], fitness: 85, fatigue: 0, currentIssue: undefined }
  assert.equal(playerPresentation.getPlayerStatus(player, training).label, 'Disponible')
  assert.equal(playerPresentation.getPlayerStatus(player, { ...training, fitness: 40 }).label, 'Falta de ritmo (cardio)')
  const hangover = { ...training, currentIssue: { type: 'HANGOVER', remainingDays: 1 } }
  assert.equal(playerPresentation.getPlayerStatus(player, hangover).label, 'Con resaca')
  assert.equal(playerPresentation.getPlayerStatus(player, hangover, { injured: true }).label, 'Lesionado')
  assert.equal(playerPresentation.getPlayerStatus(player, training, { eligibility: { status: 'SUSPENDED' } }).label, 'Sancionado')
  assert.equal(playerPresentation.getPlayerStatus(player, training, { eligibility: { status: 'UNAVAILABLE', reason: 'Compromiso laboral' } }).description, 'Compromiso laboral')
  assert.doesNotMatch(JSON.stringify(playerPresentation.getPlayerStatus(player, training)), /sobrepeso|laboral|resaca/)
})

test('el seguimiento prioriza gravedad, evita duplicados y conserva una voz de apoyo real', () => {
  const training = healthyTraining()
  for (const player of Object.values(training.players)) player.lockerRoomInfluence = 'LOW'
  training.players[1].lockerRoomInfluence = 'LEADER'
  const problems = [
    ...players.slice(1).map(player => ({ id: `minor:${player.id}`, playerId: player.id, severity: 'MINOR', subject: 'Revisar situación', status: 'Activo' })),
    { id: 'severe:5', playerId: 5, severity: 'SEVERE', subject: 'Molesto por sus minutos', status: 'Activo' },
    { id: 'outside', playerId: 999, severity: 'SEVERE', subject: 'Ajeno a la plantilla', status: 'Activo' },
  ]
  const before = JSON.stringify({ roomData, training, problems })
  const overview = roomPresentation.getDressingRoomOverview(roomData, training, players, problems)
  assert.equal(overview.watchPlayers.length, 6)
  assert.equal(overview.watchPlayers[0].playerId, 5)
  assert.equal(overview.watchPlayers[0].priority, 'SEVERE')
  assert.equal(new Set(overview.watchPlayers.map(player => player.playerId)).size, 6)
  assert.equal(overview.watchPlayers.at(-1).playerId, 1)
  assert.equal(overview.watchPlayers.at(-1).priority, 'SUPPORT')
  assert.ok(!overview.watchPlayers.some(player => player.playerId === 999))
  assert.equal(overview.hierarchy.reduce((count, group) => count + group.count, 0), players.length)
  assert.equal(overview.hierarchy.find(group => group.influence === 'LEADER').count, 1)
  assert.ok(overview.voices.length <= 3)
  assert.equal(JSON.stringify({ roomData, training, problems }), before)
  assert.deepEqual(roomPresentation.getDressingRoomOverview(roomData, training, players, problems), overview)
  training.players[1].managerAuthority = 30
  const changedProblems = problemsFor(roomData, training)
  const changed = roomPresentation.getDressingRoomOverview(roomData, training, players, changedProblems)
  assert.ok(!changed.watchPlayers.some(player => player.playerId === 1 && player.priority === 'SUPPORT'))
  assert.match(changed.voices.find(voice => voice.playerId === 1).quote, /situación|decisiones/)
})

test('la jerarquía usa la influencia viva y no inventa miembros ni voces en una plantilla vacía', () => {
  const training = healthyTraining()
  const overview = roomPresentation.getDressingRoomOverview(roomData, training, [], [])
  assert.deepEqual(overview.watchPlayers, [])
  assert.deepEqual(overview.voices, [])
  assert.ok(overview.hierarchy.every(group => group.count === 0))
  const roster = players.slice(0, 4)
  ;['LEADER', 'HIGH', 'MEDIUM', 'LOW'].forEach((influence, index) => { training.players[roster[index].id].lockerRoomInfluence = influence })
  assert.deepEqual(roomPresentation.getDressingRoomOverview(roomData, training, roster, []).hierarchy.map(group => group.count), [1, 1, 1, 1])
})

test('Compromisos refleja solo promesas activas reales, conserva su estado y no inventa plazos', () => {
  const promises = [
    { id: 'active', subjectId: String(players[0].id), description: 'Bajar la carga', status: 'active', kind: 'LOWER_TRAINING_LOAD' },
    { id: 'done', subjectId: String(players[1].id), description: 'Ya cumplida', status: 'fulfilled' },
    { id: 'broken', description: 'Incumplida', status: 'broken' },
    { id: 'outside', subjectId: 'president', description: 'Asunto del presidente', status: 'active' },
    { id: 'team', description: 'Pendiente con el grupo', status: 'active' },
  ]
  const before = JSON.stringify(promises)
  const commitments = roomPresentation.getDressingRoomCommitments(promises, players)
  assert.deepEqual(commitments.map(item => item.id), ['active', 'team'])
  assert.equal(commitments[0].deadline, 'En el próximo entrenamiento')
  assert.equal(commitments[1].deadline, 'Pendiente')
  const html = render(DressingRoomScreen, { ...screenProps(), cohesion: 60, morale: 60, promises, onOpenSquad() {} })
  assert.match(html, /Ver plantilla →/)
  assert.match(html, /Bajar la carga/)
  assert.doesNotMatch(html, /Ya cumplida|Incumplida|Asunto del presidente/)
  assert.equal(JSON.stringify(promises), before)
  promises[0].status = 'fulfilled'
  assert.deepEqual(roomPresentation.getDressingRoomCommitments(promises, players).map(item => item.id), ['team'])
})
