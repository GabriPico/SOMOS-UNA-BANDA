import { MatchdaySelector } from '../components/MatchdaySelector'
import { LeagueTabs } from '../components/LeagueTabs'
import { leagueSeason, leagueTeams } from '../data/mockData'
import type { LeagueMatch, MatchOutcome } from '../domain/models'
import { calculateStandings } from '../domain/leagueStandings'
import './StandingsScreen.css'
import { CompetitionHeader } from '../components/CompetitionHeader'
import { TeamBadge } from '../components/TeamBadge'

type StandingsScreenProps = { matches: LeagueMatch[]; currentMatchday: number; onBack: () => void; onOpenResults: () => void; onOpenSanctions: () => void; onOpenScorers: () => void; selectedMatchday: number; onMatchdayChange: (matchday: number) => void }
const outcomeLabels: Record<MatchOutcome, string> = { G: 'Victoria', E: 'Empate', P: 'Derrota' }

export function StandingsScreen({ matches, currentMatchday, onBack, onOpenResults, onOpenSanctions, onOpenScorers, selectedMatchday: requestedMatchday, onMatchdayChange }: StandingsScreenProps) {
  const selectedMatchday = Math.min(requestedMatchday, Math.max(1, currentMatchday))
  const teamNames = new Map(leagueTeams.map((team) => [team.id, team.name]))
  const standings = calculateStandings(leagueTeams, matches, selectedMatchday)

  return (
    <section className="standings-screen competition-screen">
      <CompetitionHeader matches={matches} onBack={onBack} />

      <LeagueTabs activeTab="standings" onSelect={(tab) => { if (tab === 'results') onOpenResults(); if (tab === 'sanctions') onOpenSanctions(); if (tab === 'scorers') onOpenScorers() }} />

      <MatchdaySelector
        currentMatchday={currentMatchday}
        selectedMatchday={selectedMatchday}
        totalMatchdays={leagueSeason.totalMatchdays}
        onSelect={onMatchdayChange}
      />

      <div className="competition-section-heading"><h3>Clasificación</h3><p>{currentMatchday === 0 ? 'La liga todavía no ha comenzado' : `Acumulada hasta la jornada ${selectedMatchday}`}</p></div>
      <div className="standings-table-wrapper">
        <table className="standings-table" aria-label="Clasificación de liga">
          <thead><tr>
            <th scope="col">P</th><th scope="col">Equipo</th><th scope="col">PTS</th>
            <th scope="col">PJ</th><th scope="col">G</th><th scope="col">E</th>
            <th scope="col">P</th><th scope="col">GF</th><th scope="col">GC</th>
            <th scope="col">DG</th><th scope="col">Últimos</th>
          </tr></thead>
          <tbody>{standings.map((row) => (
            <tr key={row.teamId} className={row.teamId === 'fc-poblenou' ? 'is-user-team' : undefined}>
              <td className={`position position-${row.position === 1 ? 'promotion' : row.position <= 5 ? 'playoff' : 'regular'}`}>{row.position}</td>
              <th scope="row"><span className="competition-team-cell"><TeamBadge teamId={row.teamId} name={teamNames.get(row.teamId) ?? row.teamId} />{teamNames.get(row.teamId)}{row.teamId === 'fc-poblenou' && <small>Tu club</small>}</span></th>
              <td className="points">{row.points}</td><td>{row.played}</td><td>{row.won}</td>
              <td>{row.drawn}</td><td>{row.lost}</td><td>{row.goalsFor}</td>
              <td>{row.goalsAgainst}</td><td>{row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}</td>
              <td><div className="recent-form">{row.recentForm.map((outcome, index) => (
                <span className={`outcome outcome-${outcome}`} title={outcomeLabels[outcome]} aria-label={outcomeLabels[outcome]} key={`${row.teamId}-${index}`}>{outcome}</span>
              ))}{Array.from({ length: Math.max(0, 5 - row.recentForm.length) }, (_, index) => <span className="outcome" title="Sin partido" key={`empty-${index}`}>–</span>)}</div></td>
            </tr>
          ))}</tbody>
        </table>
      </div>

      <footer className="standings-legend">
        <span><i className="zone-mark promotion" />Ascenso directo</span>
        <span><i className="zone-mark playoff" />Playoff</span>
      </footer>
    </section>
  )
}
