import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import { createServer } from 'vite'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

let vite, dev, mock, talk, context, factory, narrative, consequences, flow, preparation, engine, duels, migration, screen, topics, player, presentation, dressing
before(async () => {
  vite = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom', logLevel: 'silent' })
  ;[dev, mock, talk, context, factory, narrative, consequences, flow, preparation, engine, duels, migration, screen, topics, player, presentation, dressing] = await Promise.all([
    '/src/dev/preMatchTalkScenarios.ts', '/src/data/mockData.ts', '/src/domain/preMatchTalk.ts', '/src/domain/preMatchTalkContext.ts',
    '/src/data/preMatchTalkScene.ts', '/src/domain/narrative.ts', '/src/domain/consequences.ts', '/src/domain/preMatchFlow.ts',
    '/src/domain/preMatch.ts', '/src/domain/matchEngine.ts', '/src/domain/matchDuels.ts', '/src/domain/gameStateMigration.ts',
    '/src/screens/PreMatchScreen.tsx', '/src/domain/preMatchTalkTopics.ts', '/src/components/NarrativePlayer.tsx',
    '/src/data/preMatchTalkPresentation.ts', '/src/data/dressingRoomData.ts',
  ].map((path) => vite.ssrLoadModule(path)))
})
after(async () => vite?.close())
const sources = () => ({ teams: mock.leagueTeams, profiles: mock.rivalTeamProfiles, players: mock.players, rivalPlayers: mock.rivalPlayers, sanctions: mock.leagueSanctions, dressingRoomPlayers: dressing.initialDressingRoomState.players })
function fixture(id, seed = 84731) {
  const state = dev.buildPrematchScenario(id, seed)
  const matchId = state.gameState.temporal.activeCheckpoint.relatedId
  return { ...state, game: state.gameState, matchId, talk: state.gameState.preMatchPreparations[matchId].talk }
}
const sceneFor = (f) => factory.createPrematchTalkScene(f.talk.context)
const apply = (f, scene, id, game = f.game) => consequences.applyConsequences(game, scene.nodes[`${id}-effect`].consequence)
const menu = (scene, game) => narrative.getNarrativeChoices(scene.nodes['plan-choice'], game)
const spokenPlans = (state) => state.beats.filter((beat) => beat.mentions?.includes('plan') && beat.id !== 'plan-skip')

test('todos los escenarios recorren rutas cortas y largas con seed, sin iniciar el partido antes de salir', () => {
  for (const seed of [84731, 1, 4294967295]) for (const id of Object.keys(dev.PREMATCH_SCENARIO_LABELS)) {
    const f = fixture(id, seed), scene = sceneFor(f)
    assert.deepEqual(f.game, fixture(id, seed).game, `${id}: seed`)
    assert.deepEqual(narrative.validateNarrativeScene(scene, new Set(), new Set(['LOCKER_ROOM'])), [], id)
    for (const route of ['EARLY', 'SHORT', 'LONG']) {
      const game = dev.rehearsePrematchTalk(f.game, f.matchId, route)
      assert.equal(game.activeMatch, undefined, `${id}: partido prematuro`)
      assert.equal(game.temporal.currentDateTime, f.game.temporal.currentDateTime)
      assert.equal(game.narrativeRuntimes[scene.id].currentNodeId, 'end', id)
      assert.equal(scene.nodes.end.autoComplete, true)
      assert.equal(flow.startPreparedMatch(game, f.matchId, sources()), game)
      const started = flow.startPreparedMatch(talk.completePrematchTalk(game, f.matchId), f.matchId, sources())
      assert.equal(started.activeMatch?.phase, 'FIRST_HALF', `${id}: salida`)
      assert.equal(started.activeMatch.minute, 0)
      assert.equal(started.activeMatch.events.filter((event) => event.kind === 'KICK_OFF').length, 1)
      assert.equal(flow.startPreparedMatch(started, f.matchId, sources()), started)
      assert.deepEqual(game.training, f.game.training)
    }
  }
})

test('narración neutral seguida de una elección: ningún discurso del míster se decide automáticamente', () => {
  for (const id of Object.keys(dev.PREMATCH_SCENARIO_LABELS)) {
    const f = fixture(id), scene = sceneFor(f)
    assert.equal(scene.nodes.opening.type, 'NARRATION')
    assert.equal(scene.nodes.opening.next, 'context-choice')
    assert.equal(scene.nodes['context-choice'].prompt, '¿Qué quieres transmitirles sobre el partido?')
    for (const node of Object.values(scene.nodes)) {
      if (node.type === 'DIALOGUE') assert.notEqual(node.characterId, f.talk.context.coachId, `${id}: diálogo del entrenador`)
      if (node.type === 'CHARACTER_ACTION') assert.notEqual(node.characterId, f.talk.context.coachId)
      if (node.type === 'CHOICE') for (const choice of node.choices) {
        assert.doesNotMatch(choice.text, /^(Quiero|Hoy quiero|Salid|Confío|No quiero|Explícame)/)
        const next = scene.nodes[choice.next]
        const result = next.type === 'CONSEQUENCE' ? scene.nodes[next.next] : next
        if (result.type === 'NARRATION') assert.notEqual(result.text, choice.text)
      }
    }
  }
})

test('el primer amistoso permite dar significados distintos al partido y nunca presupone un sistema habitual', () => {
  const f = fixture('talk-first-friendly'), scene = sceneFor(f)
  assert.equal(f.talk.context.formationUse, 'FIRST')
  assert.equal(f.talk.context.habitualFormation, undefined)
  assert.equal(f.talk.context.previousPlan, undefined)
  assert.deepEqual(scene.nodes['context-choice'].choices.map((choice) => choice.id), ['context-learn', 'context-win', 'context-enjoy', 'context-places'])
  const text = Object.values(scene.nodes).filter((node) => node.type === 'DIALOGUE').map((node) => narrative.resolveNarrativeText(node.text, f.game)).join(' ')
  assert.doesNotMatch(text, /4-4-2|sistema habitual|de siempre|Volvemos|espalda.*lateral|carrileros/)
  assert.equal(scene.nodes.report, undefined)
  assert.equal(scene.nodes['assistant-comment'], undefined)
  const pressured = apply(f, scene, 'context-places'), calm = apply(f, scene, 'context-enjoy')
  assert.notDeepEqual(talk.getPrematchTalkEmotions(pressured.preMatchPreparations[f.matchId].talk), talk.getPrematchTalkEmotions(calm.preMatchPreparations[f.matchId].talk))
})

test('el mensaje inicial cambia con amistoso, Liga, rachas, derbi, rival directo, objetivo y playoff', () => {
  const cases = { 'talk-first-friendly': 'FIRST_FRIENDLY', 'talk-friendly': 'FRIENDLY', 'talk-league-debut': 'LEAGUE_DEBUT', 'talk-normal': 'LEAGUE', 'talk-direct-rival': 'DIRECT_RIVAL', 'talk-decisive': 'DECISIVE', 'talk-good-run': 'GOOD_RUN', 'talk-bad-run': 'REACTION', 'talk-derby': 'DERBY', 'talk-playoff': 'PLAYOFF_FINAL', 'talk-weak-rival': 'WEAK_RIVAL' }
  for (const [id, expected] of Object.entries(cases)) assert.equal(fixture(id).talk.context.primarySituation, expected, id)
  const f = fixture('talk-normal')
  f.game.expectations.expectations.find((item) => item.type === 'league').assessment = 'below'
  f.game.narrativeFacts.push({ id: 'coachShutVeteranDown', occurredAt: f.game.temporal.currentDateTime })
  const derived = context.buildPrematchTalkContext(f.game, f.talk.context.match, sources())
  assert.ok(derived.situations.includes('PRESIDENT'))
  assert.ok(derived.situations.includes('INCIDENT'))
})

test('un amistoso termina tras el contexto y un plan opcional, sin arenga ni grito', () => {
  for (const [id, expected] of [['talk-very-short', 0], ['talk-one-topic', 1]]) {
    const f = fixture(id), scene = sceneFor(f)
    assert.equal(spokenPlans(f.talk).length, expected)
    assert.equal(scene.nodes['rally-choice'], undefined)
    assert.equal(scene.nodes['chant-call'], undefined)
    assert.equal(scene.nodes.topics, undefined)
    const effect = scene.nodes[scene.nodes.exit.next]
    assert.equal(effect.type, 'CONSEQUENCE')
    assert.equal(effect.next, 'end')
    assert.equal(scene.nodes.end.autoComplete, true)
    assert.equal(scene.nodes.end.text, undefined)
    const ended = consequences.applyConsequences(f.game, effect.consequence)
    assert.equal(spokenPlans(ended.preMatchPreparations[f.matchId].talk).length, expected)
    assert.ok(!talk.inattentivePlayers(ended.preMatchPreparations[f.matchId].talk).length)
  }
})

test('el plan se decide una vez y ofrece solo repaso propio, segundo, trabajo acreditado o salida', () => {
  const f = fixture('talk-first-friendly'), scene = sceneFor(f)
  assert.deepEqual(menu(scene, f.game).map((choice) => choice.id), ['plan-coach', 'plan-assistant', 'plan-trained', 'plan-skip'])
  for (const route of ['SHORT', 'LONG', 'EARLY']) {
    const ended = dev.rehearsePrematchTalk(f.game, f.matchId, route)
    assert.equal(ended.preMatchPreparations[f.matchId].talk.beats.filter((beat) => beat.mentions?.includes('plan')).length, 1)
  }
  const untrained = fixture('talk-untrained'), absent = fixture('talk-no-assistant')
  assert.ok(!menu(sceneFor(untrained), untrained.game).some((choice) => choice.id === 'plan-trained'))
  assert.ok(!menu(sceneFor(absent), absent.game).some((choice) => choice.id === 'plan-assistant'))
  assert.ok(!Object.values(scene.nodes).some((node) => node.type === 'CHOICE' && /añadir algo más/.test(node.prompt)))
})

test('una ficha genérica, un amistoso o un rival flojo no autorizan un informe táctico', () => {
  for (const id of ['talk-first-friendly', 'talk-friendly', 'talk-league-debut', 'talk-normal', 'talk-weak-rival', 'talk-unknown-rival']) {
    const f = fixture(id)
    assert.equal(topics.hasUsefulPrematchScouting(f.talk.context), false, id)
    assert.equal(sceneFor(f).nodes.report, undefined, id)
    const supplied = sources()
    supplied.profiles = structuredClone(supplied.profiles)
    const profile = supplied.profiles.find((item) => item.teamId === f.talk.context.rival.id)
    profile.scouting.knowledge = 'OBSERVED'
    if (['talk-first-friendly', 'talk-friendly', 'talk-weak-rival'].includes(id)) profile.scouting.preparedForMatchId = f.matchId
    const derived = context.buildPrematchTalkContext(f.game, f.talk.context.match, supplied)
    assert.equal(topics.hasUsefulPrematchScouting(derived), false, `${id}: no basta la ficha`)
  }
})

test('el informe concreto requiere información y motivo, permite preguntar una vez y conserva la incertidumbre', () => {
  for (const id of ['talk-direct-rival', 'talk-return-leg', 'talk-playoff', 'talk-known-rival', 'talk-report-fits']) {
    const f = fixture(id), scene = sceneFor(f)
    assert.ok(topics.hasUsefulPrematchScouting(f.talk.context), id)
    assert.ok(f.talk.context.rival.facts.length <= 2)
    assert.ok(scene.nodes.report)
    assert.doesNotMatch(scene.nodes.report.text, /les hicimos daño|les marcamos/)
    const asked = apply(f, scene, 'report-more')
    assert.ok(!narrative.getNarrativeChoices(scene.nodes['report-choice'], asked).some((choice) => choice.id === 'report-more'))
    assert.ok(narrative.getNarrativeChoices(scene.nodes['report-choice'], asked).some((choice) => choice.id === 'keep'))
    assert.ok(scene.nodes['scouting-choice'].choices.some((choice) => choice.id === 'skip-report'))
  }
  assert.ok(fixture('talk-return-leg').talk.context.rival.previousMeetings > 0)
  const conflict = fixture('talk-report-conflicts')
  assert.ok(!sceneFor(conflict).nodes['report-choice'].choices.some((choice) => choice.id === 'exploit'))
})

test('el segundo comenta el equipo con voz propia o guarda silencio; su presencia sigue siendo real', () => {
  const young = fixture('talk-young-assistant'), veteran = fixture('talk-veteran-assistant')
  assert.equal(young.talk.context.assistant.voice, 'ANALYTICAL')
  assert.equal(veteran.talk.context.assistant.voice, 'PRAGMATIC')
  assert.notEqual(sceneFor(young).nodes['plan-assistant'].text, sceneFor(veteran).nodes['plan-assistant'].text)
  assert.match(sceneFor(veteran).nodes['plan-assistant'].text, /Chavales/)
  assert.match(sceneFor(young).nodes['plan-assistant'].text, /referencias/)
  assert.match(sceneFor(fixture('talk-long')).nodes['plan-assistant'].text, /Bueno|A ver/)
  for (const f of [young, veteran]) assert.doesNotMatch(sceneFor(f).nodes['plan-assistant'].text, /míster|Yo les|Recuérdales/)
  const absent = fixture('talk-no-assistant')
  assert.equal(topics.getAssistantTalkContribution(absent.talk.context), 'NONE')
  assert.equal(sceneFor(absent).nodes['assistant-enter'], undefined)
  assert.equal(topics.getAssistantTalkContribution({ ...fixture('talk-normal').talk.context, seed: 2, physicalLoadRelevant: false, cohesion: 80, participants: [{ happiness: 80 }] }), 'NONE')
})

test('el entrenador no aparece ni habla; el POV filtra también siluetas guardadas', () => {
  const f = fixture('talk-first-friendly'), scene = sceneFor(f)
  const runtime = { ...narrative.createNarrativeRuntime(scene), currentNodeId: 'plan-coach', visibleCharacters: [
    { characterId: f.talk.context.coachId, position: 'RIGHT', expression: 'NEUTRAL', visible: true },
    { characterId: f.talk.context.assistant.id, position: 'LEFT', expression: 'NEUTRAL', visible: true },
  ] }
  const game = narrative.saveNarrativeProgress(f.game, scene, runtime)
  const html = renderToStaticMarkup(createElement(player.NarrativePlayer, { scene, gameState: game, onGameStateChange() {}, onComplete() {} }))
  assert.doesNotMatch(html, /MÍSTER/)
  assert.ok(html.includes(f.talk.context.assistant.name))
  assert.ok(!html.includes(f.game.coachName))
  assert.equal(narrative.createNarrativeRuntime(scene, game).visibleCharacters.length, 1)
})

test('entrenamiento y familiaridad proponen temas sin alterarse ni inventar trabajo pendiente', () => {
  const f = fixture('talk-trained')
  assert.equal(f.talk.context.formationTrainingDays.length, 2)
  const before = JSON.stringify(f.game.training)
  const connection = f.talk.context.tacticalConnections.find((item) => item.instruction === 'afterRecovery')
  assert.equal(connection.days.length, 2)
  assert.match(sceneFor(f).nodes['plan-trained'].text, /trabajado esta semana/)
  const ended = dev.rehearsePrematchTalk(f.game, f.matchId, 'LONG')
  assert.equal(JSON.stringify(ended.training), before)
  f.game.preMatchPreparations[f.matchId].tacticalPlan.afterRecovery = 'Mantener posición'
  let derived = context.buildPrematchTalkContext(f.game, f.talk.context.match, sources())
  assert.equal(derived.tacticalConnections.find((item) => item.instruction === 'afterRecovery').days.length, 0)
  for (const session of f.game.training.sessions) session.status = 'pending'
  derived = context.buildPrematchTalkContext(f.game, f.talk.context.match, sources())
  assert.ok(derived.tacticalConnections.every((item) => !item.days.length))
  const changed = fixture('talk-new-formation')
  assert.equal(changed.talk.context.formationUse, 'NEW')
  assert.match(sceneFor(changed).nodes['plan-coach'].text, /tres centrales/)
  assert.equal(fixture('talk-habitual-formation').talk.context.formationUse, 'HABITUAL')
})

test('las reacciones por duración son graduales, no se repiten y no añaden tiempo por ser observadas', () => {
  const short = fixture('talk-one-topic'), long = fixture('talk-long')
  assert.equal(talk.inattentivePlayers(short.talk).length, 0)
  assert.ok(talk.inattentivePlayers(long.talk).length)
  assert.ok(talk.talkDuration(long.talk) > talk.talkDuration(short.talk))
  const signal = talk.getTalkAttentionSignal(long.talk)
  const scene = sceneFor(long)
  const after = apply(long, scene, `plan-attention-${signal}`)
  assert.equal(talk.talkDuration(after.preMatchPreparations[long.matchId].talk), talk.talkDuration(long.talk))
  assert.equal(talk.getTalkAttentionSignal(after.preMatchPreparations[long.matchId].talk), undefined)
  const high = fixture('talk-high-authority'), low = fixture('talk-low-authority')
  const beats = [1, 2, 3].map((id) => ({ id: String(id), duration: 'LONG' }))
  assert.ok(talk.inattentivePlayers({ ...low.talk, beats }).length > talk.inattentivePlayers({ ...high.talk, beats }).length)
})

test('la misma presión depende del jugador, la autoridad y el peso del partido; sus efectos son pequeños', () => {
  const f = fixture('talk-first-friendly')
  const base = f.talk.context.participants[0]
  const state = { ...f.talk, context: { ...f.talk.context, participants: [
    { ...base, id: 1, personality: 'Competitivo', authority: 85, relationship: 85, happiness: 80, confidence: 80 },
    { ...base, id: 2, personality: 'Caliente', authority: 20, relationship: 25, happiness: 25, confidence: 20 },
  ] }, beats: [{ id: 'pressure', duration: 'MEDIUM', intent: 'PROVOKE' }] }
  const effects = talk.getPrematchTalkEmotions(state)
  assert.ok(effects[1].motivation > effects[2].motivation)
  assert.ok(effects[2].nerves > effects[1].nerves)
  assert.ok(effects[2].involvement < 0)
  const important = talk.getPrematchTalkEmotions({ ...state, context: { ...state.context, importance: 3 } })
  assert.ok(important[2].nerves < effects[2].nerves)
  const high = talk.getPrematchTalkEmotions({ ...state, context: { ...state.context, authority: 95 } })
  const low = talk.getPrematchTalkEmotions({ ...state, context: { ...state.context, authority: 5 } })
  assert.ok(high[1].motivation > low[1].motivation)
  for (const value of Object.values(effects).flatMap(Object.values)) assert.ok(Math.abs(value) <= 4)
})

test('serializar y reabrir conserva nodo, temas y efectos; una charla antigua no vuelve a pronunciarse', () => {
  const f = fixture('talk-one-topic'), scene = sceneFor(f)
  const restored = migration.hydrateGameState(JSON.parse(JSON.stringify(f.game)))
  assert.equal(narrative.createNarrativeRuntime(scene, restored).currentNodeId, 'exit')
  assert.deepEqual(menu(scene, restored), menu(scene, f.game))
  const beat = spokenPlans(f.talk)[0]
  assert.equal(consequences.applyConsequences(restored, scene.nodes[`${beat.id}-effect`].consequence), restored)
  assert.equal(talk.beginPrematchTalk(restored, f.talk.context.match, sources()), restored)
  assert.equal(preparation.savePreMatchPreparation(restored, { matchId: f.matchId, lineupIds: [], tacticalPlan: f.tacticalPlan, completed: false }), restored)
  const legacy = structuredClone(restored)
  legacy.narrativeRuntimes[scene.id].currentNodeId = 'tactical-choice'
  delete legacy.narrativeRuntimes[scene.id].sceneVersion
  const before = JSON.stringify(legacy.preMatchPreparations[f.matchId].talk.beats)
  assert.equal(narrative.createNarrativeRuntime(scene, legacy).currentNodeId, 'exit')
  assert.equal(JSON.stringify(legacy.preMatchPreparations[f.matchId].talk.beats), before)
})

test('convocatoria, portero y elegibilidad siguen obligatorios antes y después de hablar', () => {
  const f = fixture('talk-league-debut')
  const finished = talk.completePrematchTalk(dev.rehearsePrematchTalk(f.game, f.matchId, 'SHORT'), f.matchId)
  for (const invalidate of [
    (game) => { game.squadSelections[f.matchId].announced = false },
    (game) => { game.preMatchPreparations[f.matchId].lineupIds.pop() },
    (game) => { game.preMatchPreparations[f.matchId].lineupIds[0] = game.preMatchPreparations[f.matchId].lineupIds[1] },
    (game) => { game.squadSelections[f.matchId].playerIds.push(mock.players.find((item) => item.clubStatus === 'TRIAL').id) },
    (game) => { game.temporal.activeCheckpoint.relatedId = 'otro' },
  ]) {
    const invalid = structuredClone(finished); invalidate(invalid)
    assert.equal(flow.startPreparedMatch(invalid, f.matchId, sources()), invalid)
    delete invalid.preMatchPreparations[f.matchId].talk
    assert.equal(talk.beginPrematchTalk(invalid, f.talk.context.match, sources()), invalid)
  }
})

test('la charla no cambia atributos y la pausa y serialización conservan la simulación', () => {
  const f = fixture('talk-first-friendly')
  const finished = dev.rehearsePrematchTalk(f.game, f.matchId, 'LONG')
  const started = flow.startPreparedMatch(talk.completePrematchTalk(finished, f.matchId), f.matchId, sources()).activeMatch
  const club = started.home.teamId === 'fc-poblenou' ? started.home : started.away
  const neutral = engine.createMatchState({ match: f.talk.context.match, homeName: started.home.name, awayName: started.away.name,
    clubPlayers: mock.players.filter((item) => f.game.squadSelections[f.matchId].playerIds.includes(item.id)), rivalPlayers: mock.rivalPlayers,
    lineupIds: f.lineupIds, plan: f.tacticalPlan, training: f.game.training, opponentFormation: mock.rivalTeamProfiles.find((item) => item.teamId === f.talk.context.rival.id).preferredFormation,
    seed: started.seed, cohesion: f.game.team.cohesion })
  const neutralClub = neutral.home.teamId === 'fc-poblenou' ? neutral.home : neutral.away
  for (const item of Object.values(club.players)) {
    assert.deepEqual(item.attributes, neutralClub.players[item.id].attributes)
    assert.deepEqual(duels.behavioralState({ ...item, minutesPlayed: 30 }), duels.behavioralState({ ...item, minutesPlayed: 30, prematchEmotions: undefined }))
  }
  let direct = started, restored = JSON.parse(JSON.stringify(started))
  for (let step = 0; step < 18; step += 1) {
    const advance = ['PAUSED_FOR_DECISION', 'HALF_TIME'].includes(direct.phase) ? engine.resumeMatch : engine.advanceMatchStep
    direct = advance(direct); restored = advance(JSON.parse(JSON.stringify(restored)))
    assert.deepEqual(JSON.parse(JSON.stringify(direct)), JSON.parse(JSON.stringify(restored)))
  }
})

test('la previa conserva sus elementos y no recupera tarjetas ni indicadores numéricos de charla', () => {
  const f = fixture('talk-first-friendly')
  const html = renderToStaticMarkup(createElement(screen.PreMatchScreen, { match: f.talk.context.match, gameState: f.game, lineupIds: f.lineupIds, tacticalPlan: f.tacticalPlan, trainingState: f.game.training, staffMembers: f.game.staff.members, errors: [], onLineupChange() {}, onPlanChange() {}, onPlay() {}, onBack() {} }))
  assert.doesNotMatch(html, /CHARLA PREVIA|Últimas palabras antes de salir|Sereno|Convencido/)
  assert.match(html, /JUGAR PARTIDO/)
  assert.match(html, /banquillo/i)
})

test('la Liga corriente tiene cierre y ritual; las situaciones relevantes añaden una elección de arenga', () => {
  for (const id of ['talk-league-debut', 'talk-normal', 'talk-good-run', 'talk-weak-rival']) {
    const f = fixture(id), scene = sceneFor(f)
    assert.equal(talk.getPrematchClosing(f.talk.context), 'RITUAL', id)
    assert.equal(scene.nodes['rally-choice'], undefined)
    assert.match(scene.nodes['league-closing'].text, /puntos/)
    assert.ok(scene.nodes.huddle && scene.nodes['chant-call'] && scene.nodes['chant-response'])
  }
  for (const id of ['talk-direct-rival', 'talk-derby', 'talk-bad-run', 'talk-promotion', 'talk-decisive', 'talk-playoff-semifinal', 'talk-playoff']) {
    const f = fixture(id), scene = sceneFor(f)
    assert.equal(talk.getPrematchClosing(f.talk.context), 'RALLY', id)
    assert.equal(scene.nodes['rally-choice'].choices.length, 4)
    assert.equal(scene.nodes['league-closing'], undefined)
    const finished = dev.rehearsePrematchTalk(f.game, f.matchId, 'SHORT')
    const state = finished.preMatchPreparations[f.matchId].talk
    assert.equal(state.beats.filter((beat) => beat.mentions?.includes('rally')).length, 1)
    assert.equal(state.beats.filter((beat) => beat.mentions?.includes('chant')).length, 1)
  }
  const normal = fixture('talk-normal').talk.context
  for (const situation of ['PRESIDENT', 'PLAYOFF_RACE', 'REACTION']) assert.equal(talk.getPrematchClosing({ ...normal, situations: [situation] }), 'RALLY')
  assert.match(sceneFor(fixture('talk-playoff-semifinal')).nodes['rally-demand'].text, /sitio en la final/)
  assert.match(sceneFor(fixture('talk-playoff')).nodes['rally-demand'].text, /final y la oportunidad de subir/)
})

test('los escenarios de recepción nacen de los estados reales y responden de forma cualitativa', () => {
  for (const seed of [84731, 1, 4294967295]) {
    for (const [id, expected] of [['talk-rally-effective', 'ENERGIZED'], ['talk-rally-flat', 'FLAT'], ['talk-rally-rejected', 'REJECTED']]) {
      const f = fixture(id, seed)
      assert.equal(talk.getRallyReception(f.talk).mood, expected, id)
      assert.doesNotMatch(presentation.getRallyReaction(f.talk), /\d|%/)
      assert.doesNotMatch(presentation.getHuddleNarration(f.talk), /\d|%/)
    }
  }
  const aggressive = fixture('talk-aggressive'), calm = fixture('talk-calm')
  const a = talk.getPrematchTalkEmotions(aggressive.talk), b = talk.getPrematchTalkEmotions(calm.talk)
  assert.ok(Object.keys(a).some((id) => a[id].motivation > b[id].motivation))
  assert.ok(Object.keys(a).every((id) => a[id].nerves > b[id].nerves))
  assert.match(presentation.getHuddleNarration(fixture('talk-rally-effective').talk), /tocado/)
  assert.match(presentation.getHuddleNarration(fixture('talk-rally-rejected').talk), /no termina de acompañar/)
})

test('la piña usa la cohesión existente cuando no hay una reacción extrema a la arenga', () => {
  assert.match(presentation.getHuddleNarration(fixture('talk-high-cohesion').talk), /Antes incluso/)
  assert.match(presentation.getHuddleNarration(fixture('talk-low-cohesion').talk), /menos entusiasmo/)
  const normal = fixture('talk-normal').talk
  assert.equal(presentation.getHuddleNarration({ ...normal, context: { ...normal.context, cohesion: 60 } }), 'Los jugadores se levantan y forman la piña.')
})

test('inicia el grito el capitán disponible, su sustituto o el grupo, nunca un ausente', () => {
  const present = fixture('talk-captain-present'), absent = fixture('talk-captain-absent')
  const captain = dressing.initialDressingRoomState.players.find((profile) => profile.socialRole === 'Capitán').playerId
  const deputy = dressing.initialDressingRoomState.players.find((profile) => profile.socialRole === 'Segundo capitán').playerId
  assert.equal(present.talk.context.huddleLeader.id, captain)
  assert.equal(absent.talk.context.huddleLeader.id, deputy)
  for (const change of [
    (game) => { game.squadSelections[present.matchId].playerIds = game.squadSelections[present.matchId].playerIds.filter((id) => id !== captain) },
    (game) => { game.injuredPlayerIds.push(captain) },
    (game) => { game.squadSelections[present.matchId].records.find((record) => record.playerId === captain).status = 'UNAVAILABLE' },
  ]) {
    const game = structuredClone(present.game); change(game)
    assert.notEqual(context.buildPrematchTalkContext(game, present.talk.context.match, sources()).huddleLeader?.id, captain)
  }
  const supplied = sources()
  supplied.sanctions = [...supplied.sanctions, { id: 'captain-suspended', playerId: captain, teamId: 'fc-poblenou', startMatchday: present.talk.context.match.matchday, matches: 1 }]
  assert.notEqual(context.buildPrematchTalkContext(present.game, present.talk.context.match, supplied).huddleLeader?.id, captain)
  // No captaincy profile: choose an existing influence/personality, without declaring a new captain.
  supplied.dressingRoomPlayers = []
  const noLeader = structuredClone(present.game)
  for (const human of Object.values(noLeader.training.players)) { human.lockerRoomInfluence = 'LOW'; human.personality = 'Profesional' }
  const group = factory.createPrematchTalkScene(context.buildPrematchTalkContext(noLeader, present.talk.context.match, supplied))
  assert.equal(group.nodes['leader-call'], undefined)
  assert.equal(group.nodes.huddle.next, 'chant-call')
})

test('el nombre dinámico se presenta en un grito automático, con dos tiempos y sin diálogo o confirmación', () => {
  const f = fixture('talk-other-team'), scene = sceneFor(f)
  assert.equal(scene.nodes['chant-call'].text, '¡UNA, DOS Y TRES...!')
  assert.equal(scene.nodes['chant-response'].text, '¡¡UNIÓ ESPORTIVA DEL BARRI!!')
  assert.equal(scene.nodes['chant-call'].next, 'chant-response')
  for (const id of ['chant-call', 'chant-response']) {
    assert.equal(scene.nodes[id].type, 'GROUP_CALL')
    assert.ok(scene.nodes[id].durationMs > 0 && scene.nodes[id].durationMs < 2000)
    assert.ok(narrative.isAutomaticNarrativeNode(scene.nodes[id]))
    const runtime = { ...narrative.createNarrativeRuntime(scene), currentNodeId: id }
    const game = narrative.saveNarrativeProgress(f.game, scene, runtime)
    const html = renderToStaticMarkup(createElement(player.NarrativePlayer, { scene, gameState: game, onGameStateChange() {}, onComplete() {} }))
    assert.match(html, /narrative-group-call/)
    assert.ok(html.includes(scene.nodes[id].text))
    assert.doesNotMatch(html, /narrative-dialogue-box|CONTINUAR|MÍSTER/)
  }
  const finished = talk.completePrematchTalk(dev.rehearsePrematchTalk(f.game, f.matchId, 'SHORT'), f.matchId)
  const active = flow.startPreparedMatch(finished, f.matchId, sources()).activeMatch
  assert.equal((active.home.teamId === 'fc-poblenou' ? active.home : active.away).name, f.talk.context.teamName)
})

test('restaurar durante arenga, piña o grito conserva decisiones y no duplica ni anticipa el saque inicial', () => {
  const f = fixture('talk-playoff'), scene = sceneFor(f)
  const reaction = dev.rehearsePrematchTalk(f.game, f.matchId, 'AGGRESSIVE', 'REACTION')
  for (const nodeId of ['rally-reaction', 'huddle', 'chant-call', 'chant-response', 'finish-effect', 'end']) {
    const runtime = { ...narrative.createNarrativeRuntime(scene), currentNodeId: nodeId }
    const saved = narrative.saveNarrativeProgress(reaction, scene, runtime)
    const restored = migration.hydrateGameState(JSON.parse(JSON.stringify(saved)))
    assert.equal(narrative.createNarrativeRuntime(scene, restored).currentNodeId, nodeId)
    assert.equal(talk.completePrematchTalk(restored, f.matchId), restored)
    assert.equal(flow.startPreparedMatch(restored, f.matchId, sources()), restored)
    if (nodeId === 'end') continue // An unfinished forged runtime cannot complete the domain state.
    const finished = dev.rehearsePrematchTalk(restored, f.matchId, 'SHORT')
    const completed = talk.completePrematchTalk(finished, f.matchId)
    const state = completed.preMatchPreparations[f.matchId].talk
    assert.equal(state.completed, true)
    assert.equal(state.beats.filter((beat) => beat.mentions?.includes('rally')).length, 1)
    assert.equal(state.beats.filter((beat) => beat.mentions?.includes('chant')).length, 1)
    assert.equal(consequences.applyConsequences(completed, scene.nodes['finish-effect'].consequence), completed)
    const started = flow.startPreparedMatch(completed, f.matchId, sources())
    assert.equal(started.activeMatch.events.filter((event) => event.kind === 'KICK_OFF').length, 1)
    assert.equal(flow.startPreparedMatch(started, f.matchId, sources()), started)
  }
})

test('las charlas v2 conservan efectos y avanzan sin volver a los temas retirados', () => {
  const f = fixture('talk-normal'), legacy = structuredClone(f.game)
  const state = legacy.preMatchPreparations[f.matchId].talk
  state.context.version = 2; delete state.context.teamName; delete state.context.huddleLeader
  state.beats = [{ id: 'topic-structure', speaker: 'COACH', duration: 'LONG', intent: 'SIMPLIFY', mentions: ['topic:structure'] }]
  const scene = factory.createPrematchTalkScene(state.context)
  assert.equal(narrative.createNarrativeRuntime(scene, legacy).currentNodeId, 'plan-choice')
  const ended = dev.rehearsePrematchTalk(legacy, f.matchId, 'EARLY')
  assert.deepEqual(ended.preMatchPreparations[f.matchId].talk.beats[0], state.beats[0])
  assert.ok(talk.completePrematchTalk(ended, f.matchId).preMatchPreparations[f.matchId].talk.completed)
  state.beats.push({ id: 'finish', duration: 'SHORT', mentions: ['closing'] })
  assert.equal(narrative.createNarrativeRuntime(scene, legacy).currentNodeId, 'end')
  assert.ok(talk.completePrematchTalk(legacy, f.matchId).preMatchPreparations[f.matchId].talk.completed)
})
