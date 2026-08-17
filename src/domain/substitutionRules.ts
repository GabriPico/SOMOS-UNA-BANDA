import type { CompetitionType } from './models'

export type SubstitutionRules = { maxOwnStoppages: number | null; unlimitedPlayerChanges: true; reEntryAllowed: true; halfTimeFree: true; canPiggybackOpponentStoppage: boolean }
export const SUBSTITUTION_RULES: Record<CompetitionType, SubstitutionRules> = {
  LEAGUE: { maxOwnStoppages: 3, unlimitedPlayerChanges: true, reEntryAllowed: true, halfTimeFree: true, canPiggybackOpponentStoppage: true },
  FRIENDLY: { maxOwnStoppages: null, unlimitedPlayerChanges: true, reEntryAllowed: true, halfTimeFree: true, canPiggybackOpponentStoppage: false },
}
export const getSubstitutionRules = (competitionType: CompetitionType) => SUBSTITUTION_RULES[competitionType]
