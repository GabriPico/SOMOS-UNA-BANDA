import type { PlayerAttribute, PlayerAttributes, TacticalPlan, TrainingSession } from './models'

export type BetaPersonality = 'Profesional' | 'Trabajador / Currante' | 'Ambicioso' | 'Competitivo' | 'Fiestero' | 'Vago' | 'Veterano' | 'Líder' | 'Sociable' | 'Individualista' | 'Caliente' | 'Pasota'
export type PhysicalIssueType = 'MUSCLE_DISCOMFORT' | 'POOR_SLEEP' | 'HANGOVER' | 'SORENESS' | 'MINOR_KNOCK' | 'MILD_ILLNESS'
export type CurrentPhysicalIssue = { type: PhysicalIssueType; remainingDays: number; startedAt: string }
export type AttributeTrainingState = { bonus: number; consolidation: number; consecutiveWeeks: number; trainedThisWeek: boolean; maintainedThisWeek: boolean; exposuresThisWeek: number }
export type HappinessComponents = { teammates: number; playingTime: number; training: number; results: number }
export type TrainingPlayerState = {
  playerId: number
  baseAttributes: PlayerAttributes
  attributes: Partial<Record<PlayerAttribute, AttributeTrainingState>>
  fitness: number
  fatigue: number
  happiness: HappinessComponents
  managerRelationship: number
  managerAuthority: number
  lockerRoomInfluence: 'LOW' | 'MEDIUM' | 'HIGH' | 'LEADER'
  /** @deprecated Se migra a managerAuthority al hidratar partidas antiguas. */
  authorityWithCoach?: number
  personality: BetaPersonality
  currentIssue?: CurrentPhysicalIssue
}
export type FamiliarityMemory = { current: number; historicalMax: number; trainedThisWeek: boolean }
export type TacticalFamiliarityState = {
  instructions: Record<string, Record<string, FamiliarityMemory>>
  formations: Record<string, FamiliarityMemory>
  setPieces: FamiliarityMemory
  setPieceWeeksWithoutTraining: number
}
export type TrainingPlanningStatus = 'UNPLANNED' | 'DIRTY' | 'PLANNED' | 'COMPLETED'
export type TrainingSessionEvent =
  | { type: 'PLAYER_ABSENCE'; playerId: number; planned: boolean; warned: boolean; reason?: string }
  | { type: 'PLAYER_LATE'; playerId: number; minutes: number }
  | { type: 'PLAYER_DISCOMFORT'; playerId: number; area: string }
  | { type: 'PLAYER_INJURY'; playerId: number; severity: 'MINOR' | 'SERIOUS' }
  | { type: 'PLAYER_PERFORMANCE'; playerId: number; level: 'GOOD' | 'POOR' }
  | { type: 'STAFF_EVENT'; staffId: string; note: string }
export type TrainingAppliedEffects = { teamFitnessDelta: number; teamFatigueDelta: number; teamHappinessDelta: number; teamAuthorityDelta: number; tacticalFamiliarityDelta: number; individualPlayerIds: number[] }
export type TrainingSessionPlan = { id: string; date?: string; sessionNumber: number; status: TrainingPlanningStatus; intensity: TrainingSession['intensity']; blocks: TrainingSession['blocks']; tacticalPlan?: TacticalPlan; expectedPlayerIds: number[]; expectedStaffIds: string[] }
export type SessionResult = {
  quality: number
  qualityLabel: TrainingSession['qualityLabel']
  tacticalPlan: TacticalPlan
  attendees: number[]
  effects: string[]
  highlights: string[]
  injuryRisk: 'Bajo' | 'Moderado' | 'Alto'
  absentPlayerIds?: number[]
  presentStaffIds?: string[]
  events?: TrainingSessionEvent[]
  appliedEffects?: TrainingAppliedEffects
  summary?: string
}
export type TrainingSessionState = { plan: TrainingSessionPlan; result: SessionResult | null }
export type FunctionalTrainingSession = TrainingSession & { planningStatus?: TrainingPlanningStatus; plannedTacticalPlan?: TacticalPlan; plannedAbsentPlayerIds?: number[]; plannedAbsenceReasons?: Record<number, string>; plannedStaffIds?: string[]; absentPlayerIds: number[]; availableStaffIds?: string[]; staffAbsenceNotes?: string[]; result?: SessionResult }
export type TrainingGameState = { week: number; seed: number; players: Record<number, TrainingPlayerState>; familiarity: TacticalFamiliarityState; sessions: FunctionalTrainingSession[]; weekClosed: boolean }
