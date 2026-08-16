import type {
  GoalEvent, LeagueMatch, LeagueTeam, MatchOutcome, PlayerAttribute,
  RivalPlayer, RivalTeamProfile, StandingRow,
} from './models'
import { calculatePositionRating } from './playerRatings'

export type RecentMatch = { match: LeagueMatch; outcome: MatchOutcome }
export type ScoutedPlayer = { player: RivalPlayer; goals: number; description: string }
export type ScoutedWeakness = { title: string; detail: string }

export function getNextMatch(matches: LeagueMatch[], teamId: string): LeagueMatch | undefined {
  return matches
    .filter((match) => match.status === 'scheduled' && (match.homeTeamId === teamId || match.awayTeamId === teamId))
    .sort((a, b) => a.matchday - b.matchday || a.date.localeCompare(b.date) || a.time.localeCompare(b.time))[0]
}

export function getOpponentId(match: LeagueMatch, teamId: string) {
  return match.homeTeamId === teamId ? match.awayTeamId : match.homeTeamId
}

export function getRecentMatches(matches: LeagueMatch[], teamId: string, beforeMatchday: number, limit = 5): RecentMatch[] {
  return matches
    .filter((match) => match.status === 'played' && match.matchday < beforeMatchday && (match.homeTeamId === teamId || match.awayTeamId === teamId))
    .sort((a, b) => b.matchday - a.matchday || b.id.localeCompare(a.id))
    .slice(0, limit)
    .reverse()
    .map((match) => {
      const teamGoals = match.homeTeamId === teamId ? match.homeGoals : match.awayGoals
      const opponentGoals = match.homeTeamId === teamId ? match.awayGoals : match.homeGoals
      return { match, outcome: teamGoals > opponentGoals ? 'G' : teamGoals < opponentGoals ? 'P' : 'E' }
    })
}

export function summarizeRecentForm(recentMatches: RecentMatch[]): string {
  if (recentMatches.length === 0) return 'Todavía no han disputado ningún partido esta temporada.'
  const outcomes = recentMatches.map(({ outcome }) => outcome)
  const wins = outcomes.filter((outcome) => outcome === 'G').length
  const losses = outcomes.filter((outcome) => outcome === 'P').length
  if (!outcomes.includes('P') && outcomes.length >= 2) return `Llevan ${outcomes.length} partidos sin perder.`
  if (wins >= 3) return `Llegan en buena dinámica: han ganado ${wins} de sus últimos ${outcomes.length} partidos.`
  if (losses >= 3) return `Han perdido ${losses} de sus últimos ${outcomes.length} partidos.`
  if (wins > losses) return `Han ganado ${wins} de sus últimos ${outcomes.length} partidos.`
  if (losses > wins) return `Han perdido ${losses} de sus últimos ${outcomes.length} partidos.`
  return `Balance equilibrado en sus últimos ${outcomes.length} partidos.`
}

function getGoalTotals(events: GoalEvent[], matches: LeagueMatch[], teamId: string, beforeMatchday: number) {
  const matchIds = new Set(matches.filter((match) => match.status === 'played' && match.matchday < beforeMatchday).map((match) => match.id))
  const totals = new Map<number, number>()
  events.filter((event) => event.teamId === teamId && matchIds.has(event.matchId)).forEach((event) => {
    totals.set(event.scorerId, (totals.get(event.scorerId) ?? 0) + 1)
  })
  return totals
}

const ATTRIBUTE_LABELS: Partial<Record<PlayerAttribute, string>> = {
  paradas: 'las paradas', juegoAereoPortero: 'el juego aéreo', rapidez: 'la velocidad',
  alcanceAereo: 'el juego aéreo', fuerza: 'la fuerza', resistencia: 'la resistencia',
  tecnica: 'la técnica', regate: 'el regate', pases: 'el pase', remate: 'el remate',
  entradas: 'las entradas', marcaje: 'el marcaje',
}

function strongestAttribute(player: RivalPlayer) {
  const relevant = player.primaryPosition === 'POR'
    ? ['paradas', 'juegoAereoPortero', 'juegoPiesPortero'] as PlayerAttribute[]
    : ['rapidez', 'alcanceAereo', 'fuerza', 'resistencia', 'tecnica', 'regate', 'pases', 'remate', 'entradas', 'marcaje'] as PlayerAttribute[]
  return relevant.sort((a, b) => player.attributes[b] - player.attributes[a] || a.localeCompare(b))[0]
}

export function getPlayersToWatch(players: RivalPlayer[], events: GoalEvent[], matches: LeagueMatch[], teamId: string, beforeMatchday: number, limit = 3): ScoutedPlayer[] {
  const goals = getGoalTotals(events, matches, teamId, beforeMatchday)
  return players.filter((player) => player.teamId === teamId)
    .map((player) => ({ player, goals: goals.get(player.id) ?? 0, rating: calculatePositionRating(player, player.primaryPosition) }))
    .sort((a, b) => b.goals - a.goals || b.rating - a.rating || a.player.id - b.player.id)
    .slice(0, limit)
    .map(({ player, goals: playerGoals }) => {
      const strength = ATTRIBUTE_LABELS[strongestAttribute(player)] ?? 'su juego en conjunto'
      const goalText = playerGoals > 0 ? `${playerGoals} ${playerGoals === 1 ? 'gol' : 'goles'}. ` : ''
      return { player, goals: playerGoals, description: `${goalText}${playerGoals > 0 ? 'Es una de sus principales amenazas' : 'Es uno de los jugadores de más calidad del equipo'} y destaca por ${strength}.` }
    })
}

export function getScoutedWeaknesses(players: RivalPlayer[], profile: RivalTeamProfile, limit = 3): ScoutedWeakness[] {
  const individual = players.filter((player) => player.teamId === profile.teamId)
    .map((player) => {
      const attributes: Array<[string, number, string]> = player.primaryPosition === 'POR'
        ? [['Juego con los pies', player.attributes.juegoPiesPortero, 'Puede sufrir si se le obliga a participar con los pies.']]
        : [['Velocidad', player.attributes.rapidez, 'Puede sufrir ante jugadores rápidos y cuando debe defender muchos metros.'], ['Juego aéreo', player.attributes.alcanceAereo, 'Puede conceder ventaja en balones aéreos y segundas jugadas.'], ['Fuerza', player.attributes.fuerza, 'Puede sufrir en duelos físicos y disputas cuerpo a cuerpo.']]
      const weakest = attributes.sort((a, b) => a[1] - b[1] || a[0].localeCompare(b[0]))[0]
      return { player, value: weakest[1], detail: weakest[2] }
    })
    .sort((a, b) => a.value - b.value || a.player.id - b.player.id)
    .filter(({ value }) => value <= 10)
    .slice(0, 1)
    .map(({ player, detail }) => ({ title: `${player.name} · ${player.primaryPosition}`, detail }))
  const collective = (profile.collectiveWeaknesses ?? []).map((detail) => ({ title: 'Debilidad colectiva', detail }))
  return [...individual, ...collective].slice(0, limit)
}

export function getOpponentStanding(standings: StandingRow[], teamId: string) {
  return standings.find((row) => row.teamId === teamId)
}

export function getTeamName(teams: LeagueTeam[], teamId: string) {
  return teams.find((team) => team.id === teamId)?.name
}
