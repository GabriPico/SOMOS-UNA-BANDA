import type { LeagueMatch, LeagueTeam, MatchOutcome, StandingRow } from './models'

export function getMatchesByMatchday(matches: LeagueMatch[], matchday: number): LeagueMatch[] {
  return matches.filter((match) => match.competitionType !== 'FRIENDLY' && match.matchday === matchday)
}

/** Current league table, independent of any presentation's selected round. */
export function getCurrentLeagueStandings(teams: LeagueTeam[], matches: LeagueMatch[]): StandingRow[] {
  const league = matches.filter(match => match.competitionType !== 'FRIENDLY' && !match.playoffRound)
  return calculateStandings(teams, league, Math.max(0, ...league.map(match => match.matchday)))
}

export function calculateStandings(teams: LeagueTeam[], matches: LeagueMatch[], throughMatchday: number): StandingRow[] {
  const rows = new Map(teams.map((team) => [team.id, {
    position: 0, teamId: team.id, played: 0, won: 0, drawn: 0, lost: 0,
    goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0,
    recentForm: [] as MatchOutcome[],
  }]))

  matches
    .filter((match) => match.competitionType !== 'FRIENDLY' && match.status === 'played' && match.matchday <= throughMatchday)
    .sort((a, b) => a.matchday - b.matchday || a.id.localeCompare(b.id))
    .forEach((match) => {
      const home = rows.get(match.homeTeamId)
      const away = rows.get(match.awayTeamId)
      if (!home || !away) return

      home.played += 1
      away.played += 1
      home.goalsFor += match.homeGoals
      home.goalsAgainst += match.awayGoals
      away.goalsFor += match.awayGoals
      away.goalsAgainst += match.homeGoals

      if (match.homeGoals > match.awayGoals) {
        home.won += 1; home.points += 3; away.lost += 1
        home.recentForm.push('G'); away.recentForm.push('P')
      } else if (match.homeGoals < match.awayGoals) {
        away.won += 1; away.points += 3; home.lost += 1
        home.recentForm.push('P'); away.recentForm.push('G')
      } else {
        home.drawn += 1; away.drawn += 1; home.points += 1; away.points += 1
        home.recentForm.push('E'); away.recentForm.push('E')
      }
    })

  return [...rows.values()]
    .map((row) => ({ ...row, goalDifference: row.goalsFor - row.goalsAgainst, recentForm: row.recentForm.slice(-5) }))
    .sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference || b.goalsFor - a.goalsFor || a.teamId.localeCompare(b.teamId))
    .map((row, index) => ({ ...row, position: index + 1 }))
}

export function getStandingsAroundTeam(standings: StandingRow[], teamId: string, size = 5): StandingRow[] {
  if (size <= 0) return []
  const teamIndex = standings.findIndex((row) => row.teamId === teamId)
  if (teamIndex < 0) return []
  const windowSize = Math.min(size, standings.length)
  const start = Math.min(Math.max(teamIndex - Math.floor(windowSize / 2), 0), standings.length - windowSize)
  return standings.slice(start, start + windowSize)
}
