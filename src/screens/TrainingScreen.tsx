import { useState } from "react";
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

type Props = {
  tacticalPlan: TacticalPlan;
  trainingState: TrainingGameState;
  activeSessionId?: string;
  injuredPlayerIds?: number[];
  staffMembers: StaffPerson[];
  guided?: boolean;
  onTrainingStateChange: (state: TrainingGameState) => void;
  onBack: () => void;
  onOpenTactics: () => void;
  onFinishEditing?: () => void;
};
const absenceReasons = [
  "Trabajo",
  "Estudios",
  "Motivos personales",
  "Molestias",
];

function TrainingSummary({
  state,
  plan,
}: {
  state: TrainingGameState;
  plan: TacticalPlan;
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
    <section className="training-effects">
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
}: {
  session: FunctionalTrainingSession;
  onChange: (next: FunctionalTrainingSession) => void;
  staffMembers?: StaffPerson[];
  plan: TacticalPlan;
  canExecute?: boolean;
  onExecute?: () => void;
}) {
  const [showAbsences, setShowAbsences] = useState(false);
  if (session.status === "completed")
    return <CompletedSession session={session} />;
  const isFull = FULL_SESSION_BLOCKS.includes(session.blocks[0]);
  const setBlock = (index: 0 | 1, block: TrainingBlock) =>
    onChange({
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
    <article className="training-session-card">
      <header>
        <div>
          <span>Sesión {session.id === "tuesday" ? "1" : "2"}</span>
          <h3>{session.day}</h3>
        </div>
        <span className="session-status">
          {session.planningStatus === "PLANNED"
            ? "PLANIFICADA"
            : "POR PLANIFICAR"}
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
                onChange({
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
      <div className="training-block-selectors">
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
      {session.planningStatus !== "PLANNED" && (
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
  onTrainingStateChange,
  onBack,
  onOpenTactics,
  onFinishEditing,
}: Props) {
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const updateSession = (next: FunctionalTrainingSession) =>
    onTrainingStateChange({
      ...trainingState,
      sessions: trainingState.sessions.map((session) =>
        session.id === next.id ? next : session,
      ),
    });
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
      </header>
      {guided && (
        <aside className="onboarding-prompt">
          <span>PRIMERA SEMANA</span>
          <p>
            {plannedCount === 2
              ? "SEMANA PLANIFICADA"
              : `${plannedCount} de 2 sesiones planificadas`}
          </p>
        </aside>
      )}
      <TrainingSummary state={trainingState} plan={tacticalPlan} />
      <TacticalTrainingSummary
        plan={tacticalPlan}
        onOpenTactics={onOpenTactics}
      />
      <section className="training-sessions" aria-label="Planificación semanal">
        {trainingState.sessions.map((session) => (
          activeSessionId && session.id !== activeSessionId && session.status !== "completed" ? null :
          <TrainingSessionCard
            key={session.id}
            session={session}
            staffMembers={staffMembers}
            plan={tacticalPlan}
            onChange={updateSession}
          />
        ))}
      </section>
      {activeSessionId && onFinishEditing && <aside className="training-edit-finish"><p>Los cambios quedan guardados en la planificación pendiente.</p><button className="primary-action" type="button" onClick={onFinishEditing}>GUARDAR CAMBIOS Y CONTINUAR</button></aside>}
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
    </section>
  );
}
