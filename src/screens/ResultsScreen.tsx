import { LeagueTabs } from '../components/LeagueTabs'
import { MatchdaySelector } from '../components/MatchdaySelector'
import { CompetitionHeader } from '../components/CompetitionHeader'
import { TeamBadge } from '../components/TeamBadge'
import { leagueSeason, leagueTeams } from '../data/mockData'
import type { LeagueMatch } from '../domain/models'
import { getMatchesByMatchday } from '../domain/leagueStandings'
import { fixtureDate } from '../domain/competitionPresentation'
import '../styles/competition.css'

type ResultsScreenProps = { liveMatches: LeagueMatch[]; currentMatchday: number; onBack: () => void; onOpenStandings: () => void; onOpenSanctions: () => void; onOpenScorers: () => void; selectedMatchday: number; onMatchdayChange: (matchday: number) => void; onOpenMatch: (matchId: string) => void; competition: 'league' | 'friendly'; onCompetitionChange: (competition: 'league' | 'friendly') => void }
const USER_TEAM_ID = 'fc-poblenou'

export function ResultsScreen({ liveMatches, currentMatchday, onBack, onOpenStandings, onOpenSanctions, onOpenScorers, selectedMatchday, onMatchdayChange, onOpenMatch, competition, onCompetitionChange: setCompetition }: ResultsScreenProps) {
  const teamNames = new Map(leagueTeams.map((team) => [team.id, team.name]))
  const matches = competition === 'friendly' ? liveMatches.filter(match => match.competitionType === 'FRIENDLY') : getMatchesByMatchday(liveMatches, selectedMatchday)

  return (
    <section className="results-screen competition-screen">
      <CompetitionHeader title="Resultados" matches={liveMatches} onBack={onBack} />

      <LeagueTabs activeTab="results" onSelect={(tab) => { if (tab === 'standings') onOpenStandings(); if (tab === 'sanctions') onOpenSanctions(); if (tab === 'scorers') onOpenScorers() }} />
      <div className="competition-toolbar"><div className="results-filter" aria-label="Competición de los resultados"><button type="button" aria-pressed={competition === 'league'} onClick={() => setCompetition('league')}>Liga</button><button type="button" aria-pressed={competition === 'friendly'} onClick={() => setCompetition('friendly')}>Amistosos</button></div><span>Consulta el calendario y las actas de cada partido.</span></div>
      {competition === 'league' && <MatchdaySelector currentMatchday={currentMatchday} selectedMatchday={selectedMatchday} totalMatchdays={leagueSeason.totalMatchdays} onSelect={onMatchdayChange} allowFuture />}
      <div className="competition-section-heading"><h3>{competition === 'friendly' ? 'Amistosos de pretemporada' : `Resultados · Jornada ${selectedMatchday}`}</h3><p>{matches.length} {matches.length === 1 ? 'partido' : 'partidos'}</p></div>

      <div className="competition-results" aria-label={competition === 'friendly' ? 'Resultados de amistosos' : `Resultados de la jornada ${selectedMatchday}`}>
        {matches.map((match) => {
          const isUserMatch = match.homeTeamId === USER_TEAM_ID || match.awayTeamId === USER_TEAM_ID
          const home = teamNames.get(match.homeTeamId) ?? match.homeTeamId
          const away = teamNames.get(match.awayTeamId) ?? match.awayTeamId
          const played = match.status === 'played'
          return (
            <article className={`competition-result${isUserMatch ? ' is-user-match' : ''}`} key={match.id}>
              <div className="competition-result-team"><span>{home}</span><TeamBadge teamId={match.homeTeamId} name={home} /></div>
              <div className="competition-result-score">{played ? <><strong>{match.homeGoals} – {match.awayGoals}</strong><small>Finalizado</small></> : <><time dateTime={`${match.date}T${match.time}`}>{fixtureDate(match.date)}<br />{match.time} h</time><small>Pendiente</small></>}</div>
              <div className="competition-result-team"><TeamBadge teamId={match.awayTeamId} name={away} /><span>{away}</span></div>
              <div className="competition-result-info"><small>{played && <>{fixtureDate(match.date)} · {match.time} h<br /></>}{match.venue ?? 'Campo por confirmar'}</small><button type="button" aria-label={`${played ? 'Ver acta' : 'Ver ficha'}: ${home} – ${away}`} onClick={() => onOpenMatch(match.id)}>{played ? 'VER ACTA' : 'VER FICHA'} →</button></div>
            </article>
          )
        })}
        {!matches.length && <p className="competition-empty competition-panel">No hay partidos programados en esta selección.</p>}
      </div>
    </section>
  )
}
