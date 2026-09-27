import { PageTitle } from '../components/ClubUi'
import { LeagueTabs } from '../components/LeagueTabs'
import { MatchdaySelector } from '../components/MatchdaySelector'
import { leagueSanctions, leagueSeason, leagueTeams, players, rivalPlayers } from '../data/mockData'
import { getSanctionsForMatchday } from '../domain/leagueSanctions'
import './SanctionsScreen.css'

type SanctionsScreenProps = { onBack: () => void; onOpenResults: () => void; onOpenStandings: () => void; onOpenScorers: () => void; selectedMatchday: number; onMatchdayChange: (matchday: number) => void }

export function SanctionsScreen({ onBack, onOpenResults, onOpenStandings, onOpenScorers, selectedMatchday, onMatchdayChange }: SanctionsScreenProps) {
  const teamNames = new Map(leagueTeams.map((team) => [team.id, team.name]))
  const playerNames = new Map<number, string>()
  players.forEach((player) => playerNames.set(player.id, player.name))
  rivalPlayers.forEach((player) => playerNames.set(player.id, player.name))
  const sanctions = getSanctionsForMatchday(leagueSanctions, selectedMatchday)

  return (
    <section className="competition-screen sanctions-screen">
      <PageTitle title="Sanciones" subtitle="El tablón de nuestra liga." actions={<button className="screen-back-button" type="button" onClick={onBack}>← Panel del club</button>} />
      <LeagueTabs activeTab="sanctions" onSelect={(tab) => { if (tab === 'results') onOpenResults(); if (tab === 'standings') onOpenStandings(); if (tab === 'scorers') onOpenScorers() }} />
      <MatchdaySelector currentMatchday={leagueSeason.currentMatchday} selectedMatchday={selectedMatchday} totalMatchdays={leagueSeason.totalMatchdays} onSelect={onMatchdayChange} />

      {sanctions.length === 0 ? <p className="sanctions-empty">No hay sanciones para esta jornada.</p> : (
        <div className="sanctions-table-wrapper">
          <table className="sanctions-table" aria-label={`Sanciones de la jornada ${selectedMatchday}`}>
            <thead><tr><th scope="col">Jugador</th><th scope="col">Equipo</th><th scope="col">Motivo</th><th scope="col">Sanción</th></tr></thead>
            <tbody>{sanctions.map((sanction) => (
              <tr className={sanction.teamId === 'fc-poblenou' ? 'is-user-team' : undefined} key={sanction.id}>
                <th scope="row">{playerNames.get(sanction.playerId)}</th><td>{teamNames.get(sanction.teamId)}</td><td>{sanction.reason}</td>
                <td>{sanction.remainingMatches} {sanction.remainingMatches === 1 ? 'partido' : 'partidos'}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </section>
  )
}
