import { MiniTacticalBoard } from '../components/MiniTacticalBoard'
import { PageTitle } from '../components/ClubUi'
import { useEffect, useState } from "react";
import { PlayerDetail } from "../components/PlayerDetail";
import { ManagementIcon, type ManagementIconName } from "../components/ManagementIcon";
import { getApproximateStatusLevel, getManagementStatusTone } from "../presentation/managementPresentation";
import { leagueTeams, players } from "../data/mockData";
import { getOpponentId, getTeamName } from "../domain/nextMatch";
import type {
  LeagueMatch,
  Player,
  TacticalPlan,
  TrainingBlock,
  TrainingIntensity,
} from "../domain/models";
import {
  FULL_SESSION_BLOCKS,
  TRAINING_BLOCKS,
  previewTraining,
} from "../domain/training";
import {
  calculateOverallFamiliarity,
  getPlayerHappiness,
  getTeamAuthority,
  getTeamFatigue,
  getTeamFitness,
  getTeamHappiness,
} from "../domain/trainingEngine";
import type {
  FunctionalTrainingSession,
  TrainingGameState,
} from "../domain/trainingTypes";
import { getAuthorityLabel, getConditionLabel, getFamiliarityLabel, getFatigueLabel, getHappinessLabel } from "../domain/humanState";
import { getPlayersToWatch } from "../domain/trainingPresentation";
import "./TrainingScreen.css";
import type { StaffPerson } from "../domain/staff";
import { ContextualTour } from "../components/ContextualTour";

type Props = {
  tacticalPlan: TacticalPlan;
  trainingState: TrainingGameState;
  nextMatch?: LeagueMatch;
  activeSessionId?: string;
  injuredPlayerIds?: number[];
  staffMembers: StaffPerson[];
  guided?: boolean;
  tutorialActive?: boolean;
  tutorialCompleted?: boolean;
  tutorialStep?: number;
  onTutorialStepChange?: (step: number) => void;
  onTutorialComplete?: () => void;
  onTrainingStateChange: (state: TrainingGameState) => void;
  onBack: () => void;
  onOpenTactics: () => void;
  onFinishEditing?: () => void;
  reviewRequiredSessionId?: string;
  onSessionPlanSaved?: (sessionId: string) => void;
  validationAttempt?: number;
};
const absenceReasons = [
  "Trabajo",
  "Estudios",
  "Motivos personales",
  "Molestias",
];
const TRAINING_TUTORIAL_STEPS = [
  { selector: '[data-tour-target="training-week"]', placement: 'viewport', title: 'Prepara la semana', text: 'Cada semana tienes dos entrenamientos. Decide qué quieres trabajar antes de que llegue el día de la sesión.' },
  { selector: '[data-tour-target="training-blocks-tuesday"]', title: 'Elige qué trabajar', text: 'Cada entrenamiento tiene dos bloques. Elige qué quieres trabajar en cada uno. Algunas actividades pueden ocupar los dos bloques de la sesión.' },
  { selector: '[data-tour-target="training-effects-tuesday"]', title: 'No todo sirve para lo mismo', text: 'Cada trabajo mejora aspectos distintos. Algunos también cargan más físicamente al equipo y aumentan el riesgo de molestias.' },
  { selector: '[data-tour-target="training-physical-state"]', title: 'Mira cómo llega el equipo', text: 'La condición, el cansancio y las molestias importan. Cargar demasiado a un jugador puede perjudicar su rendimiento o aumentar el riesgo de lesión.' },
  { selector: '[data-tour-target="training-continue"]', title: 'Cuando estés listo...', text: 'Cuando avances el tiempo llegará el entrenamiento. Veremos quién aparece, cómo responde el equipo y si ocurre alguna incidencia.' },
] as const;

function TrainingSummary({
  state,
  plan,
}: {
  state: TrainingGameState;
  plan: TacticalPlan;
  validationError?: boolean;
}) {
  const values: [string, number, (value: number) => string, ManagementIconName][] = [
    ["Familiaridad táctica", calculateOverallFamiliarity(state.familiarity, plan), getFamiliarityLabel, "tactics"],
    ["Balón parado", state.familiarity.setPieces.current, getFamiliarityLabel, "ball"],
    ["Condición física", getTeamFitness(state), getConditionLabel, "training"],
    ["Carga", getTeamFatigue(state), getFatigueLabel, "transition"],
    ["Felicidad", getTeamHappiness(state), getHappinessLabel, "mood"],
    ["Autoridad", getTeamAuthority(state), getAuthorityLabel, "authority"],
  ];
  return (
    <section
      className="training-summary"
      aria-label="Estado general del equipo"
      data-tour-target="training-physical-state"
    >
      {values.map(([label, value, describe, icon]) => {
        const description = describe(value);
        return <div key={label} className={`training-metric is-${getManagementStatusTone(description)}`}>
          <ManagementIcon name={icon} />
          <span>{label}</span>
          <strong>{description}</strong>
          <span className="training-meter" aria-hidden="true"><i style={{ width: `${getApproximateStatusLevel(value)}%` }} /></span>
        </div>;
      })}
    </section>
  );
}

function TacticalTrainingSummary({
  plan,
  onOpenTactics,
}: {
  plan: TacticalPlan;
  onOpenTactics: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  return (
    <section className="training-tactics-summary">
      <div className="training-section-heading">
        <h3>Planteamiento táctico actual</h3>
      </div>
      <div className="training-tactics-overview">
        <div><strong className="training-formation">{plan.formation}</strong>
          <ul><li>{plan.mentality} · {plan.passingStyle}</li><li>Ritmo {plan.tempo.toLowerCase()}</li><li>{plan.afterRecovery}</li><li>Presión {plan.pressingHeight.toLowerCase()}</li><li>Intensidad {plan.pressingIntensity.toLowerCase()}</li><li>{plan.afterLoss}</li></ul>
        </div>
        <MiniTacticalBoard formation={plan.formation} />
      </div>
      <button className="training-text-button" type="button" aria-expanded={expanded} onClick={() => setExpanded((value) => !value)}>
        {expanded ? "Ocultar detalles ↑" : "Ver detalles →"}
      </button>
      {expanded && (
        <div className="tactical-details">
          <strong>Formación: {plan.formation}</strong>
          <div>
            <h4>Con balón</h4>
            <p>
              Mentalidad: {plan.mentality}
              <br />
              Estilo de pase: {plan.passingStyle}
              <br />
              Ritmo: {plan.tempo}
              <br />
              Tras recuperación: {plan.afterRecovery}
            </p>
          </div>
          <div>
            <h4>Sin balón</h4>
            <p>
              Altura de presión: {plan.pressingHeight}
              <br />
              Intensidad de presión: {plan.pressingIntensity}
              <br />
              Tras pérdida: {plan.afterLoss}
            </p>
          </div>
          <p>
            Perder tiempo: {plan.timeWasting} · Ser agresivos: {plan.aggression}
          </p>
          <button type="button" onClick={onOpenTactics}>
            Ir a Tácticas
          </button>
        </div>
      )}
    </section>
  );
}

function TrainingEffectsPreview({
  session,
}: {
  session: FunctionalTrainingSession;
}) {
  const full = FULL_SESSION_BLOCKS.includes(session.blocks[0]);
  const preview = previewTraining(
    full ? [session.blocks[0]] : session.blocks,
    session.intensity,
  );
  return (
    <section className="training-effects" data-tour-target={`training-effects-${session.id}`}>
      <h4>Efectos previstos</h4>
      <dl>
        {preview.effects.map(([name, level]) => (
          <div key={name}>
            <dt>{name}</dt>
            <dd>{level}</dd>
          </div>
        ))}
      </dl>
      {preview.attributes.length > 0 && (
        <p>
          <strong>Principalmente trabaja:</strong>
          <br />
          {preview.attributes.join(" · ")}
        </p>
      )}
      <p>
        <strong>Familiaridad táctica:</strong>
        <br />
        {preview.familiarity.length
          ? preview.familiarity.join(" · ")
          : "Sin efecto"}
      </p>
      <small>{preview.intensityNote}</small>
    </section>
  );
}

function CompletedSession({ session, expanded, onToggle }: { session: FunctionalTrainingSession; expanded?: boolean; onToggle?: (open: boolean) => void }) {
  const result = session.result;
  return (
    <article className="training-session-card completed-session">
      <header>
        <div>
          <h3>{session.day} <span>— Entrenamiento realizado</span></h3>
        </div>
        <span className="session-status">✓ Realizada</span>
      </header>
      <div className="training-completed-stats">
        <span>Asistencia <strong>{session.attendance} / {session.totalPlayers}</strong></span>
        <span>Calidad <strong>{session.qualityLabel ?? "Sin informe"}</strong></span>
        <span>Riesgo de lesión <strong>{result?.injuryRisk ?? "Sin informe"}</strong></span>
        {result?.effects.map((effect) => <span key={effect}>{effect}</span>)}
      </div>
      <details className="training-report-details" open={expanded} onToggle={event => onToggle?.(event.currentTarget.open)}>
        <summary>Ver informe de la sesión</summary>
        <p>
        {(FULL_SESSION_BLOCKS.includes(session.blocks[0])
          ? [session.blocks[0]]
          : session.blocks
        ).join(" + ")}
        <br />
        Intensidad: {session.intensity}
      </p>
      <div className="session-results">
        <h4>Resultados</h4>
        {result?.effects.map((effect) => (
          <p key={effect}>{effect}</p>
        ))}
      </div>
      <div className="session-highlights">
        <h4>Destacados</h4>
        {result?.highlights.map((highlight) => (
          <p key={highlight}>{highlight}</p>
        ))}
        {result && (
          <small>
            Planteamiento entrenado: {result.tacticalPlan.formation} ·{" "}
            {result.tacticalPlan.mentality}
          </small>
        )}
      </div>
      </details>
    </article>
  );
}

function TrainingIntensityBars({ intensity }: { intensity: TrainingIntensity }) {
  const level = { Baja: 1, Media: 2, Alta: 3 }[intensity];
  return <span className="training-intensity-bars" aria-hidden="true">{[1, 2, 3].map(bar => <i key={bar} className={bar <= level ? 'is-filled' : ''} />)}</span>;
}

function TrainingCone() {
  return <svg className="management-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" aria-hidden="true"><path d="m6 19 4-16h4l4 16M8 11h8M7 15h10M3 19h18v3H3z" /></svg>;
}

function WeeklyMicrocycle({ sessions, nextMatch, selectedSessionId, activeSessionId, onSelect }: {
  sessions: FunctionalTrainingSession[];
  nextMatch?: LeagueMatch;
  selectedSessionId?: string;
  activeSessionId?: string;
  onSelect: (id: string) => void;
}) {
  return <section className="training-microcycle" aria-label="Microciclo semanal" data-tour-target="training-week">
    <h3>Microciclo semanal</h3>
    <div className="training-week-cards">
      {sessions.map(session => <button type="button" key={session.id} className={`training-week-card${selectedSessionId === session.id ? ' is-selected' : ''}`} disabled={Boolean(activeSessionId && activeSessionId !== session.id && session.status !== 'completed')} aria-expanded={selectedSessionId === session.id} aria-controls={`training-session-${session.id}`} onClick={() => onSelect(session.id)}>
        <span className="training-week-day">{session.day}<TrainingCone /></span>
        <strong>Entrenamiento general</strong>
        <span className="training-week-blocks">{(FULL_SESSION_BLOCKS.includes(session.blocks[0]) ? [session.blocks[0]] : session.blocks).join(' + ')}</span>
        <span className="training-week-intensity"><TrainingIntensityBars intensity={session.intensity} />Intensidad: {session.intensity}</span>
        <span className={`training-week-status is-${session.status === 'completed' ? 'completed' : (session.planningStatus ?? 'UNPLANNED').toLowerCase()}`}>{session.status === 'completed' ? '✓ Realizada · Ver informe' : session.planningStatus === 'PLANNED' ? '✓ Planificada · Editar →' : session.planningStatus === 'DIRTY' ? 'Cambios sin guardar →' : 'Planificar sesión →'}</span>
      </button>)}
      <article className="training-week-card training-match-card">
        <span className="training-week-day">{nextMatch ? new Intl.DateTimeFormat('es', { weekday: 'long', timeZone: 'UTC' }).format(new Date(`${nextMatch.date}T12:00:00Z`)) : 'Próximo partido'}<ManagementIcon name="group" /></span>
        <strong>{nextMatch ? nextMatch.competitionType === 'FRIENDLY' ? 'Partido amistoso' : 'Partido de Liga' : 'Sin partido programado'}</strong>
        {nextMatch && <><span className="training-week-blocks">{getTeamName(leagueTeams, getOpponentId(nextMatch, 'fc-poblenou'))}</span><span className="training-week-intensity"><ManagementIcon name="calendar" /><time dateTime={`${nextMatch.date}T${nextMatch.time}`}>{new Intl.DateTimeFormat('es', { day: 'numeric', month: 'short', timeZone: 'UTC' }).format(new Date(`${nextMatch.date}T12:00:00Z`))} · {nextMatch.time}</time></span><span className="training-week-status">Próximo en el calendario</span></>}
      </article>
    </div>
  </section>;
}

function TrainingHighlights({ sessions }: { sessions: FunctionalTrainingSession[] }) {
  const latest = sessions.filter(session => session.status === 'completed' && session.result).at(-1);
  return <section className="training-highlights"><h3><span aria-hidden="true">★</span> Destacados {latest && <small>· {latest.day}</small>}</h3>
    {latest?.result ? <><ul>{latest.result.highlights.map(highlight => <li key={highlight}>{highlight}</li>)}</ul><p className="training-highlight-plan">Planteamiento entrenado: <strong>{latest.result.tacticalPlan.formation} · {latest.result.tacticalPlan.mentality}</strong></p></> : <p className="training-empty">Aquí aparecerán los destacados al completar el primer entrenamiento.</p>}
  </section>;
}

function TrainingSessionCard({
  session,
  onChange,
  staffMembers = [],
  plan,
  validationError = false,
  requiresReview = false,
  onClose,
}: {
  session: FunctionalTrainingSession;
  onChange: (next: FunctionalTrainingSession) => void;
  staffMembers?: StaffPerson[];
  plan: TacticalPlan;
  validationError?: boolean;
  requiresReview?: boolean;
  canExecute?: boolean;
  onExecute?: () => void;
  onClose: () => void;
}) {
  const [showAbsences, setShowAbsences] = useState(false);
  if (session.status === "completed")
    return <CompletedSession session={session} />;
  const isFull = FULL_SESSION_BLOCKS.includes(session.blocks[0]);
  const edit = (next: FunctionalTrainingSession) => onChange({ ...next, planningStatus: session.planningStatus === 'PLANNED' ? 'DIRTY' : session.planningStatus });
  const setBlock = (index: 0 | 1, block: TrainingBlock) =>
    edit({
      ...session,
      blocks: FULL_SESSION_BLOCKS.includes(block)
        ? [block, block]
        : index === 0 && isFull
          ? [block, "Táctica"]
          : (session.blocks.map((item, i) => (i === index ? block : item)) as [
              TrainingBlock,
              TrainingBlock,
            ]),
    });
  const plannedAbsences =
    session.plannedAbsentPlayerIds ?? session.absentPlayerIds;
  const plannedStaff =
    session.plannedStaffIds ??
    staffMembers
      .filter(
        (member) =>
          member.role !== "PRIMER_ENTRENADOR" && member.isUsuallyAvailable,
      )
      .map((member) => member.id);
  return (
    <article className={`training-session-card is-${(session.planningStatus ?? 'UNPLANNED').toLowerCase()}${validationError ? ' has-validation-error' : ''}`}>
      <header>
        <div>
          <span>Sesión {session.id === "tuesday" ? "1" : "2"}</span>
          <h3>{session.day}</h3>
        </div>
        <span className="session-status">
          {session.planningStatus === "PLANNED" ? "✓ PLANIFICADA" : session.planningStatus === 'DIRTY' ? 'CAMBIOS SIN GUARDAR' : "POR PLANIFICAR"}
        </span>
        <button className="training-text-button" type="button" onClick={onClose} aria-label="Cerrar planificación">Cerrar ×</button>
      </header>
      <div className="training-editor-columns"><div>
      <fieldset>
        <legend>Intensidad</legend>
        <div className="training-segments">
          {(["Baja", "Media", "Alta"] as TrainingIntensity[]).map((level) => (
            <button
              key={level}
              type="button"
              className={session.intensity === level ? "is-selected" : ""}
              aria-pressed={session.intensity === level}
              onClick={() =>
                edit({
                  ...session,
                  intensity: level,
                })
              }
            >
              {level}
            </button>
          ))}
        </div>
      </fieldset>
      <div className="training-block-selectors" data-tour-target={`training-blocks-${session.id}`}>
        <label>
          Bloque 1
          <select
            value={session.blocks[0]}
            onChange={(event) =>
              setBlock(0, event.target.value as TrainingBlock)
            }
          >
            {TRAINING_BLOCKS.map((block) => (
              <option key={block}>{block}</option>
            ))}
          </select>
        </label>
        {isFull ? (
          <div className="full-session-notice">
            <strong>{session.blocks[0]}</strong>
            <span>Ocupa los dos bloques de la sesión</span>
          </div>
        ) : (
          <label>
            Bloque 2
            <select
              value={session.blocks[1]}
              onChange={(event) =>
                setBlock(1, event.target.value as TrainingBlock)
              }
            >
              {TRAINING_BLOCKS.map((block) => (
                <option key={block}>{block}</option>
              ))}
            </select>
          </label>
        )}
      </div>
      <div className="attendance">
        <strong>
          Asistencia prevista: {session.totalPlayers - plannedAbsences.length} /{" "}
          {session.totalPlayers}
        </strong>
        {plannedAbsences.length > 0 && (
          <>
            <button
              type="button"
              onClick={() => setShowAbsences((value) => !value)}
            >
              {plannedAbsences.length} ausencias previstas
            </button>
            {showAbsences && (
              <ul>
                {plannedAbsences.map((id, index) => (
                  <li key={id}>
                    {players.find((player) => player.id === id)?.name} —{" "}
                    {session.plannedAbsenceReasons?.[id] ?? absenceReasons[index % absenceReasons.length]}
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
      <div className="attendance">
        <strong>Staff previsto: {plannedStaff.length}</strong>
        {plannedStaff.map((id) => (
          <small key={id}>
            {staffMembers.find((member) => member.id === id)?.name}
          </small>
        ))}
      </div>
      </div><TrainingEffectsPreview session={session} /></div>
      {(session.planningStatus !== "PLANNED" || requiresReview) && (
        <button
          className="primary-action"
          type="button"
          onClick={() =>
            onChange({
              ...session,
              planningStatus: "PLANNED",
              plannedTacticalPlan: structuredClone(plan),
            })
          }
        >
          GUARDAR PLANIFICACIÓN
        </button>
      )}
    </article>
  );
}

function PlayersToWatch({
  state,
  onSelect,
  injuredPlayerIds,
}: {
  state: TrainingGameState;
  onSelect: (player: Player) => void;
  injuredPlayerIds: number[];
}) {
  const watch = getPlayersToWatch(state, injuredPlayerIds);
  return (
    <section className="training-squad">
      <h3>Jugadores a vigilar</h3>
      {watch.length ? <div className="players-to-watch" tabIndex={0} role="region" aria-label="Jugadores en observación">{watch.map((item) => { const player = players.find((candidate) => candidate.id === item.playerId); return player ? <button type="button" key={item.playerId} onClick={() => onSelect(player)}><strong>{player.name}</strong><span>{item.reasons.map((reason) => reason.label).join(" · ")}</span><small>En observación</small></button> : null })}</div> : <p className="training-empty">No hay situaciones individuales especialmente preocupantes.</p>}
    </section>
  );
}

export function TrainingScreen({
  tacticalPlan,
  trainingState,
  nextMatch,
  staffMembers,
  activeSessionId,
  injuredPlayerIds = [],
  guided = false,
  tutorialActive = false,
  tutorialCompleted = false,
  tutorialStep = 0,
  onTutorialStepChange,
  onTutorialComplete,
  onTrainingStateChange,
  onBack,
  onOpenTactics,
  onFinishEditing,
  reviewRequiredSessionId,
  onSessionPlanSaved,
  validationAttempt = 0,
}: Props) {
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState<string | undefined>(activeSessionId ?? reviewRequiredSessionId);
  const visibleEditorId = tutorialActive && (tutorialStep === 1 || tutorialStep === 2) ? 'tuesday' : editingSessionId;
  const invalidSessions = trainingState.sessions.filter((session) => session.status !== 'completed' && session.planningStatus !== 'PLANNED');
  const invalidSessionCount = invalidSessions.length;
  const firstInvalidSessionId = invalidSessions[0]?.id;
  useEffect(() => {
    if (!validationAttempt || !invalidSessionCount) return;
    setShowValidation(true);
    setEditingSessionId(firstInvalidSessionId);
    document.querySelector('.training-sessions')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [validationAttempt, invalidSessionCount, firstInvalidSessionId]);
  const updateSession = (next: FunctionalTrainingSession) => {
    onTrainingStateChange({
      ...trainingState,
      sessions: trainingState.sessions.map((session) =>
        session.id === next.id ? next : session,
      ),
    });
    if (next.id === reviewRequiredSessionId && next.planningStatus === 'PLANNED') onSessionPlanSaved?.(next.id);
  };
  const selectedState = selectedPlayer
    ? trainingState.players[selectedPlayer.id]
    : null;
  const detailPlayer =
    selectedPlayer && selectedState
      ? {
          ...selectedPlayer,
          attributes: selectedState.baseAttributes,
          fitness: selectedState.fitness,
          happiness: getPlayerHappiness(selectedState),
          personality: selectedState.personality,
        }
      : null;
  const provisionalProgress = selectedState
    ? Object.fromEntries(
        Object.entries(selectedState.attributes).map(([key, value]) => [
          key,
          value?.bonus ?? 0,
        ]),
      )
    : undefined;
  const plannedCount = trainingState.sessions.filter(
    (session) =>
      session.planningStatus === "PLANNED" || session.status === "completed",
  ).length;
  return (
    <section className="training-screen">
      <PageTitle title="Planificación de entrenamiento" subtitle={"Semana " + trainingState.week + " · Preparamos la semana para seguir mejorando, partido a partido."} actions={<><button className="screen-back-button" type="button" onClick={onBack}>← Panel del club</button>{tutorialCompleted && <button className="training-help-button" type="button" onClick={() => setShowHelp(value => !value)}>AYUDA</button>}</>} />
      {guided && tutorialCompleted && (
        <aside className="onboarding-prompt">
          <span>{plannedCount === 2 ? "ENTRENAMIENTO PREPARADO" : "PRIMER ENTRENAMIENTO"}</span>
          <p>
            {plannedCount === 2
              ? "La sesión está lista. Ya puedes continuar."
              : "Elige los bloques de trabajo para preparar tu primera sesión."}
          </p>
        </aside>
      )}
      {showHelp && <aside className="training-help-summary"><div><strong>Cómo funciona el entrenamiento</strong><p>Planificas dos sesiones semanales con dos bloques cada una. Los trabajos tienen efectos deportivos y cargas físicas diferentes. La condición, el cansancio y las molestias de la plantilla importan.</p><p>Guardar una planificación no ejecuta la sesión: el entrenamiento ocurre cuando utilizas CONTINUAR y el calendario llega a ese momento.</p></div><button type="button" onClick={() => setShowHelp(false)}>CERRAR</button></aside>}
      {showValidation && invalidSessions.length > 0 && <aside className="training-save-error" role="alert">
        {invalidSessions.length === 2
          ? 'Guarda la planificación de los entrenamientos antes de continuar.'
          : invalidSessions[0].planningStatus === 'DIRTY'
            ? `Has realizado cambios en el entrenamiento del ${invalidSessions[0].day.toLowerCase()} que todavía no has guardado.`
            : `Te falta guardar la planificación del entrenamiento del ${invalidSessions[0].day.toLowerCase()}. Revisa la sesión y pulsa GUARDAR PLANIFICACIÓN antes de continuar.`}
      </aside>}
      {reviewRequiredSessionId && <aside className="training-save-error" role="alert">Has dicho al segundo entrenador que revisarías la sesión del jueves. Haz los cambios que consideres y pulsa GUARDAR PLANIFICACIÓN antes de continuar.</aside>}
      <TrainingSummary state={trainingState} plan={tacticalPlan} />
      <div className="training-planning-row">
        <TacticalTrainingSummary plan={tacticalPlan} onOpenTactics={onOpenTactics} />
        <WeeklyMicrocycle sessions={trainingState.sessions} nextMatch={nextMatch} activeSessionId={activeSessionId} selectedSessionId={visibleEditorId} onSelect={id => {
          setEditingSessionId(current => current === id ? undefined : id);
          requestAnimationFrame(() => document.getElementById(`training-session-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }));
        }} />
      </div>
      <section className="training-sessions" aria-label="Sesiones de entrenamiento">
        {trainingState.sessions.map((session) => (
          <div key={session.id} id={`training-session-${session.id}`} hidden={session.status !== 'completed' && visibleEditorId !== session.id}>
          {session.status === 'completed' ? <CompletedSession session={session} expanded={visibleEditorId === session.id} onToggle={open => setEditingSessionId(current => open ? session.id : current === session.id ? undefined : current)} /> : visibleEditorId === session.id && <TrainingSessionCard
            session={session}
            staffMembers={staffMembers}
            plan={tacticalPlan}
            validationError={showValidation && session.planningStatus !== 'PLANNED'}
            requiresReview={session.id === reviewRequiredSessionId}
            onChange={updateSession}
            onClose={() => setEditingSessionId(undefined)}
          />}
          </div>
        ))}
      </section>
      {activeSessionId && onFinishEditing && <aside className="training-edit-finish"><p>{invalidSessions.length ? 'Guarda la planificación de la sesión antes de continuar.' : 'La planificación está guardada.'}</p><button className="primary-action" type="button" disabled={invalidSessions.length > 0} onClick={onFinishEditing}>CONTINUAR</button></aside>}
      {trainingState.weekClosed && (
        <p className="week-closed-notice">
          Semana procesada. Sus efectos no volverán a aplicarse.
        </p>
      )}
      <div className="training-bottom-row">
        <PlayersToWatch state={trainingState} injuredPlayerIds={injuredPlayerIds} onSelect={setSelectedPlayer} />
        <TrainingHighlights sessions={trainingState.sessions} />
      </div>
      {detailPlayer && (
        <PlayerDetail
          player={detailPlayer}
          trainingState={selectedState ?? undefined}
          provisionalProgress={provisionalProgress}
          onClose={() => setSelectedPlayer(null)}
        />
      )}
      {tutorialActive && onTutorialStepChange && onTutorialComplete && <ContextualTour steps={TRAINING_TUTORIAL_STEPS} step={tutorialStep} onStepChange={onTutorialStepChange} onComplete={onTutorialComplete} skipLabel="SALTAR TUTORIAL" />}
    </section>
  );
}
