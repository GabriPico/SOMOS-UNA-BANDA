import type { LeagueMatch, LeagueTeam } from '../domain/models'
import './NextMatchSummary.css'

type NextMatchSummaryProps = { match: LeagueMatch; teams: LeagueTeam[]; userTeamId: string }
const weekdays = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']

function formatDate(date: string) {
  const [year, month, day] = date.split('-').map(Number)
  const weekday = weekdays[new Date(Date.UTC(year, month - 1, day)).getUTCDay()]
  return `${weekday[0].toUpperCase()}${weekday.slice(1)} ${day} ${months[month - 1]}`
}

export function NextMatchSummary({ match, teams, userTeamId }: NextMatchSummaryProps) {
  const teamNames = new Map(teams.map((team) => [team.id, team.name]))
  const location = match.homeTeamId === userTeamId ? 'C' : 'F'
  return (
    <div className="next-match-summary">
      <p className="next-match-eyebrow">PRÓXIMO PARTIDO — {match.competitionType === 'FRIENDLY' ? 'Amistoso' : `Jornada ${match.matchday}`}</p>
      <h2>{teamNames.get(match.homeTeamId)} vs {teamNames.get(match.awayTeamId)} <span>({location})</span></h2>
      <p className="next-match-kickoff">{formatDate(match.date)} · {match.time} h</p>
    </div>
  )
}
