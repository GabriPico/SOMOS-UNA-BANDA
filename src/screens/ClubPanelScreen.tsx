import "./ClubPanelScreen.css";
import { OnboardingSpotlight } from "../components/OnboardingSpotlight";
import { NextMatchSummary } from "../components/NextMatchSummary";
import { initialDressingRoomState } from "../data/dressingRoomData";
import { leagueSanctions, leagueTeams, players } from "../data/mockData";
import {
  getAuthorityLabel,
  getCohesionLabel,
  getMoodLabel,
} from "../domain/humanState";
import { EXPECTATION_ASSESSMENT_LABELS } from "../domain/inbox";
import { countPendingResponses, countUnreadConversations } from '../domain/messages';
import {
  calculateStandings,
  getStandingsAroundTeam,
} from "../domain/leagueStandings";
import { getSanctionsForMatchday } from "../domain/leagueSanctions";
import type { LeagueMatch, TacticalPlan } from "../domain/models";
import type { OnboardingState, TemporalCheckpoint } from "../domain/gameState";
import type { ClubExpectationsState } from "../domain/inbox";
import type { MessageConversation } from '../domain/messages';
import { getNextMatch } from "../domain/nextMatch";
import {
  getPlayerHappiness,
  getTeamAuthority,
  getTeamHappiness,
} from "../domain/trainingEngine";
import type { TrainingGameState } from "../domain/trainingTypes";
import type { MatchSquadSelection } from "../domain/squadSelection";

type Props = {
  tacticalPlan: TacticalPlan;
  trainingState: TrainingGameState;
  conversations: MessageConversation[];
  secondSessionNeedsReview?: boolean;
  expectations: ClubExpectationsState;
  matches: LeagueMatch[];
  currentMatchday: number;
  nextCheckpoint?: TemporalCheckpoint;
  squadSelections: Record<string, MatchSquadSelection>;
  continueLabel: string;
  onboarding: OnboardingState;
  onTourComplete: () => void;
  onContinue: () => void;
  onOpenStaff: () => void;
  onOpenTeam: () => void;
  onOpenTactics: () => void;
  onOpenTraining: () => void;
  onOpenLeague: () => void;
  onOpenNextMatch: () => void;
  onOpenDressingRoom: () => void;
  onOpenInbox: () => void;
};

export function ClubPanelScreen({
  tacticalPlan,
  trainingState,
  conversations,
  secondSessionNeedsReview = false,
  expectations,
  matches,
  currentMatchday,
  nextCheckpoint,
  squadSelections,
  continueLabel,
  onboarding,
  onTourComplete,
  onContinue,
  onOpenStaff,
  onOpenTeam,
  onOpenTactics,
  onOpenTraining,
  onOpenLeague,
  onOpenNextMatch,
  onOpenDressingRoom,
  onOpenInbox,
}: Props) {
  const nextMatch = getNextMatch(matches, "fc-poblenou");
  const standings = calculateStandings(leagueTeams, matches, currentMatchday);
  const userStanding = standings.find((row) => row.teamId === "fc-poblenou");
  const nearbyStandings = getStandingsAroundTeam(standings, "fc-poblenou");
  const teamNames = new Map(leagueTeams.map((team) => [team.id, team.name]));
  const suspendedPlayers = getSanctionsForMatchday(
    leagueSanctions,
    currentMatchday + 1,
  ).filter((sanction) => sanction.teamId === "fc-poblenou").length;
  const unhappyPlayers = Object.values(trainingState.players).filter(
    (player) => getPlayerHappiness(player) < 58,
  ).length;
  const unreadConversations = countUnreadConversations(conversations);
  const pendingResponses = countPendingResponses(conversations);
  const latestConversation = [...conversations].sort((a, b) => (b.messages.at(-1)?.timestamp ?? '').localeCompare(a.messages.at(-1)?.timestamp ?? ''))[0];
  const latestMessage = latestConversation?.messages.at(-1);
  const messagesRequiringAttention = pendingResponses;
  const newMessages = unreadConversations;
  const latestMessages = latestMessage ? [{ id: latestMessage.id, senderName: latestConversation.participantName, subject: latestMessage.text }] : [];
  const leagueExpectation = expectations.expectations.find(
    (expectation) => expectation.type === "league",
  );

  const tourActive = ['CLUB_PANEL_INTRO', 'CONTINUE_EXPLANATION', 'STAFF_HIGHLIGHT', 'MESSAGES_HIGHLIGHT', 'TEAM_HIGHLIGHT', 'TACTICS_HIGHLIGHT', 'TRAINING_HIGHLIGHT', 'LOCKER_ROOM_HIGHLIGHT', 'NEXT_MATCH_HIGHLIGHT', 'LEAGUE_HIGHLIGHT', 'FIRST_TRAINING_READY'].includes(onboarding.active);
  const objective = ({ STAFF: "staff", INBOX: "inbox", SQUAD: "squad", TACTICS: "tactics", TRAINING_PLANNING: "training", DRESSING_ROOM: "dressing-room", NEXT_MATCH: "next-match", LEAGUE: "league" } as const)[onboarding.active as "STAFF" | "INBOX" | "TACTICS" | "SQUAD" | "TRAINING_PLANNING" | "DRESSING_ROOM" | "NEXT_MATCH" | "LEAGUE"];

  return (
    <main className={`club-panel-screen${tourActive ? " is-touring" : ""}`}>
      {objective && !tourActive && <aside className="panel-objective"><span>PRIMER DÍA</span><div><strong>{PANEL_OBJECTIVES[objective].title}</strong><p>{PANEL_OBJECTIVES[objective].text}</p></div></aside>}
      <button
        data-panel-card="next-match"
        className="dashboard-card dashboard-card-action"
        type="button"
        onClick={onOpenNextMatch}
        disabled={!nextMatch}
      >
        {nextMatch ? (
          <>
            <NextMatchSummary
              match={nextMatch}
              teams={leagueTeams}
              userTeamId="fc-poblenou"
            />
            {nextMatch.competitionType !== "FRIENDLY" && (
              <p
                className={
                  squadSelections[nextMatch.id]?.announced
                    ? "message-preview"
                    : "card-warning"
                }
              >
                {squadSelections[nextMatch.id]?.announced
                  ? `Convocatoria · ${squadSelections[nextMatch.id].playerIds.length} jugadores`
                  : "Convocatoria pendiente"}
              </p>
            )}
          </>
        ) : (
          <h2>No hay próximo partido programado</h2>
        )}
      </button>

      <section
        data-panel-card="league"
        className="dashboard-card league-summary-card"
        role="link"
        tabIndex={0}
        onClick={onOpenLeague}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onOpenLeague();
          }
        }}
      >
        <h2>La liga</h2>
        {userStanding && (
          <p className="league-position-summary">
            <strong>
              {userStanding.position}º · {userStanding.points} pts
            </strong>
          </p>
        )}
        <table
          className="mini-standings"
          aria-label="Clasificación alrededor del FC Poblenou"
        >
          <thead>
            <tr>
              <th scope="col">P</th>
              <th scope="col">Equipo</th>
              <th scope="col">Pts</th>
            </tr>
          </thead>
          <tbody>
            {nearbyStandings.map((row) => (
              <tr
                key={row.teamId}
                className={
                  row.teamId === "fc-poblenou" ? "is-user-team" : undefined
                }
              >
                <td>{row.position}</td>
                <th scope="row">{teamNames.get(row.teamId)}</th>
                <td>{row.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <button
        data-panel-card="staff"
        className="dashboard-card dashboard-card-action"
        type="button"
        onClick={onOpenStaff}
      >
        <h2>Staff</h2>
        <p className="card-description">
          Consulta quién te ayuda, su disponibilidad y el pequeño presupuesto
          del cuerpo técnico.
        </p>
      </button>

      <button
        data-panel-card="squad"
        className="dashboard-card dashboard-card-action"
        type="button"
        onClick={onOpenTeam}
      >
        <h2>Equipo</h2>
        <p className="card-main-value">
          <strong>{players.length} jugadores</strong>
        </p>
        <dl className="card-facts">
          <div>
            <dt>Sancionados</dt>
            <dd>{suspendedPlayers}</dd>
          </div>
        </dl>
      </button>

      <button
        data-panel-card="tactics"
        className="dashboard-card dashboard-card-action"
        type="button"
        onClick={onOpenTactics}
      >
        <h2>Táctica</h2>
        <p className="card-main-value">
          <strong>
            {tacticalPlan.formation} · {tacticalPlan.mentality}
          </strong>
        </p>
        <p className="card-lines">
          Pase {tacticalPlan.passingStyle.toLowerCase()}
          <br />
          Ritmo {tacticalPlan.tempo.toLowerCase()}
          <br />
          Presión {tacticalPlan.pressingHeight.toLowerCase()}
        </p>
      </button>

      <button
        data-panel-card="training"
        className={`dashboard-card dashboard-card-action${secondSessionNeedsReview ? " is-pending-action" : ""}`}
        type="button"
        onClick={onOpenTraining}
      >
        <h2>Preparación de entrenamiento</h2>
        {secondSessionNeedsReview && <p className="card-warning">Prometiste revisar y guardar la sesión del jueves.</p>}
        {trainingState.sessions.length > 0 ? (
          <>
            <p className="card-main-value">
              <strong>Semana {trainingState.week}</strong>
            </p>
            <p className="card-lines">
              {trainingState.sessions
                .map(
                  (session) =>
                    `${session.day}: ${session.blocks[0]} + ${session.blocks[1]} · ${session.intensity}`,
                )
                .join("\n")}
            </p>
          </>
        ) : (
          <p className="card-main-value">
            <strong>Entrenamiento sin preparar</strong>
          </p>
        )}
      </button>

      <button
        data-panel-card="dressing-room"
        className="dashboard-card dashboard-card-action"
        type="button"
        onClick={onOpenDressingRoom}
      >
        <h2>Estado del vestuario</h2>
        <dl className="card-facts">
          <div>
            <dt>Ánimo</dt>
            <dd>{getMoodLabel(getTeamHappiness(trainingState))}</dd>
          </div>
          <div>
            <dt>Cohesión</dt>
            <dd>{getCohesionLabel(initialDressingRoomState.cohesion)}</dd>
          </div>
          <div>
            <dt>Autoridad</dt>
            <dd>{getAuthorityLabel(getTeamAuthority(trainingState))}</dd>
          </div>
          {leagueExpectation && (
            <div>
              <dt>Expectativas</dt>
              <dd>
                {EXPECTATION_ASSESSMENT_LABELS[leagueExpectation.assessment]}
              </dd>
            </div>
          )}
        </dl>
        {unhappyPlayers > 0 && (
          <p className="card-warning">
            {unhappyPlayers}{" "}
            {unhappyPlayers === 1
              ? "jugador descontento"
              : "jugadores descontentos"}
          </p>
        )}
      </button>

      <button
        data-panel-card="inbox"
        className={`dashboard-card dashboard-card-action${newMessages ? " has-new-message" : ""}`}
        type="button"
        onClick={onOpenInbox}
      >
        <h2>Mensajes</h2>
        {newMessages > 0 && <span className="message-unread-badge" aria-label={`${newMessages} conversaciones sin leer`}>{newMessages}</span>}
        <p className="card-main-value">
          <strong>
            {messagesRequiringAttention
              ? `${messagesRequiringAttention} ${messagesRequiringAttention === 1 ? "asunto requiere" : "asuntos requieren"} tu atención`
              : `${newMessages} ${newMessages === 1 ? "mensaje nuevo" : "mensajes nuevos"}`}
          </strong>
        </p>
        {latestMessages.map((message) => (
          <p className="message-preview" key={message.id}>
            <strong>{message.senderName}</strong>
            <br />
            {message.subject}
          </p>
        ))}
      </button>

      <section data-panel-card="continue" className="dashboard-card continue-card">
        <button type="button" onClick={onContinue}>
          CONTINUAR
        </button>
        <p>{continueLabel || nextCheckpoint?.label}</p>
      </section>
      {onboarding.active === 'CLUB_PANEL_INTRO' && <OnboardingSpotlight title="El Panel del club" text="Desde aquí controlaremos el club: plantilla, táctica, entrenamientos, mensajes, staff, vestuario, partidos y liga. CONTINUAR será la forma habitual de avanzar el tiempo cuando hayamos terminado lo necesario." actionLabel="SEGUIR" onAction={onTourComplete} />}
      {onboarding.active === 'CONTINUE_EXPLANATION' && <OnboardingSpotlight selectors={['.global-continue', '[data-panel-card="continue"]']} title="Avanzar el tiempo" text="Estos son los controles de CONTINUAR. Normalmente harán avanzar el calendario; ahora cualquiera de los dos solo continuará este recorrido." />}
      {onboarding.active === 'STAFF_HIGHLIGHT' && <OnboardingSpotlight selectors={['[data-panel-card="staff"]']} title="Primero, el Staff" text="Primero vamos a ver quién tenemos echándonos una mano. Entra en Staff." />}
      {onboarding.active === 'MESSAGES_HIGHLIGHT' && <OnboardingSpotlight selectors={['[data-panel-card="inbox"]']} title="Manolo ha escrito" text="Manolo ya te ha escrito. Mira qué quiere." />}
      {onboarding.active === 'TEAM_HIGHLIGHT' && <OnboardingSpotlight selectors={['[data-panel-card="squad"]']} title="Conoce la plantilla" text="Primero tenemos que saber qué jugadores hay disponibles. Entra en Equipo." />}
      {onboarding.active === 'TACTICS_HIGHLIGHT' && <OnboardingSpotlight selectors={['[data-panel-card="tactics"]']} title="Prepara la táctica" text="Ahora que sabemos con qué contamos, vamos a decidir cómo queremos jugar." />}
      {onboarding.active === 'TRAINING_HIGHLIGHT' && <OnboardingSpotlight selectors={['[data-panel-card="training"]']} title="Prepara la semana" text="Nos queda dejar preparada la semana. Vamos a organizar los dos entrenamientos." />}
      {onboarding.active === 'LOCKER_ROOM_HIGHLIGHT' && <OnboardingSpotlight selectors={['[data-panel-card="dressing-room"]']} mode="EXPLAIN_ONLY" title="Estado del vestuario" text="Aquí consultarás ambiente, cohesión, felicidad, autoridad, relaciones, expectativas y conflictos. No entraremos ahora." actionLabel="CONTINUAR TUTORIAL" onAction={onContinue} />}
      {onboarding.active === 'NEXT_MATCH_HIGHLIGHT' && <OnboardingSpotlight selectors={['[data-panel-card="next-match"]']} mode="EXPLAIN_ONLY" title="Próximo partido" text="Esta tarjeta reúne rival, fecha, localía, la información disponible y el acceso a la previa. No entraremos ahora." actionLabel="CONTINUAR TUTORIAL" onAction={onContinue} />}
      {onboarding.active === 'LEAGUE_HIGHLIGHT' && <OnboardingSpotlight selectors={['[data-panel-card="league"]']} mode="EXPLAIN_ONLY" title="La Liga" text="Aquí tendrás clasificación, resultados, calendario, goleadores y estadísticas. Bueno, ya tenemos lo importante preparado. Ahora toca conocer a los jugadores de verdad." actionLabel="CONOCER A LA PLANTILLA" onAction={onContinue} />}
      {onboarding.active === 'FIRST_TRAINING_READY' && <OnboardingSpotlight title="Todo preparado" text="Pues venga. Empezamos." actionLabel="EMPEZAR ENTRENAMIENTO" onAction={onContinue} />}
    </main>
  );
}

const PANEL_OBJECTIVES = {
  staff: { title: "Conoce a la gente del club", text: "Antes de empezar a trabajar con el equipo, echa un vistazo a quién tienes alrededor. Ve a Staff." },
  inbox: { title: "Manolo ya te ha escrito", text: "Échale un ojo al mensaje nuevo. Ahí están las tres tareas antes del primer entrenamiento." },
  squad: { title: "Primero, la plantilla", text: "Antes de decidir nada conviene saber qué jugadores tenemos. Entra en Equipo." },
  tactics: { title: "Ahora, cómo queremos jugar", text: "Entra en Táctica, elige formación, prepara un once real y revisa las instrucciones." },
  training: { title: "Nos queda preparar la semana", text: "Entra en Preparación de entrenamiento y deja guardadas las dos sesiones." },
  'dressing-room': { title: "Estado del vestuario", text: "Aquí consultarás ambiente, cohesión, felicidad, autoridad, relaciones, expectativas y conflictos. No hace falta entrar ahora." },
  'next-match': { title: "Próximo partido", text: "Esta tarjeta reúne rival, fecha, localía y acceso a la previa. No hace falta entrar ahora." },
  league: { title: "La Liga", text: "Aquí tendrás clasificación, resultados, calendario y estadísticas disponibles. Después conoceremos al grupo de verdad." },
} as const;
