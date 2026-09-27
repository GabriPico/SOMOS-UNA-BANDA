import type { GameState } from '../domain/gameState'
import { leagueTeams, players } from '../data/mockData'
import { calculateStandings, getStandingsAroundTeam } from '../domain/leagueStandings'
import { countPendingResponses, countUnreadConversations } from '../domain/messages'
import { getNextMatch, getTeamName } from '../domain/nextMatch'
import { getTeamAuthority, getTeamHappiness } from '../domain/trainingEngine'
import { getAuthorityLabel, getCohesionLabel, getHappinessLabel, getDressingRoomSummary } from '../domain/humanState'
import { getPlayerHappiness } from '../domain/trainingEngine'
import { getPlayerStatus } from './playerPresentation'
import { fixtureDate } from '../domain/competitionPresentation'

export function getClubPanelPresentation(game: GameState, matchday: number) {
  const match = getNextMatch(game.temporal.calendar, 'fc-poblenou')
  const standings = calculateStandings(leagueTeams, game.temporal.calendar, matchday)
  const happiness = getTeamHappiness(game.training)
  const authority = getTeamAuthority(game.training)
  const unhappy = Object.values(game.training.players).filter(player => getPlayerHappiness(player) < 58).length
  const responses = countPendingResponses(game.conversations)
  const review = game.secondSessionPlanningDecision?.status === 'REVIEW_REQUIRED'
  const trainingPending = new Set(game.training.sessions.filter(session => session.status !== 'completed' && session.planningStatus !== 'PLANNED').map(session => session.id))
  if (review && game.secondSessionPlanningDecision) trainingPending.add(game.secondSessionPlanningDecision.targetSessionId)
  const callUpPending = Boolean(match && match.competitionType !== 'FRIENDLY' && !game.squadSelections[match.id]?.announced)
  return {
    match,
    home: match ? (getTeamName(leagueTeams, match.homeTeamId) ?? match.homeTeamId) : '',
    away: match ? (getTeamName(leagueTeams, match.awayTeamId) ?? match.awayTeamId) : '',
    fixtureTime: match ? fixtureDate(match.date) + ' · ' + match.time : 'Sin partido programado',
    standings: getStandingsAroundTeam(standings, 'fc-poblenou', 5).map(row => ({ ...row, name: getTeamName(leagueTeams, row.teamId) })),
    standing: standings.find(row => row.teamId === 'fc-poblenou'),
    players: players.slice(0, 3).map(player => ({ player, status: getPlayerStatus(player, game.training.players[player.id], { injured: game.injuredPlayerIds.includes(player.id) }) })),
    playerCount: players.length,
    states: [
      { label: 'Cohesión', value: getCohesionLabel(game.team.cohesion), level: game.team.cohesion },
      { label: 'Felicidad', value: getHappinessLabel(happiness), level: happiness },
      { label: 'Autoridad', value: getAuthorityLabel(authority), level: authority },
    ],
    roomSummary: getDressingRoomSummary(game.team.cohesion, game.team.recentResultsMood, authority, unhappy),
    unread: countUnreadConversations(game.conversations),
    responses, review, callUpPending, pending: responses + trainingPending.size + Number(callUpPending),
  }
}
