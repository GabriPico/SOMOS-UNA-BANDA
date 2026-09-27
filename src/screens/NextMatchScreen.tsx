import { useState } from "react";
import { MatchFixtureHeader } from "../components/MatchFixtureHeader";
import { PageTitle } from '../components/ClubUi';
import { StarRating } from "../components/StarRating";
import { getFormLabel } from "../domain/playerPresentation";
import { latestClubMatch } from "../domain/competitionPresentation";
import {
  goalEvents,
  leagueSanctions,
  leagueTeams,
  players,
  rivalPlayers,
  rivalTeamProfiles,
} from "../data/mockData";
import type { LeagueMatch } from "../domain/models";
import type { GameState } from "../domain/gameState";
import {
  calculateGeneralRating,
  getPlayerPositions,
} from "../domain/playerRatings";
import {
  getPlayerEligibility,
  OFFICIAL_SQUAD_MAX,
  OFFICIAL_SQUAD_MIN,
} from "../domain/squadSelection";
import { calculateStandings } from "../domain/leagueStandings";
import {
  getNextMatch,
  getOpponentId,
  getOpponentStanding,
  getPlayersToWatch,
  getRecentMatches,
  getScoutedWeaknesses,
  getTeamName,
  summarizeRecentForm,
} from "../domain/nextMatch";
import "./NextMatchScreen.css";
import { getConditionLabel } from "../domain/humanState";

type NextMatchScreenProps = {
  matches: LeagueMatch[];
  goalEvents: typeof goalEvents;
  matchReady: boolean;
  gameState: GameState;
  onAnnounceSquad: (playerIds: number[]) => string[];
  lineupReady: boolean;
  onBack: () => void;
  onOpenTactics: () => void;
  onPlay: () => void;
  onOpenReport: (matchId: string) => void;
};
const USER_TEAM_ID = "fc-poblenou";
const outcomeLabels = { G: "V", E: "E", P: "D" } as const;

export function NextMatchScreen({
  matches,
  goalEvents: liveGoalEvents,
  matchReady,
  gameState,
  onAnnounceSquad,
  lineupReady,
  onBack,
  onOpenTactics,
  onPlay,
  onOpenReport,
}: NextMatchScreenProps) {
  const nextMatch = getNextMatch(matches, USER_TEAM_ID);
  const lastMatch = latestClubMatch(matches);
  if (!nextMatch)
    return (
      <section className="next-match-screen competition-screen">
        <PageTitle title="Próximo partido" subtitle="Calendario del club" actions={<button className="screen-back-button" type="button" onClick={onBack}>← Panel del club</button>} />
        <div className="next-match-block">
          <p>No hay ningún próximo partido programado.</p>
          {lastMatch && <button className="competition-primary" type="button" onClick={() => onOpenReport(lastMatch.id)}>Ver acta del último partido →</button>}
        </div>
      </section>
    );

  const opponentId = getOpponentId(nextMatch, USER_TEAM_ID);
  const opponentName =
    getTeamName(leagueTeams, opponentId) ?? "Rival por confirmar";
  const standings = calculateStandings(
    leagueTeams,
    matches,
    nextMatch.matchday - 1,
  );
  const standing = getOpponentStanding(standings, opponentId);
  const profile = rivalTeamProfiles.find((item) => item.teamId === opponentId);
  const recentMatches = getRecentMatches(
    matches,
    opponentId,
    nextMatch.matchday,
  );
  const watchedPlayers = getPlayersToWatch(
    rivalPlayers,
    liveGoalEvents,
    matches,
    opponentId,
    nextMatch.matchday,
  );
  const weaknesses = profile ? getScoutedWeaknesses(rivalPlayers, profile) : [];

  return (
    <section className="next-match-screen competition-screen">
        <MatchFixtureHeader
          match={nextMatch}
          teams={leagueTeams}
          title="Próximo partido"
          actions={<><button className="screen-back-button" type="button" onClick={onBack}>← Panel del club</button>{lastMatch && <button className="competition-back" type="button" onClick={() => onOpenReport(lastMatch.id)}>Acta del último partido →</button>}</>}
        />
        <section className="opponent-status">
          <h3>{opponentName}</h3>
          {standing && (
            <>
              <strong>
                {standing.position}.º · {standing.points} pts
              </strong>
              <span>
                PJ {standing.played} · {standing.won}V · {standing.drawn}E ·{" "}
                {standing.lost}D
              </span>
            </>
          )}
          {profile && (
            <span>Temporada pasada: {profile.previousSeasonPosition}.º</span>
          )}
        </section>

      <div className="next-match-columns">
        {profile && (
          <section className="next-match-block scouting-style">
            <h3>CÓMO JUEGAN</h3>
            <p>
              <strong>Formación habitual: {profile.preferredFormation}</strong>
            </p>
            <div>
              <h4>Con balón</h4>
              <p>{profile.scouting.withBall}</p>
            </div>
            <div>
              <h4>Sin balón</h4>
              <p>{profile.scouting.withoutBall}</p>
            </div>
            {profile.scouting.observedPattern && (
              <div>
                <h4>Tendencia</h4>
                <p>{profile.scouting.observedPattern}</p>
              </div>
            )}
          </section>
        )}

        <section className="next-match-block compact-form">
          <h3>DINÁMICA</h3>
          {recentMatches.length > 0 && (
            <>
              <p className="form-sequence">
                {recentMatches
                  .map(({ outcome }) => outcomeLabels[outcome])
                  .join(" · ")}
              </p>
              <ul className="recent-results">
                {recentMatches.map(({ match }) => (
                  <li key={match.id}>
                    <span>{getTeamName(leagueTeams, match.homeTeamId)}</span>
                    <strong>
                      {match.homeGoals}–{match.awayGoals}
                    </strong>
                    <span>{getTeamName(leagueTeams, match.awayTeamId)}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
          <p>{summarizeRecentForm(recentMatches)}</p>
        </section>
      </div>

      <div className="next-match-lower">
        <section className="next-match-block">
          <h3>JUGADORES A VIGILAR</h3>
          <div className="scouting-list">
            {watchedPlayers.map(({ player, description }) => (
              <article key={player.id}>
                <h4>
                  {player.name} · {player.primaryPosition}
                </h4>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </section>

        {weaknesses.length > 0 && (
          <section className="next-match-block">
            <h3>PODEMOS EXPLOTAR</h3>
            <div className="scouting-list">
              {weaknesses.map((weakness, index) => (
                <article key={`${weakness.title}-${index}`}>
                  <h4>{weakness.title}</h4>
                  <p>{weakness.detail}</p>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>

      {nextMatch.competitionType !== "FRIENDLY" && (
        <SquadSelectionSection
          key={nextMatch.id}
          gameState={gameState}
          match={nextMatch}
          onAnnounce={onAnnounceSquad}
        />
      )}

      <footer className="next-match-actions">
        {!lineupReady && gameState.squadSelections[nextMatch.id]?.announced && (
          <p className="squad-selection-error">
            Prepara un once válido con jugadores convocados.
          </p>
        )}
        <button
          className="primary-action"
          type="button"
          onClick={onOpenTactics}
        >
          IR A TÁCTICAS
        </button>
        {matchReady &&
          (nextMatch.competitionType === "FRIENDLY" ||
            gameState.squadSelections[nextMatch.id]?.announced) && (
            <button
              className="primary-action"
              type="button"
              onClick={onPlay}
              disabled={!lineupReady}
            >
              JUGAR PARTIDO
            </button>
          )}
      </footer>
    </section>
  );
}

function SquadSelectionSection({
  gameState,
  match,
  onAnnounce,
}: {
  gameState: GameState;
  match: LeagueMatch;
  onAnnounce: (playerIds: number[]) => string[];
}) {
  const announced = gameState.squadSelections[match.id];
  const eligiblePlayers = players.filter(
    (player) =>
      getPlayerEligibility(gameState, match, player, leagueSanctions).eligible,
  );
  const [selectedIds, setSelectedIds] = useState<number[]>(
    () =>
      announced?.playerIds ??
      eligiblePlayers.slice(0, OFFICIAL_SQUAD_MAX).map((player) => player.id),
  );
  const [errors, setErrors] = useState<string[]>([]);
  const toggle = (playerId: number) => {
    if (announced) return;
    setErrors([]);
    setSelectedIds((current) =>
      current.includes(playerId)
        ? current.filter((id) => id !== playerId)
        : current.length >= OFFICIAL_SQUAD_MAX
          ? current
          : [...current, playerId],
    );
  };
  const relevantReactions =
    announced?.reactions.filter(
      (reaction) => reaction.significance === "RELEVANT" && reaction.text,
    ) ?? [];
  return (
    <section className="next-match-block squad-selection-block">
      <header>
        <div>
          <h3>CONVOCATORIA</h3>
          <p>
            {announced
              ? "Lista anunciada"
              : "Selecciona a los jugadores disponibles y comunica la lista."}
          </p>
        </div>
        <strong>
          CONVOCADOS {selectedIds.length} / {OFFICIAL_SQUAD_MAX}
        </strong>
      </header>
      <div className="squad-selection-table">
        <table>
          <thead>
            <tr>
              <th></th>
              <th>Pos</th>
              <th>Nombre</th>
              <th>Calidad</th>
              <th>Forma</th>
              <th>Condición</th>
              <th>Disponibilidad</th>
              <th>Situación</th>
            </tr>
          </thead>
          <tbody>
            {players.map((player) => {
              const eligibility = getPlayerEligibility(
                gameState,
                match,
                player,
                leagueSanctions,
              );
              const human = gameState.training.players[player.id];
              const selected = selectedIds.includes(player.id);
              return (
                <tr
                  key={player.id}
                  className={
                    !eligibility.eligible
                      ? "is-unavailable"
                      : selected
                        ? "is-called-up"
                        : undefined
                  }
                >
                  <td>
                    <input
                      type="checkbox"
                      aria-label={`Convocar a ${player.name}`}
                      checked={selected}
                      disabled={
                        Boolean(announced) ||
                        !eligibility.eligible ||
                        (!selected && selectedIds.length >= OFFICIAL_SQUAD_MAX)
                      }
                      onChange={() => toggle(player.id)}
                    />
                  </td>
                  <td>{getPlayerPositions(player).join("/")}</td>
                  <td>
                    <strong>{player.name}</strong>
                    {player.clubStatus === "TRIAL" && <small>A PRUEBA</small>}
                  </td>
                  <td><StarRating value={calculateGeneralRating(player)} /></td>
                  <td>{getFormLabel(player.form)}</td>
                  <td>{human ? getConditionLabel(human.fitness) : "—"}</td>
                  <td>
                    {eligibility.eligible ? "Disponible" : eligibility.reason}
                  </td>
                  <td>
                    {selected
                      ? "Convocado"
                      : eligibility.eligible
                        ? "No convocado"
                        : eligibility.status === "NOT_REGISTERED"
                          ? "No inscrito"
                          : eligibility.reason}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {!announced &&
        selectedIds.length < OFFICIAL_SQUAD_MAX &&
        selectedIds.length >= OFFICIAL_SQUAD_MIN && (
          <p className="squad-selection-warning">
            Quedan {OFFICIAL_SQUAD_MAX - selectedIds.length} plazas libres.
            Puedes anunciar igualmente la convocatoria.
          </p>
        )}
      {errors.map((error) => (
        <p className="squad-selection-error" key={error}>
          {error}
        </p>
      ))}
      {!announced ? (
        <button
          className="primary-action"
          type="button"
          onClick={() => setErrors(onAnnounce(selectedIds))}
        >
          ANUNCIAR CONVOCATORIA
        </button>
      ) : (
        <div className="squad-announcement">
          <strong>{announced.playerIds.length} jugadores convocados.</strong>
          {relevantReactions.length ? (
            relevantReactions.map((reaction) => (
              <p key={reaction.playerId}>{reaction.text}</p>
            ))
          ) : (
            <p>La convocatoria se comunica sin incidencias.</p>
          )}
        </div>
      )}
    </section>
  );
}
