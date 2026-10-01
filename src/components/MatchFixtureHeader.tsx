import { PageTitle } from './ClubUi'
import type { ReactNode } from 'react'
import type { LeagueMatch, LeagueTeam } from '../domain/models'
import { competitionSeason, fixtureDate } from '../domain/competitionPresentation'
import { TeamBadge } from './TeamBadge'
import '../styles/competition.css'

export function MatchFixtureHeader({ match, teams, title, actions, onOpenClub }: { match: LeagueMatch; teams: LeagueTeam[]; title: string; actions?: ReactNode; onOpenClub?: (id: string) => void }) {
  const home = teams.find(team => team.id === match.homeTeamId)?.name ?? match.homeTeamId
  const away = teams.find(team => team.id === match.awayTeamId)?.name ?? match.awayTeamId
  const played = match.status === 'played'
  return <div className="fixture-heading">
    <PageTitle title={title} subtitle={match.competitionType === "FRIENDLY" ? "Pretemporada · Amistoso" : "4a Catalana"} actions={actions} />
    <div className="fixture-hero">
      <div className="fixture-versus"><div className="fixture-team fixture-team--home"><strong>{home}</strong><span className="fixture-crest"><TeamBadge teamId={match.homeTeamId} name={home} large onOpen={onOpenClub} /></span></div>
        <div className="fixture-score"><span className={`fixture-status${played ? ' is-final' : ''}`}>{played ? 'Finalizado' : 'Pendiente'}</span><strong aria-label={played ? `${home} ${match.homeGoals}, ${away} ${match.awayGoals}` : 'Partido pendiente'}>{played ? match.homeGoals : '–'}<i>:</i>{played ? match.awayGoals : '–'}</strong></div>
        <div className="fixture-team fixture-team--away"><span className="fixture-crest"><TeamBadge teamId={match.awayTeamId} name={away} large onOpen={onOpenClub} /></span><strong>{away}</strong></div>
      </div>
    </div>
    <dl className="fixture-details"><div><dt>Competición</dt><dd>{match.competitionType === 'FRIENDLY' ? 'Amistoso' : `4a Catalana · Jornada ${match.matchday}`}</dd></div><div><dt>Temporada</dt><dd>{competitionSeason([match])}</dd></div><div><dt>Fecha y hora</dt><dd>{fixtureDate(match.date)} · {match.time} h</dd></div><div><dt>Campo</dt><dd>{match.venue ?? 'Campo por confirmar'}</dd></div></dl>
  </div>
}
