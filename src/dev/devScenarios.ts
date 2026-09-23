import { PREMATCH_DEV_SCENARIOS, type PrematchScenarioId } from './preMatchTalkScenarios'
import { createNewGameState } from '../data/gameState'
import { initialTacticalPlan, leagueTeams, players, rivalPlayers, rivalTeamProfiles } from '../data/mockData'
import { advanceGame, resolveStaffAvailability } from '../domain/gameTime'
import { advanceMatchStep, createMatchState, resumeMatch, startMatch } from '../domain/matchEngine'
import type { GameState, OnboardingMilestone } from '../domain/gameState'
import type { MatchState } from '../domain/matchTypes'
import type { ScreenId, TacticalPlan } from '../domain/models'
import { getNextMatch } from '../domain/nextMatch'
import { createInitialTrainingState, executeTrainingSession } from '../domain/trainingEngine'
import type { TrainingGameState } from '../domain/trainingTypes'
import { completeOnboardingMilestone } from '../domain/onboarding'
import { resolveTrainingSession } from '../domain/trainingSessionResolver'
import { selectLineupForFormation } from '../domain/lineupSelection'
import { resolveFriendlySquadAnnouncement } from '../domain/squadSelection'
import { LOCKER_ROOM_JOKER_TRIGGERED_FACT, selectLockerRoomJoker, selectVeteranForTrainingComplaint, VETERAN_COMPLAINT_TRIGGERED_FACT } from '../domain/preseasonOnboarding'
import { appendConversationMessages, chooseMessageResponse } from '../domain/messages'
import { createCallUpMessage } from '../domain/callUpMessages'
import { savePreMatchPreparation } from '../domain/preMatch'
import type { AssistantArchetype } from '../domain/staff'
import { ensureFirstTrainingAssistantPresence } from '../domain/assistantPersonality'

export const DEV_SEED_STANDARD = 84731
const DEV_COACH_NAME = 'Miquel Ferrer'

export type DevScenarioId = PrematchScenarioId | 'new-game' | 'narrative-manolo' | 'after-intro' | 'panel-tour-completed' | 'staff' | 'onboarding-continue-priority' | 'tactics' | 'squad' | 'before-initial-messages' | 'initial-messages' | 'training-tutorial' | 'training-tutorial-completed' | 'training-planned' | 'first-training-talk' | 'post-first-training-talk' | 'post-training-tuesday' | 'before-training-thursday' | 'post-training-thursday' | 'first-training' | 'first-training-youngster' | 'first-training-veteran' | 'first-training-captain' | 'first-training-trusted' | 'first-training-joker' | 'first-training-incident' | 'incident-resolved' | 'second-training-promise' | 'second-training-veteran-after-joker' | 'second-training' | 'messages-persistent' | 'messages-read' | 'messages-unread' | 'messages-multiple-unread' | 'messages-pending' | 'messages-resolved' | 'messages-training-report' | 'messages-two-training-reports' | 'manolo-informative' | 'manolo-question' | 'manolo-answered' | 'manolo-history' | 'group-empty' | 'group-messages' | 'friendly-call-up' | 'team-chat-call-up' | 'pre-match-no-lineup' | 'pre-match-lineup-no-talk' | 'pre-match-ready' | 'first-friendly' | 'match-start' | 'match-25' | 'match-65' | 'match-fatigue' | 'half-time' | 'rival-window' | 'post-match' | 'matchday-1'

export type DevScenarioState = {
  gameState: GameState
  trainingState: TrainingGameState
  tacticalPlan: TacticalPlan
  lineupIds: number[]
  activeScreen: ScreenId
  focusedConversationId?: string
  focusedMessageId?: string
  activeDialogue?: 'SECOND_COACH_INTRO' | 'MEET_SQUAD' | 'FIRST_TRAINING_TALK'
  activeNarrativeId?: string
}

export type DevScenarioDefinition = {
  id: DevScenarioId
  label: string
  onboarding?: boolean
  disabled?: boolean
  note?: string
  build: (seed: number) => DevScenarioState
}

export function validateDevScenario(state: DevScenarioState, scenarioId: DevScenarioId): string[] {
  const missing: string[] = []
  if (!state.gameState.temporal?.currentDateTime) missing.push('temporal.currentDateTime')
  if (!state.gameState.training?.players || Object.keys(state.gameState.training.players).length !== players.length) missing.push('training.players')
  if (!state.gameState.staff?.members.some((member) => member.role === 'PRIMER_ENTRENADOR')) missing.push('staff.headCoach')
  if (!state.gameState.tacticalPlan || state.lineupIds.length !== 11) missing.push('tacticalPlan/lineupIds')
  if (!state.gameState.consequences) missing.push('consequences')
  if (scenarioId === 'first-training-talk') {
    if (state.activeDialogue !== 'FIRST_TRAINING_TALK') missing.push('activeDialogue.FIRST_TRAINING_TALK')
    if (state.gameState.onboarding.active !== 'FIRST_TRAINING_TALK') missing.push('onboarding.active.FIRST_TRAINING_TALK')
    if (state.gameState.onboarding.completed.includes('FIRST_TRAINING_TALK')) missing.push('onboarding.initialTalkMustBePending')
    if (state.trainingState.sessions.some((session) => session.planningStatus !== 'PLANNED')) missing.push('training.sessions.planned')
    if (state.trainingState.sessions.some((session) => session.status === 'completed')) missing.push('training.sessions.notCompleted')
  }
  if (scenarioId === 'narrative-manolo' && state.activeNarrativeId !== 'manolo_objective') missing.push('activeNarrativeId.manolo_objective')
  return missing
}

function createBase(seed: number, completeIntro = true, assistantArchetype?: AssistantArchetype): DevScenarioState {
  const gameState = createNewGameState(seed, assistantArchetype ? { assistantArchetype } : {})
  const trainingState = createInitialTrainingState(players, seed)
  trainingState.seed = seed
  if (completeIntro) {
    gameState.coachName = DEV_COACH_NAME
    gameState.staff.members = gameState.staff.members.map((member) => member.role === 'PRIMER_ENTRENADOR' ? { ...member, name: DEV_COACH_NAME } : member)
    gameState.completedScenes = ['new-game-introduction']
    gameState.onboarding = { completed: ['INTRO'], active: 'SECOND_COACH_INTRO', clubPanelTourCompleted: false, clubPanelTourStep: 0, trainingTutorialCompleted: false, trainingTutorialStep: 0 }
  }
  return { gameState, trainingState, tacticalPlan: { ...initialTacticalPlan }, lineupIds: selectLineupForFormation(players, initialTacticalPlan.formation), activeScreen: 'club-panel' }
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

function prepareTutorialWeek(base: DevScenarioState) {
  const trainingState = {
    ...base.trainingState,
    sessions: base.trainingState.sessions.map((session) => ({
      ...session,
      planningStatus: 'PLANNED' as const,
      plannedTacticalPlan: structuredClone(base.tacticalPlan),
    })),
  }
  const tutorialCompletedState = {
    ...base.gameState,
    training: trainingState,
    onboarding: { ...base.gameState.onboarding, trainingTutorialCompleted: true },
  }
  const gameState = base.gameState.onboarding.active === 'TRAINING_PLANNING'
    ? completeOnboardingMilestone(tutorialCompletedState, 'TRAINING_PLANNING')
    : tutorialCompletedState
  return { ...base, gameState, trainingState }
}

function completeFirstTraining(base: DevScenarioState) {
  const first = reachTraining(prepareTutorialWeek(base), 'tuesday')
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
    cohesion: ready.gameState.team.cohesion,
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
const buildNarrativeManolo = (seed: number) => ({ ...createBase(seed), activeNarrativeId: 'manolo_objective' })
const buildAfterIntro = (seed: number) => ({ ...createBase(seed), activeDialogue: 'SECOND_COACH_INTRO' as const })
const buildPanelTourCompleted = (seed: number) => { const base = createBase(seed); for (const milestone of ['SECOND_COACH_INTRO', 'CLUB_PANEL_INTRO', 'CONTINUE_EXPLANATION'] as const) base.gameState = completeOnboardingMilestone(base.gameState, milestone); return base }
const withIntroductions = (base: DevScenarioState) => {
  let gameState = base.gameState
  gameState.completedScenes = [...new Set([...gameState.completedScenes, 'onboarding-staff', 'onboarding-tactics', 'onboarding-squad'])]
  for (const milestone of ['SECOND_COACH_INTRO', 'CLUB_PANEL_INTRO', 'CONTINUE_EXPLANATION', 'STAFF_HIGHLIGHT', 'STAFF_TUTORIAL', 'MESSAGES_HIGHLIGHT', 'MANOLO_MESSAGE', 'TEAM_HIGHLIGHT', 'TEAM_TUTORIAL', 'TACTICS_HIGHLIGHT', 'TACTICS_TUTORIAL', 'TRAINING_HIGHLIGHT'] as const) gameState = completeOnboardingMilestone(gameState, milestone)
  return { ...base, gameState }
}
const buildStaff = (seed: number) => buildPanelTourCompleted(seed)
const buildSquad = (seed: number) => { const base = buildPanelTourCompleted(seed); for (const milestone of ['STAFF_HIGHLIGHT', 'STAFF_TUTORIAL', 'MESSAGES_HIGHLIGHT', 'MANOLO_MESSAGE'] as const) base.gameState = completeOnboardingMilestone(base.gameState, milestone); return base }
const buildTactics = (seed: number) => { const base = buildSquad(seed); base.gameState = completeOnboardingMilestone(base.gameState, 'TEAM_HIGHLIGHT'); base.gameState = completeOnboardingMilestone(base.gameState, 'TEAM_TUTORIAL'); return base }
const buildTrainingTutorial = (seed: number) => ({ ...withIntroductions(createBase(seed)), activeScreen: 'training' as const })
const buildTrainingTutorialCompleted = (seed: number) => { const base = buildTrainingTutorial(seed); base.gameState.onboarding.trainingTutorialCompleted = true; return base }
const resolveTrainingScene = (base: DevScenarioState) => {
  const sessionId = base.gameState.temporal.activeCheckpoint?.relatedId ?? ''
  const firstTraining = base.gameState.onboarding.active === 'FIRST_TRAINING'
  const presence = firstTraining ? ensureFirstTrainingAssistantPresence(base.gameState.staff.members, base.gameState.temporal.activeCheckpoint?.availableStaffIds, base.gameState.temporal.activeCheckpoint?.staffAbsenceNotes) : undefined
  const trainingState = presence ? { ...base.trainingState, sessions: base.trainingState.sessions.map((session) => session.id === sessionId ? { ...session, ...presence } : session) } : base.trainingState
  return { ...base, trainingState: resolveTrainingSession(trainingState, sessionId, base.tacticalPlan, players, base.gameState.staff.members), activeScreen: 'training-event' as const }
}
const asFirstTraining = (base: DevScenarioState) => ({ ...base, gameState: { ...base.gameState, onboarding: { ...base.gameState.onboarding, active: 'FIRST_TRAINING' as const } } })
const buildFirstTraining = (seed: number) => resolveTrainingScene(asFirstTraining(reachTraining(prepareTutorialWeek(withIntroductions(createBase(seed))), 'tuesday')))
const buildFirstTrainingWithAssistant = (archetype: AssistantArchetype) => (seed: number) => resolveTrainingScene(asFirstTraining(reachTraining(prepareTutorialWeek(withIntroductions(createBase(seed, true, archetype))), 'tuesday')))
const buildFirstTrainingJoker = (seed: number) => {
  const base = reachTraining(prepareTutorialWeek(withIntroductions(createBase(seed))), 'tuesday')
  base.trainingState.sessions = base.trainingState.sessions.map((session) => session.id === 'tuesday' ? { ...session, intensity: 'Media', blocks: ['Táctica', 'Balón parado'] } : session)
  return resolveTrainingScene(asFirstTraining(base))
}
const buildFirstTrainingIncident = buildFirstTraining
const buildIncidentResolved = (seed: number) => {
  const base = completeFirstTraining(withIntroductions(createBase(seed)))
  const veteran = selectVeteranForTrainingComplaint(players)!
  base.gameState.onboarding.active = 'FIRST_TRAINING_REPORT'
  base.gameState.onboarding.completed.push('FIRST_TRAINING')
  base.gameState.narrativeFacts.push({ id: VETERAN_COMPLAINT_TRIGGERED_FACT, occurredAt: base.gameState.temporal.currentDateTime, relatedEventId: 'tuesday' }, { id: 'veteranQuestionedTraining', occurredAt: base.gameState.temporal.currentDateTime, subjectId: String(veteran.id) }, { id: 'coachPromisedLowerLoad', occurredAt: base.gameState.temporal.currentDateTime, subjectId: String(veteran.id) })
  base.gameState.promises.push({ id: 'promise-lower-load-next-training', subjectId: String(veteran.id), description: 'El entrenador prometió reducir la carga del siguiente entrenamiento.', kind: 'LOWER_TRAINING_LOAD', status: 'active' })
  return { ...base, activeScreen: 'inbox' as const }
}
const buildSecondTrainingPromise = (seed: number) => { const base = buildIncidentResolved(seed); base.gameState.onboarding.active = 'SECOND_TRAINING'; return resolveTrainingScene(base) }
const buildSecondTrainingVeteranAfterJoker = (seed: number) => {
  const base = completeFirstTraining(withIntroductions(createBase(seed)))
  const joker = selectLockerRoomJoker(base.gameState, players)!
  base.gameState.narrativeFacts.push({ id: LOCKER_ROOM_JOKER_TRIGGERED_FACT, occurredAt: base.gameState.temporal.currentDateTime, subjectId: String(joker.id), relatedEventId: 'tuesday' }, { id: 'coachIgnoredJoke', occurredAt: base.gameState.temporal.currentDateTime, subjectId: String(joker.id) })
  base.gameState.onboarding.active = 'SECOND_TRAINING'
  return resolveTrainingScene(base)
}
const buildSecondTraining = (seed: number) => { const base = completeFirstTraining(withIntroductions(createBase(seed))); base.gameState = completeOnboardingMilestone(base.gameState, 'FIRST_TRAINING'); return resolveTrainingScene(base) }
const buildMessages = (seed: number, mode: 'read' | 'unread' | 'multiple' | 'pending' | 'resolved' | 'report') => {
  const base = withIntroductions(createBase(seed)); base.activeScreen = 'inbox'
  base.gameState.onboarding.active = 'FREE_PRESEASON'
  const conversation = base.gameState.conversations[0]
  conversation.messages.forEach((message) => { message.read = mode === 'read' || mode === 'resolved' })
  if (mode === 'unread') conversation.messages.slice(0, -1).forEach((message) => { message.read = true })
  if (mode === 'pending' || mode === 'resolved') {
    const message = conversation.messages.at(-1)!
    message.responseOptions = [{ id: 'ok', label: 'No pasa nada' }, { id: 'needed', label: 'Dile que necesito que venga' }, { id: 'personal', label: 'Hablaré yo con él' }]
    if (mode === 'resolved') message.chosenResponse = { optionId: 'ok', label: 'No pasa nada', chosenAt: base.gameState.temporal.currentDateTime }
  }
  if (mode === 'report') base.gameState.conversations = [{ id: 'conversation-staff-toni', participantId: 'staff-toni', participantName: 'Toni Casals', participantType: 'STAFF', type: 'DIRECT', messages: [{ id: 'dev-report', senderType: 'STAFF', senderId: 'staff-toni', senderName: 'Toni Casals', timestamp: base.gameState.temporal.currentDateTime, text: '16 jugadores han completado una sesión correcta. No ha habido nada especialmente preocupante.', read: false }] }]
  return base
}
const buildPersistentMessages = (seed: number) => {
  const base = buildMessages(seed, 'read')
  base.gameState.conversations = [
    { ...base.gameState.conversations[0], messages: [...base.gameState.conversations[0].messages, { id: 'dev-manolo-1', senderType: 'PRESIDENT', senderId: 'manolo-escudero', senderName: 'Manolo Escudero', timestamp: '2026-08-25T21:14:00', text: 'Míster', read: true }, { id: 'dev-manolo-2', senderType: 'PRESIDENT', senderId: 'manolo-escudero', senderName: 'Manolo Escudero', timestamp: '2026-08-25T21:14:05', text: 'cuando puedas dime algo', read: true }, { id: 'dev-manolo-3', senderType: 'PRESIDENT', senderId: 'manolo-escudero', senderName: 'Manolo Escudero', timestamp: '2026-08-25T21:14:10', text: 'tenemos un problema con uno de los chavales', read: true }, { id: 'dev-manolo-coach', senderType: 'COACH', senderName: base.gameState.coachName, timestamp: '2026-08-25T21:15:00', text: 'Quería hablar contigo del presupuesto.', read: true }] },
    { id: 'conversation-staff-toni', participantId: 'staff-toni', participantName: 'Toni Casals', participantType: 'STAFF', type: 'DIRECT', messages: [{ id: 'dev-toni-report', senderType: 'STAFF', senderId: 'staff-toni', senderName: 'Toni Casals', timestamp: '2026-08-25T21:17:00', text: '16 jugadores han completado una sesión correcta. No ha habido nada especialmente preocupante.', read: false }] },
    { id: 'conversation-sito', participantId: 'sito', participantName: 'Sito', participantType: 'CLUB', type: 'DIRECT', messages: [{ id: 'dev-sito-pending', senderType: 'CLUB', senderId: 'sito', senderName: 'Sito', timestamp: '2026-08-25T21:18:00', text: 'Para el jueves, ¿prefieres que saque el material antes?', read: false, responseOptions: [{ id: 'yes', label: 'Sí, déjalo preparado' }, { id: 'no', label: 'No hace falta' }] }] },
    { id: 'conversation-player-4', participantId: 'player-4', participantName: 'Marc Soler', participantType: 'PLAYER', type: 'DIRECT', messages: [{ id: 'dev-player-question', senderType: 'PLAYER', senderId: 4, senderName: 'Marc Soler', timestamp: '2026-08-25T20:10:00', text: 'Míster, el jueves llegaré tarde.', read: true, responseOptions: [{ id: 'ok', label: 'Gracias por avisar' }], chosenResponse: { optionId: 'ok', label: 'Gracias por avisar', chosenAt: '2026-08-25T20:11:00' } }, { id: 'dev-player-answer', senderType: 'COACH', senderName: base.gameState.coachName, timestamp: '2026-08-25T20:11:00', text: 'Gracias por avisar', read: true }] },
    { id: 'conversation-team-group', participantId: 'team-group', participantName: 'Grupo del equipo', participantType: 'GROUP', type: 'GROUP', messages: [{ id: 'dev-group-callup', senderType: 'COACH', senderName: base.gameState.coachName, timestamp: '2026-08-25T19:00:00', text: 'Convocatoria para el amistoso del domingo.', read: true }] },
  ]
  return base
}
const buildFriendlyCallUp = (seed: number): DevScenarioState => { const base = reachPreMatch(withIntroductions(createBase(seed))); base.gameState.onboarding.active = 'FRIENDLY_CALL_UP'; return { ...base, activeScreen: 'friendly-call-up' } }
const buildGroup = (seed:number,withMessage:boolean) => { const base=buildPersistentMessages(seed); const messages=withMessage?[{id:'dev-group-week',senderType:'COACH' as const,senderName:base.gameState.coachName,timestamp:'2026-08-24T19:30:00',text:'Esta semana entrenamos martes y jueves. Sed puntuales, que luego se nos hace de noche.',read:true}]:[]; base.gameState.conversations=base.gameState.conversations.filter(item=>item.participantId!=='team-group'); base.gameState.conversations.push({id:'conversation-team-group',participantId:'team-group',participantName:'Grupo del equipo',participantType:'GROUP',type:'GROUP',messages}); base.gameState.selectedConversationId='conversation-team-group'; return {...base,activeScreen:'inbox' as const,focusedConversationId:'conversation-team-group'} }
const buildTeamChatCallUp = (seed: number) => {
  const base = buildFriendlyCallUp(seed)
  const match = getNextMatch(base.gameState.temporal.calendar, 'fc-poblenou')!
  const selected = players.map((player) => player.id)
  let gameState = resolveFriendlySquadAnnouncement(base.gameState, match, selected, players, base.gameState.temporal.currentDateTime).state
  const callUp = createCallUpMessage(gameState, match, selected, players, 'FC Poblenou', 'Pujadas CD', [{ emoji: '👍', count: 6 }, { emoji: '💪', count: 4 }, { emoji: '❤️', count: 2 }])
  gameState = { ...gameState, conversations: appendConversationMessages(gameState.conversations, { participantId: 'team-group', participantName: 'Grupo del equipo', participantType: 'GROUP', type: 'GROUP' }, [callUp]) }
  gameState.onboarding.active = 'TEAM_CHAT'
  return { ...base, gameState, activeScreen: 'inbox' as const, focusedConversationId: 'conversation-team-group', focusedMessageId: callUp.id }
}
const buildTwoReports = (seed:number) => { const base=buildPersistentMessages(seed); base.gameState.conversations=base.gameState.conversations.filter(item=>item.participantId!=='staff-toni'); base.gameState.conversations.push({id:'conversation-staff-toni',participantId:'staff-toni',participantName:'Toni Casals',participantType:'STAFF',type:'DIRECT',messages:[{id:'report-tuesday',senderType:'STAFF',senderId:'staff-toni',senderName:'Toni Casals',timestamp:'2026-08-25T19:30:00',text:'Entrenamiento del martes. Han venido 16 jugadores y la carga ha sido alta.',read:true},{id:'report-thursday',senderType:'STAFF',senderId:'staff-toni',senderName:'Toni Casals',timestamp:'2026-08-27T19:30:00',text:'Entrenamiento del jueves. Han venido 18 jugadores y el equipo ha respondido bien.',read:false}]}); return base }
const buildInitialMessages = (seed:number) => { const base=withIntroductions(createBase(seed)); base.gameState.onboarding.active='INBOX'; return {...base,activeScreen:'inbox' as const,focusedConversationId:'conversation-manolo-escudero',focusedMessageId:base.gameState.conversations.find(item=>item.participantId==='manolo-escudero')?.messages.at(-1)?.id} }
const buildTuesdayReport = (seed:number) => { const base=buildTwoReports(seed); const toni=base.gameState.conversations.find(item=>item.participantId==='staff-toni')!; toni.messages=toni.messages.filter(message=>message.id==='report-tuesday'); base.gameState.onboarding.active='FIRST_TRAINING_REPORT'; return {...base,activeScreen:'inbox' as const,focusedConversationId:toni.id,focusedMessageId:'report-tuesday'} }
const buildBeforeThursday = (seed:number) => { const base=buildTuesdayReport(seed); base.gameState.onboarding.active='SECOND_TRAINING'; return base }
const buildThursdayReport = (seed:number) => { const base=buildTwoReports(seed); base.gameState.onboarding.active='FRIENDLY_CALL_UP'; return {...base,activeScreen:'inbox' as const,focusedConversationId:'conversation-staff-toni',focusedMessageId:'report-thursday'} }
const buildPreMatch = (seed:number, mode:'empty'|'lineup'|'ready') => { const base=buildTeamChatCallUp(seed); const match=getNextMatch(base.gameState.temporal.calendar,'fc-poblenou')!; const lineup=mode==='empty'?[]:base.lineupIds.filter(id=>base.gameState.squadSelections[match.id].playerIds.includes(id)).slice(0,11); base.gameState=savePreMatchPreparation(base.gameState,{matchId:match.id,lineupIds:lineup,tacticalPlan:base.tacticalPlan,completed:false}); return {...base,lineupIds:lineup,activeScreen:'pre-match' as const} }
const buildTalkPending = (seed:number) => {
  const base = prepareTutorialWeek(withIntroductions(createBase(seed)))
  base.gameState.onboarding = {
    ...base.gameState.onboarding,
    active: 'FIRST_TRAINING_TALK',
    completed: [...new Set<OnboardingMilestone>([...base.gameState.onboarding.completed, 'TRAINING_TUTORIAL', 'LOCKER_ROOM_HIGHLIGHT', 'NEXT_MATCH_HIGHLIGHT', 'LEAGUE_HIGHLIGHT', 'MEET_SQUAD'])],
  }
  return { ...base, activeDialogue: 'FIRST_TRAINING_TALK' as const }
}
const buildPostTalk = (seed:number) => { const base=buildTalkPending(seed); base.gameState=completeOnboardingMilestone(base.gameState,'FIRST_TRAINING_TALK'); return {...base,activeDialogue:undefined,activeScreen:'training' as const} }
const buildManoloCase = (seed:number, mode:'info'|'question'|'answered'|'history') => { const base=buildInitialMessages(seed); const manolo=base.gameState.conversations.find(item=>item.participantId==='manolo-escudero')!; if(mode!=='info') manolo.messages.push({id:'dev-manolo-question',senderType:'PRESIDENT',senderId:'manolo-escudero',senderName:'Manolo Escudero',timestamp:'2026-08-25T18:10:00',order:3,text:'Marc lleva dos cuotas pendientes. ¿Qué hacemos con él?',read:false,responseOptions:[{id:'talk',label:'Déjame hablar con él',replyText:'Vale, habla con él y me cuentas.'},{id:'week',label:'Dale otra semana',replyText:'De acuerdo. Una semana más.'}]}); if(mode==='answered') base.gameState.conversations=chooseMessageResponse(base.gameState.conversations,manolo.id,'dev-manolo-question','week',base.gameState.coachName,'2026-08-25T18:10:00'); if(mode==='history') manolo.messages.push({id:'dev-manolo-same-minute',senderType:'PRESIDENT',senderId:'manolo-escudero',senderName:'Manolo Escudero',timestamp:'2026-08-25T18:10:00',order:4,text:'Cuando puedas me dices algo.',read:true},{id:'dev-manolo-next-day',senderType:'PRESIDENT',senderId:'manolo-escudero',senderName:'Manolo Escudero',timestamp:'2026-08-26T09:05:00',order:5,text:'Míster, luego te cuento cómo queda lo de las cuotas.',read:false}); return {...base,focusedConversationId:manolo.id,focusedMessageId:manolo.messages.at(-1)?.id} }
const buildFirstFriendly = (seed: number) => { const base = reachPreMatch(withIntroductions(createBase(seed))); base.gameState = completeOnboardingMilestone(completeOnboardingMilestone(base.gameState, 'FIRST_TRAINING'), 'SECOND_TRAINING'); return base }
const buildMatchdayOne = (seed: number) => { const base = buildFirstFriendly(seed); const friendly = base.gameState.temporal.calendar.find((match) => match.competitionType === 'FRIENDLY'); if (friendly) friendly.status = 'played'; const league = base.gameState.temporal.calendar.find((match) => match.competitionType === 'LEAGUE' && match.matchday === 1 && (match.homeTeamId === 'fc-poblenou' || match.awayTeamId === 'fc-poblenou'))!; base.gameState.onboarding = { completed: ['INTRO', 'CLUB_PANEL_TOUR', 'STAFF', 'TACTICS', 'SQUAD', 'FIRST_TRAINING', 'SECOND_TRAINING', 'FIRST_FRIENDLY'], active: 'COMPLETE', clubPanelTourCompleted: true, clubPanelTourStep: 8, trainingTutorialCompleted: true, trainingTutorialStep: 4 }; base.gameState.temporal.currentDateTime = `${league.date}T${league.time}:00`; base.gameState.temporal.activeCheckpoint = { type: 'PRE_MATCH', at: base.gameState.temporal.currentDateTime, label: `Jornada 1 · ${league.date} ${league.time}`, relatedId: league.id }; return base }
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

export const DEV_SCENARIOS: DevScenarioDefinition[] = [...PREMATCH_DEV_SCENARIOS,
  { id: 'new-game', label: 'Nueva partida normal', onboarding: true, build: buildNewGame },
  { id: 'narrative-manolo', label: 'Narrativa · Manolo', build: buildNarrativeManolo },
  { id: 'after-intro', label: 'Después de Manolo', onboarding: true, build: buildAfterIntro },
  { id: 'panel-tour-completed', label: 'Tour del Panel completado', onboarding: true, build: buildPanelTourCompleted },
  { id: 'staff', label: 'Objetivo · Staff', onboarding: true, build: buildStaff },
  { id: 'onboarding-continue-priority', label: 'Tutorial · CONTINUAR desde Staff sin planificar', onboarding: true, build: (seed)=>{const base=buildStaff(seed);return {...base,activeScreen:'staff' as const}} },
  { id: 'tactics', label: 'Objetivo · Táctica', onboarding: true, build: buildTactics },
  { id: 'squad', label: 'Objetivo · Equipo', onboarding: true, build: buildSquad },
  { id: 'before-initial-messages', label: 'Tutorial · antes de Mensajes iniciales', onboarding: true, build: (seed)=>{const base=withIntroductions(createBase(seed));base.gameState.onboarding.active='SQUAD';return base} },
  { id: 'initial-messages', label: 'Tutorial · Mensajes iniciales de Manolo', onboarding: true, build: buildInitialMessages },
  { id: 'training-tutorial', label: 'Entrenamiento · primer acceso', onboarding: true, build: buildTrainingTutorial },
  { id: 'training-tutorial-completed', label: 'Entrenamiento · tutorial completado', onboarding: true, build: buildTrainingTutorialCompleted },
  { id: 'training-planned', label: 'Entrenamiento · planificación guardada', onboarding: true, build: (seed)=>{const base=withIntroductions(createBase(seed));base.gameState=completeOnboardingMilestone(base.gameState,'INBOX');return prepareTutorialWeek(base)} },
  { id: 'first-training-talk', label: 'Tutorial · charla inicial', onboarding: true, build: buildTalkPending },
  { id: 'post-first-training-talk', label: 'Tutorial · post charla / antes del primer entreno', onboarding: true, build: buildPostTalk },
  { id: 'post-training-tuesday', label: 'Tutorial · informe martes', onboarding: true, build: buildTuesdayReport },
  { id: 'before-training-thursday', label: 'Tutorial · antes del jueves', onboarding: true, build: buildBeforeThursday },
  { id: 'post-training-thursday', label: 'Tutorial · informes martes y jueves', onboarding: true, build: buildThursdayReport },
  { id: 'first-training', label: 'Primer entrenamiento', build: buildFirstTraining },
  { id: 'first-training-youngster', label: 'Primer entrenamiento · joven enchufado', build: buildFirstTrainingWithAssistant('CONNECTED_YOUNGSTER') },
  { id: 'first-training-veteran', label: 'Primer entrenamiento · veterano del club', build: buildFirstTrainingWithAssistant('CLUB_VETERAN') },
  { id: 'first-training-captain', label: 'Primer entrenamiento · excapitán', build: buildFirstTrainingWithAssistant('FORMER_CAPTAIN') },
  { id: 'first-training-trusted', label: 'Primer entrenamiento · segundo de confianza', build: buildFirstTrainingWithAssistant('TRUSTED_ASSISTANT') },
  { id: 'first-training-joker', label: 'Primer entrenamiento normal · gracioso', build: buildFirstTrainingJoker },
  { id: 'first-training-incident', label: 'Incidencia · antes de decidir', build: buildFirstTrainingIncident },
  { id: 'incident-resolved', label: 'Incidencia · promesa registrada', build: buildIncidentResolved },
  { id: 'second-training-promise', label: 'Segundo entrenamiento · con promesa', build: buildSecondTrainingPromise },
  { id: 'second-training-veteran-after-joker', label: 'Segundo entrenamiento · veterano tras gracioso', build: buildSecondTrainingVeteranAfterJoker },
  { id: 'second-training', label: 'Segundo entrenamiento', build: buildSecondTraining },
  { id: 'messages-persistent', label: 'Mensajes · conversaciones persistentes', build: buildPersistentMessages },
  { id: 'messages-read', label: 'Mensajes · todo leído', build: (seed) => buildMessages(seed, 'read') },
  { id: 'messages-unread', label: 'Mensajes · uno sin leer', build: (seed) => buildMessages(seed, 'unread') },
  { id: 'messages-multiple-unread', label: 'Mensajes · varios sin leer', build: (seed) => buildMessages(seed, 'multiple') },
  { id: 'messages-pending', label: 'Mensajes · respuesta pendiente', build: (seed) => buildMessages(seed, 'pending') },
  { id: 'messages-resolved', label: 'Mensajes · respuesta elegida', build: (seed) => buildMessages(seed, 'resolved') },
  { id: 'messages-training-report', label: 'Mensajes · informe informativo', build: (seed) => buildMessages(seed, 'report') },
  { id: 'messages-two-training-reports', label: 'Mensajes · informes martes y jueves', build: buildTwoReports },
  { id: 'manolo-informative', label: 'Manolo · solo mensajes informativos', build: (seed)=>buildManoloCase(seed,'info') },
  { id: 'manolo-question', label: 'Manolo · mensaje que requiere respuesta', build: (seed)=>buildManoloCase(seed,'question') },
  { id: 'manolo-answered', label: 'Manolo · respuesta y réplica', build: (seed)=>buildManoloCase(seed,'answered') },
  { id: 'manolo-history', label: 'Manolo · historial de varios días', build: (seed)=>buildManoloCase(seed,'history') },
  { id: 'group-empty', label: 'Grupo · vacío', build: (seed)=>buildGroup(seed,false) },
  { id: 'group-messages', label: 'Grupo · mensajes normales', build: (seed)=>buildGroup(seed,true) },
  { id: 'friendly-call-up', label: 'Convocatoria · amistoso', build: buildFriendlyCallUp },
  { id: 'team-chat-call-up', label: 'Grupo · convocatoria enviada', build: buildTeamChatCallUp },
  { id: 'pre-match-no-lineup', label: 'Prepartido · sin XI', build: (seed)=>buildPreMatch(seed,'empty') },
  { id: 'pre-match-lineup-no-talk', label: 'Prepartido · charla pendiente', build: (seed)=>buildPreMatch(seed,'lineup') },
  { id: 'pre-match-ready', label: 'Prepartido · listo para jugar', build: (seed)=>buildPreMatch(seed,'ready') },
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

export const usesRealOnboardingFlow = (id: DevScenarioId) => DEV_SCENARIOS.find((scenario) => scenario.id === id)?.onboarding === true

export function createDevScenario(id: DevScenarioId, seed = DEV_SEED_STANDARD) {
  const scenario = DEV_SCENARIOS.find((item) => item.id === id)
  if (!scenario || scenario.disabled) throw new Error(`Escenario DEV no disponible: ${id}`)
  const state = scenario.build(seed >>> 0)
  const missing = validateDevScenario(state, id)
  if (missing.length) throw new Error(`[DEV SCENARIO INVALID]\nScenario: ${id}\nMissing:\n${missing.map((item) => `- ${item}`).join('\n')}`)
  return state
}
