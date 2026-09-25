import type { GoalEvent, LeagueMatch, Player, PlayerPosition, RivalPlayer } from './models'
import type { MatchState, MatchStatistics, MatchTeamState } from './matchTypes'

export type ReportIncident = { minute: number; kind: 'GOAL' | 'PENALTY' | 'YELLOW' | 'RED' | 'IN' | 'OUT' }
export type ReportPlayer = { id: number; name: string; shirtNumber?: number; position: PlayerPosition; started: boolean; minutes: number; incidents: ReportIncident[] }
export type ReportTeam = { teamId: string; players: ReportPlayer[]; formation?: string; coach?: string }
export type ReportGoal = { id: string; teamId: string; playerName: string; shirtNumber?: number; minute: number; isPenalty: boolean; homeGoals: number; awayGoals: number }
export type MatchReport = {
  matchId: string
  home: ReportTeam
  away: ReportTeam
  goals: ReportGoal[]
  substitutions: { teamId: string; minute: number; playerIn: string; playerOut: string }[]
  statistics?: { home: MatchStatistics; away: MatchStatistics }
  complete: boolean
}

function reportTeam(team: MatchTeamState, match: MatchState, coachName: string): ReportTeam {
  const initial = team.initialLineup
  return {
    teamId: team.teamId,
    formation: initial?.formation,
    coach: team.teamId === 'fc-poblenou' ? coachName || undefined : undefined,
    players: Object.values(team.players).map(player => {
      const firstChange = match.substitutions.find(sub => sub.teamId === team.teamId && (sub.playerInId === player.id || sub.playerOutId === player.id))
      // Old active matches have no kickoff snapshot; the first change still identifies starters, including reentries.
      const started = initial ? initial.starters.includes(player.id) : firstChange ? firstChange.playerOutId === player.id : team.lineup.starters.includes(player.id)
      const incidents: ReportIncident[] = match.events.flatMap(event => event.teamId === team.teamId && event.playerId === player.id && (event.kind === 'GOAL' || event.kind === 'YELLOW' || event.kind === 'RED') ? [{ minute: event.minute, kind: event.kind }] : [])
      for (const sub of match.substitutions.filter(sub => sub.teamId === team.teamId)) {
        if (sub.playerInId === player.id) incidents.push({ minute: sub.minute, kind: 'IN' })
        if (sub.playerOutId === player.id) incidents.push({ minute: sub.minute, kind: 'OUT' })
      }
      const slot = initial?.starters.indexOf(player.id) ?? -1
      return { id: player.id, name: player.name, shirtNumber: player.shirtNumber, position: slot >= 0 ? initial!.slots[slot] : player.naturalPositions[0], started, minutes: player.minutesPlayed, incidents: incidents.sort((a, b) => a.minute - b.minute) }
    }),
  }
}

/** A detached, serializable record of facts; no attributes or mutable training state. */
export function createMatchReport(match: MatchState, coachName = ''): MatchReport {
  let homeGoals = 0, awayGoals = 0
  const goalEvents = match.events.filter(event => event.kind === 'GOAL')
  const goals = goalEvents.map((event, index): ReportGoal => {
    const team = event.teamId === match.home.teamId ? match.home : match.away
    const player = event.playerId === undefined ? undefined : team.players[event.playerId]
    if (team.teamId === match.home.teamId) homeGoals += 1
    else awayGoals += 1
    return { id: event.id, teamId: team.teamId, playerName: player?.name ?? 'Autor no registrado', shirtNumber: player?.shirtNumber, minute: event.minute, isPenalty: match.goalEvents[index]?.isPenalty ?? false, homeGoals, awayGoals }
  })
  return {
    matchId: match.matchId, complete: true,
    home: reportTeam(match.home, match, coachName), away: reportTeam(match.away, match, coachName), goals,
    statistics: structuredClone(match.statistics),
    substitutions: match.substitutions.map(sub => {
      const team = sub.teamId === match.home.teamId ? match.home : match.away
      return { teamId: sub.teamId, minute: sub.minute, playerIn: team.players[sub.playerInId].name, playerOut: team.players[sub.playerOutId].name }
    }),
  }
}

/** Legacy and background results only contain goals. Never invent lineups, cards or referees. */
export function getMatchReport(match: LeagueMatch, archive: Record<string, MatchReport> | undefined, events: GoalEvent[], players: Player[], rivals: RivalPlayer[]): MatchReport {
  if (archive?.[match.id]) return archive[match.id]
  let homeGoals = 0, awayGoals = 0
  const names = new Map([...players, ...rivals].map(player => [player.id, player]))
  const goals = events.filter(event => event.matchId === match.id).sort((a, b) => a.minute - b.minute).map(event => {
    if (event.teamId === match.homeTeamId) homeGoals += 1
    else awayGoals += 1
    const player = names.get(event.scorerId)
    return { ...event, playerName: player?.name ?? 'Autor no registrado', shirtNumber: player && 'shirtNumber' in player ? player.shirtNumber : undefined, homeGoals, awayGoals }
  })
  return { matchId: match.id, home: { teamId: match.homeTeamId, players: [] }, away: { teamId: match.awayTeamId, players: [] }, goals, substitutions: [], complete: false }
}
