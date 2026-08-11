import { teamPlayers } from '../data/mockData'
import './TeamScreen.css'

const incomeFormatter = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
})

function formatIncome(income: number) {
  if (income > 0) {
    return `+${incomeFormatter.format(income)}`
  }

  return incomeFormatter.format(income)
}

export function TeamScreen() {
  return (
    <section className="team-screen">
      <h2>Equipo</h2>
      <p className="team-description">
        Plantilla actual con posiciones, personalidad y los ingresos desde el punto de vista del club.
      </p>

      <div className="team-table-wrapper">
        <table className="team-table" aria-label="Tabla de jugadores del equipo">
          <caption className="team-table-caption">
            + significa que el jugador paga al club; - significa que el club paga al jugador.
          </caption>
          <thead>
            <tr>
              <th scope="col">Pos</th>
              <th scope="col">Nombre</th>
              <th scope="col">Calidad</th>
              <th scope="col">Forma</th>
              <th scope="col">PJ</th>
              <th scope="col">G</th>
              <th scope="col">Edad</th>
              <th scope="col">Personalidad</th>
              <th scope="col">Felicidad</th>
              <th scope="col">Ingresos</th>
            </tr>
          </thead>
          <tbody>
            {teamPlayers.map((player) => (
              <tr key={player.id}>
                <td>{player.positions.join(' / ')}</td>
                <td>{player.name}</td>
                <td>{player.quality}</td>
                <td>{player.form}</td>
                <td>{player.appearances}</td>
                <td>{player.goals}</td>
                <td>{player.age}</td>
                <td>{player.personality}</td>
                <td>{player.happiness}</td>
                <td>{formatIncome(player.income)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
