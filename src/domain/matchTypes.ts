import type { Formation, GoalEvent, PlayerAttributes, PlayerPosition, TacticalPlan } from './models'

export type MatchPhase = 'PRE_MATCH' | 'FIRST_HALF' | 'HALF_TIME' | 'SECOND_HALF' | 'PAUSED_FOR_DECISION' | 'FINISHED'
export type MatchTeamSide = 'home' | 'away'
export type AttackRoute = 'LEFT_WING' | 'RIGHT_WING' | 'CENTRAL' | 'DIRECT_TARGET' | 'IN_BEHIND' | 'COUNTER' | 'SET_PIECE'
export type MatchEventKind = 'KICK_OFF' | 'CHANCE' | 'GOAL' | 'SAVE' | 'CORNER' | 'FOUL' | 'YELLOW' | 'RED' | 'INJURY' | 'TACTICAL' | 'SUBSTITUTION' | 'HALF_TIME' | 'FULL_TIME'
export type MatchMood = 'NEUTRAL' | 'CONFIDENT' | 'FRUSTRATED' | 'NERVOUS' | 'DISCONNECTED' | 'MOTIVATED'
export type MatchPlayerStats = { duelsWon: number; duelsLost: number; aerialDuelsWon: number; recoveries: number; losses: number; progressions: number; chancesCreated: number; shots: number; saves: number; errors: number; tacticalActions: number }

export type MatchPlayer = {
  id: number; canonicalScorerId?: number; teamId: string; name: string; position: PlayerPosition; naturalPositions: PlayerPosition[]; attributes: PlayerAttributes; baseMatchAttributes: PlayerAttributes
  personality: string; happiness: number; authority: number; condition: number; fatigue: number
  minutesPlayed: number; yellowCards: number; redCard: boolean; injured: boolean; onPitch: boolean
  performance: number; actions: number
  mood: MatchMood; matchStats: MatchPlayerStats
  fatigueNoticeLevel: number
}
export type MatchLineup = { formation: Formation; starters: number[]; bench: number[]; slots: PlayerPosition[] }
export type MatchTeamState = {
  teamId: string; name: string; lineup: MatchLineup; tactics: TacticalPlan; players: Record<number, MatchPlayer>
  familiarity: { formation: number; attack: number; transitionAttack: number; defense: number; transitionDefense: number; setPieces: number; formations: Record<string, number>; instructions: Record<string, Record<string, number>> }
  cohesion: number; routeSuccess: Partial<Record<AttackRoute, number>>; routeAttempts: Partial<Record<AttackRoute, number>>
}
export type MatchStatistics = { possessionTicks: number; shots: number; shotsOnTarget: number; corners: number; fouls: number; yellowCards: number; redCards: number }
export type MatchEvent = { id: string; minute: number; kind: MatchEventKind; text: string; importance?: 'HIGHLIGHT' | 'CONTEXT'; teamId?: string; playerId?: number; route?: AttackRoute }
export type GoalInterruption = { eventId: string; minute: number; scoringTeamId: string; scorerId: number; scoreBefore: { home: number; away: number }; scoreAfter: { home: number; away: number }; presentation: 'CELEBRATION' | 'DECISION' }
export type MatchSubstitution = { teamId: string; minute: number; playerOutId: number; playerInId: number }
export type SubstitutionWindow = { source: 'HOME' | 'AWAY' | 'HALF_TIME'; sourceTeamId?: string; minute: number; consumesOwnWindow: boolean }
export type AssistantMatchObservation = { minute: number; text: string; confidence: number; topic: string; severity: number }
export type MatchState = {
  matchId: string; competitionType: 'LEAGUE' | 'FRIENDLY'; seed: number; sequence: number; minute: number; clockSeconds: number; phase: MatchPhase
  home: MatchTeamState; away: MatchTeamState; score: { home: number; away: number }
  statistics: { home: MatchStatistics; away: MatchStatistics }; events: MatchEvent[]
  goalEvents: GoalEvent[]; substitutions: MatchSubstitution[]; observations: AssistantMatchObservation[]
  interventionRequested: boolean; pauseReason?: 'INTERVENTION' | 'INJURY' | 'RED_CARD' | 'RIVAL_SUBSTITUTION' | 'GOAL'; committed: boolean
  goalInterruption?: GoalInterruption; processedGoalEventIds?: string[]
  substitutionInterruptions: { home: number; away: number }; substitutionWindow?: SubstitutionWindow
  recentControl: MatchTeamSide[]
}

export type MatchAdvanceResult = { state: MatchState; stopped: boolean }
