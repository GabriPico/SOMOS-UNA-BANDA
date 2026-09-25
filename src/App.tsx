import { Activity, lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { AppShell } from "./components/AppShell";
import type { ScreenId, TacticalPlan } from "./domain/models";
import {
  initialTacticalPlan,
  leagueSeason,
  leagueSanctions,
  leagueTeams,
  players,
  rivalPlayers,
  rivalTeamProfiles,
} from "./data/mockData";
import { createNewGameState } from "./data/gameState";
import type { InitialGameOverrides } from "./data/gameState";
import { ClubPanelScreen } from "./screens/ClubPanelScreen";
import { StaffScreen } from "./screens/StaffScreen";
import { TacticsScreen } from "./screens/TacticsScreen";
import { TeamScreen } from "./screens/TeamScreen";
import { PlayerProfileScreen } from './screens/PlayerProfileScreen';
import { FORMATION_SLOTS } from './domain/matchTactics';
import { getPlayerStatus, getTrainingObservations } from './presentation/playerPresentation';
import { getTacticalCardIndicators } from './presentation/tacticalPlayerPresentation';
import { TrainingScreen } from "./screens/TrainingScreen";
import { StandingsScreen } from "./screens/StandingsScreen";
import { ResultsScreen } from "./screens/ResultsScreen";
import { ScorersScreen } from "./screens/ScorersScreen";
import { SanctionsScreen } from "./screens/SanctionsScreen";
import { NextMatchScreen } from "./screens/NextMatchScreen";
import { DressingRoomScreen } from "./screens/DressingRoomScreen";
import { ClubPhone } from "./components/ClubPhone";
import { useClubPhone } from "./hooks/useClubPhone";
import { getPhoneAttentionTarget, getPhoneGuide } from "./domain/clubPhone";
import { FriendlyCallUpScreen } from "./screens/FriendlyCallUpScreen";
import { MatchScreen } from "./screens/MatchScreen";
import { MatchReportScreen } from "./screens/MatchReportScreen";
import { getMatchReport } from "./domain/matchReport";
import { PreMatchScreen } from "./screens/PreMatchScreen";
import {
  advanceGame,
  canRequestStaffSearch,
  formatGameDateTime,
  getCurrentMatchday,
  resolveStaffAvailability,
} from "./domain/gameTime";
import { getNextMatch } from "./domain/nextMatch";
import { startPreparedMatch } from "./domain/preMatchFlow";
import { applyPostMatch } from "./domain/postMatch";
import "./App.css";
import type { DevScenarioId, DevScenarioState } from "./dev/devScenarios";
import { resolveTrainingSession } from "./domain/trainingSessionResolver";
import type { TemporalCheckpoint } from "./domain/gameState";
import {
  completeOnboardingMilestone,
  completeTrainingTutorial,
  canNavigateDuringTutorial,
  getOnboardingDestination,
  isGuidedTraining,
  isPreseason,
  setTrainingTutorialStep,
} from "./domain/onboarding";
import {
  areWeeklySessionsPlanned,
  getNextPendingGameEvent,
  shouldValidateTrainingPlanning,
} from "./domain/gameFlow";
import {
  appendTrainingReport,
  createTrainingReportMessages,
} from "./domain/trainingReports";
import type { TrainingGameState } from "./domain/trainingTypes";
import { resolveFriendlySquadAnnouncement, resolveSquadAnnouncement } from "./domain/squadSelection";
import { selectLineupForFormation } from "./domain/lineupSelection";
import { markLockerRoomJokerTriggered, markVeteranComplaintTriggered, resolveVeteranTrainingPromises, selectLockerRoomJoker, shouldTriggerLockerRoomJoker, shouldTriggerVeteranComplaint, VETERAN_COMPLAINT_TRIGGERED_FACT } from "./domain/preseasonOnboarding";
import { appendConversationMessages } from './domain/messages';
import { createCallUpMessage } from './domain/callUpMessages';
import { savePreMatchPreparation, validatePreMatchPreparation } from './domain/preMatch';
import { beginPrematchTalk, completePrematchTalk } from './domain/preMatchTalk';
import { createPrematchTalkScene } from './data/preMatchTalkScene';
import { initialDressingRoomState } from './data/dressingRoomData';
import { hydrateGameState } from './domain/gameStateMigration';
import { calculateTeamMorale, consumeConsequenceFeedback, dismissConsequenceFeedback } from './domain/consequences';
import { ConsequenceFeedback } from './components/ConsequenceFeedback';
import { DevErrorBoundary } from './dev/DevErrorBoundary';
import { NarrativePlayer } from './components/NarrativePlayer';
import { initialTeamTalkScene, narrativeScenes } from './data/narrativeScenes';
import type { NarrativeRuntime, NarrativeScene } from './domain/narrative';
import { ensureFirstTrainingAssistantPresence } from './domain/assistantPersonality';
import { getSeasonLabel } from './presentation/playerPresentation';
import { getPlayerEligibility } from './domain/squadSelection';
import { createLockerRoomJokerNarrativeScene, createManoloConversationScene, createManoloStaffResultScene, createMeetSquadNarrativeScene, createNewGameIntroductionScene, createSecondCoachIntroductionScene, createStaffIntroductionScene, createTrainingPresentationScene, createVeteranComplaintNarrativeScene } from './data/narrativeSceneFactories';

const DevMenu = import.meta.env.DEV
  ? lazy(() => import("./dev/DevMenu"))
  : null;

const navItems: { id: ScreenId; label: string }[] = [
  { id: "club-panel", label: "Panel" },
  { id: "squad", label: "Equipo" },
  { id: "tactics", label: "Tácticas" },
  { id: "training", label: "Entrenamientos" },
  { id: "dressing-room", label: "Estado del vestuario" },
  { id: "next-match", label: "Próximo partido" },
  { id: "standings", label: "Clasificación" },
  { id: "staff", label: "Staff" },
];

function OnboardingPrompt({
  visible,
  text,
  onContinue,
  disabled = false,
  tourTarget,
}: {
  visible: boolean;
  text: string;
  onContinue: () => void;
  disabled?: boolean;
  tourTarget?: string;
}) {
  if (!visible) return null;
  return (
    <aside className="onboarding-prompt">
      <span>PRIMER DÍA</span>
      <p>{text}</p>
      <button
        className="primary-action"
        type="button"
        disabled={disabled}
        onClick={onContinue}
        data-tour-target={tourTarget}
      >
        CONTINUAR
      </button>
    </aside>
  );
}

function App() {
  const [gameState, setGameState] = useState(() => hydrateGameState(createNewGameState(84731)));
  const [activeNarrative, setActiveNarrative] = useState<NarrativeScene | null>(() => createNewGameIntroductionScene(gameState));
  const [narrativeRuntime, setNarrativeRuntime] = useState<NarrativeRuntime | null>(null);
  const [activeScreen, setScreen] = useState<Exclude<ScreenId, 'inbox'>>("club-panel");
  const phone = useClubPhone(gameState, setGameState, Boolean(activeNarrative));

  function openPhoneAttention(state = gameState) {
    const target = getPhoneAttentionTarget(state);
    phone.open(target.conversationId, target.messageId);
  }

  function openClubPhone() {
    if (gameState.onboarding.active === 'MESSAGES_HIGHLIGHT') {
      const progressed = completeOnboardingMilestone(gameState, 'MESSAGES_HIGHLIGHT');
      setGameState(progressed);
      openPhoneAttention(progressed);
    } else if (getPhoneGuide(gameState)) openPhoneAttention();
    else phone.open();
  }

  // Compatibility for saved DEV destinations and existing domain checkpoints.
  // The legacy inbox identifier opens an overlay; it can never become a screen.
  function setActiveScreen(screen: ScreenId) {
    if (screen === 'inbox') openPhoneAttention();
    else setScreen(screen);
  }
  const [reportView, setReportView] = useState<{ matchId: string; afterMatch: boolean } | null>(null);
  const [resultsCompetition, setResultsCompetition] = useState<'league' | 'friendly'>('league');
  const reportMatch = gameState.temporal.calendar.find(match => match.id === reportView?.matchId);
  const openMatchReport = (matchId: string) => {
    const match = gameState.temporal.calendar.find(item => item.id === matchId);
    if (!match) return;
    if (match.matchday > 0) setSelectedLeagueMatchday(match.matchday);
    setResultsCompetition(match.competitionType === 'FRIENDLY' ? 'friendly' : 'league');
    setReportView({ matchId, afterMatch: false });
    setActiveScreen('post-match');
  };
  const [profilePlayerId, setProfilePlayerId] = useState<number | null>(null);
  const profileReturnContext = useRef<{ focus: HTMLElement | null; scrollY: number; containers: { element: Element; top: number }[] } | null>(null);
  const openPlayerProfile = (id: number) => {
    profileReturnContext.current = {
      focus: document.activeElement instanceof HTMLElement ? document.activeElement : null,
      scrollY: window.scrollY,
      containers: Array.from(document.querySelectorAll('.lineup-list-scroll, .tactical-instructions-panel, .tactical-instruction-groups, .player-table-wrapper, .player-detail--inline')).map(element => ({ element, top: element.scrollTop })),
    };
    setProfilePlayerId(id);
  };
  const closePlayerProfile = useCallback(() => {
    setProfilePlayerId(null);
    requestAnimationFrame(() => {
      const context = profileReturnContext.current;
      if (!context) return;
      context.containers.forEach(({ element, top }) => { if (element.isConnected) element.scrollTop = top; });
      context.focus?.focus({ preventScroll: true });
      window.scrollTo(0, context.scrollY);
    });
  }, []);
  const [tacticalPlan, setTacticalPlan] =
    useState<TacticalPlan>(gameState.tacticalPlan ?? initialTacticalPlan);
  const [lineupIds, setLineupIds] = useState(() => gameState.lineupIds ?? selectLineupForFormation(players, initialTacticalPlan.formation));
  const [trainingFocusSessionId, setTrainingFocusSessionId] = useState<string>();
  const [secondTrainingConsequence, setSecondTrainingConsequence] = useState<string>();
  const [trainingValidationAttempt, setTrainingValidationAttempt] = useState(0);
  const [preMatchErrors, setPreMatchErrors] = useState<string[]>([]);
  const trainingState = gameState.training;
  const [selectedLeagueMatchday, setSelectedLeagueMatchday] = useState(
    leagueSeason.currentMatchday,
  );
  const [devScenarioId, setDevScenarioId] = useState<DevScenarioId | null>(
    null,
  );
  const [devSeed, setDevSeed] = useState(84731);
  const [navigationContext, setNavigationContext] = useState<'NORMAL' | 'DEV'>('NORMAL');
  const [devScenarioRevision, setDevScenarioRevision] = useState(0);
  const [devScenarioError, setDevScenarioError] = useState<string>();
  const isDevNavigation = import.meta.env.DEV && navigationContext === 'DEV';
  const nextPendingEvent = getNextPendingGameEvent(gameState);
  const nextScheduledMatch = getNextMatch(
    gameState.temporal.calendar,
    "fc-poblenou",
  );
  const playerEligibility = nextScheduledMatch ? Object.fromEntries(players.map(player => [player.id, getPlayerEligibility(gameState, nextScheduledMatch, player, leagueSanctions)])) : undefined;
  const selectablePlayerIds = gameState.squadSelections[nextScheduledMatch?.id ?? ""]?.announced
    ? gameState.squadSelections[nextScheduledMatch?.id ?? ""]?.playerIds
    : undefined;
  const visibleNavItems = navItems;
  const profilePlayer = players.find(player => player.id === profilePlayerId);
  const profileContext = profilePlayer ? {
    injured: gameState.injuredPlayerIds.includes(profilePlayer.id),
    eligibility: activeScreen === 'tactics' && selectablePlayerIds && !selectablePlayerIds.includes(profilePlayer.id)
      ? { playerId: profilePlayer.id, eligible: false, status: 'UNAVAILABLE' as const, reason: 'No convocado para este partido' }
      : playerEligibility?.[profilePlayer.id],
  } : undefined;
  const lineupGoalkeeper = players.find((player) => player.id === lineupIds[0]);
  const lineupReadyForNextMatch =
    lineupIds.length === 11 &&
    new Set(lineupIds).size === 11 &&
    Boolean(
      lineupGoalkeeper &&
        [lineupGoalkeeper.primaryPosition, ...lineupGoalkeeper.secondaryPositions].includes("POR"),
    ) &&
    (!selectablePlayerIds ||
      lineupIds.every((id) => selectablePlayerIds.includes(id)));
  const nextCheckpoint =
    nextPendingEvent.kind === "TEMPORAL"
      ? nextPendingEvent.checkpoint
      : undefined;
  const consumeFeedback = useCallback((ids: string[]) => setGameState((current) => consumeConsequenceFeedback(current, ids)), []);
  const dismissFeedback = useCallback((id: string) => setGameState((current) => dismissConsequenceFeedback(current, id)), []);

  function openNarrativeDestination(destination: string, state: typeof gameState) {
    const [kind, id] = destination.split(':', 2);
    if (kind === 'PREMATCH_COMPLETE') {
      const completed = completePrematchTalk(state, id);
      const started = startPreparedMatch(completed, id, { teams: leagueTeams, profiles: rivalTeamProfiles, players, rivalPlayers, sanctions: leagueSanctions });
      setGameState(started);
      setActiveNarrative(null);
      setNarrativeRuntime(null);
      setActiveScreen(started.activeMatch ? 'match' : 'pre-match');
      return;
    }
    if (kind === 'NARRATIVE') {
      const nextScene = id === 'second-coach-introduction' ? createSecondCoachIntroductionScene(state) : id === 'initial_team_talk' ? initialTeamTalkScene : narrativeScenes[id];
      if (!nextScene) throw new Error(`Narrative destination not found: ${destination}`);
      setGameState(state);
      setActiveNarrative(nextScene);
      setNarrativeRuntime(null);
      return;
    }
    setGameState(state);
    setActiveNarrative(null);
    setNarrativeRuntime(null);
    if (destination === 'CLUB_PANEL') setActiveScreen('club-panel');
    else if (destination === 'STAFF') setActiveScreen('staff');
    else if (destination === 'RESUME_GAME') { setActiveScreen('club-panel'); window.setTimeout(() => continueGameFrom(state, state.training), 0); }
    else if (destination === 'TRAINING_INCIDENT_COMPLETE') {
      const relatedSessionId = state.narrativeFacts.find((fact) => fact.id === VETERAN_COMPLAINT_TRIGGERED_FACT)?.relatedEventId;
      const relatedSession = state.training.sessions.find((session) => session.id === relatedSessionId);
      const joker = selectLockerRoomJoker(state, players);
      if (activeNarrative?.id === 'first-training-veteran-incident' && state.onboarding.active === 'FRIENDLY_CALL_UP' && relatedSession && joker && shouldTriggerLockerRoomJoker(state, 'SECOND_TRAINING', false)) {
        const withJoker = markLockerRoomJokerTriggered(state, relatedSession, joker.id);
        setGameState(withJoker); setActiveNarrative(createLockerRoomJokerNarrativeScene(withJoker, players, true)); return;
      }
      setActiveScreen('club-panel');
    }
    else if (destination === 'TRAINING_PRESENTATION_COMPLETE') continueAfterTraining(state.training);
  }

  useEffect(() => {
    if (activeScreen !== 'staff' || gameState.onboarding.active !== 'STAFF_HIGHLIGHT' || activeNarrative) return;
    const progressed = completeOnboardingMilestone(gameState, 'STAFF_HIGHLIGHT');
    setGameState(progressed);
    setActiveNarrative(createStaffIntroductionScene(progressed));
  }, [activeNarrative, activeScreen, gameState]);

  function updateTacticalPlan(plan: TacticalPlan) {
    setTacticalPlan(plan);
    setGameState((current) => ({ ...current, tacticalPlan: plan }));
  }

  function updateLineup(ids: number[]) {
    setLineupIds(ids);
    setGameState((current) => ({ ...current, lineupIds: ids }));
  }

  function followOnboarding(
    currentGame: typeof gameState,
    currentTraining = trainingState,
  ) {
    const destination = getOnboardingDestination(currentGame);
    if (destination.kind === "SCENE") {
      if (destination.id === 'FIRST_TRAINING_TALK') {
        setGameState(currentGame);
        setActiveScreen('club-panel');
        setActiveNarrative(initialTeamTalkScene);
        return;
      }
      const scene =
        destination.id === "SECOND_COACH_INTRO"
          ? createSecondCoachIntroductionScene(currentGame)
          : destination.id === "STAFF_TUTORIAL"
            ? createStaffIntroductionScene(currentGame)
          : destination.id === "MEET_SQUAD"
            ? createMeetSquadNarrativeScene(currentGame)
            : createMeetSquadNarrativeScene(currentGame);
      setGameState(currentGame);
      setActiveNarrative(scene);
      return;
    }
    if (destination.kind === "SCREEN") {
      setGameState(currentGame);
      if (destination.id === 'inbox') openPhoneAttention(currentGame);
      else setActiveScreen(destination.id);
      return;
    }
    continueGameFrom(currentGame, currentTraining);
  }

  function openOnboardingSection(screen: "staff" | "tactics" | "squad") {
    if (isDevNavigation) { setActiveScreen(screen); return; }
    if (gameState.onboarding.active === 'STAFF_HIGHLIGHT') {
      if (screen !== 'staff') return;
      const progressed = completeOnboardingMilestone(gameState, 'STAFF_HIGHLIGHT');
      setGameState(progressed);
      setActiveScreen('staff');
      setActiveNarrative(createStaffIntroductionScene(progressed));
      return;
    }
    const highlight = ({ TEAM_HIGHLIGHT: 'squad', TACTICS_HIGHLIGHT: 'tactics' } as const)[gameState.onboarding.active as 'TEAM_HIGHLIGHT' | 'TACTICS_HIGHLIGHT'];
    if (highlight) {
      if (highlight !== screen) return;
      const milestone = gameState.onboarding.active as 'TEAM_HIGHLIGHT' | 'TACTICS_HIGHLIGHT';
      const progressed = completeOnboardingMilestone(gameState, milestone);
      setGameState(progressed);
      setActiveScreen(screen);
      return;
    }
    if (!canNavigateDuringTutorial(gameState.onboarding, screen)) return;
    setActiveScreen(screen);
  }

  function continueOnboardingScreen() {
    const milestone = gameState.onboarding.active;
    const guide = getPhoneGuide(gameState);
    if (guide) {
      if (!guide.canContinue || phone.selectedConversationId !== guide.conversationId) { openPhoneAttention(); return; }
      phone.minimize();
    }
    if (
      ![
        "STAFF",
        "TACTICS",
        "SQUAD",
        "DRESSING_ROOM",
        "INBOX",
        "FIRST_TRAINING_REPORT",
        "TEAM_CHAT",
        "NEXT_MATCH",
        "LEAGUE",
        "MANOLO_MESSAGE",
        "TEAM_TUTORIAL",
        "TACTICS_TUTORIAL",
      ].includes(milestone)
    )
      return;
    const completed = completeOnboardingMilestone(
        gameState,
        milestone as
          | "STAFF"
          | "TACTICS"
          | "SQUAD"
          | "DRESSING_ROOM"
          | "INBOX"
          | "FIRST_TRAINING_REPORT"
          | "TEAM_CHAT"
          | "NEXT_MATCH"
          | "LEAGUE"
          | "MANOLO_MESSAGE"
          | "TEAM_TUTORIAL"
          | "TACTICS_TUTORIAL",
      );
    if (milestone === 'FIRST_TRAINING_REPORT') {
      setGameState(completed);
      setActiveScreen('club-panel');
      return;
    }
    followOnboarding(completed, trainingState);
  }

  function playMatch() {
    const match = getNextMatch(gameState.temporal.calendar, "fc-poblenou");
    if (!match || gameState.activeMatch) return;
    const errors = validatePreMatchPreparation(gameState, match.id, players, leagueSanctions);
    if (errors.length) { setPreMatchErrors(errors); setActiveScreen('pre-match'); return; }
    const next = beginPrematchTalk(gameState, match, { teams: leagueTeams, profiles: rivalTeamProfiles, players, sanctions: leagueSanctions, dressingRoomPlayers: initialDressingRoomState.players });
    const talk = next.preMatchPreparations[match.id]?.talk;
    if (!talk) return;
    if (talk.completed) {
      openNarrativeDestination(`PREMATCH_COMPLETE:${match.id}`, next);
      return;
    }
    setGameState(next);
    setActiveNarrative(createPrematchTalkScene(talk.context));
    setNarrativeRuntime(null);
  }
  function openPreMatch() {
    const match = getNextMatch(gameState.temporal.calendar, "fc-poblenou");
    if (!match) return;
    const selection = gameState.squadSelections[match.id];
    if (!selection?.announced) { setActiveScreen('next-match'); return; }
    const validLineup = lineupIds.filter((id) => selection.playerIds.includes(id)).slice(0, 11);
    const preparation = gameState.preMatchPreparations[match.id] ?? { matchId: match.id, lineupIds: validLineup, tacticalPlan, completed: false };
    setGameState((current) => savePreMatchPreparation(current, preparation));
    setLineupIds(preparation.lineupIds);
    setTacticalPlan(preparation.tacticalPlan);
    setPreMatchErrors([]);
    setActiveScreen('pre-match');
  }

  function updatePreMatch(lineup = lineupIds, plan = tacticalPlan) {
    const match = getNextMatch(gameState.temporal.calendar, "fc-poblenou");
    if (!match) return;
    setGameState((current) => savePreMatchPreparation(current, { matchId: match.id, lineupIds: lineup, tacticalPlan: plan, completed: false }));
    setPreMatchErrors([]);
  }

  function announceSquad(playerIds: number[]) {
    const match = getNextMatch(gameState.temporal.calendar, "fc-poblenou");
    if (!match || match.competitionType === "FRIENDLY")
      return ["Este partido no necesita una convocatoria oficial."];
    const resolved = resolveSquadAnnouncement(
      gameState,
      match,
      playerIds,
      players,
      leagueSanctions,
      gameState.temporal.currentDateTime,
    );
    if (resolved.errors.length) return resolved.errors;
    const homeName = leagueTeams.find((team) => team.id === match.homeTeamId)?.name ?? match.homeTeamId;
    const awayName = leagueTeams.find((team) => team.id === match.awayTeamId)?.name ?? match.awayTeamId;
    const message = createCallUpMessage(resolved.state, match, playerIds, players, homeName, awayName, [{ emoji: '👍', count: 6 }, { emoji: '💪', count: 4 }]);
    const announcedState = { ...resolved.state, selectedConversationId: 'conversation-team-group', conversations: appendConversationMessages(resolved.state.conversations, { participantId: 'team-group', participantName: 'Grupo del equipo', participantType: 'GROUP', type: 'GROUP' }, [message]) };
    setGameState(announcedState);
    setLineupIds((current) => {
      const retained = current.filter((id) => playerIds.includes(id));
      return [
        ...retained,
        ...playerIds.filter((id) => !retained.includes(id)),
      ].slice(0, 11);
    });
    phone.open('conversation-team-group', message.id);
    return [];
  }

  function sendFriendlyCallUp(playerIds: number[]) {
    const match = getNextMatch(gameState.temporal.calendar, "fc-poblenou");
    if (!match || match.competitionType !== "FRIENDLY") return ["No hay un amistoso pendiente."];
    const resolved = resolveFriendlySquadAnnouncement(gameState, match, playerIds, players, gameState.temporal.currentDateTime);
    if (resolved.errors.length) return resolved.errors;
    const rivalId = match.homeTeamId === "fc-poblenou" ? match.awayTeamId : match.homeTeamId;
    const rivalName = leagueTeams.find((team) => team.id === rivalId)?.name ?? rivalId;
    const message = createCallUpMessage(resolved.state, match, playerIds, players, 'FC Poblenou', rivalName, [{ emoji: '👍', count: 6 }, { emoji: '💪', count: 4 }, { emoji: '❤️', count: 2 }]);
    let next: typeof gameState = { ...resolved.state, selectedConversationId: 'conversation-team-group', conversations: appendConversationMessages(resolved.state.conversations, { participantId: 'team-group', participantName: 'Grupo del equipo', participantType: 'GROUP', type: 'GROUP' }, [message]) };
    next = completeOnboardingMilestone(next, "FRIENDLY_CALL_UP");
    setGameState(next);
    setLineupIds((current) => [...current.filter((id) => playerIds.includes(id)), ...playerIds.filter((id) => !current.includes(id))].slice(0, 11));
    phone.open('conversation-team-group', message.id);
    return [];
  }

  function finishMatch() {
    if (!gameState.activeMatch || gameState.activeMatch.phase !== 'FINISHED') return;
    const playedMatchday = gameState.temporal.calendar.find(
      (match) => match.id === gameState.activeMatch?.matchId,
    )?.matchday;
    const completed = applyPostMatch(
      gameState,
      trainingState,
      gameState.activeMatch,
      players,
      rivalPlayers,
    );
    const completedGame = {
      ...completed.gameState,
      training: completed.trainingState,
    };
    setGameState(completedGame);
    if (playedMatchday) setSelectedLeagueMatchday(playedMatchday);
    setReportView({ matchId: completed.matchState.matchId, afterMatch: true });
    setResultsCompetition(completed.matchState.competitionType === 'FRIENDLY' ? 'friendly' : 'league');
    setActiveScreen('post-match');
  }

  function openTrainingEvent(
    currentGame: typeof gameState,
    currentTraining: typeof trainingState,
    checkpoint: TemporalCheckpoint,
  ) {
    const checkpointStaff = currentGame.onboarding.active === 'FIRST_TRAINING'
      ? ensureFirstTrainingAssistantPresence(currentGame.staff.members, checkpoint.availableStaffIds, checkpoint.staffAbsenceNotes)
      : { availableStaffIds: checkpoint.availableStaffIds, staffAbsenceNotes: checkpoint.staffAbsenceNotes };
    const prepared = {
      ...currentTraining,
      sessions: currentTraining.sessions.map((session) =>
        session.id === checkpoint.relatedId
          ? {
              ...session,
              availableStaffIds: checkpointStaff.availableStaffIds,
              staffAbsenceNotes: checkpointStaff.staffAbsenceNotes,
              plannedStaffIds:
                session.plannedStaffIds ??
                currentGame.staff.members
                  .filter(
                    (member) =>
                      member.role !== "PRIMER_ENTRENADOR" &&
                      member.isUsuallyAvailable,
                  )
                  .map((member) => member.id),
            }
          : session,
      ),
    };
    if (
      prepared.sessions.find((session) => session.id === checkpoint.relatedId)
        ?.planningStatus !== "PLANNED"
    ) {
      setGameState(currentGame);
      setActiveScreen("training");
      return;
    }
    const resolved = resolveTrainingSession(
      prepared,
      checkpoint.relatedId ?? "",
      tacticalPlan,
      players,
      currentGame.staff.members,
    );
    const session = resolved.sessions.find(
      (item) => item.id === checkpoint.relatedId,
    );
    const sessionIndex = resolved.sessions.findIndex((item) => item.id === checkpoint.relatedId);
    const nextSession = sessionIndex === 0 ? resolved.sessions[1] : undefined;
    const reports = session
      ? createTrainingReportMessages(
          session,
          currentGame.staff.members,
          checkpoint.at,
          resolved.week,
          nextSession,
          resolved,
          players,
        )
      : [];
    const planningQuestion = reports[0]?.messages.find((message) => message.responseOptions?.some((option) => option.id === 'KEEP_SECOND_SESSION'));
    const nextState: typeof currentGame = {
      ...currentGame,
      training: resolved,
      conversations: appendTrainingReport(currentGame.conversations, reports),
      secondSessionPlanningDecision: planningQuestion && session && nextSession && currentGame.secondSessionPlanningDecision?.messageId !== planningQuestion.id ? {
        week: resolved.week,
        firstSessionId: session.id,
        targetSessionId: nextSession.id,
        messageId: planningQuestion.id,
        status: 'PENDING' as const,
      } : currentGame.secondSessionPlanningDecision,
    };
    setGameState(nextState);
    if (session) setActiveNarrative(createTrainingPresentationScene(nextState, session, players, currentGame.staff.members));
  }

  function continueGameFrom(
    currentGame = gameState,
    currentTraining = trainingState,
  ) {
    const active = currentGame.temporal.activeCheckpoint;
    if (active?.type === "TRAINING") {
      openTrainingEvent(currentGame, currentTraining, active);
      return;
    }
    if (active?.type === "PRE_MATCH") {
      const matchId = active.relatedId ?? '';
      if (currentGame.squadSelections[matchId]?.announced) {
        setPreMatchErrors(validatePreMatchPreparation(currentGame, matchId));
        setActiveScreen("pre-match");
      } else setActiveScreen("next-match");
      return;
    }
    const pending = currentGame.temporal.pendingConversations[0];
    if (pending) {
      setActiveNarrative(createManoloStaffResultScene(currentGame, pending.relatedId ?? ""));
      return;
    }
    const completedIds = currentTraining.sessions
      .filter((session) => session.status === "completed")
      .map((session) => session.id);
    const advanced = advanceGame(currentGame, completedIds);
    setGameState(advanced.state);
    if (advanced.checkpoint?.type === "TRAINING") {
      openTrainingEvent(advanced.state, currentTraining, advanced.checkpoint);
    } else if (advanced.checkpoint?.type === "PRE_MATCH")
      setActiveScreen("next-match");
    else if (advanced.checkpoint?.type === "CONVERSATION") {
      const requestId = advanced.checkpoint.relatedId ?? "";
      setActiveNarrative(createManoloStaffResultScene(advanced.state, requestId));
    }
  }

  const continueGame = () => {
    const secondSessionDecision = gameState.secondSessionPlanningDecision;
    const secondSessionStillPending = secondSessionDecision
      ? gameState.training.sessions.find((session) => session.id === secondSessionDecision.targetSessionId)?.status !== 'completed'
      : false;
    const isClosingSecondSessionDecision = Boolean(
      secondSessionDecision
      && (secondSessionDecision.status === 'KEPT' || secondSessionDecision.status === 'REVIEWED')
      && secondSessionStillPending
      && (activeScreen !== 'club-panel' || phone.isPhoneOpen),
    );
    if (isClosingSecondSessionDecision) {
      const closed = gameState.onboarding.active === 'FIRST_TRAINING_REPORT'
        ? completeOnboardingMilestone(gameState, 'FIRST_TRAINING_REPORT')
        : gameState;
      setGameState(closed);
      setTrainingFocusSessionId(undefined);
      phone.minimize();
      setActiveScreen('club-panel');
      return;
    }
    if (gameState.onboarding.active === "TRAINING_TUTORIAL" || gameState.onboarding.active === "TRAINING_PLANNING") {
      if (!areWeeklySessionsPlanned(gameState)) {
        setActiveScreen("training");
        setTrainingValidationAttempt((value) => value + 1);
        return;
      }
      const milestone = gameState.onboarding.active as 'TRAINING_TUTORIAL' | 'TRAINING_PLANNING';
      const progressed = completeOnboardingMilestone(gameState, milestone);
      setGameState(progressed);
      setActiveScreen('club-panel');
      return;
    }
    if (gameState.onboarding.active === 'CONTINUE_EXPLANATION') {
      const progressed = completeOnboardingMilestone(gameState, 'CONTINUE_EXPLANATION');
      setGameState(progressed);
      setActiveScreen('club-panel');
      return;
    }
    if (gameState.onboarding.active === 'LOCKER_ROOM_HIGHLIGHT' || gameState.onboarding.active === 'NEXT_MATCH_HIGHLIGHT' || gameState.onboarding.active === 'LEAGUE_HIGHLIGHT') {
      const milestone = gameState.onboarding.active;
      const progressed = completeOnboardingMilestone(gameState, milestone);
      setGameState(progressed);
      followOnboarding(progressed, progressed.training);
      return;
    }
    if (gameState.onboarding.active === 'FIRST_TRAINING_READY') {
      const progressed = completeOnboardingMilestone(gameState, 'FIRST_TRAINING_READY');
      setGameState(progressed);
      continueGameFrom(progressed, progressed.training);
      return;
    }
    if (gameState.onboarding.active === 'CLUB_PANEL_INTRO' || gameState.onboarding.active === 'STAFF_HIGHLIGHT' || gameState.onboarding.active === 'MESSAGES_HIGHLIGHT' || gameState.onboarding.active === 'TEAM_HIGHLIGHT' || gameState.onboarding.active === 'TACTICS_HIGHLIGHT' || gameState.onboarding.active === 'TRAINING_HIGHLIGHT' || gameState.onboarding.active === 'STAFF_TUTORIAL') return;
    const pending = getNextPendingGameEvent(gameState);
    if (pending.kind === "ONBOARDING") {
      if (getPhoneGuide(gameState)) {
        if (phone.isPhoneOpen) continueOnboardingScreen();
        else openPhoneAttention();
        return;
      }
      const requiredScreen = ({ TEAM_TUTORIAL: 'squad', TACTICS_TUTORIAL: 'tactics', TRAINING_TUTORIAL: 'training', STAFF: 'staff', TACTICS: 'tactics', SQUAD: 'squad', DRESSING_ROOM: 'club-panel', NEXT_MATCH: 'club-panel', LEAGUE: 'club-panel' } as const)[gameState.onboarding.active as 'TEAM_TUTORIAL' | 'TACTICS_TUTORIAL' | 'TRAINING_TUTORIAL' | 'STAFF' | 'TACTICS' | 'SQUAD' | 'DRESSING_ROOM' | 'NEXT_MATCH' | 'LEAGUE'];
      if (requiredScreen && activeScreen === requiredScreen) {
        if ((gameState.onboarding.active === 'TACTICS' || gameState.onboarding.active === 'TACTICS_TUTORIAL') && lineupIds.length !== 11) return;
        continueOnboardingScreen();
      } else setActiveScreen(pending.screen);
      return;
    }
    if (shouldValidateTrainingPlanning(gameState) && !areWeeklySessionsPlanned(gameState)) {
      setActiveScreen("training");
      setTrainingValidationAttempt((value) => value + 1);
      return;
    }
    if (
      pending.kind === "PLAN_TRAINING" ||
      pending.kind === "INBOX_ATTENTION" ||
      pending.kind === "SQUAD_SELECTION"
    ) {
      setActiveScreen(pending.screen);
      if (pending.kind === "PLAN_TRAINING") setTrainingValidationAttempt((value) => value + 1);
      return;
    }
    continueGameFrom();
  };
  function continueAfterTraining(nextTraining: typeof trainingState) {
    const milestone =
      gameState.onboarding.active === "FIRST_TRAINING"
        ? "FIRST_TRAINING"
        : gameState.onboarding.active === "SECOND_TRAINING"
          ? "SECOND_TRAINING"
          : undefined;
    const session = nextTraining.sessions.find((item) => item.id === gameState.temporal.activeCheckpoint?.relatedId);
    let progressed = { ...gameState, training: nextTraining };
    if (session) {
      const resolution = resolveVeteranTrainingPromises(progressed, session);
      progressed = resolution.state;
      setSecondTrainingConsequence(resolution.narrative);
    }
    if (milestone) progressed = completeOnboardingMilestone(progressed, milestone);
    const triggerComplaint = Boolean(session && shouldTriggerVeteranComplaint(progressed, session));
    if (session && triggerComplaint) progressed = markVeteranComplaintTriggered(progressed, session);
    const triggerJoker = Boolean(session && milestone && shouldTriggerLockerRoomJoker(progressed, milestone, triggerComplaint));
    if (session && triggerJoker && !triggerComplaint) {
      const joker = selectLockerRoomJoker(progressed, players);
      if (joker) progressed = markLockerRoomJokerTriggered(progressed, session, joker.id);
    }
    const cleared = {
      ...progressed,
      temporal: { ...progressed.temporal, activeCheckpoint: undefined },
    };
    const nextGame = cleared;
    setGameState(nextGame);
    if (session && triggerComplaint) {
      setActiveNarrative(createVeteranComplaintNarrativeScene(nextGame, players, session));
      return;
    }
    if (triggerJoker && !triggerComplaint) {
      setActiveNarrative(createLockerRoomJokerNarrativeScene(nextGame, players));
      return;
    }
    if (milestone === "FIRST_TRAINING") {
      setActiveScreen("club-panel");
      return;
    }
    if (milestone === "SECOND_TRAINING") {
      setActiveScreen("club-panel");
      return;
    }
    setActiveScreen("club-panel");
  }

  function updateTrainingState(next: TrainingGameState) {
    const activeSessionId =
      gameState.temporal.activeCheckpoint?.type === "TRAINING"
        ? gameState.temporal.activeCheckpoint.relatedId
        : undefined;
    const justCompleted =
      activeSessionId &&
      next.sessions.find((session) => session.id === activeSessionId)
        ?.status === "completed";
    setGameState((current) => ({
      ...current,
      training: next,
      temporal: justCompleted
        ? { ...current.temporal, activeCheckpoint: undefined }
        : current.temporal,
    }));
  }

  function applyDevState(
    id: DevScenarioId,
    seed: number,
    state: DevScenarioState,
    useRealOnboarding: boolean,
  ) {
    const scenarioGameState = hydrateGameState({ ...state.gameState, training: state.trainingState });
    scenarioGameState.consequences.feedbackQueue = [];
    if (state.focusedConversationId) scenarioGameState.selectedConversationId = state.focusedConversationId;
    setGameState(scenarioGameState);
    setTacticalPlan(state.tacticalPlan);
    setLineupIds(state.lineupIds);
    setProfilePlayerId(null);
    setReportView(null);
    setResultsCompetition('league');
    setScreen(state.activeScreen === 'inbox' ? 'club-panel' : state.activeScreen);
    const devTrainingSession = state.activeScreen === 'training-event' ? scenarioGameState.training.sessions.find((session) => session.id === scenarioGameState.temporal.activeCheckpoint?.relatedId && session.result) : undefined;
    const devTalk = Object.values(scenarioGameState.preMatchPreparations).find((preparation) => preparation.talk && state.activeNarrativeId === "prematch-talk-" + preparation.matchId)?.talk;
    setActiveNarrative(devTalk ? createPrematchTalkScene(devTalk.context) : state.activeNarrativeId ? narrativeScenes[state.activeNarrativeId] ?? null : state.activeDialogue === 'SECOND_COACH_INTRO' ? createSecondCoachIntroductionScene(scenarioGameState) : state.activeDialogue === 'MEET_SQUAD' ? createMeetSquadNarrativeScene(scenarioGameState) : state.activeDialogue === 'FIRST_TRAINING_TALK' ? initialTeamTalkScene : devTrainingSession ? createTrainingPresentationScene(scenarioGameState, devTrainingSession, players, scenarioGameState.staff.members) : !scenarioGameState.completedScenes.includes('new-game-introduction') ? createNewGameIntroductionScene(scenarioGameState) : null);
    setNarrativeRuntime(null);
    phone.reset(state.activeScreen === 'inbox', state.focusedMessageId);
    setSelectedLeagueMatchday(1);
    setTrainingFocusSessionId(undefined);
    setSecondTrainingConsequence(undefined);
    setTrainingValidationAttempt(0);
    setPreMatchErrors([]);
    setNavigationContext(useRealOnboarding ? 'NORMAL' : 'DEV');
    setDevScenarioError(undefined);
    setDevScenarioRevision((current) => current + 1);
    setDevScenarioId(id);
    setDevSeed(seed);
  }

  async function loadDevScenario(id: DevScenarioId, seed: number) {
    if (!import.meta.env.DEV) return;
    try {
      const { createDevScenario, usesRealOnboardingFlow } = await import("./dev/devScenarios");
      applyDevState(id, seed, createDevScenario(id, seed), usesRealOnboardingFlow(id));
    } catch (error) {
      const message = error instanceof Error ? error.stack ?? error.message : String(error);
      console.error('[DEV SCENARIO INVALID]', { scenario: id, error });
      setDevScenarioId(id);
      setDevSeed(seed);
      setNavigationContext('DEV');
      setDevScenarioError(message);
    }
  }

  function resetDevOnboarding(seed: number, overrides: InitialGameOverrides) {
    if (!import.meta.env.DEV) return;
    const fresh = createNewGameState(seed, overrides);
    setGameState(hydrateGameState(fresh));
    setTacticalPlan(fresh.tacticalPlan);
    setLineupIds(fresh.lineupIds);
    setActiveNarrative(createNewGameIntroductionScene(fresh));
    setNarrativeRuntime(null);
    setActiveScreen('club-panel');
    setTrainingFocusSessionId(undefined);
    setSecondTrainingConsequence(undefined);
    setTrainingValidationAttempt(0);
    phone.reset();
    setPreMatchErrors([]);
    setSelectedLeagueMatchday(leagueSeason.currentMatchday);
    setDevScenarioId(null);
    setDevSeed(seed);
    setNavigationContext('NORMAL');
    setDevScenarioError(undefined);
    setDevScenarioRevision((current) => current + 1);
  }

  const devTools =
    import.meta.env.DEV && DevMenu ? (
      <Suspense fallback={null}>
        <DevMenu
          activeScenarioId={devScenarioId}
          seed={devSeed}
          generatedAssistant={gameState.assistantArchetype}
          hasDelegate={gameState.staff.members.some((member) => member.role === 'DELEGADO')}
          gameState={gameState}
          narrativeRuntime={narrativeRuntime}
          onLoad={loadDevScenario}
          onResetOnboarding={resetDevOnboarding}
          onReset={() => {
            if (devScenarioId) void loadDevScenario(devScenarioId, devSeed);
          }}
        />
      </Suspense>
    ) : null;

  const resetActiveDevScenario = () => { if (devScenarioId) void loadDevScenario(devScenarioId, devSeed); };
  const returnToDevPanel = () => { setDevScenarioError(undefined); setActiveNarrative(null); setNarrativeRuntime(null); setActiveScreen('club-panel'); setDevScenarioRevision((current) => current + 1); };

  if (devScenarioError) return <>{devTools}<main className="dev-error-screen"><section><span>DEV SCENARIO ERROR</span><h1>{devScenarioId}</h1><pre>{devScenarioError}</pre><div><button type="button" onClick={resetActiveDevScenario}>REINICIAR ESCENARIO</button><button type="button" onClick={returnToDevPanel}>VOLVER A ESCENARIOS DEV</button></div></section></main></>;

  return (
    <>
      <ConsequenceFeedback key={devScenarioRevision} queue={gameState.consequences.feedbackQueue} onConsume={consumeFeedback} onDismiss={dismissFeedback} />
      <DevErrorBoundary key={devScenarioRevision} enabled={import.meta.env.DEV} scenarioLabel={devScenarioId ?? activeScreen} onResetScenario={resetActiveDevScenario} onReturnToDev={returnToDevPanel}><AppShell
        activeScreen={activeScreen}
        contentView={profilePlayer ? 'player-profile' : undefined}
        navItems={visibleNavItems}
        onNavigate={(screen) => {
          if (!isDevNavigation && !canNavigateDuringTutorial(gameState.onboarding, screen)) return;
          setProfilePlayerId(null);
          if (!isDevNavigation && screen === 'training' && gameState.onboarding.active === 'INBOX') {
            openPhoneAttention();
            return;
          }
          if (screen === "staff" || screen === "tactics" || screen === "squad") openOnboardingSection(screen);
          else setActiveScreen(screen);
        }}
        dateLabel={formatGameDateTime(gameState.temporal.currentDateTime)}
        nextMatch={nextScheduledMatch}
        teams={leagueTeams}
        matchday={isPreseason(gameState) ? 0 : getCurrentMatchday(gameState)}
        onContinue={() => { setProfilePlayerId(null); continueGame(); }}
        continueLabel={nextPendingEvent.label}
        phone={<ClubPhone key={devScenarioRevision} phone={phone} conversations={gameState.conversations} calls={gameState.calls ?? []}
          currentDateTime={gameState.temporal.currentDateTime} staffMembers={gameState.staff.members} players={players}
          coachName={gameState.coachName} guide={getPhoneGuide(gameState)} onOpen={openClubPhone}
          onContinue={continueOnboardingScreen} suspended={Boolean(activeNarrative)} />}
      >
        <Activity mode={profilePlayer ? 'hidden' : 'visible'}>
        {activeScreen === "club-panel" && (
          <ClubPanelScreen
            tacticalPlan={tacticalPlan}
            trainingState={trainingState}
            conversations={gameState.conversations}
            secondSessionNeedsReview={gameState.secondSessionPlanningDecision?.status === 'REVIEW_REQUIRED'}
            expectations={gameState.expectations}
            matches={gameState.temporal.calendar}
            currentMatchday={getCurrentMatchday(gameState)}
            nextCheckpoint={nextCheckpoint}
            squadSelections={gameState.squadSelections}
            continueLabel={nextPendingEvent.label}
            onboarding={gameState.onboarding}
            onTourComplete={() => setGameState((current) => completeOnboardingMilestone(current, current.onboarding.active === 'CLUB_PANEL_INTRO' ? 'CLUB_PANEL_INTRO' : 'CLUB_PANEL_TOUR'))}
            onContinue={continueGame}
            onOpenStaff={() => openOnboardingSection("staff")}
            onOpenTeam={() => openOnboardingSection("squad")}
            onOpenTactics={() => openOnboardingSection("tactics")}
            onOpenTraining={() => {
              if (isDevNavigation) { setActiveScreen('training'); return; }
              if (gameState.onboarding.active === 'INBOX' || gameState.onboarding.active === 'MANOLO_MESSAGE') {
                openPhoneAttention();
              } else if (gameState.onboarding.active === 'TRAINING_HIGHLIGHT') {
                const progressed = completeOnboardingMilestone(gameState, 'TRAINING_HIGHLIGHT');
                setGameState(progressed);
                setActiveScreen('training');
              } else if (canNavigateDuringTutorial(gameState.onboarding, 'training')) setActiveScreen("training");
            }}
            onOpenLeague={() => (isDevNavigation || canNavigateDuringTutorial(gameState.onboarding, 'standings')) ? setActiveScreen("standings") : undefined}
            onOpenNextMatch={() => (isDevNavigation || canNavigateDuringTutorial(gameState.onboarding, 'next-match')) ? setActiveScreen("next-match") : undefined}
            onOpenDressingRoom={() => (isDevNavigation || canNavigateDuringTutorial(gameState.onboarding, 'dressing-room')) ? setActiveScreen("dressing-room") : undefined}
            onOpenInbox={openClubPhone}
          />
        )}
        {activeScreen === "next-match" && (
          <NextMatchScreen
            matches={gameState.temporal.calendar}
            goalEvents={gameState.goalEvents}
            matchReady={
              gameState.temporal.activeCheckpoint?.type === "PRE_MATCH"
            }
            gameState={gameState}
            onAnnounceSquad={announceSquad}
            lineupReady={lineupReadyForNextMatch}
            onBack={() => setActiveScreen("club-panel")}
            onOpenTactics={() => setActiveScreen("tactics")}
            onPlay={openPreMatch}
            onOpenReport={openMatchReport}
          />
        )}
        {activeScreen === "friendly-call-up" && nextScheduledMatch?.competitionType === "FRIENDLY" && (
          <>
            {secondTrainingConsequence && <aside className="onboarding-prompt"><span>DESPUÉS DEL ENTRENAMIENTO</span><p>{secondTrainingConsequence}</p></aside>}
            <FriendlyCallUpScreen gameState={gameState} match={nextScheduledMatch} players={players} onSend={sendFriendlyCallUp} onBack={() => setActiveScreen("club-panel")} />
          </>
        )}
        {activeScreen === "dressing-room" && (
          <>
            <OnboardingPrompt
              visible={gameState.onboarding.active === "DRESSING_ROOM"}
              text="Aquí ves cómo está el grupo: autoridad, cohesión, felicidad y los problemas que vayan apareciendo. Ahora están tranquilos; en el fútbol esto cambia deprisa."
              onContinue={continueOnboardingScreen}
            />
            <DressingRoomScreen
              cohesion={gameState.team.cohesion}
              promises={gameState.promises}
              onOpenSquad={() => { if (isDevNavigation || canNavigateDuringTutorial(gameState.onboarding, 'squad')) setActiveScreen("squad") }}
              morale={calculateTeamMorale(gameState)}
              trainingState={trainingState}
              playerSeasonStats={gameState.playerSeasonStats}
              injuredPlayerIds={gameState.injuredPlayerIds}
              playerFees={gameState.clubFinances.playerFees}
              playerCompensations={gameState.clubFinances.playerCompensations}
              onBack={() => { if (isDevNavigation || gameState.onboarding.active !== 'DRESSING_ROOM') setActiveScreen("club-panel") }}
            />
          </>
        )}
        {activeScreen === "squad" && (
          <>
            <OnboardingPrompt
              visible={gameState.onboarding.active === "TEAM_TUTORIAL" || gameState.onboarding.active === "SQUAD"}
              text="Selecciona un jugador para consultar su ficha a la derecha. Verás sus posiciones, atributos aproximados y estado. Los jugadores A prueba entrenan y juegan amistosos, pero no Liga."
              onContinue={continueOnboardingScreen}
            />
            <TeamScreen
              onOpenPlayer={openPlayerProfile}
              seasonLabel={getSeasonLabel(gameState.temporal.startedAt)}
              eligibility={playerEligibility}
              playerSeasonStats={gameState.playerSeasonStats}
              trainingState={trainingState}
              injuredPlayerIds={gameState.injuredPlayerIds}
              playerFees={gameState.clubFinances.playerFees}
              playerCompensations={gameState.clubFinances.playerCompensations}
              onBack={() => { if (isDevNavigation || (gameState.onboarding.active !== 'TEAM_TUTORIAL' && gameState.onboarding.active !== 'SQUAD')) setActiveScreen("club-panel") }}
            />
          </>
        )}
        {activeScreen === "staff" && (
          <>
            <OnboardingPrompt
              visible={gameState.onboarding.active === "STAFF"}
              text="Este es el pequeño grupo que nos ayuda. Revisa roles, disponibilidad y acuerdos: en fútbol amateur algunos trabajan gratis. La calidad real no siempre es evidente y la relación personal con cada uno importa."
              onContinue={continueOnboardingScreen}
            />
            <StaffScreen
              staffState={gameState.staff}
              sportsBudget={gameState.sportsBudget}
              playerCompensations={Object.values(
                gameState.clubFinances.playerCompensations,
              )}
              staffSearchRequests={gameState.staffSearchRequests}
              onTalkToManolo={() =>
                setActiveNarrative(
                  createManoloConversationScene(
                    canRequestStaffSearch(
                      gameState,
                      trainingState.sessions.some(
                        (session) => session.status === "completed",
                      ),
                    ),
                    gameState,
                  ),
                )
              }
              onStaffStateChange={(staff) =>
                setGameState((current) => ({ ...current, staff }))
              }
              onBack={() => { if (isDevNavigation || gameState.onboarding.active !== 'STAFF') setActiveScreen("club-panel") }}
            />
          </>
        )}
        {activeScreen === "tactics" && (
          <>
            <OnboardingPrompt
              visible={gameState.onboarding.active === "TACTICS_TUTORIAL" || gameState.onboarding.active === "TACTICS"}
              text="Elige formación, coloca titulares y banquillo y revisa las instrucciones. Verás qué puestos son naturales o improvisados. Puedes probar la sugerencia falible de tu segundo; el once que dejes aquí queda guardado."
              onContinue={continueOnboardingScreen}
              disabled={lineupIds.length !== 11}
            />
            <TacticsScreen
              onOpenPlayer={openPlayerProfile}
              injuredPlayerIds={gameState.injuredPlayerIds}
              seasonLabel={getSeasonLabel(gameState.temporal.startedAt)}
              eligibility={playerEligibility}
              tacticalPlan={tacticalPlan}
              onTacticalPlanChange={updateTacticalPlan}
              lineupIds={lineupIds}
              onLineupChange={updateLineup}
              trainingState={trainingState}
              staffMembers={gameState.staff.members}
              seed={gameState.temporal.seed}
              preseason={isPreseason(gameState)}
              selectablePlayerIds={selectablePlayerIds}
              onBack={() => { if (isDevNavigation || (gameState.onboarding.active !== 'TACTICS_TUTORIAL' && gameState.onboarding.active !== 'TACTICS')) setActiveScreen("club-panel") }}
            />
          </>
        )}
        {activeScreen === "training" && (
          <>
            <OnboardingPrompt
              visible={gameState.onboarding.active === "TRAINING_TUTORIAL" || gameState.onboarding.active === "TRAINING_PLANNING"}
              text={
                areWeeklySessionsPlanned(gameState)
                  ? "Las dos sesiones están guardadas. Volvamos al Panel; todavía falta terminar el recorrido antes de entrenar."
                  : "Prepara las dos sesiones de esta semana. Planificar una no bloquea la otra: podrás retocar el jueves después del martes."
              }
              onContinue={continueGame}
              disabled={!areWeeklySessionsPlanned(gameState)}
              tourTarget="training-continue"
            />
            <TrainingScreen
              tacticalPlan={tacticalPlan}
              trainingState={trainingState}
              nextMatch={nextScheduledMatch}
              staffMembers={gameState.staff.members}
              activeSessionId={trainingFocusSessionId}
              injuredPlayerIds={gameState.injuredPlayerIds}
              guided={isGuidedTraining(gameState)}
              tutorialActive={
                (gameState.onboarding.active === "TRAINING_TUTORIAL" || gameState.onboarding.active === "TRAINING_PLANNING") &&
                !gameState.onboarding.trainingTutorialCompleted
              }
              tutorialCompleted={gameState.onboarding.trainingTutorialCompleted}
              tutorialStep={gameState.onboarding.trainingTutorialStep}
              onTutorialStepChange={(step) =>
                setGameState((current) => setTrainingTutorialStep(current, step))
              }
              onTutorialComplete={() =>
                setGameState((current) => completeTrainingTutorial(current))
              }
              onTrainingStateChange={updateTrainingState}
              onBack={() => { if (isDevNavigation || (gameState.onboarding.active !== 'TRAINING_TUTORIAL' && gameState.onboarding.active !== 'TRAINING_PLANNING')) setActiveScreen("club-panel") }}
              onOpenTactics={() => { if (isDevNavigation || (gameState.onboarding.active !== 'TRAINING_TUTORIAL' && gameState.onboarding.active !== 'TRAINING_PLANNING')) setActiveScreen("tactics") }}
              onFinishEditing={trainingFocusSessionId ? () => { setTrainingFocusSessionId(undefined); setActiveScreen("club-panel"); } : undefined}
              reviewRequiredSessionId={gameState.secondSessionPlanningDecision?.status === 'REVIEW_REQUIRED' ? gameState.secondSessionPlanningDecision.targetSessionId : undefined}
              onSessionPlanSaved={(sessionId) => {
                setGameState((current) => current.secondSessionPlanningDecision?.status === 'REVIEW_REQUIRED' && current.secondSessionPlanningDecision.targetSessionId === sessionId ? { ...current, secondSessionPlanningDecision: { ...current.secondSessionPlanningDecision, status: 'REVIEWED' } } : current);
                setTrainingFocusSessionId(undefined);
                setActiveScreen("club-panel");
              }}
              validationAttempt={trainingValidationAttempt}
            />
          </>
        )}
        {activeScreen === "standings" && (
          <StandingsScreen
            matches={gameState.temporal.calendar}
            currentMatchday={getCurrentMatchday(gameState)}
            onBack={() => setActiveScreen("club-panel")}
            onOpenResults={() => setActiveScreen("league-results")}
            onOpenSanctions={() => setActiveScreen("league-sanctions")}
            onOpenScorers={() => setActiveScreen("league-scorers")}
            selectedMatchday={selectedLeagueMatchday}
            onMatchdayChange={setSelectedLeagueMatchday}
          />
        )}
        {activeScreen === "league-results" && (
          <ResultsScreen
            onOpenMatch={openMatchReport}
            competition={resultsCompetition}
            onCompetitionChange={setResultsCompetition}
            liveMatches={gameState.temporal.calendar}
            currentMatchday={getCurrentMatchday(gameState)}
            onBack={() => setActiveScreen("club-panel")}
            onOpenStandings={() => setActiveScreen("standings")}
            onOpenSanctions={() => setActiveScreen("league-sanctions")}
            onOpenScorers={() => setActiveScreen("league-scorers")}
            selectedMatchday={selectedLeagueMatchday}
            onMatchdayChange={setSelectedLeagueMatchday}
          />
        )}
        {activeScreen === "league-scorers" && (
          <ScorersScreen
            matches={gameState.temporal.calendar}
            goalEvents={gameState.goalEvents}
            currentMatchday={getCurrentMatchday(gameState)}
            onBack={() => setActiveScreen("club-panel")}
            onOpenResults={() => setActiveScreen("league-results")}
            onOpenStandings={() => setActiveScreen("standings")}
            onOpenSanctions={() => setActiveScreen("league-sanctions")}
            selectedMatchday={selectedLeagueMatchday}
            onMatchdayChange={setSelectedLeagueMatchday}
          />
        )}
        {activeScreen === "league-sanctions" && (
          <SanctionsScreen
            onBack={() => setActiveScreen("club-panel")}
            onOpenResults={() => setActiveScreen("league-results")}
            onOpenStandings={() => setActiveScreen("standings")}
            onOpenScorers={() => setActiveScreen("league-scorers")}
            selectedMatchday={selectedLeagueMatchday}
            onMatchdayChange={setSelectedLeagueMatchday}
          />
        )}
        {activeScreen === 'post-match' && reportMatch && (
          <MatchReportScreen
            match={reportMatch}
            report={getMatchReport(reportMatch, gameState.matchReports, gameState.goalEvents, players, rivalPlayers)}
            onBack={() => setActiveScreen('league-results')}
            onContinue={reportView?.afterMatch ? () => continueGameFrom(gameState, trainingState) : undefined}
          />
        )}
        {activeScreen === "match" &&
          gameState.activeMatch &&
          (() => {
            const availability = resolveStaffAvailability(
              gameState.staff.members,
              gameState.activeMatch.matchId,
              gameState.temporal.currentDateTime,
              gameState.temporal.seed,
            );
            const assistant = gameState.staff.members.find(
              (member) =>
                member.role === "SEGUNDO_ENTRENADOR" &&
                availability.availableStaffIds.includes(member.id),
            );
            return (
              <MatchScreen
                match={gameState.activeMatch}
                assistant={assistant}
                onChange={(activeMatch) =>
                  setGameState((current) => ({ ...current, activeMatch }))
                }
                onFinish={finishMatch}
              />
            );
          })()}
        {activeScreen === "pre-match" && nextScheduledMatch && (
          <PreMatchScreen match={nextScheduledMatch} gameState={gameState} lineupIds={lineupIds} tacticalPlan={tacticalPlan} trainingState={trainingState} staffMembers={gameState.staff.members} errors={preMatchErrors}
            onBack={() => setActiveScreen('next-match')}
            onLineupChange={(ids) => { setLineupIds(ids); updatePreMatch(ids, tacticalPlan) }}
            onPlanChange={(plan) => { setTacticalPlan(plan); updatePreMatch(lineupIds, plan) }}

            onPlay={playMatch}/>
        )}
        </Activity>
        {profilePlayer && <PlayerProfileScreen player={profilePlayer} origin={activeScreen === 'tactics' ? 'tactics' : 'squad'} onBack={closePlayerProfile}
          trainingState={trainingState.players[profilePlayer.id]} seasonStats={gameState.playerSeasonStats[profilePlayer.id]} seasonLabel={getSeasonLabel(gameState.temporal.startedAt)}
          currentTacticalPosition={FORMATION_SLOTS[tacticalPlan.formation][lineupIds.indexOf(profilePlayer.id)]}
          status={getPlayerStatus(profilePlayer, trainingState.players[profilePlayer.id], { ...profileContext, observations: getTrainingObservations(trainingState, profilePlayer.id) })}
          cardIndicators={getTacticalCardIndicators(profilePlayer, trainingState.players[profilePlayer.id], profileContext)}
          playerFee={profilePlayer.clubStatus === 'TRIAL' ? undefined : gameState.clubFinances.playerFees[profilePlayer.id]}
          playerCompensation={profilePlayer.clubStatus === 'TRIAL' ? undefined : gameState.clubFinances.playerCompensations[profilePlayer.id]} />}
      </AppShell></DevErrorBoundary>
      {activeNarrative && <NarrativePlayer
        key={`${activeNarrative.id}:${devScenarioRevision}`}
        scene={activeNarrative}
        gameState={gameState}
        onGameStateChange={setGameState}
        onRuntimeChange={setNarrativeRuntime}
        devMode={import.meta.env.DEV}
        onComplete={(completedState, destination) => {
          const completion = activeNarrative.completion;
          const withScene = completion?.completedSceneId && !completedState.completedScenes.includes(completion.completedSceneId)
            ? { ...completedState, completedScenes: [...completedState.completedScenes, completion.completedSceneId] }
            : completedState;
          let progressed = completion?.onboardingMilestone ? completeOnboardingMilestone(withScene, completion.onboardingMilestone) : withScene;
          if (activeNarrative.id === 'staff-onboarding-tutorial') progressed = { ...progressed, conversations: progressed.conversations.map((conversation) => conversation.participantId === 'manolo-escudero' ? { ...conversation, messages: conversation.messages.map((message) => message.id === 'welcome-first-week' ? { ...message, read: false } : message) } : conversation) };
          openNarrativeDestination(destination, progressed);
        }}
      />}
      {devTools}
    </>
  );
}

export default App;
