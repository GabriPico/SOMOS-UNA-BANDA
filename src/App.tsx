import { lazy, Suspense, useState } from "react";
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
  tactics,
} from "./data/mockData";
import { createNewGameState } from "./data/gameState";
import { newGameIntroduction } from "./data/introScene";
import { ClubPanelScreen } from "./screens/ClubPanelScreen";
import { StaffScreen } from "./screens/StaffScreen";
import { TacticsScreen } from "./screens/TacticsScreen";
import { TeamScreen } from "./screens/TeamScreen";
import { TrainingScreen } from "./screens/TrainingScreen";
import { TrainingSessionEventScreen } from "./screens/TrainingSessionEventScreen";
import { StandingsScreen } from "./screens/StandingsScreen";
import { ResultsScreen } from "./screens/ResultsScreen";
import { ScorersScreen } from "./screens/ScorersScreen";
import { SanctionsScreen } from "./screens/SanctionsScreen";
import { NextMatchScreen } from "./screens/NextMatchScreen";
import { DressingRoomScreen } from "./screens/DressingRoomScreen";
import { InboxScreen } from "./screens/InboxScreen";
import { ConversationScreen } from "./screens/ConversationScreen";
import { MatchScreen } from "./screens/MatchScreen";
import type { DialogueScene } from "./domain/dialogue";
import { createManoloConversation } from "./data/manoloConversation";
import { createManoloStaffSearchResultConversation } from "./data/manoloConversation";
import {
  advanceGame,
  canRequestStaffSearch,
  formatGameDateTime,
  getCurrentMatchday,
  resolveStaffAvailability,
} from "./domain/gameTime";
import { getNextMatch } from "./domain/nextMatch";
import { createMatchState, startMatch } from "./domain/matchEngine";
import { applyPostMatch } from "./domain/postMatch";
import "./App.css";
import type { DevScenarioId, DevScenarioState } from "./dev/devScenarios";
import { resolveTrainingSession } from "./domain/trainingSessionResolver";
import type { TemporalCheckpoint } from "./domain/gameState";
import {
  completeOnboardingMilestone,
  getOnboardingDestination,
  isGuidedTraining,
  isPreseason,
} from "./domain/onboarding";
import {
  createSquadIntroduction,
  createStaffIntroduction,
  createTacticsIntroduction,
} from "./data/onboardingScenes";
import {
  areWeeklySessionsPlanned,
  getNextPendingGameEvent,
} from "./domain/gameFlow";
import {
  appendUniqueMessages,
  createTrainingReportMessages,
} from "./domain/trainingReports";
import type { TrainingGameState } from "./domain/trainingTypes";
import { resolveSquadAnnouncement } from "./domain/squadSelection";

const DevMenu = import.meta.env.DEV
  ? lazy(() => import("./dev/DevMenu"))
  : null;

const navItems: { id: ScreenId; label: string }[] = [
  { id: "club-panel", label: "Panel del club" },
  { id: "squad", label: "Equipo" },
  { id: "staff", label: "Staff" },
  { id: "tactics", label: "Táctica" },
  { id: "training", label: "Entrenamiento" },
];

function OnboardingPrompt({
  visible,
  text,
  onContinue,
  disabled = false,
}: {
  visible: boolean;
  text: string;
  onContinue: () => void;
  disabled?: boolean;
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
      >
        CONTINUAR
      </button>
    </aside>
  );
}

function App() {
  const [gameState, setGameState] = useState(() => createNewGameState(84731));
  const [activeConversation, setActiveConversation] =
    useState<DialogueScene | null>(null);
  const [activeScreen, setActiveScreen] = useState<ScreenId>("club-panel");
  const [tacticalPlan, setTacticalPlan] =
    useState<TacticalPlan>(initialTacticalPlan);
  const [lineupIds, setLineupIds] = useState(() => [...tactics.startingEleven]);
  const [trainingFocusSessionId, setTrainingFocusSessionId] = useState<string>();
  const trainingState = gameState.training;
  const [selectedLeagueMatchday, setSelectedLeagueMatchday] = useState(
    leagueSeason.currentMatchday,
  );
  const [devScenarioId, setDevScenarioId] = useState<DevScenarioId | null>(
    null,
  );
  const [devSeed, setDevSeed] = useState(84731);
  const nextPendingEvent = getNextPendingGameEvent(gameState);
  const nextScheduledMatch = getNextMatch(
    gameState.temporal.calendar,
    "fc-poblenou",
  );
  const selectablePlayerIds =
    nextScheduledMatch?.competitionType !== "FRIENDLY"
      ? gameState.squadSelections[nextScheduledMatch?.id ?? ""]?.playerIds
      : undefined;
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
  const pendingOnboardingDestination = gameState.completedScenes.includes(
    newGameIntroduction.id,
  )
    ? getOnboardingDestination(gameState)
    : undefined;

  function followOnboarding(
    currentGame: typeof gameState,
    currentTraining = trainingState,
  ) {
    const destination = getOnboardingDestination(currentGame);
    if (destination.kind === "SCENE") {
      const scene =
        destination.id === "STAFF"
          ? createStaffIntroduction(currentGame)
          : destination.id === "TACTICS"
            ? createTacticsIntroduction(currentGame)
            : createSquadIntroduction(currentGame);
      setGameState(currentGame);
      setActiveConversation(scene);
      return;
    }
    if (destination.kind === "SCREEN") {
      setGameState(currentGame);
      setActiveScreen(destination.id);
      return;
    }
    continueGameFrom(currentGame, currentTraining);
  }

  function continueOnboardingScreen() {
    const milestone = gameState.onboarding.active;
    if (
      ![
        "STAFF",
        "TACTICS",
        "SQUAD",
        "DRESSING_ROOM",
        "INBOX",
        "FIRST_TRAINING_REPORT",
      ].includes(milestone)
    )
      return;
    followOnboarding(
      completeOnboardingMilestone(
        gameState,
        milestone as
          | "STAFF"
          | "TACTICS"
          | "SQUAD"
          | "DRESSING_ROOM"
          | "INBOX"
          | "FIRST_TRAINING_REPORT",
      ),
      trainingState,
    );
  }

  function playMatch() {
    const match = getNextMatch(gameState.temporal.calendar, "fc-poblenou");
    if (
      !match ||
      gameState.temporal.activeCheckpoint?.type !== "PRE_MATCH" ||
      gameState.activeMatch
    )
      return;
    const officialSelection =
      match.competitionType === "FRIENDLY"
        ? undefined
        : gameState.squadSelections[match.id];
    if (!lineupReadyForNextMatch) return;
    if (
      match.competitionType !== "FRIENDLY" &&
      (!officialSelection?.announced ||
        lineupIds.some((id) => !officialSelection.playerIds.includes(id)))
    )
      return;
    const homeName =
      leagueTeams.find((team) => team.id === match.homeTeamId)?.name ??
      match.homeTeamId;
    const awayName =
      leagueTeams.find((team) => team.id === match.awayTeamId)?.name ??
      match.awayTeamId;
    const opponentId =
      match.homeTeamId === "fc-poblenou" ? match.awayTeamId : match.homeTeamId;
    const opponentFormation =
      rivalTeamProfiles.find((profile) => profile.teamId === opponentId)
        ?.preferredFormation ?? "4-4-2";
    const activeMatch = startMatch(
      createMatchState({
        match,
        homeName,
        awayName,
        clubPlayers: officialSelection
          ? players.filter((player) =>
              officialSelection.playerIds.includes(player.id),
            )
          : players,
        rivalPlayers,
        lineupIds,
        plan: tacticalPlan,
        training: trainingState,
        opponentFormation,
        seed: gameState.temporal.seed + match.matchday * 1009,
        cohesion: gameState.dressingRoomCohesion,
      }),
    );
    setGameState((current) => ({ ...current, activeMatch }));
    setActiveScreen("match");
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
    setGameState(resolved.state);
    setLineupIds((current) => {
      const retained = current.filter((id) => playerIds.includes(id));
      return [
        ...retained,
        ...playerIds.filter((id) => !retained.includes(id)),
      ].slice(0, 11);
    });
    return [];
  }

  function finishMatch() {
    if (!gameState.activeMatch) return;
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
    continueGameFrom(completedGame, completed.trainingState);
  }

  function openTrainingEvent(
    currentGame: typeof gameState,
    currentTraining: typeof trainingState,
    checkpoint: TemporalCheckpoint,
  ) {
    const prepared = {
      ...currentTraining,
      sessions: currentTraining.sessions.map((session) =>
        session.id === checkpoint.relatedId
          ? {
              ...session,
              availableStaffIds: checkpoint.availableStaffIds,
              staffAbsenceNotes: checkpoint.staffAbsenceNotes,
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
    const reports = session
      ? createTrainingReportMessages(
          session,
          currentGame.staff.members,
          checkpoint.at,
          currentGame.onboarding.active === "FIRST_TRAINING",
        )
      : [];
    setGameState({
      ...currentGame,
      training: resolved,
      inboxMessages: appendUniqueMessages(currentGame.inboxMessages, reports),
    });
    setActiveScreen("training-event");
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
      setActiveScreen("next-match");
      return;
    }
    const pending = currentGame.temporal.pendingConversations[0];
    if (pending) {
      setActiveConversation(
        createManoloStaffSearchResultConversation(pending.relatedId ?? ""),
      );
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
      setActiveConversation(
        createManoloStaffSearchResultConversation(requestId),
      );
    }
  }

  const continueGame = () => {
    const pending = getNextPendingGameEvent(gameState);
    if (
      pending.kind === "ONBOARDING" ||
      pending.kind === "PLAN_TRAINING" ||
      pending.kind === "INBOX_ATTENTION" ||
      pending.kind === "SQUAD_SELECTION"
    ) {
      setActiveScreen(pending.screen);
      return;
    }
    if (
      gameState.onboarding.active === "TRAINING_PLANNING" &&
      areWeeklySessionsPlanned(gameState)
    ) {
      const progressed = completeOnboardingMilestone(
        gameState,
        "TRAINING_PLANNING",
      );
      setGameState(progressed);
      continueGameFrom(progressed, progressed.training);
      return;
    }
    continueGameFrom();
  };
  function continueAfterTraining(nextTraining: typeof trainingState, modifyNext = false) {
    const milestone =
      gameState.onboarding.active === "FIRST_TRAINING"
        ? "FIRST_TRAINING"
        : gameState.onboarding.active === "SECOND_TRAINING"
          ? "SECOND_TRAINING"
          : undefined;
    const progressed = milestone
      ? completeOnboardingMilestone(gameState, milestone)
      : gameState;
    const cleared = {
      ...progressed,
      temporal: { ...progressed.temporal, activeCheckpoint: undefined },
    };
    const nextGame = { ...cleared, training: nextTraining };
    setGameState(nextGame);
    if (milestone === "FIRST_TRAINING") {
      if (modifyNext) {
        const nextSession = nextTraining.sessions.find((session) => session.status !== "completed");
        setTrainingFocusSessionId(nextSession?.id);
        setActiveScreen("training");
      } else setActiveScreen("inbox");
      return;
    }
    continueGameFrom(nextGame, nextTraining);
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
  ) {
    setGameState({ ...state.gameState, training: state.trainingState });
    setTacticalPlan(state.tacticalPlan);
    setLineupIds(state.lineupIds);
    setActiveScreen(state.activeScreen);
    setActiveConversation(null);
    setSelectedLeagueMatchday(1);
    setDevScenarioId(id);
    setDevSeed(seed);
  }

  async function loadDevScenario(id: DevScenarioId, seed: number) {
    if (!import.meta.env.DEV) return;
    const { createDevScenario } = await import("./dev/devScenarios");
    applyDevState(id, seed, createDevScenario(id, seed));
  }

  const devTools =
    import.meta.env.DEV && DevMenu ? (
      <Suspense fallback={null}>
        <DevMenu
          activeScenarioId={devScenarioId}
          seed={devSeed}
          onLoad={loadDevScenario}
          onReset={() => {
            if (devScenarioId) void loadDevScenario(devScenarioId, devSeed);
          }}
        />
      </Suspense>
    ) : null;

  if (!gameState.completedScenes.includes(newGameIntroduction.id)) {
    return (
      <>
        {devTools}
        <ConversationScreen
          scene={newGameIntroduction}
          gameState={gameState}
          onGameStateChange={setGameState}
          onComplete={(completedState) => {
            if (newGameIntroduction.completionFlow === "CONTINUE")
              followOnboarding(completedState, trainingState);
            else {
              setGameState(completedState);
              setActiveScreen("club-panel");
            }
          }}
        />
      </>
    );
  }
  if (!activeConversation && pendingOnboardingDestination?.kind === "SCENE") {
    const scene =
      pendingOnboardingDestination.id === "STAFF"
        ? createStaffIntroduction(gameState)
        : pendingOnboardingDestination.id === "TACTICS"
          ? createTacticsIntroduction(gameState)
          : createSquadIntroduction(gameState);
    return (
      <>
        {devTools}
        <ConversationScreen
          scene={scene}
          gameState={gameState}
          onGameStateChange={setGameState}
          onComplete={(completedState) =>
            followOnboarding(completedState, trainingState)
          }
        />
      </>
    );
  }
  if (activeConversation) {
    return (
      <>
        {devTools}
        <ConversationScreen
          scene={activeConversation}
          gameState={gameState}
          onGameStateChange={setGameState}
          onComplete={(completedState) => {
            setActiveConversation(null);
            if (activeConversation.id.startsWith("onboarding-"))
              followOnboarding(completedState, trainingState);
            else {
              setGameState(completedState);
              if (activeConversation.completionFlow === "CONTINUE")
                continueGameFrom(completedState, trainingState);
            }
          }}
        />
      </>
    );
  }

  return (
    <>
      <AppShell
        activeScreen={activeScreen}
        navItems={navItems}
        onNavigate={setActiveScreen}
        dateLabel={formatGameDateTime(gameState.temporal.currentDateTime)}
        matchday={isPreseason(gameState) ? 0 : getCurrentMatchday(gameState)}
      >
        {activeScreen === "club-panel" && (
          <ClubPanelScreen
            tacticalPlan={tacticalPlan}
            trainingState={trainingState}
            messages={gameState.inboxMessages}
            expectations={gameState.expectations}
            matches={gameState.temporal.calendar}
            currentMatchday={getCurrentMatchday(gameState)}
            nextCheckpoint={nextCheckpoint}
            squadSelections={gameState.squadSelections}
            continueLabel={nextPendingEvent.label}
            onContinue={continueGame}
            onOpenStaff={() => setActiveScreen("staff")}
            onOpenTeam={() => setActiveScreen("squad")}
            onOpenTactics={() => setActiveScreen("tactics")}
            onOpenTraining={() => setActiveScreen("training")}
            onOpenLeague={() => setActiveScreen("standings")}
            onOpenNextMatch={() => setActiveScreen("next-match")}
            onOpenDressingRoom={() => setActiveScreen("dressing-room")}
            onOpenInbox={() => setActiveScreen("inbox")}
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
            onPlay={playMatch}
          />
        )}
        {activeScreen === "dressing-room" && (
          <>
            <OnboardingPrompt
              visible={gameState.onboarding.active === "DRESSING_ROOM"}
              text="Aquí ves cómo está el grupo: autoridad, cohesión, felicidad y los problemas que vayan apareciendo. Ahora están tranquilos; en el fútbol esto cambia deprisa."
              onContinue={continueOnboardingScreen}
            />
            <DressingRoomScreen
              cohesion={gameState.dressingRoomCohesion}
              trainingState={trainingState}
              expectations={gameState.expectations}
              playerFees={gameState.clubFinances.playerFees}
              playerCompensations={gameState.clubFinances.playerCompensations}
              onBack={() => setActiveScreen("club-panel")}
            />
          </>
        )}
        {activeScreen === "inbox" && (
          <>
            <OnboardingPrompt
              visible={
                gameState.onboarding.active === "INBOX" ||
                gameState.onboarding.active === "FIRST_TRAINING_REPORT"
              }
              text={
                gameState.onboarding.active === "FIRST_TRAINING_REPORT"
                  ? "El entrenamiento ya ha terminado. Aquí encontrarás la interpretación del Staff y cualquier seguimiento posterior."
                  : "Aquí llegarán mensajes del presidente, informes del Staff, avisos médicos y asuntos de los jugadores."
              }
              onContinue={continueOnboardingScreen}
              disabled={
                gameState.onboarding.active === "FIRST_TRAINING_REPORT" &&
                gameState.inboxMessages.some(
                  (message) =>
                    message.attention === "REQUIRES_ATTENTION" &&
                    message.status === "new",
                )
              }
            />
            <InboxScreen
              messages={gameState.inboxMessages}
              focusedMessageId={
                gameState.onboarding.active === "FIRST_TRAINING_REPORT"
                  ? gameState.inboxMessages.find(
                      (message) =>
                        message.attention === "REQUIRES_ATTENTION" &&
                        message.status === "new",
                    )?.id
                  : undefined
              }
              onMessagesChange={(inboxMessages) =>
                setGameState((current) => ({ ...current, inboxMessages }))
              }
              onBack={() => setActiveScreen("club-panel")}
            />
          </>
        )}
        {activeScreen === "squad" && (
          <>
            <OnboardingPrompt
              visible={gameState.onboarding.active === "SQUAD"}
              text="Los jugadores con la etiqueta A prueba entrenan y pueden jugar amistosos, pero todavía no forman parte definitiva de la plantilla."
              onContinue={continueOnboardingScreen}
            />
            <TeamScreen
              playerSeasonStats={gameState.playerSeasonStats}
              trainingState={trainingState}
              injuredPlayerIds={gameState.injuredPlayerIds}
              playerFees={gameState.clubFinances.playerFees}
              playerCompensations={gameState.clubFinances.playerCompensations}
              onBack={() => setActiveScreen("club-panel")}
            />
          </>
        )}
        {activeScreen === "staff" && (
          <>
            <OnboardingPrompt
              visible={gameState.onboarding.active === "STAFF"}
              text="Aquí puedes consultar el rol, la disponibilidad y el acuerdo de cada persona. Sus capacidades reales se irán conociendo trabajando juntos."
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
                setActiveConversation(
                  createManoloConversation(
                    canRequestStaffSearch(
                      gameState,
                      trainingState.sessions.some(
                        (session) => session.status === "completed",
                      ),
                    ),
                  ),
                )
              }
              onStaffStateChange={(staff) =>
                setGameState((current) => ({ ...current, staff }))
              }
              onBack={() => setActiveScreen("club-panel")}
            />
          </>
        )}
        {activeScreen === "tactics" && (
          <>
            <OnboardingPrompt
              visible={gameState.onboarding.active === "TACTICS"}
              text="Elige una formación y coloca un once válido. La cifra de cada jugador corresponde al puesto que ocupa; las instrucciones necesitan entrenamiento para asentarse."
              onContinue={continueOnboardingScreen}
              disabled={lineupIds.length !== 11}
            />
            <TacticsScreen
              tacticalPlan={tacticalPlan}
              onTacticalPlanChange={setTacticalPlan}
              lineupIds={lineupIds}
              onLineupChange={setLineupIds}
              trainingState={trainingState}
              staffMembers={gameState.staff.members}
              seed={gameState.temporal.seed}
              preseason={isPreseason(gameState)}
              selectablePlayerIds={selectablePlayerIds}
              onBack={() => setActiveScreen("club-panel")}
            />
          </>
        )}
        {activeScreen === "training" && (
          <>
            <OnboardingPrompt
              visible={gameState.onboarding.active === "TRAINING_PLANNING"}
              text={
                areWeeklySessionsPlanned(gameState)
                  ? "Semana planificada. CONTINUAR te llevará al entrenamiento del martes."
                  : "Prepara las dos sesiones de esta semana. Planificar una no bloquea la otra: podrás retocar el jueves después del martes."
              }
              onContinue={continueGame}
              disabled={!areWeeklySessionsPlanned(gameState)}
            />
            <TrainingScreen
              tacticalPlan={tacticalPlan}
              trainingState={trainingState}
              staffMembers={gameState.staff.members}
              activeSessionId={trainingFocusSessionId}
              injuredPlayerIds={gameState.injuredPlayerIds}
              guided={isGuidedTraining(gameState)}
              onTrainingStateChange={updateTrainingState}
              onBack={() => setActiveScreen("club-panel")}
              onOpenTactics={() => setActiveScreen("tactics")}
              onFinishEditing={trainingFocusSessionId ? () => { setTrainingFocusSessionId(undefined); setActiveScreen("inbox"); } : undefined}
            />
          </>
        )}
        {activeScreen === "training-event" &&
          (() => {
            const sessionId = gameState.temporal.activeCheckpoint?.relatedId;
            const session = trainingState.sessions.find(
              (item) => item.id === sessionId,
            );
            const nextSession = trainingState.sessions.find(
              (item) => item.status !== "completed" && item.id !== sessionId,
            );
            return session?.result ? (
              <TrainingSessionEventScreen
                session={session}
                nextSession={nextSession}
                staff={gameState.staff.members}
                onContinue={() => continueAfterTraining(trainingState)}
                onKeepNextPlan={() => continueAfterTraining(trainingState)}
                onModifyNextPlan={() => continueAfterTraining(trainingState, true)}
              />
            ) : null;
          })()}
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
      </AppShell>
      {devTools}
    </>
  );
}

export default App;
