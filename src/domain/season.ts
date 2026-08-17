export type SeasonObjective = { type: 'PROMOTION'; targetDivision: '3a Catalana' }
export type BetaGameOutcome = 'GAME_WON' | 'GAME_LOST'

export const BETA_SEASON_OBJECTIVE: SeasonObjective = { type: 'PROMOTION', targetDivision: '3a Catalana' }

export function resolveBetaGameOutcome(promotedToThirdCatalana: boolean): BetaGameOutcome {
  return promotedToThirdCatalana ? 'GAME_WON' : 'GAME_LOST'
}

export const didTeamWinBeta = (promotedToThirdCatalana: boolean) => resolveBetaGameOutcome(promotedToThirdCatalana) === 'GAME_WON'
