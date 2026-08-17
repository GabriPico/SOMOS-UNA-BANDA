import type { GameState } from './gameState'
import type { MatchState } from './matchTypes'
import type { TrainingGameState } from './trainingTypes'
import { PERSONALITY_MODIFIERS } from './trainingPersonality'
import type { Player, RivalPlayer } from './models'
import { startNextTrainingWeek } from './trainingEngine'
import { completeOnboardingMilestone } from './onboarding'
import { matchPerformancePresentation } from './tacticalPresentation'
import { hasValidMatchRating } from './playerPresentation'

const USER_TEAM_ID = 'fc-poblenou'
const clamp = (value: number) => Math.max(0, Math.min(100, value))
const hash = (value: string, seed: number) => [...value].reduce((result, character) => Math.imul(result ^ character.charCodeAt(0), 16777619) >>> 0, seed >>> 0)
export function applyPostMatch(currentGame: GameState, currentTraining: TrainingGameState, match: MatchState, players: Player[], rivalPlayers: RivalPlayer[]) {
  if (match.phase !== 'FINISHED' || match.committed) return { gameState: currentGame, trainingState: currentTraining, matchState: match }
  const gameState = structuredClone(currentGame); const trainingState = structuredClone(currentTraining); const matchState = structuredClone(match)
  const calendarMatch = gameState.temporal.calendar.find((item) => item.id === match.matchId)
  if (!calendarMatch || calendarMatch.status === 'played') return { gameState: currentGame, trainingState: currentTraining, matchState: { ...match, committed: true } }
  calendarMatch.status = 'played'; calendarMatch.homeGoals = match.score.home; calendarMatch.awayGoals = match.score.away
  const existing = new Set(gameState.goalEvents.map((event) => event.id)); match.goalEvents.filter((event) => !existing.has(event.id)).forEach((event) => gameState.goalEvents.push({ ...event }))
  const isFriendly = match.competitionType === 'FRIENDLY'
  gameState.temporal.calendar.filter((item) => !isFriendly && item.competitionType !== 'FRIENDLY' && item.matchday === calendarMatch.matchday && item.status === 'scheduled').forEach((item) => {
    item.homeGoals = hash(`${item.id}:home`, gameState.temporal.seed) % 4
    item.awayGoals = hash(`${item.id}:away`, gameState.temporal.seed) % 3
    item.status = 'played'
    const addGoals = (teamId: string, total: number, side: string) => {
      const scorers = rivalPlayers.filter((player) => player.teamId === teamId)
      for (let index = 0; index < total && scorers.length; index += 1) {
        const scorer = scorers[hash(`${item.id}:${side}:${index}`, gameState.temporal.seed) % scorers.length]
        gameState.goalEvents.push({ id: `${item.id}-${side}-${index + 1}`, matchId: item.id, teamId, scorerId: scorer.id, minute: 8 + hash(`${item.id}:minute:${side}:${index}`, gameState.temporal.seed) % 82, isPenalty: false })
      }
    }
    addGoals(item.homeTeamId, item.homeGoals, 'home'); addGoals(item.awayTeamId, item.awayGoals, 'away')
  })
  const clubSide = match.home.teamId === USER_TEAM_ID ? 'home' : 'away'; const club = match[clubSide]; const opponentGoals = match.score[clubSide === 'home' ? 'away' : 'home']; const clubGoals = match.score[clubSide]
  const resultDelta = (clubGoals > opponentGoals ? 4 : clubGoals < opponentGoals ? -3 : 1) * (isFriendly ? .35 : 1)
  Object.values(club.players).forEach((played) => {
    const player = trainingState.players[played.id]; if (!player) return
    player.fitness = clamp(played.condition); player.fatigue = clamp(played.fatigue)
    const personality = PERSONALITY_MODIFIERS[player.personality]; const started = played.minutesPlayed > 0 && !match.substitutions.some((sub) => sub.teamId === USER_TEAM_ID && sub.playerInId === played.id)
    const used = played.minutesPlayed > 0
    const playingDelta = started ? 2 : used ? 1 : -1 - Math.max(0, personality.playingTimeSensitivity) * .4
    player.happiness.playingTime = clamp(player.happiness.playingTime + playingDelta)
    player.happiness.results = clamp(player.happiness.results + resultDelta * (1 + personality.resultsSensitivity * .12))
    player.authorityWithCoach = clamp(player.authorityWithCoach + (clubGoals > opponentGoals ? .6 : clubGoals < opponentGoals ? -.35 : .1))
    const statistics = gameState.playerSeasonStats[played.id]
    if (statistics && hasValidMatchRating(played.minutesPlayed)) {
      statistics.ratings ??= []
      statistics.ratings.push({ matchId: match.matchId, rating: Number(matchPerformancePresentation(played.performance).score), minutesPlayed: played.minutesPlayed, started, competitionType: match.competitionType })
    }
    if (statistics && !isFriendly) {
      if (played.minutesPlayed > 0) { statistics.appearances += 1; statistics.starts = (statistics.starts ?? 0) + (started ? 1 : 0) }
      statistics.goals += match.goalEvents.filter((event) => event.teamId === USER_TEAM_ID && event.scorerId === played.id).length
      statistics.yellowCards += played.yellowCards
      if (played.redCard) statistics.redCards += 1
    }
    if (played.injured && !gameState.injuredPlayerIds.includes(played.id)) gameState.injuredPlayerIds.push(played.id)
  })
  gameState.dressingRoomCohesion = clamp(gameState.dressingRoomCohesion + (clubGoals > opponentGoals ? 1.2 : clubGoals < opponentGoals ? -.7 : .25))
  gameState.temporal.activeCheckpoint = undefined; gameState.activeMatch = undefined; matchState.committed = true
  const progressedGame = isFriendly ? completeOnboardingMilestone(gameState, 'FIRST_FRIENDLY') : gameState
  return { gameState: progressedGame, trainingState: startNextTrainingWeek(trainingState, players), matchState }
}
