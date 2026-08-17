import type { GoalInterruption } from './matchTypes'

export function getGoalInterruptionContext(interruption: GoalInterruption, homeTeamId: string, userTeamId: string) {
  const userSide = homeTeamId === userTeamId ? 'home' : 'away'
  const rivalSide = userSide === 'home' ? 'away' : 'home'
  const beforeUser = interruption.scoreBefore[userSide]
  const beforeRival = interruption.scoreBefore[rivalSide]
  const afterUser = interruption.scoreAfter[userSide]
  const afterRival = interruption.scoreAfter[rivalSide]
  const userScored = interruption.scoringTeamId === userTeamId
  if (userScored) {
    if (afterUser === afterRival) return 'Empatáis el partido.'
    if (beforeUser === beforeRival && afterUser > afterRival) return 'Os ponéis por delante.'
    if (afterUser < afterRival) return 'Recortáis distancias.'
    return 'Ampliáis la ventaja.'
  }
  if (afterUser === afterRival) return 'Os empatan.'
  if (beforeUser === beforeRival && afterRival > afterUser) return 'El rival se pone por delante.'
  if (afterUser > afterRival) return 'El rival recorta distancias.'
  return 'El rival amplía la ventaja.'
}
