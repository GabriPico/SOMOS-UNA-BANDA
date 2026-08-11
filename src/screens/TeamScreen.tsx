import { useState } from 'react'
import { PlayerDetail } from '../components/PlayerDetail'
import { players } from '../data/mockData'
import type { Player } from '../domain/models'
import { calculateGeneralRating, getPlayerPositions } from '../domain/playerRatings'
import './TeamScreen.css'

const incomeFormatter = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })
const formatIncome = (income: number) => `${income > 0 ? '+' : ''}${incomeFormatter.format(income)}`
type TeamScreenProps = { onBack: () => void }

export function TeamScreen({ onBack }: TeamScreenProps) {
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)
  return <section className="team-screen">
    <header className="screen-header"><button className="screen-back-button" type="button" onClick={onBack}>← Panel del club</button><h2>Equipo</h2></header>
    <p className="team-description">Plantilla actual con posiciones, personalidad y los ingresos desde el punto de vista del club.</p>
    <div className="team-table-wrapper"><table className="team-table" aria-label="Tabla de jugadores del equipo">
      <caption className="team-table-caption">Pulsa un jugador para abrir su ficha. + significa que paga al club; - que el club paga al jugador.</caption>
      <thead><tr><th>Pos</th><th>Nombre</th><th>Calidad General</th><th>Forma</th><th>PJ</th><th>G</th><th>Edad</th><th>Personalidad</th><th>Felicidad</th><th>Ingresos</th></tr></thead>
      <tbody>{players.map((player) => <tr key={player.id} tabIndex={0} onClick={() => setSelectedPlayer(player)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') setSelectedPlayer(player) }}>
        <td>{getPlayerPositions(player).join('/')}</td><td><button className="player-name-button" type="button">{player.name}</button></td><td>{Math.round(calculateGeneralRating(player))}</td><td>{player.form}</td><td>{player.appearances}</td><td>{player.goals}</td><td>{player.age}</td><td>{player.personality}</td><td>{player.happiness}</td><td>{formatIncome(player.income)}</td>
      </tr>)}</tbody>
    </table></div>
    {selectedPlayer && <PlayerDetail player={selectedPlayer} onClose={() => setSelectedPlayer(null)} />}
  </section>
}
