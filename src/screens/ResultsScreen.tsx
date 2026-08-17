import { LeagueTabs } from '../components/LeagueTabs'
import { MatchdaySelector } from '../components/MatchdaySelector'
import { leagueSeason, leagueTeams } from '../data/mockData'
import type { LeagueMatch } from '../domain/models'
import { getMatchesByMatchday } from '../domain/leagueStandings'
import './ResultsScreen.css'

type ResultsScreenProps = { liveMatches: LeagueMatch[]; currentMatchday: number; onBack: () => void; onOpenStandings: () => void; onOpenSanctions: () => void; onOpenScorers: () => void; selectedMatchday: number; onMatchdayChange: (matchday: number) => void }
const USER_TEAM_ID = 'fc-poblenou'

export function ResultsScreen({ liveMatches, currentMatchday, onBack, onOpenStandings, onOpenSanctions, onOpenScorers, selectedMatchday, onMatchdayChange }: ResultsScreenProps) {
  const teamNames = new Map(leagueTeams.map((team) => [team.id, team.name]))
  const matches = getMatchesByMatchday(liveMatches, selectedMatchday)

  return (
    <section className="results-screen">
      <header className="screen-header">
        <button className="screen-back-button" type="button" onClick={onBack}>← Panel del club</button>
        <h2>La liga</h2>
      </header>

      <LeagueTabs activeTab="results" onSelect={(tab) => { if (tab === 'standings') onOpenStandings(); if (tab === 'sanctions') onOpenSanctions(); if (tab === 'scorers') onOpenScorers() }} />
      <MatchdaySelector currentMatchday={currentMatchday} selectedMatchday={selectedMatchday} totalMatchdays={leagueSeason.totalMatchdays} onSelect={onMatchdayChange} />

      <div className="match-results" aria-label={`Resultados de la jornada ${selectedMatchday}`}>
        {matches.map((match) => {
          const isUserMatch = match.homeTeamId === USER_TEAM_ID || match.awayTeamId === USER_TEAM_ID
          return (
            <article className={`match-result${isUserMatch ? ' is-user-match' : ''}`} key={match.id}>
              <span className="match-team home-team">{teamNames.get(match.homeTeamId)}</span>
              <strong className="match-score">{match.homeGoals} - {match.awayGoals}</strong>
              <span className="match-team away-team">{teamNames.get(match.awayTeamId)}</span>
              <small className="match-status">{match.status === 'played' ? 'Final' : 'Pendiente'}</small>
            </article>
          )
        })}
      </div>
    </section>
  )
}
