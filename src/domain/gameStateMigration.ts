import type { GameState } from './gameState'
import { clampHumanState, createInitialConsequenceState } from './consequences'

type LegacyGameState = GameState & {
  manager?: GameState['manager']
  team?: GameState['team']
  consequences?: GameState['consequences']
  dressingRoomCohesion?: number
}

export function hydrateGameState(input: LegacyGameState): GameState {
  const game = structuredClone(input)
  game.manager = { generalAuthority: clampHumanState(game.manager?.generalAuthority ?? 60) }
  game.team = {
    cohesion: clampHumanState(game.team?.cohesion ?? game.dressingRoomCohesion ?? 58),
    recentResultsMood: clampHumanState(game.team?.recentResultsMood ?? 50),
  }
  game.consequences = {
    ...createInitialConsequenceState(),
    ...game.consequences,
    memories: game.consequences?.memories ?? [],
    flags: game.consequences?.flags ?? {},
    decisionLog: game.consequences?.decisionLog ?? [],
    feedbackQueue: game.consequences?.feedbackQueue ?? [],
  }
  for (const player of Object.values(game.training.players)) {
    player.managerAuthority = clampHumanState(player.managerAuthority ?? player.authorityWithCoach ?? 60)
    player.managerRelationship = clampHumanState(player.managerRelationship ?? 55)
    player.lockerRoomInfluence = player.lockerRoomInfluence ?? 'MEDIUM'
    delete player.authorityWithCoach
  }
  delete game.dressingRoomCohesion
  return game
}
