import { useState } from 'react'
import { PlayerDetail } from '../components/PlayerDetail'
import { StarRating } from '../components/StarRating'
import { players } from '../data/mockData'
import type { Player } from '../domain/models'
import type { PlayerSeasonStats } from '../domain/gameState'
import type { PlayerClubCompensation, PlayerFeePlan } from '../domain/playerFinance'
import { getPlayerFeeLabel } from '../domain/playerFinance'
import { calculateGeneralRating, getPlayerPositions } from '../domain/playerRatings'
import { getPlayerHappiness } from '../domain/trainingEngine'
import type { TrainingGameState } from '../domain/trainingTypes'
import { getHappinessLabel } from '../domain/humanState'
import { formatMatchRating, getAverageMatchRating, getFormLabel, getLastMatchRatings } from '../domain/playerPresentation'
import './TeamScreen.css'

type TeamScreenProps = { playerSeasonStats: Record<number, PlayerSeasonStats>; trainingState: TrainingGameState; injuredPlayerIds: number[]; playerFees: Record<number, PlayerFeePlan>; playerCompensations: Record<number, PlayerClubCompensation>; onBack: () => void }

export function TeamScreen({ playerSeasonStats, trainingState, injuredPlayerIds, playerFees, playerCompensations, onBack }: TeamScreenProps) {
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)
  return <section className="team-screen">
    <header className="screen-header"><button className="screen-back-button" type="button" onClick={onBack}>← Panel del club</button><h2>Equipo</h2></header>
    <p className="team-description">Plantilla actual, situación deportiva y estado de la cuota del club.</p>
    <div className="team-table-wrapper"><table className="team-table" aria-label="Tabla de jugadores del equipo">
      <caption className="team-table-caption">Pulsa un jugador para abrir su ficha. Las cuotas pertenecen al club y no forman parte del presupuesto deportivo.</caption>
      <thead><tr><th>Pos</th><th>Nombre</th><th>Calidad</th><th>Forma</th><th>PJ</th><th>G</th><th>Valoración media</th><th>Últimos 5</th><th>Edad</th><th>Personalidad</th><th>Felicidad</th><th>Cuota</th></tr></thead>
      <tbody>{players.map((player) => { const stats = playerSeasonStats[player.id]; const human = trainingState.players[player.id]; const average = getAverageMatchRating(stats); const latest = getLastMatchRatings(stats); return <tr key={player.id} tabIndex={0} onClick={() => setSelectedPlayer(player)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') setSelectedPlayer(player) }}>
        <td>{getPlayerPositions(player).join('/')}</td><td><button className="player-name-button" type="button">{player.name}</button>{player.clubStatus === 'TRIAL' && <span className="trial-player-badge">A prueba</span>}</td><td><StarRating value={calculateGeneralRating(player)} /></td><td>{getFormLabel(player.form)}</td><td>{stats?.appearances ?? player.appearances}</td><td>{stats?.goals ?? player.goals}</td><td>{average === null ? '—' : formatMatchRating(average)}</td><td className="recent-ratings">{latest.length ? latest.map((item) => formatMatchRating(item.rating)).join(' · ') : '—'}</td><td>{player.age}</td><td>{human?.personality ?? player.personality}</td><td>{getHappinessLabel(human ? getPlayerHappiness(human) : player.happiness)}</td><td>{player.clubStatus === 'TRIAL' ? '—' : getPlayerFeeLabel(playerFees[player.id], playerCompensations[player.id]?.monthlyAmount)}</td>
      </tr> })}</tbody>
    </table></div>
    {selectedPlayer && <PlayerDetail player={selectedPlayer} trainingState={trainingState.players[selectedPlayer.id]} seasonStats={playerSeasonStats[selectedPlayer.id]} injured={injuredPlayerIds.includes(selectedPlayer.id)} playerFee={selectedPlayer.clubStatus === 'TRIAL' ? undefined : playerFees[selectedPlayer.id]} playerCompensation={selectedPlayer.clubStatus === 'TRIAL' ? undefined : playerCompensations[selectedPlayer.id]} onClose={() => setSelectedPlayer(null)} />}
  </section>
}
