import assert from 'node:assert/strict'
import { before, after, test } from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'

let vite, players, game, presentation, workspace, card, screen, lineup, plan, StarRating, lineupOperations, PlayerDetail, rankTacticalSubstitutes
before(async () => {
  vite = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom', logLevel: 'silent' })
  ;({ players } = await vite.ssrLoadModule('/src/data/mockData.ts'))
  const { createNewGameState } = await vite.ssrLoadModule('/src/data/gameState.ts')
  game = createNewGameState(84731)
  presentation = await vite.ssrLoadModule('/src/presentation/tacticalPlayerPresentation.ts')
  workspace = await vite.ssrLoadModule('/src/components/TacticalWorkspace.tsx')
  lineupOperations = await vite.ssrLoadModule('/src/domain/tacticalLineup.ts')
  ;({ rankTacticalSubstitutes } = await vite.ssrLoadModule('/src/domain/tacticalSubstitutions.ts'))
  ;({ PlayerDetail } = await vite.ssrLoadModule('/src/components/PlayerDetail.tsx'))
  ;({ TacticalPlayerCard: card } = await vite.ssrLoadModule('/src/components/TacticalPlayerCard.tsx'))
  ;({ StarRating } = await vite.ssrLoadModule('/src/components/StarRating.tsx'))
  ;({ TacticsScreen: screen } = await vite.ssrLoadModule('/src/screens/TacticsScreen.tsx'))
  const { selectLineupForFormation } = await vite.ssrLoadModule('/src/domain/lineupSelection.ts')
  plan = game.tacticalPlan
  lineup = selectLineupForFormation(players, plan.formation)
})
after(async () => vite?.close())
const render = (component, props) => renderToStaticMarkup(createElement(component, props))

test('condición y stamina cambian de forma independiente sin alterar al jugador', () => {
  const player = players[0], training = game.training.players[player.id]
  const before = JSON.stringify(training)
  const freshUnfit = presentation.getTacticalCardIndicators(player, { ...training, fitness: 35, fatigue: 5 })
  const tiredFit = presentation.getTacticalCardIndicators(player, { ...training, fitness: 90, fatigue: 90 })
  assert.equal(freshUnfit.condition.tone, 'negative')
  assert.equal(freshUnfit.stamina.tone, 'positive')
  assert.equal(tiredFit.condition.tone, 'positive')
  assert.equal(tiredFit.stamina.tone, 'negative')
  assert.equal(tiredFit.stamina.level, 10)
  assert.equal(presentation.getTacticalCardIndicators(player).stamina, undefined)
  assert.equal(JSON.stringify(training), before)
})

test('molestias, lesión, sanción y expulsión no se confunden', () => {
  const player = players[0], training = { ...game.training.players[player.id], currentIssue: { type: 'MUSCLE_DISCOMFORT', remainingDays: 3, startedAt: '2026-08-25' } }
  assert.equal(presentation.getTacticalCardIndicators(player, training).special.icon, '🩹')
  assert.equal(presentation.getTacticalCardIndicators(player, training, { injured: true }).special.icon, '🤕')
  assert.equal(presentation.getTacticalCardIndicators(player, training, { redCard: true }).special.icon, '🟥')
  const suspended = presentation.getTacticalCardIndicators(player, training, { eligibility: { eligible: false, status: 'SUSPENDED', reason: 'Sancionado' } })
  assert.equal(suspended.special.label, 'Sancionado')
  assert.notEqual(suspended.special.icon, '🟥')
})

test('el banquillo contiene solo convocados fuera del once y se actualiza al intercambiar', () => {
  const extra = players.filter(player => !lineup.includes(player.id)).slice(0, 4)
  const calledUpIds = [...lineup, ...extra.map(player => player.id)]
  const squad = presentation.getTacticsSquad(players, lineup, calledUpIds)
  assert.deepEqual(squad.bench.map(player => player.id), extra.map(player => player.id))
  assert.deepEqual(squad.candidates.map(player => player.id), players.filter(player => !calledUpIds.includes(player.id)).map(player => player.id))
  const next = [...lineup]; next[1] = extra[0].id
  const after = presentation.getTacticsSquad(players, next, calledUpIds)
  assert.ok(after.bench.some(player => player.id === lineup[1]))
  assert.ok(!after.bench.some(player => player.id === extra[0].id))
  const unannounced = presentation.getTacticsSquad(players, lineup)
  assert.deepEqual(unannounced.bench, [])
  assert.equal(unannounced.candidates.length, players.length - 11)
})

test('un puesto sin jugador no desplaza los puestos restantes del once', () => {
  const ids = [...lineup]; ids[3] = -1
  const squad = presentation.getTacticsSquad(players, ids)
  assert.equal(squad.starters[3], undefined)
  assert.equal(squad.starters[4].id, lineup[4])
})

test('los cuatro grupos conservan exactamente las diez instrucciones y opciones del workspace', () => {
  const grouped = render(workspace.TacticalInstructions, { plan, onChange() {}, grouped: true })
  const standard = render(workspace.TacticalInstructions, { plan, onChange() {} })
  assert.equal((grouped.match(/class="tactical-instruction-card[ "]/g) ?? []).length, 4)
  const selects = html => [...html.matchAll(/<select[^>]*data-instruction="([^"]+)"[^>]*>(.*?)<\/select>/g)].map(([, key, options]) => [key, options]).sort(([a], [b]) => a.localeCompare(b))
  assert.equal(selects(grouped).length, 10)
  assert.deepEqual(selects(grouped), selects(standard))
  assert.match(grouped, /Ajustes generales/)
  assert.match(grouped, /En transición/)
  assert.equal((grouped.match(/aria-expanded="false"/g) ?? []).length, 3)
  assert.equal((grouped.match(/>CAMBIAR</g) ?? []).length, 3)
})

test('familiaridad cualitativa y propuesta se integran en instrucciones sin cambiar el plan', () => {
  const before = JSON.stringify(plan)
  const html = render(workspace.TacticalInstructions, { plan, grouped: true, familiarity: 72, assistant: createElement('button', null, 'Propuesta del segundo'), onChange() {} })
  assert.match(html, /aria-label="Familiaridad táctica"/)
  assert.match(html, /value="70" aria-label="Familiaridad táctica" aria-valuetext="Alta"/)
  assert.ok(html.indexOf('Familiaridad táctica') < html.indexOf('Con balón'))
  assert.ok(html.indexOf('Propuesta del segundo') < html.indexOf('</aside>'))
  assert.equal(JSON.stringify(plan), before)
})

test('la tarjeta permite seleccionar a un suplente no disponible, pero no arrastrarlo', () => {
  const player = players[0]
  const html = render(card, {
    player: { ...player, positions: 'POR', unavailable: true, cardIndicators: presentation.getTacticalCardIndicators(player, game.training.players[player.id], { injured: true }) },
    source: { group: 'reserve', playerId: player.id }, onSelect() {},
  })
  assert.doesNotMatch(html, /class="tactical-card-select"[^>]*disabled=""/)
  assert.match(html, /data-drag-disabled="true"/)
  assert.doesNotMatch(html, /class="tactical-card-(name|portrait)"[^>]*disabled/)
  assert.match(html, /aria-label="Condición física:/)
  assert.match(html, /aria-label="Stamina:/)
  assert.match(html, /aria-label="Lesionado"/)
  assert.doesNotMatch(html, /aria-valuenow|title="[^"]*\d+%|aria-label="[^"]*\d+%/)
  assert.doesNotMatch(html, /<button[^>]*>(?:(?!<\/button>)[\s\S])*<button/)
})

test('la ficha compacta reutiliza calidad, rol y personalidad sin abrir el modal ni mostrar atributos', () => {
  const player = players[5], trainingState = { ...game.training.players[player.id], personality: 'Profesional' }
  const html = render(PlayerDetail, { player, trainingState, variant: 'summary', cardIndicators: presentation.getTacticalCardIndicators(player, trainingState), onOpenFull() {}, onClose() {} })
  assert.match(html, /Jugador seleccionado/)
  assert.match(html, /VER FICHA COMPLETA/)
  assert.match(html, /Profesional/)
  assert.match(html, /Calidad general/)
  assert.match(html, /Deseleccionar jugador/)
  assert.match(html, /Posiciones naturales/)
  assert.doesNotMatch(html, /role="dialog"|attribute-groups/)
})

test('el aviso posicional conserva la diferencia entre principal, secundaria, compatible e improvisada', () => {
  const player = { primaryPosition: 'MC', secondaryPositions: ['MCD'] }
  assert.equal(presentation.getTacticalPositionFit(player, 'MC').tone, 'primary')
  assert.equal(presentation.getTacticalPositionFit(player, 'MCD').tone, 'secondary')
  assert.equal(presentation.getTacticalPositionFit(player, 'MP').tone, 'compatible')
  assert.equal(presentation.getTacticalPositionFit(player, 'DC').tone, 'warning')
})

test('vista previa y movimiento respetan convocatoria, elegibilidad y portero sin bloquear puestos improvisados', () => {
  const { moveAvailableLineupPlayer, getLineupSource } = lineupOperations
  const slots = ['POR', 'LD', 'DFC', 'DFC', 'LI', 'MC', 'MC', 'MD', 'DC', 'MI', 'DC']
  const source = { group: 'field', slot: 1 }, target = { group: 'field', slot: 8 }
  const before = [...lineup]
  const swapped = moveAvailableLineupPlayer(lineup, source, target, slots, players)
  assert.equal(swapped.error, undefined)
  assert.equal(swapped.lineupIds[8], lineup[1])
  assert.deepEqual(getLineupSource(lineup[1], swapped.lineupIds), target)
  const noKeeper = moveAvailableLineupPlayer(lineup, source, { group: 'field', slot: 0 }, slots, players)
  assert.match(noKeeper.error, /portero natural/)
  const reserve = players.find(player => !lineup.includes(player.id))
  const fromBench = { group: 'reserve', playerId: reserve.id }
  const unavailable = moveAvailableLineupPlayer(lineup, fromBench, source, slots, players, { [reserve.id]: { eligible: false, reason: 'Sancionado' } })
  assert.equal(unavailable.error, 'Sancionado')
  const notCalled = moveAvailableLineupPlayer(lineup, fromBench, source, slots, players.filter(player => lineup.includes(player.id)))
  assert.ok(notCalled.error)
  const replaced = moveAvailableLineupPlayer(lineup, source, fromBench, slots, players)
  assert.equal(replaced.lineupIds[1], reserve.id)
  assert.deepEqual(lineup, before)
})

test('Tácticas muestra los once titulares en dos columnas del archivador sin paginarlos', () => {
  const calledUp = [...lineup, ...players.filter(player => !lineup.includes(player.id)).slice(0, 5).map(player => player.id)]
  const html = render(screen, { tacticalPlan: plan, lineupIds: lineup, trainingState: game.training, selectablePlayerIds: calledUp, staffMembers: game.staff.members, onBack() {}, onTacticalPlanChange() {}, onLineupChange() {} })
  assert.equal((html.match(/data-player-id=/g) ?? []).length, 11 + 11)
  assert.equal((html.match(/data-slot=/g) ?? []).length, 11 + 11)
  assert.equal((html.match(/class="tactics-binder-pocket"/g) ?? []).length, 11)
  assert.match(html, /tactics-binder-pocket--spare/)
  assert.match(html, /VER PROPUESTA/)
  assert.match(html, /Suplentes/)
  assert.match(html, /Archivador de alineación/)
  assert.doesNotMatch(html, /Página 1 de 2/)
  assert.match(html, /No convocados/)
  assert.doesNotMatch(html, /player-detail--inline|role="dialog"|tactics-selected-player|tactics-bench-section/)
  for (const omitted of players.filter(player => !calledUp.includes(player.id))) assert.ok(!html.includes(`data-player-id="${omitted.id}"`))
})

test('las sugerencias priorizan adecuación y condición con motivos derivados del jugador', () => {
  const natural = players.find(player => player.primaryPosition === 'DC')
  const improvised = players.find(player => player.primaryPosition !== 'DC' && !player.secondaryPositions.includes('DC'))
  const training = {
    [natural.id]: { ...game.training.players[natural.id], fitness: 55 },
    [improvised.id]: { ...game.training.players[improvised.id], fitness: 95 },
  }
  const ranked = rankTacticalSubstitutes([improvised, natural], 'DC', training)
  assert.equal(ranked[0].player.id, natural.id)
  assert.match(ranked[0].reason, /Posición habitual · condición/)
  assert.deepEqual(rankTacticalSubstitutes([natural, improvised], 'DC', training).map(item => item.player.id), ranked.map(item => item.player.id))
})

test('las filas usan Calidad General y reflejan la misma selección del campo', () => {
  const player = { ...players[0], positions: 'POR', generalRating: 42, rating: 99, cardIndicators: presentation.getTacticalCardIndicators(players[0], game.training.players[players[0].id]) }
  const props = { player, source: { group: 'field', slot: 0 }, selected: true, onSelect() {}, onOpenPlayer() {} }
  const row = render(card, { ...props, variant: 'row', rowLabel: 'POR' })
  const pitch = render(card, props)
  assert.match(row, /lineup-player-row is-selected/)
  assert.match(pitch, /tactical-player-card--field is-selected/)
  assert.ok(row.includes(render(StarRating, { value: player.generalRating })))
  assert.ok(!row.includes(render(StarRating, { value: player.rating })))
})
