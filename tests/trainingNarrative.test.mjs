import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import { createServer } from 'vite'

let vite, data, mock, resolver, factories, narrative, assets, consequences
before(async () => {
  vite = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom', logLevel: 'silent' })
  ;[data, mock, resolver, factories, narrative, assets, consequences] = await Promise.all([
    vite.ssrLoadModule('/src/data/gameState.ts'),
    vite.ssrLoadModule('/src/data/mockData.ts'),
    vite.ssrLoadModule('/src/domain/trainingSessionResolver.ts'),
    vite.ssrLoadModule('/src/data/narrativeSceneFactories.ts'),
    vite.ssrLoadModule('/src/domain/narrative.ts'),
    vite.ssrLoadModule('/src/data/narrativeAssets.ts'),
    vite.ssrLoadModule('/src/domain/consequences.ts'),
  ])
})
after(async () => vite?.close())

function resolveSession(archetype, intensity, week, sessionId, withAssistant = true) {
  const game = data.createNewGameState(84731, { assistantArchetype: archetype })
  game.training.week = week
  const planned = game.training.sessions.find((session) => session.id === sessionId)
  planned.intensity = intensity
  planned.blocks = ['Físico', 'Ataque posicional']
  planned.planningStatus = 'PLANNED'
  planned.availableStaffIds = withAssistant ? [game.staff.members.find((member) => member.role === 'SEGUNDO_ENTRENADOR').id] : []
  game.training = resolver.resolveTrainingSession(game.training, sessionId, game.tacticalPlan, mock.players, game.staff.members)
  return { game, session: game.training.sessions.find((session) => session.id === sessionId) }
}

function validateScene(scene) {
  assert.deepEqual(narrative.validateNarrativeScene(scene, new Set(Object.keys(assets.characterAssets)), new Set(Object.keys(assets.backgroundAssets))), [])
}

function playPresentation(scene, game) {
  validateScene(scene)
  const visited = new Set()
  let node = scene.nodes[scene.startNodeId]
  let state = game
  while (node.type !== 'END') {
    assert.ok(!visited.has(node.id), `Ciclo en ${node.id}`)
    visited.add(node.id)
    assert.notEqual(node.type, 'CHOICE', `Interrupción rutinaria en ${scene.id}: ${node.id}`)
    if (node.type === 'CONSEQUENCE') state = consequences.applyConsequences(state, node.consequence)
    assert.ok(node.next && scene.nodes[node.next], `Salto huérfano en ${node.id}`)
    node = scene.nodes[node.next]
  }
  visited.add(node.id)
  assert.equal(visited.size, Object.keys(scene.nodes).length, 'No deben quedar nodos huérfanos')
  assert.equal(node.result.destination, 'TRAINING_PRESENTATION_COMPLETE')
  return state
}

test('la presentación conserva la intensidad planificada y llega al cierre sin decisiones rutinarias, con o sin segundo', () => {
  for (const archetype of ['CONNECTED_YOUNGSTER', 'CLUB_VETERAN', 'FORMER_CAPTAIN', 'TRUSTED_ASSISTANT', null]) {
    for (const intensity of ['Baja', 'Media', 'Alta']) {
      for (const [week, sessionId] of [[1, 'tuesday'], [1, 'thursday'], [3, 'tuesday']]) {
        const { game, session } = resolveSession(archetype ?? 'TRUSTED_ASSISTANT', intensity, week, sessionId, archetype !== null)
        const before = structuredClone(game)
        const scene = factories.createTrainingPresentationScene(game, session, mock.players, game.staff.members)
        assert.match(scene.nodes['block-one'].text, new RegExp(`La intensidad es ${intensity.toLowerCase()}`))
        const after = playPresentation(scene, game)
        assert.deepEqual(after, before, 'El relato no debe corregir cansancio, resultados ni relación con el segundo')
        assert.equal(session.intensity, intensity)
        assert.equal(resolver.resolveTrainingSession(after.training, sessionId, game.tacticalPlan, mock.players, game.staff.members), after.training)
      }
    }
  }
})

test('una sesión exigente sin incidencias continúa directamente desde las observaciones hasta el resumen', () => {
  const { game, session } = resolveSession('FORMER_CAPTAIN', 'Media', 2, 'thursday')
  session.result.events = []
  assert.ok(session.result.appliedEffects.teamFatigueDelta >= 8, 'Debe cubrir el antiguo disparador por cansancio sin intensidad Alta')
  const scene = factories.createTrainingPresentationScene(game, session, mock.players, game.staff.members)
  playPresentation(scene, game)
  assert.equal(scene.nodes['during-two'].next, 'incidents')
  assert.equal(scene.nodes.incidents.next, 'summary')
})

test('las incidencias concretas del veterano y del gracioso conservan sus elecciones, consecuencias y salida', () => {
  const { game, session } = resolveSession('FORMER_CAPTAIN', 'Alta', 1, 'tuesday')
  const scenes = [
    factories.createVeteranComplaintNarrativeScene(game, mock.players, session),
    factories.createLockerRoomJokerNarrativeScene(game, mock.players),
  ]
  for (const scene of scenes) {
    validateScene(scene)
    const visited = new Set()
    function visit(id, state) {
      visited.add(id)
      const node = scene.nodes[id]
      if (node.type === 'END') {
        assert.equal(node.result.destination, 'TRAINING_INCIDENT_COMPLETE')
        assert.ok(state.consequences.decisionLog.length > game.consequences.decisionLog.length)
        assert.deepEqual(state.training.sessions, game.training.sessions, 'La incidencia no reescribe una sesión completada')
        return
      }
      if (node.type === 'CHOICE') node.choices.forEach((choice) => visit(choice.next, state))
      else visit(node.next, node.type === 'CONSEQUENCE' ? consequences.applyConsequences(state, node.consequence) : state)
    }
    assert.ok(Object.values(scene.nodes).some((node) => node.type === 'CHOICE'))
    visit(scene.startNodeId, game)
    assert.equal(visited.size, Object.keys(scene.nodes).length)
  }
})
