import { useState } from 'react'
import { StarRating } from './StarRating'
import type { LeagueMatch } from '../domain/models'
import type { GameState } from '../domain/gameState'
import { players, leagueSanctions } from '../data/mockData'
import { calculateGeneralRating, getPlayerPositions } from '../domain/playerRatings'
import { getPlayerEligibility, OFFICIAL_SQUAD_MAX, OFFICIAL_SQUAD_MIN } from '../domain/squadSelection'
import { getFormLabel } from '../domain/playerPresentation'
import { getConditionLabel } from '../domain/humanState'
export function SquadSelectionSection({
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
