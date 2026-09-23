import type { GameState } from './gameState'
import type { RivalPlayer } from './models'
import type { PrematchTalkSources } from './preMatchTalkContext'
import { validatePreMatchPreparation } from './preMatch'
import { createMatchState, startMatch } from './matchEngine'
import { getPrematchTalkEmotions } from './preMatchTalk'

/** The only UI kickoff boundary: no match state exists while the talk is running. */
export function startPreparedMatch(game: GameState, matchId: string, sources: PrematchTalkSources & { rivalPlayers: RivalPlayer[] }): GameState {
  const preparation = game.preMatchPreparations[matchId]
  const match = game.temporal.calendar.find((item) => item.id === matchId)
  if (!match || match.status !== 'scheduled' || game.activeMatch || game.temporal.activeCheckpoint?.type !== 'PRE_MATCH' || game.temporal.activeCheckpoint.relatedId !== matchId || !preparation?.talk?.completed || validatePreMatchPreparation(game, matchId, sources.players, sources.sanctions).length) return game
  const opponentId = match.homeTeamId === 'fc-poblenou' ? match.awayTeamId : match.homeTeamId
  const activeMatch = startMatch(createMatchState({
    match,
    homeName: (match.homeTeamId === 'fc-poblenou' ? preparation.talk.context.teamName : undefined) ?? sources.teams.find((team) => team.id === match.homeTeamId)?.name ?? match.homeTeamId,
    awayName: (match.awayTeamId === 'fc-poblenou' ? preparation.talk.context.teamName : undefined) ?? sources.teams.find((team) => team.id === match.awayTeamId)?.name ?? match.awayTeamId,
    clubPlayers: sources.players.filter((player) => game.squadSelections[matchId].playerIds.includes(player.id)),
    rivalPlayers: sources.rivalPlayers,
    lineupIds: preparation.lineupIds, plan: preparation.tacticalPlan, training: game.training,
    opponentFormation: sources.profiles.find((profile) => profile.teamId === opponentId)?.preferredFormation ?? '4-4-2',
    seed: game.temporal.seed + match.matchday * 1009, cohesion: game.team.cohesion,
    prematchEmotions: getPrematchTalkEmotions(preparation.talk),
  }))
  return { ...game, activeMatch }
}
