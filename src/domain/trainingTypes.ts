import type { PlayerAttribute, PlayerAttributes, TacticalPlan, TrainingSession } from './models'

export type BetaPersonality = 'Profesional' | 'Trabajador / Currante' | 'Ambicioso' | 'Competitivo' | 'Fiestero' | 'Vago' | 'Veterano' | 'Líder' | 'Sociable' | 'Individualista' | 'Caliente' | 'Pasota'
export type AttributeTrainingState = { bonus: number; consolidation: number; consecutiveWeeks: number; trainedThisWeek: boolean; maintainedThisWeek: boolean; exposuresThisWeek: number }
export type HappinessComponents = { teammates: number; playingTime: number; training: number; results: number }
export type TrainingPlayerState = {
  playerId: number
  baseAttributes: PlayerAttributes
  attributes: Partial<Record<PlayerAttribute, AttributeTrainingState>>
  fitness: number
  fatigue: number
  happiness: HappinessComponents
  authorityWithCoach: number
  personality: BetaPersonality
}
export type FamiliarityMemory = { current: number; historicalMax: number; trainedThisWeek: boolean }
export type TacticalFamiliarityState = {
  instructions: Record<string, Record<string, FamiliarityMemory>>
  formations: Record<string, FamiliarityMemory>
  setPieces: FamiliarityMemory
  setPieceWeeksWithoutTraining: number
}
export type SessionResult = {
  quality: number
  qualityLabel: TrainingSession['qualityLabel']
  tacticalPlan: TacticalPlan
  attendees: number[]
  effects: string[]
  highlights: string[]
  injuryRisk: 'Bajo' | 'Moderado' | 'Alto'
}
export type FunctionalTrainingSession = TrainingSession & { absentPlayerIds: number[]; result?: SessionResult }
export type TrainingGameState = { week: number; seed: number; players: Record<number, TrainingPlayerState>; familiarity: TacticalFamiliarityState; sessions: FunctionalTrainingSession[]; weekClosed: boolean }
