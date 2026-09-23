import type { Player } from '../domain/models'
import type { PlayerSeasonStats } from '../domain/gameState'
import type { TrainingPlayerState } from '../domain/trainingTypes'
import { getPlayerPositions } from '../domain/playerRatings'
import { getSeasonStatsPresentation, type PlayerStatusView } from '../presentation/playerPresentation'
import { PlayerIdentity } from './PlayerUi'
import { HappinessIndicator, PlayerStatus } from './PlayerStatus'

export function PlayerRow({ player, stats, training, status, selected, onSelect, onOpenPlayer }: { player: Player; stats?: PlayerSeasonStats; training?: TrainingPlayerState; status: PlayerStatusView; selected: boolean; onSelect: () => void; onOpenPlayer?: (id: number) => void }) {
  const season = getSeasonStatsPresentation(player, stats)
  return <tr className={selected ? 'is-selected' : ''} aria-current={selected ? 'true' : undefined} onClick={onSelect}>
    <td className="is-numeric squad-number">{player.shirtNumber ?? '—'}</td>
    <td><PlayerIdentity player={player} onSelect={onSelect} onOpenPlayer={onOpenPlayer} /></td>
    <td className="team-player-position">{getPlayerPositions(player).join(', ')}</td>
    <td className="is-numeric">{player.age}</td>
    <td className="is-numeric" title="Partidos jugados (titularidades)">{season.played}</td>
    <td className="is-numeric" title={season.minutesNote}>{season.minutes ?? '—'}</td>
    <td className="is-numeric">{season.goals}</td>
    <td className="is-numeric"><HappinessIndicator player={player} training={training} /></td>
    <td><PlayerStatus status={status} /></td>
    <td className="team-observations" title={status.observations.join(' · ')}>{status.observations.join(' · ') || '—'}</td>
  </tr>
}
