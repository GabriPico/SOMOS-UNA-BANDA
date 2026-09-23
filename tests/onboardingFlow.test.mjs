import assert from 'node:assert/strict'
import test, { after, before } from 'node:test'
import { createServer } from 'vite'

let vite, data, onboarding, devScenarios, narrativeScenes, consequences, narrative, assets, narrativeFactories, assistantPersonality
before(async () => {
  vite = await createServer({ server: { middlewareMode: true }, appType: 'custom' })
  ;[data, onboarding, devScenarios, narrativeScenes, consequences, narrative, assets, narrativeFactories, assistantPersonality] = await Promise.all([vite.ssrLoadModule('/src/data/gameState.ts'), vite.ssrLoadModule('/src/domain/onboarding.ts'), vite.ssrLoadModule('/src/dev/devScenarios.ts'), vite.ssrLoadModule('/src/data/narrativeScenes.ts'), vite.ssrLoadModule('/src/domain/consequences.ts'), vite.ssrLoadModule('/src/domain/narrative.ts'), vite.ssrLoadModule('/src/data/narrativeAssets.ts'), vite.ssrLoadModule('/src/data/narrativeSceneFactories.ts'), vite.ssrLoadModule('/src/domain/assistantPersonality.ts')])
})

test('el primer entrenamiento usa la misma capa del segundo en los cuatro arquetipos', () => {
  const ids = ['first-training-youngster', 'first-training-veteran', 'first-training-captain', 'first-training-trusted']
  const voices = ids.map((id) => {
    const scenario = devScenarios.createDevScenario(id, 84731)
    const session = scenario.trainingState.sessions.find((item) => item.id === 'tuesday')
    const assistant = scenario.gameState.staff.members.find((member) => member.role === 'SEGUNDO_ENTRENADOR')
    assert.ok(session?.result?.presentStaffIds?.includes(assistant.id), `${id}: el segundo debe estar presente`)
    const voice = assistantPersonality.createAssistantTrainingVoice(assistant, session, scenario.trainingState, [])
    assert.ok(voice.before && voice.during.length && voice.ending && voice.report)
    return `${voice.before}|${voice.during.join('|')}|${voice.ending}|${voice.report}`
  })
  assert.equal(new Set(voices).size, 4)
  const second = devScenarios.createDevScenario('second-training', 84731)
  assert.ok(second.trainingState.sessions.find((item) => item.id === 'thursday')?.result)
})
after(async () => vite?.close())

test('la nueva partida recorre todos los regresos al Panel antes del primer entrenamiento', () => {
  let state = data.createNewGameState(84731)
  const expected = [
    ['INTRO', 'SECOND_COACH_INTRO'], ['SECOND_COACH_INTRO', 'CLUB_PANEL_INTRO'], ['CLUB_PANEL_INTRO', 'CONTINUE_EXPLANATION'],
    ['CONTINUE_EXPLANATION', 'STAFF_HIGHLIGHT'], ['STAFF_HIGHLIGHT', 'STAFF_TUTORIAL'], ['STAFF_TUTORIAL', 'MESSAGES_HIGHLIGHT'],
    ['MESSAGES_HIGHLIGHT', 'MANOLO_MESSAGE'], ['MANOLO_MESSAGE', 'TEAM_HIGHLIGHT'], ['TEAM_HIGHLIGHT', 'TEAM_TUTORIAL'],
    ['TEAM_TUTORIAL', 'TACTICS_HIGHLIGHT'], ['TACTICS_HIGHLIGHT', 'TACTICS_TUTORIAL'], ['TACTICS_TUTORIAL', 'TRAINING_HIGHLIGHT'],
    ['TRAINING_HIGHLIGHT', 'TRAINING_TUTORIAL'], ['TRAINING_TUTORIAL', 'LOCKER_ROOM_HIGHLIGHT'], ['LOCKER_ROOM_HIGHLIGHT', 'NEXT_MATCH_HIGHLIGHT'],
    ['NEXT_MATCH_HIGHLIGHT', 'LEAGUE_HIGHLIGHT'], ['LEAGUE_HIGHLIGHT', 'MEET_SQUAD'], ['MEET_SQUAD', 'FIRST_TRAINING_TALK'],
    ['FIRST_TRAINING_TALK', 'FIRST_TRAINING_READY'], ['FIRST_TRAINING_READY', 'FIRST_TRAINING'],
  ]
  for (const [milestone, next] of expected) {
    state = onboarding.completeOnboardingMilestone(state, milestone)
    assert.equal(state.onboarding.active, next, `${milestone} debe conducir a ${next}`)
    assert.equal(onboarding.isGuidedTutorialCompleted(state.onboarding), false)
    const required = onboarding.getTutorialNavigationLock(state.onboarding)
    if (required) assert.equal(onboarding.canNavigateDuringTutorial(state.onboarding, 'standings'), false)
  }
  state = onboarding.completeOnboardingMilestone(state, 'FIRST_TRAINING')
  assert.equal(state.onboarding.active, 'FIRST_TRAINING_REPORT')
  assert.equal(onboarding.isGuidedTutorialCompleted(state.onboarding), true)
  assert.equal(onboarding.isOnboardingCompleted(state.onboarding), false, 'La secuencia de pretemporada sigue pendiente')
  assertFreeNavigation(state)
})

function assertFreeNavigation(state) {
  const before = structuredClone(state)
  assert.equal(onboarding.getTutorialNavigationLock(state.onboarding), undefined)
  for (const screen of ['squad', 'staff', 'tactics', 'training', 'inbox', 'dressing-room', 'standings', 'next-match']) {
    assert.equal(onboarding.canNavigateDuringTutorial(state.onboarding, screen), true, screen)
    assert.equal(onboarding.canNavigateDuringTutorial(state.onboarding, 'club-panel'), true)
  }
  assert.deepEqual(state, before, 'Consultar accesos no avanza el tiempo ni ejecuta sesiones')
}

test('los checkpoints posteriores y su hidratación permiten navegar sin consumir el siguiente evento', async () => {
  const flow = await vite.ssrLoadModule('/src/domain/gameFlow.ts')
  for (const id of ['post-training-tuesday', 'before-training-thursday', 'post-training-thursday', 'incident-resolved', 'second-training', 'friendly-call-up', 'team-chat-call-up']) {
    const { gameState } = devScenarios.createDevScenario(id, 84731)
    for (const state of [gameState, { ...gameState, onboarding: onboarding.normalizeOnboardingState(gameState.onboarding) }]) {
      const nextEvent = flow.getNextPendingGameEvent(state)
      assert.equal(onboarding.isGuidedTutorialCompleted(state.onboarding), true, id)
      assertFreeNavigation(state)
      assert.deepEqual(flow.getNextPendingGameEvent(state), nextEvent)
    }
  }
})

test('el informe y el segundo entrenamiento mantienen sus destinos sin bloquear navegación', () => {
  let state = onboarding.completeOnboardingMilestone(data.createNewGameState(84731), 'FIRST_TRAINING')
  assert.deepEqual(onboarding.getOnboardingDestination(state), { kind: 'SCREEN', id: 'inbox' })
  state = onboarding.completeOnboardingMilestone(state, 'FIRST_TRAINING_REPORT')
  assert.deepEqual(onboarding.getOnboardingDestination(state), { kind: 'TIME' })
  assertFreeNavigation(state)
})

test('los destinos del onboarding vuelven al Panel en todos los highlights', () => {
  const state = data.createNewGameState(84731)
  for (const active of ['TRAINING_HIGHLIGHT', 'LOCKER_ROOM_HIGHLIGHT', 'NEXT_MATCH_HIGHLIGHT', 'LEAGUE_HIGHLIGHT']) {
    state.onboarding.active = active
    assert.deepEqual(onboarding.getOnboardingDestination(state), { kind: 'SCREEN', id: 'club-panel' })
  }
  state.onboarding.active = 'MEET_SQUAD'
  assert.deepEqual(onboarding.getOnboardingDestination(state), { kind: 'SCENE', id: 'MEET_SQUAD' })
})

test('completar el onboarding elimina todos los bloqueos de navegación', () => {
  let state = data.createNewGameState(84731)
  state.onboarding.active = 'FIRST_FRIENDLY'
  state = onboarding.completeOnboardingMilestone(state, 'FIRST_FRIENDLY')

  assert.equal(state.onboarding.active, 'COMPLETE')
  assert.equal(onboarding.getTutorialNavigationLock(state.onboarding), undefined)
  for (const screen of ['club-panel', 'squad', 'staff', 'tactics', 'training', 'dressing-room', 'inbox', 'standings', 'next-match']) {
    assert.equal(onboarding.canNavigateDuringTutorial(state.onboarding, screen), true, `${screen} debe quedar accesible`)
  }
})

test('la hidratación limpia estados terminales antiguos del onboarding', () => {
  for (const legacy of [
    { active: 'FREE_PRESEASON', completed: [] },
    { active: 'TEAM_TUTORIAL', completed: ['FIRST_FRIENDLY'] },
  ]) {
    const normalized = onboarding.normalizeOnboardingState(legacy)
    assert.equal(normalized.active, 'COMPLETE')
    assert.equal(normalized.clubPanelTourCompleted, true)
    assert.equal(normalized.trainingTutorialCompleted, true)
    assert.equal(onboarding.getTutorialNavigationLock(normalized), undefined)
  }
})

test('los overrides DEV reconstruyen cada variante sin alterar el inicio del onboarding', () => {
  for (const assistantArchetype of ['CONNECTED_YOUNGSTER', 'CLUB_VETERAN', 'FORMER_CAPTAIN', 'TRUSTED_ASSISTANT']) {
    const withDelegate = data.createNewGameState(84731, { assistantArchetype, delegate: 'PRESENT' })
    assert.equal(withDelegate.assistantArchetype, assistantArchetype)
    assert.equal(withDelegate.staff.members.find((member) => member.role === 'SEGUNDO_ENTRENADOR')?.assistantArchetype, assistantArchetype)
    assert.equal(withDelegate.staff.members.some((member) => member.role === 'DELEGADO'), true)
    assert.equal(withDelegate.completedScenes.length, 0)
    assert.equal(withDelegate.coachName, '')
    assert.equal(withDelegate.onboarding.active, 'SECOND_COACH_INTRO')

    const withoutDelegate = data.createNewGameState(84731, { assistantArchetype, delegate: 'ABSENT' })
    assert.equal(withoutDelegate.staff.members.some((member) => member.role === 'DELEGADO'), false)
  }
})

test('el modo aleatorio conserva exactamente la creación normal', () => {
  assert.deepEqual(data.createNewGameState(123456), data.createNewGameState(123456, { delegate: 'DEFAULT' }))
})

test('cada escenario DEV se reconstruye de forma independiente y conserva su paso narrativo', () => {
  const first = devScenarios.createDevScenario('first-training-talk', 84731)
  first.gameState.consequences.feedbackQueue.push({ id: 'contamination', type: 'WARNING', text: 'No debe persistir', status: 'READY' })
  const rebuilt = devScenarios.createDevScenario('first-training-talk', 84731)
  assert.equal(rebuilt.activeDialogue, 'FIRST_TRAINING_TALK')
  assert.equal(rebuilt.gameState.onboarding.active, 'FIRST_TRAINING_TALK')
  assert.deepEqual(rebuilt.gameState.consequences.feedbackQueue, [])
  assert.deepEqual(rebuilt.gameState.consequences.memories, [])
  assert.deepEqual(rebuilt.gameState.consequences.flags, {})
})

test('los escenarios DEV de onboarding conservan los bloqueos reales y los saltos generales usan bypass', () => {
  assert.equal(devScenarios.usesRealOnboardingFlow('new-game'), true)
  assert.equal(devScenarios.usesRealOnboardingFlow('staff'), true)
  assert.equal(devScenarios.usesRealOnboardingFlow('match-start'), false)
})

test('la presentación de Staff incluye al delegado cuando existe y lo salta cuando no existe', () => {
  const withDelegate = narrativeFactories.createStaffIntroductionScene(data.createNewGameState(84731, { delegate: 'PRESENT' }))
  assert.equal(withDelegate.nodes.opening.next, 'member-0-enter')
  assert.equal(withDelegate.nodes['member-0'].characterId, withDelegate.nodes.opening.characterId)
  assert.equal(withDelegate.nodes['reply-0'].characterId, 'staff-manel')
  assert.equal(withDelegate.nodes['reply-0'].next, 'sito-enter')
  assert.equal(withDelegate.nodes.sito.next, 'physio')

  const withoutDelegate = narrativeFactories.createStaffIntroductionScene(data.createNewGameState(84731, { delegate: 'ABSENT' }))
  assert.equal(withoutDelegate.nodes.opening.next, 'sito-enter')
  assert.equal(withoutDelegate.nodes['member-0'], undefined)
  assert.equal(withoutDelegate.nodes.sito.next, 'physio')
})

test('los escenarios DEV de pantalla conservan su onboarding intermedio sin marcarlo completo', () => {
  const staff = devScenarios.createDevScenario('staff', 84731)
  const training = devScenarios.createDevScenario('training-tutorial', 84731)
  assert.equal(staff.activeScreen, 'club-panel')
  assert.notEqual(staff.gameState.onboarding.active, 'COMPLETE')
  assert.equal(training.activeScreen, 'training')
  assert.equal(training.gameState.onboarding.active, 'TRAINING_TUTORIAL')
})

test('la charla inicial DEV renderiza las cuatro respuestas y aplica feedback inmediato', () => {
  const scenario = devScenarios.createDevScenario('first-training-talk', 84731)
  const scene = narrativeScenes.initialTeamTalkScene
  const node = scene.nodes['initial-choice']
  assert.equal(node.type, 'CHOICE')
  assert.equal(node.choices.length, 4)
  const demanding = node.choices.find((choice) => choice.id === 'earn')
  const consequenceNode = scene.nodes[demanding.next]
  const game = consequences.applyConsequences(scenario.gameState, consequenceNode.consequence)
  assert.equal(game.consequences.feedbackQueue[0].status, 'READY')
  assert.equal(game.consequences.feedbackQueue[0].text, 'El vestuario ha entendido que tomarás las decisiones.')
  assert.equal(game.coachEvidence.at(-1).axis, 'discipline')
  assert.deepEqual(narrative.validateNarrativeScene(scene, new Set(Object.keys(assets.characterAssets)), new Set(Object.keys(assets.backgroundAssets))), [])
})

test('la escena de Manolo valida ramas, consecuencia, memoria, condición y reinicio DEV', () => {
  const first = devScenarios.createDevScenario('narrative-manolo', 84731)
  const scene = narrativeScenes.manoloObjectiveScene
  assert.equal(first.activeNarrativeId, scene.id)
  assert.deepEqual(narrative.validateNarrativeScene(scene, new Set(Object.keys(assets.characterAssets)), new Set(Object.keys(assets.backgroundAssets))), [])
  assert.equal(scene.nodes['objective-choice'].choices.length, 3)
  assert.equal(scene.nodes['manolo-enter'].action, 'ENTER')
  assert.equal(scene.nodes['manolo-exit'].action, 'EXIT')
  assert.equal(scene.nodes['memory-check'].condition.type, 'HAS_MEMORY')

  const initialRelationship = first.gameState.presidentRelationship.relationshipWithManager
  const resolved = consequences.applyConsequences(first.gameState, scene.nodes['consequence-promotion'].consequence)
  assert.ok(resolved.presidentRelationship.relationshipWithManager > initialRelationship)
  assert.equal(consequences.hasMemory(resolved.consequences, 'manolo-escudero', 'MANAGER_SHARED_PROMOTION_AMBITION'), true)
  assert.equal(narrative.evaluateNarrativeCondition(resolved, scene.nodes['memory-check'].condition), true)
  assert.equal(resolved.consequences.feedbackQueue.every((item) => item.status === 'READY'), true)

  const rebuilt = devScenarios.createDevScenario('narrative-manolo', 84731)
  assert.equal(rebuilt.gameState.presidentRelationship.relationshipWithManager, initialRelationship)
  assert.deepEqual(rebuilt.gameState.consequences.memories, [])
  assert.deepEqual(rebuilt.gameState.consequences.flags, {})
  assert.deepEqual(rebuilt.gameState.consequences.feedbackQueue, [])
})

test('el motor reconoce y valida una cadena mínima de nodos automáticos hasta contenido interactivo', () => {
  const scene = {
    id: 'automatic-chain-test', backgroundId: 'LOCKER_ROOM', startNodeId: 'fade', nodes: {
      fade: { id: 'fade', type: 'VISUAL_EFFECT', effect: 'FADE_IN', next: 'wait' },
      wait: { id: 'wait', type: 'WAIT', durationMs: 10, next: 'jump' },
      jump: { id: 'jump', type: 'JUMP', target: 'narration' },
      narration: { id: 'narration', type: 'NARRATION', text: 'Prueba de narración.', next: 'choice' },
      choice: { id: 'choice', type: 'CHOICE', prompt: 'Elige', choices: [{ id: 'a', text: 'Opción A', next: 'end' }, { id: 'b', text: 'Opción B', next: 'end' }] },
      end: { id: 'end', type: 'END', result: { destination: 'CLUB_PANEL' } },
    },
  }
  assert.deepEqual(narrative.validateNarrativeScene(scene, new Set(Object.keys(assets.characterAssets)), new Set(Object.keys(assets.backgroundAssets))), [])
  assert.equal(narrative.isAutomaticNarrativeNode(scene.nodes.fade), true)
  assert.equal(narrative.isAutomaticNarrativeNode(scene.nodes.wait), true)
  assert.equal(narrative.isAutomaticNarrativeNode(scene.nodes.jump), true)
  assert.equal(narrative.isAutomaticNarrativeNode(scene.nodes.narration), false)
  assert.equal(narrative.isAutomaticNarrativeNode(scene.nodes.choice), false)
  assert.equal(narrative.isAutomaticNarrativeNode(scene.nodes.end), true)
})

test('todos los efectos visuales MVP tienen una duración controlada por el motor', () => {
  for (const effect of ['FADE_IN', 'FADE_OUT', 'FLASH', 'SHAKE_SMALL', 'SHAKE_MEDIUM', 'SHAKE_STRONG', 'ZOOM_IN', 'ZOOM_OUT']) {
    assert.equal(Number.isFinite(narrative.NARRATIVE_EFFECT_DURATION_MS[effect]), true, effect)
    assert.equal(narrative.NARRATIVE_EFFECT_DURATION_MS[effect] > 0, true, effect)
  }
  assert.equal(narrative.NARRATIVE_VISUAL_EFFECT_WATCHDOG_GRACE_MS, 500)
})

test('la validación DEV informa los prerrequisitos ausentes', () => {
  const scenario = devScenarios.createDevScenario('first-training-talk', 84731)
  scenario.activeDialogue = undefined
  scenario.gameState.consequences = undefined
  assert.deepEqual(devScenarios.validateDevScenario(scenario, 'first-training-talk'), ['consequences', 'activeDialogue.FIRST_TRAINING_TALK'])
})
