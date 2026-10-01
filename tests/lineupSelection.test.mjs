import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import { createServer } from 'vite'

let vite
let data
let lineup
let tactics
let positions
let trainingEngine
let assistantLineup
let staffData
let trainingPresentation
let physicalIssues

before(async () => {
  vite = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'silent' })
  data = await vite.ssrLoadModule('/src/data/mockData.ts')
  lineup = await vite.ssrLoadModule('/src/domain/lineupSelection.ts')
  tactics = await vite.ssrLoadModule('/src/domain/matchTactics.ts')
  positions = await vite.ssrLoadModule('/src/domain/positionFamiliarity.ts')
  trainingEngine = await vite.ssrLoadModule('/src/domain/trainingEngine.ts')
  assistantLineup = await vite.ssrLoadModule('/src/domain/assistantLineup.ts')
  staffData = await vite.ssrLoadModule('/src/data/staffData.ts')
  trainingPresentation = await vite.ssrLoadModule('/src/domain/trainingPresentation.ts')
  physicalIssues = await vite.ssrLoadModule('/src/domain/physicalIssues.ts')
})

after(async () => vite?.close())

const familiarityFor = (formation, ids) => tactics.FORMATION_SLOTS[formation].map((position, index) => {
  const player = data.players.find((item) => item.id === ids[index])
  return positions.getPositionFamiliarity(player, position)
})

test('el XI inicial 4-4-2 no improvisa jugadores si existe una solución natural', () => {
  const ids = lineup.selectLineupForFormation(data.players, '4-4-2')
  assert.equal(ids.length, 11)
  assert.equal(new Set(ids).size, 11)
  assert.deepEqual(familiarityFor('4-4-2', ids), Array(11).fill('PREFERRED'))
})

test('la propuesta del segundo reconstruye un 5-4-1 natural para la formación activa', () => {
  const training = trainingEngine.createInitialTrainingState(data.players, 84731)
  const assistant = staffData.createInitialStaffState(84731).members.find((member) => member.role === 'SEGUNDO_ENTRENADOR')
  assert.ok(assistant)
  const plan = { ...data.initialTacticalPlan, formation: '5-4-1' }
  const proposal = assistantLineup.createAssistantLineupProposal(assistant, data.players, training, plan, 84731, true)
  assert.equal(proposal.plan.formation, '5-4-1')
  assert.deepEqual(familiarityFor('5-4-1', proposal.lineupIds), Array(11).fill('PREFERRED'))
})

test('el resumen de Toni omite formación e instrucciones cuando no cambian', () => {
  const current = lineup.selectLineupForFormation(data.players, '4-4-2')
  const plan = data.initialTacticalPlan
  const identical = assistantLineup.summarizeAssistantLineupProposal(
    { assistantName: 'Toni Casals', plan, lineupIds: current, reasons: [] }, plan, current, data.players,
  )
  assert.equal(identical.hasChanges, false)
  assert.equal(identical.formationChange, undefined)
  assert.deepEqual(identical.affectedSlots, [])

  const replacement = data.players.find(player => !current.includes(player.id))
  assert.ok(replacement)
  const proposedIds = [...current]
  proposedIds[1] = replacement.id
  ;[proposedIds[5], proposedIds[6]] = [proposedIds[6], proposedIds[5]]
  const changed = assistantLineup.summarizeAssistantLineupProposal(
    { assistantName: 'Toni Casals', plan: { ...plan, passingStyle: 'Directo' }, lineupIds: proposedIds, reasons: [] },
    plan, current, data.players,
  )
  assert.equal(changed.formationChange, undefined)
  assert.deepEqual(changed.entering.map(player => player.playerId), [replacement.id])
  assert.deepEqual(changed.leaving.map(player => player.playerId), [current[1]])
  assert.deepEqual(changed.affectedSlots, [1, 5, 6])
  assert.deepEqual(changed.instructionChanges, [{ label: 'Pase', from: plan.passingStyle, to: 'Directo' }])
  assert.equal(changed.positionChanges.length, 2)
})

test('el resumen señala la formación solo cuando Toni la cambia', () => {
  const current = lineup.selectLineupForFormation(data.players, '4-4-2')
  const plan = data.initialTacticalPlan
  const summary = assistantLineup.summarizeAssistantLineupProposal(
    { assistantName: 'Toni Casals', plan: { ...plan, formation: '4-3-3' }, lineupIds: current, reasons: [] },
    plan, current, data.players,
  )
  assert.deepEqual(summary.formationChange, { from: '4-4-2', to: '4-3-3' })
  assert.equal(summary.entering.length, 0)
  assert.equal(summary.leaving.length, 0)
  assert.ok(summary.affectedSlots.length > 0)
  assert.ok(summary.positionChanges.some(player => !player.samePosition))
})

test('la compatibilidad gana frente a una ventaja deportiva de un jugador improvisado', () => {
  const ids = lineup.selectLineupForFormation(data.players, '4-4-2', (player, position) => {
    const familiarity = positions.getPositionFamiliarity(player, position)
    return familiarity === 'IMPROVISED' ? 10_000 : 0
  })
  assert.ok(familiarityFor('4-4-2', ids).every((value) => value !== 'IMPROVISED'))
})

test('la pretemporada empieza fresca pero con condición física variable', () => {
  const state = trainingEngine.createInitialTrainingState(data.players, 84731)
  const physical = Object.values(state.players)
  assert.ok(physical.every((player) => player.fatigue < 30))
  assert.ok(physical.some((player) => player.fitness < 55))
  assert.ok(physical.some((player) => player.fitness >= 55))
  assert.ok(physical.filter((player) => player.currentIssue).length <= 2)
})

test('condición, fatiga e incidencia son estados independientes y visibles', () => {
  const state = trainingEngine.createInitialTrainingState(data.players, 84731)
  const player = structuredClone(Object.values(state.players)[0])
  player.fitness = 48
  player.fatigue = 5
  player.currentIssue = { type: 'POOR_SLEEP', remainingDays: 1, startedAt: '2026-08-25T18:00:00' }
  const presentation = trainingPresentation.getTacticalHumanLabels(player)
  assert.equal(presentation.condition, 'Condición baja')
  assert.equal(presentation.fatigue, 'Fresco')
  assert.equal(presentation.issue, 'Ha dormido poco')
})

test('la serialización conserva condición, fatiga, incidencia y duración', () => {
  const state = trainingEngine.createInitialTrainingState(data.players, 84731)
  const player = Object.values(state.players)[0]
  player.currentIssue = { type: 'MUSCLE_DISCOMFORT', remainingDays: 4, startedAt: '2026-08-25T18:00:00' }
  const restored = JSON.parse(JSON.stringify(state))
  assert.equal(restored.players[player.playerId].fitness, player.fitness)
  assert.equal(restored.players[player.playerId].fatigue, player.fatigue)
  assert.deepEqual(restored.players[player.playerId].currentIssue, player.currentIssue)
})

test('una incidencia reduce atributos efectivos sin modificar los atributos base', () => {
  const state = trainingEngine.createInitialTrainingState(data.players, 84731)
  const player = Object.values(state.players)[0]
  player.fitness = 85
  player.fatigue = 0
  player.currentIssue = { type: 'POOR_SLEEP', remainingDays: 1, startedAt: '2026-08-25T18:00:00' }
  const baseBefore = structuredClone(player.baseAttributes)
  const effective = trainingEngine.getEffectiveMatchAttributes(player)
  assert.ok(effective.mentalidad < player.baseAttributes.mentalidad)
  assert.deepEqual(player.baseAttributes, baseBefore)
})

test('el avance de días reduce la duración y resuelve la incidencia', () => {
  const state = trainingEngine.createInitialTrainingState(data.players, 84731)
  const player = Object.values(state.players)[0]
  player.currentIssue = { type: 'SORENESS', remainingDays: 2, startedAt: '2026-08-25T18:00:00' }
  const afterOneDay = physicalIssues.advancePhysicalIssues(state.players, '2026-08-25T18:00:00', '2026-08-26T18:00:00')
  assert.equal(afterOneDay[player.playerId].currentIssue.remainingDays, 1)
  const resolved = physicalIssues.advancePhysicalIssues(afterOneDay, '2026-08-26T18:00:00', '2026-08-27T18:00:00')
  assert.equal(resolved[player.playerId].currentIssue, undefined)
})
