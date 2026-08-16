import { LeagueTabs } from '../components/LeagueTabs'
import { MatchdaySelector } from '../components/MatchdaySelector'
import { goalEvents, leagueMatches, leagueSeason, leagueTeams, players, rivalPlayers } from '../data/mockData'
import { calculateTopScorers } from '../domain/leagueScorers'
import './ScorersScreen.css'

type ScorersScreenProps = { onBack: () => void; onOpenResults: () => void; onOpenStandings: () => void; onOpenSanctions: () => void; selectedMatchday: number; onMatchdayChange: (matchday: number) => void }

export function ScorersScreen({ onBack, onOpenResults, onOpenStandings, onOpenSanctions, selectedMatchday, onMatchdayChange }: ScorersScreenProps) {
  const teamNames = new Map(leagueTeams.map((team) => [team.id, team.name]))
  const scorers = calculateTopScorers(goalEvents, leagueMatches, players, rivalPlayers, selectedMatchday)
  return (
    <section className="scorers-screen">
      <header className="screen-header">
        <button className="screen-back-button" type="button" onClick={onBack}>← Panel del club</button>
        <h2>La liga</h2>
      </header>
      <LeagueTabs activeTab="scorers" onSelect={(tab) => { if (tab === 'results') onOpenResults(); if (tab === 'standings') onOpenStandings(); if (tab === 'sanctions') onOpenSanctions() }} />
      <MatchdaySelector currentMatchday={leagueSeason.currentMatchday} selectedMatchday={selectedMatchday} totalMatchdays={leagueSeason.totalMatchdays} onSelect={onMatchdayChange} />
      <div className="scorers-table-wrapper">
        <table className="scorers-table" aria-label={`Goleadores hasta la jornada ${selectedMatchday}`}>
          <thead><tr><th scope="col">POS</th><th scope="col">Jugador</th><th scope="col">Equipo</th><th scope="col">Goles</th></tr></thead>
          <tbody>{scorers.map((scorer) => (
            <tr className={scorer.teamId === 'fc-poblenou' ? 'is-user-team' : undefined} key={scorer.playerId}>
              <td>{scorer.position}</td><th scope="row">{scorer.playerName}</th><td>{teamNames.get(scorer.teamId)}</td>
              <td className="scorer-goals">{scorer.goals}{scorer.penaltyGoals > 0 ? ` (${scorer.penaltyGoals})` : ''}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
      <p className="penalty-note">Entre paréntesis, goles de penalti.</p>
    </section>
  )
}
