import { createNewGameState } from '../data/gameState'
import { initialDressingRoomState } from '../data/dressingRoomData'
import { initialTacticalPlan, leagueSanctions, leagueTeams, players, rivalTeamProfiles } from '../data/mockData'
import { createPrematchTalkScene } from '../data/preMatchTalkScene'
import { beginPrematchTalk, prematchSceneId } from '../domain/preMatchTalk'
import { talkHash } from '../domain/preMatchTalkContext'
import { savePreMatchPreparation } from '../domain/preMatch'
import { getPlayerEligibility, resolveFriendlySquadAnnouncement, resolveSquadAnnouncement } from '../domain/squadSelection'
import { selectLineupForFormation } from '../domain/lineupSelection'
import { resolveTrainingSession } from '../domain/trainingSessionResolver'
import { calculateStandings } from '../domain/leagueStandings'
import { getNextMatch } from '../domain/nextMatch'
import { applyConsequences } from '../domain/consequences'
import { createNarrativeRuntime, evaluateNarrativeCondition, getNarrativeChoices, saveNarrativeProgress } from '../domain/narrative'
import type { GameState } from '../domain/gameState'
import type { DevScenarioDefinition, DevScenarioState } from './devScenarios'

export const PREMATCH_SCENARIO_LABELS = {
  'talk-first-friendly': 'Charla · primer amistoso',
  'talk-friendly': 'Charla · amistoso posterior',
  'talk-weak-rival': 'Charla · rival flojo / sin scouting',
  'talk-return-leg': 'Charla · segunda vuelta / rival conocido',
  'talk-playoff': 'Charla · final de playoff con información',
  'talk-derby': 'Charla · derbi',
  'talk-very-short': 'Charla · terminar tras el contexto',
  'talk-one-topic': 'Charla · repaso breve y al campo',
  'talk-happy': 'Charla · jugadores felices',
  'talk-league-debut': 'Charla · debut de Liga',
  'talk-normal': 'Charla · partido normal',
  'talk-direct-rival': 'Charla · rival directo',
  'talk-decisive': 'Charla · partido decisivo',
  'talk-good-run': 'Charla · buena racha',
  'talk-bad-run': 'Charla · mala racha',
  'talk-young-assistant': 'Charla · segundo joven / analítico',
  'talk-veteran-assistant': 'Charla · segundo veterano / pragmático',
  'talk-known-rival': 'Charla · rival muy conocido',
  'talk-unknown-rival': 'Charla · poca información rival',
  'talk-habitual-formation': 'Charla · formación habitual',
  'talk-new-formation': 'Charla · formación nueva',
  'talk-new-instruction': 'Charla · instrucción nueva',
  'talk-trained': 'Charla · táctica muy trabajada',
  'talk-untrained': 'Charla · táctica poco trabajada',
  'talk-report-fits': 'Charla · informe encaja con el plan',
  'talk-report-conflicts': 'Charla · informe contradice el plan',
  'talk-high-authority': 'Charla · autoridad alta',
  'talk-low-authority': 'Charla · autoridad baja',
  'talk-unhappy': 'Charla · jugadores descontentos',
  'talk-short': 'Charla · breve y al campo',
  'talk-long': 'Charla · larga / pérdida de atención',
  'talk-no-assistant': 'Charla · sin segundo disponible',
  'talk-promotion': 'Charla · lucha por ascenso',
  'talk-playoff-semifinal': 'Charla · semifinal de playoff',
  'talk-high-cohesion': 'Charla · piña / cohesión alta',
  'talk-low-cohesion': 'Charla · piña / cohesión baja',
  'talk-aggressive': 'Charla · arenga agresiva',
  'talk-calm': 'Charla · arenga tranquila',
  'talk-rally-effective': 'Charla · arenga que conecta',
  'talk-rally-flat': 'Charla · arenga que deja frío al grupo',
  'talk-rally-rejected': 'Charla · arenga mal recibida',
  'talk-captain-present': 'Charla · capitán disponible',
  'talk-captain-absent': 'Charla · capitán no disponible',
  'talk-other-team': 'Charla · grito con otro nombre de equipo',
} as const
export type PrematchScenarioId = keyof typeof PREMATCH_SCENARIO_LABELS

/** Replays the real graph/effects for DEV checkpoints; never a second scene implementation. */
export function rehearsePrematchTalk(game: GameState, matchId: string, route: 'EARLY' | 'SHORT' | 'LONG' | 'AGGRESSIVE' | 'CALM', stopAt: 'END' | 'CLOSING' | 'ATTENTION' | 'REACTION' | 'HUDDLE' | 'CHANT' = 'END'): GameState {
  const scene = createPrematchTalkScene(game.preMatchPreparations[matchId].talk!.context)
  let runtime = createNarrativeRuntime(scene, game)
  let current = game
  for (let guard = 0; guard < 250; guard += 1) {
    const node = scene.nodes[runtime.currentNodeId]
    if (node.type === 'END' || (stopAt === 'CLOSING' && ['exit', 'league-closing', 'rally-choice'].includes(node.id))
      || (stopAt === 'ATTENTION' && node.type === 'NARRATION' && /-(DISTRACTED|IMPATIENT)$/.test(node.id))
      || (stopAt === 'REACTION' && node.id === 'rally-reaction') || (stopAt === 'HUDDLE' && node.id === 'huddle')
      || (stopAt === 'CHANT' && node.id === 'chant-call')) return saveNarrativeProgress(current, scene, runtime)
    let next: string
    if (node.type === 'CHOICE') {
      const choices = getNarrativeChoices(node, current)
      const preferred = node.id === 'context-choice' ? choices.find((choice) => choice.id === 'context-learn') ?? choices.find((choice) => choice.id === 'context-calm') ?? choices[0]
        : node.id === 'scouting-choice' ? choices.find((choice) => choice.id === (route === 'LONG' ? 'listen-report' : 'skip-report'))
        : node.id === 'report-choice' ? choices.find((choice) => choice.id === (route === 'LONG' && choices.some((item) => item.id === 'report-more') ? 'report-more' : 'keep'))
        : node.id === 'rally-choice' ? choices.find((choice) => choice.id === (route === 'CALM' ? 'rally-calm' : route === 'AGGRESSIVE' || route === 'LONG' ? 'rally-provoke' : 'rally-trust'))
        : choices.find((choice) => choice.id === (route === 'EARLY' ? 'plan-skip' : route === 'LONG' ? 'plan-assistant' : 'plan-coach'))
      next = (preferred ?? choices[0]).next
    } else if (node.type === 'CONDITION') next = evaluateNarrativeCondition(current, node.condition) ? node.then : node.otherwise
    else if (node.type === 'JUMP') next = node.target
    else {
      if (node.type === 'CONSEQUENCE') current = applyConsequences(current, node.consequence)
      if (node.type === 'CHARACTER_ACTION') runtime = { ...runtime, visibleCharacters: [...runtime.visibleCharacters.filter((item) => item.characterId !== node.characterId), { characterId: node.characterId, position: node.position ?? 'CENTER', expression: node.expression ?? 'NEUTRAL', visible: node.action !== 'EXIT' && node.action !== 'HIDE' }] }
      next = node.next
    }
    runtime = { ...runtime, currentNodeId: next }
  }
  throw new Error('El ensayo de la charla no ha alcanzado su destino.')
}

export function buildPrematchScenario(id: PrematchScenarioId, seed: number): DevScenarioState {
  const archetype = id === 'talk-veteran-assistant' ? 'CLUB_VETERAN' : id === 'talk-young-assistant' ? 'CONNECTED_YOUNGSTER' : 'TRUSTED_ASSISTANT'
  let game = createNewGameState(seed, { assistantArchetype: archetype })
  game.coachName = 'Miquel Ferrer'
  game.staff.members = game.staff.members.map((member) => member.role === 'PRIMER_ENTRENADOR' ? { ...member, name: game.coachName } : member)
  game.completedScenes = ['new-game-introduction']
  game.onboarding = { ...game.onboarding, completed: ['INTRO', 'FIRST_TRAINING', 'FIRST_FRIENDLY'], active: 'COMPLETE' }
  const isFirst = ['talk-first-friendly', 'talk-young-assistant', 'talk-veteran-assistant', 'talk-very-short', 'talk-one-topic'].includes(id)
  const targetDay = id === 'talk-league-debut' || id === 'talk-friendly' ? 1 : id === 'talk-return-leg' ? 12 : id === 'talk-promotion' ? 8 : id === 'talk-weak-rival' ? 5 : id === 'talk-decisive' ? Math.max(...game.temporal.calendar.map((match) => match.matchday)) : 4
  for (const match of game.temporal.calendar) {
    if (isFirst || match.matchday >= targetDay) continue
    match.status = 'played'
    match.homeGoals = 1; match.awayGoals = 1
    const own = match.homeTeamId === 'fc-poblenou' || match.awayTeamId === 'fc-poblenou'
    if (own && match.competitionType !== 'FRIENDLY' && id !== 'talk-direct-rival' && id !== 'talk-decisive') {
      const outcome = id === 'talk-good-run' || id === 'talk-promotion' ? 1 : id === 'talk-bad-run' ? -1 : [1, -1, 0][(match.matchday - 1) % 3]
      match.homeGoals += outcome * (match.homeTeamId === 'fc-poblenou' ? 1 : -1)
    }
    if (own) game.preMatchPreparations[match.id] = { matchId: match.id, lineupIds: [...game.lineupIds], tacticalPlan: structuredClone(initialTacticalPlan), completed: true }
  }
  let match = getNextMatch(game.temporal.calendar, 'fc-poblenou')!
  if (id === 'talk-friendly') {
    match = { ...game.temporal.calendar.find((item) => item.competitionType === 'FRIENDLY')!, id: 'friendly-2', status: 'scheduled', date: '2026-09-02', homeGoals: 0, awayGoals: 0 }
    game.temporal.calendar.push(match)
  }
  if (id === 'talk-playoff') match.playoffRound = 'FINAL'
  if (id === 'talk-playoff-semifinal' || id === 'talk-long') match.playoffRound = 'SEMIFINAL'
  if (['talk-derby', 'talk-aggressive', 'talk-calm', 'talk-rally-effective', 'talk-rally-flat', 'talk-rally-rejected', 'talk-high-authority', 'talk-low-authority'].includes(id)) match.derby = true
  if (id === 'talk-weak-rival') {
    const opponent = match.homeTeamId === 'fc-poblenou' ? match.awayTeamId : match.homeTeamId
    for (const played of game.temporal.calendar.filter((item) => item.status === 'played' && item.competitionType !== 'FRIENDLY')) {
      if (played.homeTeamId === 'fc-poblenou' || played.awayTeamId === 'fc-poblenou') {
        const outcome = [1, 0, 0, -1][(played.matchday - 1) % 4]
        played.homeGoals = 1 + outcome * (played.homeTeamId === 'fc-poblenou' ? 1 : -1); played.awayGoals = 1
      }
      if (played.homeTeamId === opponent) { played.homeGoals = 0; played.awayGoals = 2 }
      else if (played.awayTeamId === opponent) { played.homeGoals = 2; played.awayGoals = 0 }
    }
  }
  if (id === 'talk-direct-rival') {
    const standings = calculateStandings(leagueTeams, game.temporal.calendar, targetDay - 1)
    const own = standings.find((row) => row.teamId === 'fc-poblenou')!
    const close = standings.find((row) => row.teamId !== own.teamId && Math.abs(row.position - own.position) <= 1)!.teamId
    const currentOpponent = match.homeTeamId === own.teamId ? match.awayTeamId : match.homeTeamId
    const swap = (teamId: string) => teamId === currentOpponent ? close : teamId === close ? currentOpponent : teamId
    game.temporal.calendar = game.temporal.calendar.map((fixture) => fixture.status === 'scheduled' ? { ...fixture, homeTeamId: swap(fixture.homeTeamId), awayTeamId: swap(fixture.awayTeamId) } : fixture)
    match = getNextMatch(game.temporal.calendar, 'fc-poblenou')!
  }
  const second = game.staff.members.find((member) => member.role === 'SEGUNDO_ENTRENADOR')!
  if (id === 'talk-long' && second.capabilities) { second.capabilities.footballKnowledge = 30; second.capabilities.organization = 25 }
  if (id === 'talk-known-rival' && second.capabilities) { second.capabilities.observation = 90; second.capabilities.footballKnowledge = 90 }
  const plan = { ...initialTacticalPlan }
  if (id === 'talk-new-formation' || id === 'talk-untrained') plan.formation = '3-5-2'
  if (id === 'talk-new-instruction') plan.afterRecovery = 'Mantener posición'
  if (id === 'talk-untrained') { plan.passingStyle = 'Directo'; plan.tempo = 'Bajo' }
  const profiles = structuredClone(rivalTeamProfiles)
  const opponentId = match.homeTeamId === 'fc-poblenou' ? match.awayTeamId : match.homeTeamId
  const profile = profiles.find((item) => item.teamId === opponentId)!
  if (['talk-direct-rival', 'talk-known-rival', 'talk-return-leg', 'talk-playoff', 'talk-report-fits', 'talk-report-conflicts', 'talk-long'].includes(id)) profile.scouting.knowledge = 'OBSERVED'
  if (['talk-known-rival', 'talk-report-fits', 'talk-report-conflicts'].includes(id)) profile.scouting.preparedForMatchId = match.id
  if (id === 'talk-unknown-rival') profile.scouting.knowledge = 'LIMITED'
  if (['talk-report-fits', 'talk-report-conflicts'].includes(id)) {
    profile.scouting.response = { weaknessIndex: 0, instruction: 'afterRecovery', value: 'Contraataque' }
    profile.collectiveWeaknesses = ['Al perder el balón con los laterales arriba, dejan espacio a su espalda.']
    plan.afterRecovery = id === 'talk-report-conflicts' ? 'Mantener posición' : 'Contraataque'
  }
  const captainId = initialDressingRoomState.players.find((player) => player.socialRole === 'Capitán')!.playerId
  if (id === 'talk-captain-absent') game.injuredPlayerIds.push(captainId)
  const eligible = players.filter((player) => getPlayerEligibility(game, match, player, leagueSanctions).eligible)
  const lineup = selectLineupForFormation(eligible, plan.formation)
  game.tacticalPlan = plan; game.lineupIds = lineup
  if (id !== 'talk-untrained' && id !== 'talk-new-formation' && id !== 'talk-new-instruction') {
    for (const sessionId of ['tuesday', 'thursday']) {
      game.training.sessions = game.training.sessions.map((session) => session.id === sessionId ? { ...session, planningStatus: 'PLANNED', intensity: 'Media', blocks: id === 'talk-trained' ? ['Táctica', 'Transición ofensiva'] : session.blocks, availableStaffIds: [second.id] } : session)
      game.training = resolveTrainingSession(game.training, sessionId, plan, players, game.staff.members)
    }
  }
  const high = id === 'talk-high-authority' || id === 'talk-rally-effective' || id === 'talk-rally-flat'
  const low = ['talk-low-authority', 'talk-unhappy', 'talk-long', 'talk-rally-rejected'].includes(id)
  if (high || low) {
    game.manager.generalAuthority = high ? 92 : 20
    game.team.cohesion = high ? 90 : 25
    for (const player of Object.values(game.training.players)) {
      player.managerAuthority = high ? 90 : 20
      player.managerRelationship = high ? 90 : 25
      if (high || id === 'talk-unhappy' || id === 'talk-long' || id === 'talk-rally-rejected') player.happiness = { teammates: high ? 90 : 22, playingTime: high ? 90 : 22, training: high ? 90 : 22, results: high ? 90 : 22 }
      if (id === 'talk-rally-effective' || id === 'talk-rally-flat') player.personality = 'Competitivo'
      if (id === 'talk-rally-rejected' || id === 'talk-long') player.personality = 'Individualista'
    }
  }
  if (id === 'talk-happy') for (const player of Object.values(game.training.players)) player.happiness = { teammates: 90, playingTime: 90, training: 90, results: 90 }
  if (id === 'talk-high-cohesion') game.team.cohesion = 90
  if (id === 'talk-low-cohesion') game.team.cohesion = 25
  game.temporal.currentDateTime = `${match.date}T${match.time}:00`
  game.temporal.activeCheckpoint = { type: 'PRE_MATCH', at: game.temporal.currentDateTime, label: 'Vestuario', relatedId: match.id, availableStaffIds: id === 'talk-no-assistant' ? [] : [second.id] }
  const friendly = match.competitionType === 'FRIENDLY'
  const ids = eligible.map((player) => player.id).slice(0, friendly ? 20 : 18)
  const announcement = friendly ? resolveFriendlySquadAnnouncement(game, match, ids, players, game.temporal.currentDateTime) : resolveSquadAnnouncement(game, match, ids, players, leagueSanctions, game.temporal.currentDateTime)
  if (announcement.errors.length) throw new Error(announcement.errors.join(' '))
  game = savePreMatchPreparation(announcement.state, { matchId: match.id, lineupIds: lineup, tacticalPlan: plan, completed: false })
  // Variants and fixture scores are deterministic; all narrative decisions use domain logic.
  const teams = id === 'talk-other-team' ? leagueTeams.map((team) => team.id === 'fc-poblenou' ? { ...team, name: 'Unió Esportiva del Barri' } : team) : leagueTeams
  game = beginPrematchTalk(game, match, { teams, profiles, players, sanctions: leagueSanctions, dressingRoomPlayers: initialDressingRoomState.players })
  if (!game.preMatchPreparations[match.id].talk) throw new Error(`No se pudo preparar ${id} (${talkHash(id, seed)}).`)
  if (id === 'talk-short' || id === 'talk-long') game = rehearsePrematchTalk(game, match.id, id === 'talk-short' ? 'SHORT' : 'LONG', id === 'talk-short' ? 'CLOSING' : 'ATTENTION')
  if (id === 'talk-very-short' || id === 'talk-one-topic') game = rehearsePrematchTalk(game, match.id, id === 'talk-very-short' ? 'EARLY' : 'SHORT', 'CLOSING')
  if (['talk-aggressive', 'talk-calm', 'talk-rally-effective', 'talk-rally-flat', 'talk-rally-rejected'].includes(id)) game = rehearsePrematchTalk(game, match.id, id === 'talk-calm' || id === 'talk-rally-flat' ? 'CALM' : 'AGGRESSIVE', 'REACTION')
  if (['talk-high-cohesion', 'talk-low-cohesion', 'talk-captain-present', 'talk-captain-absent', 'talk-other-team'].includes(id)) game = rehearsePrematchTalk(game, match.id, 'SHORT', 'HUDDLE')
  return { gameState: game, trainingState: game.training, tacticalPlan: plan, lineupIds: lineup, activeScreen: 'pre-match', activeNarrativeId: prematchSceneId(match.id) }
}

export const PREMATCH_DEV_SCENARIOS: DevScenarioDefinition[] = (Object.entries(PREMATCH_SCENARIO_LABELS) as [PrematchScenarioId, string][]).map(([id, label]) => ({ id, label, build: (seed) => buildPrematchScenario(id, seed) }))
