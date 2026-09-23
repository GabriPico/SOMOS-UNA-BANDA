import { useEffect, useState } from "react";
import { PlayerDetail } from "../components/PlayerDetail";
import { players } from "../data/mockData";
import type {
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
  const values = [
    [
      "Familiaridad táctica",
      getFamiliarityLabel(calculateOverallFamiliarity(state.familiarity, plan)),
    ],
    ["Balón parado", getFamiliarityLabel(state.familiarity.setPieces.current)],
    ["Condición física", getConditionLabel(getTeamFitness(state))],
    ["Carga", getFatigueLabel(getTeamFatigue(state))],
    ["Felicidad", getHappinessLabel(getTeamHappiness(state))],
    ["Autoridad", getAuthorityLabel(getTeamAuthority(state))],
  ];
  return (
    <section
      className="training-summary"
      aria-label="Estado general del equipo"
      data-tour-target="training-physical-state"
    >
      {values.map(([label, value]) => (
        <div key={label}>
          <span>{label}</span>
          <strong>{value}</strong>
        </div>
      ))}
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
        <h3>Planteamiento actual</h3>
        <button type="button" onClick={() => setExpanded((value) => !value)}>
          {expanded ? "Ocultar detalles" : "Ver detalles"}
        </button>
      </div>
      <p>
        {plan.formation} · {plan.mentality} · {plan.passingStyle} · Ritmo{" "}
        {plan.tempo.toLowerCase()} · {plan.afterRecovery}
        <br />
        Presión {plan.pressingHeight.toLowerCase()} · Intensidad{" "}
        {plan.pressingIntensity.toLowerCase()} · {plan.afterLoss}
      </p>
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

function CompletedSession({ session }: { session: FunctionalTrainingSession }) {
  const result = session.result;
  return (
    <article className="training-session-card completed-session">
      <header>
        <div>
          <span>{session.day}</span>
          <h3>Entrenamiento realizado</h3>
        </div>
        <span className="session-status">Realizada</span>
      </header>
      <p>
        <strong>
          Asistencia: {session.attendance} / {session.totalPlayers}
        </strong>
        <br />
        Calidad: <strong>{session.qualityLabel}</strong>
        <br />
        Riesgo de lesión: <strong>{result?.injuryRisk}</strong>
      </p>
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
    </article>
  );
}

function TrainingSessionCard({
  session,
  onChange,
  staffMembers = [],
  plan,
  validationError = false,
  requiresReview = false,
}: {
  session: FunctionalTrainingSession;
  onChange: (next: FunctionalTrainingSession) => void;
  staffMembers?: StaffPerson[];
  plan: TacticalPlan;
  validationError?: boolean;
  requiresReview?: boolean;
  canExecute?: boolean;
  onExecute?: () => void;
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
      </header>
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
      <TrainingEffectsPreview session={session} />
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
      {watch.length ? <div className="players-to-watch">{watch.map((item) => { const player = players.find((candidate) => candidate.id === item.playerId); return player ? <button type="button" key={item.playerId} onClick={() => onSelect(player)}><strong>{player.name}</strong><span>{item.reasons.map((reason) => reason.label).join(" · ")}</span></button> : null })}</div> : <p>No hay situaciones individuales especialmente preocupantes.</p>}
    </section>
  );
}

export function TrainingScreen({
  tacticalPlan,
  trainingState,
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
  const invalidSessions = trainingState.sessions.filter((session) => session.status !== 'completed' && session.planningStatus !== 'PLANNED');
  const invalidSessionCount = invalidSessions.length;
  useEffect(() => {
    if (!validationAttempt || !invalidSessionCount) return;
    setShowValidation(true);
    document.querySelector('.training-sessions')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [validationAttempt, invalidSessionCount]);
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
      <header className="screen-header training-header">
        <button className="screen-back-button" type="button" onClick={onBack}>
          ← Panel del club
        </button>
        <div>
          <h2>Planificación de entrenamiento</h2>
          <span>Semana {trainingState.week}</span>
        </div>
        {tutorialCompleted && <button className="training-help-button" type="button" onClick={() => setShowHelp((value) => !value)}>AYUDA</button>}
      </header>
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
      <TacticalTrainingSummary
        plan={tacticalPlan}
        onOpenTactics={onOpenTactics}
      />
      <section className="training-sessions" aria-label="Planificación semanal" data-tour-target="training-week">
        {trainingState.sessions.map((session) => (
          activeSessionId && session.id !== activeSessionId && session.status !== "completed" ? null :
          <TrainingSessionCard
            key={session.id}
            session={session}
            staffMembers={staffMembers}
            plan={tacticalPlan}
            validationError={showValidation && session.status !== 'completed' && session.planningStatus !== 'PLANNED'}
            requiresReview={session.id === reviewRequiredSessionId}
            onChange={updateSession}
          />
        ))}
      </section>
      {activeSessionId && onFinishEditing && <aside className="training-edit-finish"><p>{invalidSessions.length ? 'Guarda la planificación de la sesión antes de continuar.' : 'La planificación está guardada.'}</p><button className="primary-action" type="button" disabled={invalidSessions.length > 0} onClick={onFinishEditing}>CONTINUAR</button></aside>}
      {trainingState.weekClosed && (
        <p className="week-closed-notice">
          Semana procesada. Sus efectos no volverán a aplicarse.
        </p>
      )}
      <PlayersToWatch state={trainingState} injuredPlayerIds={injuredPlayerIds} onSelect={setSelectedPlayer} />
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
