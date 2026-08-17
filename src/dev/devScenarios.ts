import { createNewGameState } from '../data/gameState'
import { initialTacticalPlan, leagueTeams, players, rivalPlayers, rivalTeamProfiles, tactics } from '../data/mockData'
import { newGameIntroduction } from '../data/introScene'
import { advanceGame, resolveStaffAvailability } from '../domain/gameTime'
import { advanceMatchStep, createMatchState, resumeMatch, startMatch } from '../domain/matchEngine'
import type { GameState } from '../domain/gameState'
import type { MatchState } from '../domain/matchTypes'
import type { ScreenId, TacticalPlan } from '../domain/models'
import { getNextMatch } from '../domain/nextMatch'
import { createInitialTrainingState, executeTrainingSession } from '../domain/trainingEngine'
import type { TrainingGameState } from '../domain/trainingTypes'
import { completeOnboardingMilestone } from '../domain/onboarding'
import { resolveTrainingSession } from '../domain/trainingSessionResolver'

export const DEV_SEED_STANDARD = 84731
const DEV_COACH_NAME = 'Miquel Ferrer'

export type DevScenarioId = 'new-game' | 'after-intro' | 'staff' | 'tactics' | 'dressing-room-intro' | 'first-training' | 'second-training' | 'first-friendly' | 'match-start' | 'match-25' | 'match-65' | 'match-fatigue' | 'half-time' | 'rival-window' | 'post-match' | 'matchday-1'

export type DevScenarioState = {
  gameState: GameState
  trainingState: TrainingGameState
  tacticalPlan: TacticalPlan
  lineupIds: number[]
  activeScreen: ScreenId
}

export type DevScenarioDefinition = {
  id: DevScenarioId
  label: string
  disabled?: boolean
  note?: string
  build: (seed: number) => DevScenarioState
}

function createBase(seed: number, completeIntro = true): DevScenarioState {
  const gameState = createNewGameState(seed)
  const trainingState = createInitialTrainingState(players)
  trainingState.seed = seed
  if (completeIntro) {
    gameState.coachName = DEV_COACH_NAME
    gameState.staff.members = gameState.staff.members.map((member) => member.role === 'PRIMER_ENTRENADOR' ? { ...member, name: DEV_COACH_NAME } : member)
    gameState.completedScenes = [newGameIntroduction.id]
    gameState.onboarding = { completed: ['INTRO'], active: 'STAFF' }
  }
  return { gameState, trainingState, tacticalPlan: { ...initialTacticalPlan }, lineupIds: [...tactics.startingEleven], activeScreen: 'club-panel' }
}

function reachTraining(base: DevScenarioState, sessionId: 'tuesday' | 'thursday') {
  let gameState = base.gameState
  const completed = base.trainingState.sessions.filter((session) => session.status === 'completed').map((session) => session.id)
  for (let guard = 0; guard < 4; guard += 1) {
    const advanced = advanceGame(gameState, completed)
    gameState = advanced.state
    if (advanced.checkpoint?.type === 'TRAINING' && advanced.checkpoint.relatedId === sessionId) break
  }
  const checkpoint = gameState.temporal.activeCheckpoint
  const trainingState = { ...base.trainingState, sessions: base.trainingState.sessions.map((session) => session.id === checkpoint?.relatedId ? { ...session, availableStaffIds: checkpoint.availableStaffIds, staffAbsenceNotes: checkpoint.staffAbsenceNotes } : session) }
  return { ...base, gameState, trainingState, activeScreen: 'training' as const }
}

function completeFirstTraining(base: DevScenarioState) {
  const first = reachTraining(base, 'tuesday')
  const trainingState = executeTrainingSession(first.trainingState, 'tuesday', first.tacticalPlan, players, first.gameState.staff.members)
  const cleared = { ...first.gameState, temporal: { ...first.gameState.temporal, activeCheckpoint: undefined } }
  return reachTraining({ ...first, gameState: cleared, trainingState }, 'thursday')
}

function reachPreMatch(base: DevScenarioState) {
  const second = completeFirstTraining(base)
  const trainingState = executeTrainingSession(second.trainingState, 'thursday', second.tacticalPlan, players, second.gameState.staff.members)
  const cleared = { ...second.gameState, temporal: { ...second.gameState.temporal, activeCheckpoint: undefined } }
  const advanced = advanceGame(cleared, trainingState.sessions.map((session) => session.id))
  return { ...second, gameState: advanced.state, trainingState, activeScreen: 'next-match' as const }
}

function prepareMatch(base: DevScenarioState, plan = base.tacticalPlan) {
  const ready = reachPreMatch({ ...base, tacticalPlan: plan })
  const scheduled = getNextMatch(ready.gameState.temporal.calendar, 'fc-poblenou')
  if (!scheduled) throw new Error('El escenario DEV necesita un partido oficial programado.')
  const opponentId = scheduled.homeTeamId === 'fc-poblenou' ? scheduled.awayTeamId : scheduled.homeTeamId
  const match = startMatch(createMatchState({
    match: scheduled,
    homeName: leagueTeams.find((team) => team.id === scheduled.homeTeamId)?.name ?? scheduled.homeTeamId,
    awayName: leagueTeams.find((team) => team.id === scheduled.awayTeamId)?.name ?? scheduled.awayTeamId,
    clubPlayers: players,
    rivalPlayers,
    lineupIds: ready.lineupIds,
    plan,
    training: ready.trainingState,
    opponentFormation: rivalTeamProfiles.find((profile) => profile.teamId === opponentId)?.preferredFormation ?? '4-4-2',
    seed: ready.gameState.temporal.seed + scheduled.matchday * 1009,
    cohesion: ready.gameState.dressingRoomCohesion,
  }))
  return { ...ready, tacticalPlan: plan, gameState: { ...ready.gameState, activeMatch: match }, activeScreen: 'match' as const }
}

function assistantFor(state: DevScenarioState) {
  const match = state.gameState.activeMatch!
  const availability = resolveStaffAvailability(state.gameState.staff.members, match.matchId, state.gameState.temporal.currentDateTime, state.gameState.temporal.seed)
  return state.gameState.staff.members.find((member) => member.role === 'SEGUNDO_ENTRENADOR' && availability.availableStaffIds.includes(member.id))
}

function simulateTo(base: DevScenarioState, targetMinute: number, targetPhase?: MatchState['phase']) {
  let match = base.gameState.activeMatch!
  const assistant = assistantFor(base)
  for (let guard = 0; guard < 80; guard += 1) {
    if (targetPhase ? match.phase === targetPhase : match.minute >= targetMinute) break
    if (match.phase === 'HALF_TIME' || match.phase === 'PAUSED_FOR_DECISION') match = resumeMatch(match)
    else if (match.phase === 'FIRST_HALF' || match.phase === 'SECOND_HALF') match = advanceMatchStep(match, assistant)
    else break
  }
  return { ...base, gameState: { ...base.gameState, activeMatch: match } }
}

const buildNewGame = (seed: number) => createBase(seed, false)
const buildAfterIntro = (seed: number) => createBase(seed)
const withIntroductions = (base: DevScenarioState) => {
  let gameState = base.gameState
  gameState.completedScenes = [...new Set([...gameState.completedScenes, 'onboarding-staff', 'onboarding-tactics', 'onboarding-squad'])]
  gameState = completeOnboardingMilestone(completeOnboardingMilestone(completeOnboardingMilestone(gameState, 'STAFF'), 'TACTICS'), 'SQUAD')
  return { ...base, gameState }
}
const buildStaff = (seed: number) => ({ ...createBase(seed), activeScreen: 'staff' as const })
const buildTactics = (seed: number) => { const base = createBase(seed); base.gameState.completedScenes.push('onboarding-staff'); base.gameState = completeOnboardingMilestone(base.gameState, 'STAFF'); return { ...base, activeScreen: 'tactics' as const } }
const buildDressingRoomIntro = (seed: number) => { const base = createBase(seed); base.gameState.completedScenes.push('onboarding-staff', 'onboarding-tactics'); base.gameState = completeOnboardingMilestone(completeOnboardingMilestone(base.gameState, 'STAFF'), 'TACTICS'); return base }
const resolveTrainingScene = (base: DevScenarioState) => { const sessionId=base.gameState.temporal.activeCheckpoint?.relatedId ?? ''; return { ...base, trainingState: resolveTrainingSession(base.trainingState, sessionId, base.tacticalPlan, players, base.gameState.staff.members), activeScreen: 'training-event' as const } }
const buildFirstTraining = (seed: number) => resolveTrainingScene(reachTraining(withIntroductions(createBase(seed)), 'tuesday'))
const buildSecondTraining = (seed: number) => { const base = completeFirstTraining(withIntroductions(createBase(seed))); base.gameState = completeOnboardingMilestone(base.gameState, 'FIRST_TRAINING'); return resolveTrainingScene(base) }
const buildFirstFriendly = (seed: number) => { const base = reachPreMatch(withIntroductions(createBase(seed))); base.gameState = completeOnboardingMilestone(completeOnboardingMilestone(base.gameState, 'FIRST_TRAINING'), 'SECOND_TRAINING'); return base }
const buildMatchdayOne = (seed: number) => { const base = buildFirstFriendly(seed); const friendly = base.gameState.temporal.calendar.find((match) => match.competitionType === 'FRIENDLY'); if (friendly) friendly.status = 'played'; const league = base.gameState.temporal.calendar.find((match) => match.competitionType === 'LEAGUE' && match.matchday === 1 && (match.homeTeamId === 'fc-poblenou' || match.awayTeamId === 'fc-poblenou'))!; base.gameState.onboarding = { completed: ['INTRO', 'STAFF', 'TACTICS', 'SQUAD', 'FIRST_TRAINING', 'SECOND_TRAINING', 'FIRST_FRIENDLY'], active: 'COMPLETE' }; base.gameState.temporal.currentDateTime = `${league.date}T${league.time}:00`; base.gameState.temporal.activeCheckpoint = { type: 'PRE_MATCH', at: base.gameState.temporal.currentDateTime, label: `Jornada 1 · ${league.date} ${league.time}`, relatedId: league.id }; return base }
const buildMatchStart = (seed: number) => prepareMatch(createBase(seed))
const buildMatchMinute = (minute: number) => (seed: number) => simulateTo(buildMatchStart(seed), minute)
const buildHalfTime = (seed: number) => simulateTo(buildMatchStart(seed), 45, 'HALF_TIME')
const buildRivalWindow = (seed: number) => {
  const scenario = buildMatchStart(seed)
  let match = scenario.gameState.activeMatch!
  const assistant = assistantFor(scenario)
  for (let guard = 0; guard < 80 && match.pauseReason !== 'RIVAL_SUBSTITUTION'; guard += 1) {
    if (match.phase === 'HALF_TIME' || match.phase === 'PAUSED_FOR_DECISION') match = resumeMatch(match)
    else if (match.phase === 'FIRST_HALF' || match.phase === 'SECOND_HALF') match = advanceMatchStep(match, assistant)
    else break
  }
  return { ...scenario, gameState: { ...scenario.gameState, activeMatch: match } }
}
const buildPostMatch = (seed: number) => simulateTo(buildMatchStart(seed), 90, 'FINISHED')
const buildFatigue = (seed: number) => {
  const plan: TacticalPlan = { ...initialTacticalPlan, tempo: 'Alto', pressingHeight: 'Alta', pressingIntensity: 'Alta', afterLoss: 'Presión tras pérdida' }
  return simulateTo(prepareMatch(createBase(seed), plan), 70)
}

export const DEV_SCENARIOS: DevScenarioDefinition[] = [
  { id: 'new-game', label: 'Nueva partida normal', build: buildNewGame },
  { id: 'after-intro', label: 'Después de Manolo', build: buildAfterIntro },
  { id: 'staff', label: 'Staff', build: buildStaff },
  { id: 'tactics', label: 'Táctica', build: buildTactics },
  { id: 'dressing-room-intro', label: 'Vestuario · primer día', build: buildDressingRoomIntro },
  { id: 'first-training', label: 'Primer entrenamiento', build: buildFirstTraining },
  { id: 'second-training', label: 'Segundo entrenamiento', build: buildSecondTraining },
  { id: 'first-friendly', label: 'Primer amistoso', build: buildFirstFriendly },
  { id: 'match-start', label: 'Partido · inicio', build: buildMatchStart },
  { id: 'match-25', label: "Partido · minuto 25", build: buildMatchMinute(25) },
  { id: 'match-65', label: "Partido · minuto 65", build: buildMatchMinute(65) },
  { id: 'match-fatigue', label: 'Partido · cansancio', build: buildFatigue },
  { id: 'half-time', label: 'Descanso', build: buildHalfTime },
  { id: 'rival-window', label: 'Ventana de cambios rival', build: buildRivalWindow },
  { id: 'post-match', label: 'Postpartido', build: buildPostMatch },
  { id: 'matchday-1', label: 'Jornada 1', build: buildMatchdayOne },
]

export function createDevScenario(id: DevScenarioId, seed = DEV_SEED_STANDARD) {
  const scenario = DEV_SCENARIOS.find((item) => item.id === id)
  if (!scenario || scenario.disabled) throw new Error(`Escenario DEV no disponible: ${id}`)
  return scenario.build(seed >>> 0)
}
