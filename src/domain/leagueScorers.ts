import type { GoalEvent, LeagueMatch, Player, RivalPlayer, TopScorerRow } from './models'

const USER_TEAM_ID = 'fc-poblenou'

export function calculateTopScorers(
  events: GoalEvent[],
  matches: LeagueMatch[],
  clubPlayers: Player[],
  rivalPlayers: RivalPlayer[],
  throughMatchday: number,
): TopScorerRow[] {
  const eligibleMatchIds = new Set(matches.filter((match) => match.competitionType !== 'FRIENDLY' && match.status === 'played' && match.matchday <= throughMatchday).map((match) => match.id))
  const playersById = new Map<number, { name: string; teamId: string }>()
  clubPlayers.forEach((player) => playersById.set(player.id, { name: player.name, teamId: USER_TEAM_ID }))
  rivalPlayers.forEach((player) => playersById.set(player.id, { name: player.name, teamId: player.teamId }))
  const totals = new Map<number, { goals: number; penalties: number }>()

  events.filter((event) => eligibleMatchIds.has(event.matchId)).forEach((event) => {
    const total = totals.get(event.scorerId) ?? { goals: 0, penalties: 0 }
    total.goals += 1
    if (event.isPenalty) total.penalties += 1
    totals.set(event.scorerId, total)
  })

  return [...totals.entries()].map(([playerId, total]) => {
    const player = playersById.get(playerId)
    if (!player) throw new Error(`Goleador desconocido: ${playerId}`)
    return { position: 0, playerId, playerName: player.name, teamId: player.teamId, goals: total.goals, penaltyGoals: total.penalties }
  }).sort((a, b) => b.goals - a.goals || a.playerName.localeCompare(b.playerName) || a.playerId - b.playerId)
    .map((row, index) => ({ ...row, position: index + 1 }))
}

export function validateGoalEvents(matches: LeagueMatch[], events: GoalEvent[], clubPlayers: Player[], rivalPlayers: RivalPlayer[]): string[] {
  const playerTeams = new Map<number, string>()
  clubPlayers.forEach((player) => playerTeams.set(player.id, USER_TEAM_ID))
  rivalPlayers.forEach((player) => playerTeams.set(player.id, player.teamId))
  const errors: string[] = []

  matches.filter((match) => match.status === 'played').forEach((match) => {
    const matchEvents = events.filter((event) => event.matchId === match.id)
    const homeGoals = matchEvents.filter((event) => event.teamId === match.homeTeamId).length
    const awayGoals = matchEvents.filter((event) => event.teamId === match.awayTeamId).length
    if (homeGoals !== match.homeGoals || awayGoals !== match.awayGoals) errors.push(`Marcador incoherente en ${match.id}`)
    matchEvents.forEach((event) => {
      if (event.teamId !== match.homeTeamId && event.teamId !== match.awayTeamId) errors.push(`Equipo ajeno al partido en ${event.id}`)
      if (playerTeams.get(event.scorerId) !== event.teamId) errors.push(`Goleador ajeno al equipo en ${event.id}`)
    })
  })
  return errors
}
