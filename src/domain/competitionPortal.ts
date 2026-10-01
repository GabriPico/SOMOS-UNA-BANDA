import type { GameState } from './gameState'
import type { LeagueMatch, LeagueSanction, LeagueTeam, Player, RivalPlayer } from './models'
import { getCurrentLeagueStandings } from './leagueStandings'
import { calculateTopScorers } from './leagueScorers'
import { getSanctionsForMatchday } from './leagueSanctions'
import { competitionSeason } from './competitionPresentation'
import { getClubKits, getClubPalette } from './clubAppearance'

export type CompetitionTab = 'results' | 'standings' | 'calendar' | 'sanctions' | 'scorers' | 'kits'
export type CompetitionMetadata = { name: string; modality: string; group?: string }
export type PublicClubPlayer = { id: number; name: string; positions: string; age?: number; shirtNumber?: number }
export const isCompetitionScreen = (screen: string) => ['competition', 'standings', 'league-results', 'league-scorers', 'league-sanctions'].includes(screen)
export function competitionTabForScreen(screen: string): CompetitionTab {
  return ({ 'league-results': 'results', 'league-scorers': 'scorers', 'league-sanctions': 'sanctions' } as Record<string, CompetitionTab>)[screen] ?? 'standings'
}
export const sortFixtures = (matches: LeagueMatch[]) => [...matches].sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`) || a.id.localeCompare(b.id))

/** Pure read model shared by the full portal and the phone; never mutates a game. */
export function getCompetitionPortalData(game: GameState, teams: LeagueTeam[], players: Player[], rivals: RivalPlayer[], sanctions: LeagueSanction[], metadata: CompetitionMetadata) {
  const matches = sortFixtures(game.temporal.calendar)
  const league = matches.filter(match => match.competitionType !== 'FRIENDLY' && !match.playoffRound)
  const matchdays = [...new Set(league.map(match => match.matchday))].sort((a, b) => a - b)
  const through = Math.max(0, ...matchdays)
  const standings = getCurrentLeagueStandings(teams, matches)
  const currentMatchday = Math.max(0, ...league.filter(match => match.status === 'played').map(match => match.matchday))
  const clubs = teams.map(team => {
    const fixtures = matches.filter(match => match.homeTeamId === team.id || match.awayTeamId === team.id)
    const squad: PublicClubPlayer[] = team.id === 'fc-poblenou' ? players.filter(player => player.clubStatus !== 'TRIAL').map(player => ({ id: player.id, name: player.name, positions: [player.primaryPosition, ...player.secondaryPositions].join(' · '), age: player.age, shirtNumber: player.shirtNumber })) : rivals.filter(player => player.teamId === team.id).map(player => ({ id: player.id, name: player.name, positions: [player.primaryPosition, ...player.secondaryPositions].join(' · ') }))
    return { ...team, palette: getClubPalette(team.id), kits: getClubKits(team), standing: standings.find(row => row.teamId === team.id)!, fixtures, nextMatchId: fixtures.find(match => match.status === 'scheduled')?.id, ground: team.ground ?? fixtures.find(match => match.homeTeamId === team.id && match.venue)?.venue, squad }
  })
  const scorers = calculateTopScorers(game.goalEvents, league, players, rivals, through).map(row => {
    const teamMatches = league.filter(match => match.status === 'played' && (match.homeTeamId === row.teamId || match.awayTeamId === row.teamId))
    // A team fixture never proves individual participation. Full reports take
    // precedence over legacy totals, which may include initial mock history.
    const completeReports = teamMatches.every(match => game.matchReports?.[match.id]?.complete)
    const publicIdentityRecorded = teamMatches.some(match => {
      const report = game.matchReports?.[match.id]
      return report && (report.home.teamId === row.teamId ? report.home : report.away).players.some(player => player.id === row.playerId)
    })
    const recordedAppearances = teamMatches.filter(match => {
      const report = game.matchReports?.[match.id]
      if (!report) return false
      const side = report.home.teamId === row.teamId ? report.home : report.away
      return side.players.some(player => player.id === row.playerId && player.minutes > 0)
    }).length
    const seasonAppearances = row.teamId === 'fc-poblenou' ? game.playerSeasonStats[row.playerId]?.appearances : undefined
    const scoredMatches = new Set(game.goalEvents.filter(event => event.scorerId === row.playerId && teamMatches.some(match => match.id === event.matchId)).map(event => event.matchId)).size
    const consistentTotal = seasonAppearances !== undefined && seasonAppearances <= teamMatches.length && seasonAppearances >= Math.max(recordedAppearances, scoredMatches)
    const played = completeReports && publicIdentityRecorded ? recordedAppearances : consistentTotal ? seasonAppearances : undefined
    return { ...row, played, goalsPerMatch: played && played > 0 ? row.goals / played : undefined }
  })
  const playerNames = new Map([...players, ...rivals].map(player => [player.id, player.name]))
  const playerPositions = new Map([...players, ...rivals].map(player => [player.id, player.primaryPosition]))
  return { metadata, season: competitionSeason(league), matches, league, matchdays, currentMatchday, standings, clubs, scorers, sanctions, playerNames, playerPositions,
    rounds: matchdays.map(number => ({ number, matches: league.filter(match => match.matchday === number), date: league.find(match => match.matchday === number)?.date })),
    sanctionsForMatchday: (matchday: number) => getSanctionsForMatchday(sanctions, matchday),
  }
}
export type CompetitionPortalData = ReturnType<typeof getCompetitionPortalData>
