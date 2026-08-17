import type { ClubExpectationsState } from './inbox'
import type { StaffState } from './staff'
import type { SportsBudget } from './economy'
import type { SeasonObjective } from './season'
import type { ClubFinances } from './playerFinance'
import type { PhysiotherapyContact, PlayerPhysiotherapyPlan } from './medicalServices'
import type { StaffSearchRequest } from './staff'
import type { GoalEvent, LeagueMatch } from './models'
import type { MatchState } from './matchTypes'
import type { InboxMessage } from './inbox'
import type { TrainingGameState } from './trainingTypes'
import type { MatchSquadSelection, PlayerMatchSelectionRecord } from './squadSelection'

export type TimePhase = 'MORNING' | 'AFTERNOON' | 'EVENING'
export type TemporalEvent = { id: string; at: string; type: 'STAFF_SEARCH_RESULT' | 'FEE_DUE' | 'CONTEXTUAL'; priority: number; requiresDecision: boolean; sourceCharacterId?: string; relatedId?: string; status: 'SCHEDULED' | 'PENDING' | 'RESOLVED' }
export type PendingConversation = { id: string; sceneId: 'MANOLO_STAFF_SEARCH_RESULT'; sourceCharacterId: string; relatedId?: string; createdAt: string }
export type TemporalCheckpoint = { type: 'TRAINING' | 'CONVERSATION' | 'EVENT' | 'PRE_MATCH'; at: string; label: string; relatedId?: string; availableStaffIds?: string[]; staffAbsenceNotes?: string[] }
export type TemporalState = { startedAt: string; currentDateTime: string; phase: TimePhase; seed: number; calendar: LeagueMatch[]; events: TemporalEvent[]; pendingConversations: PendingConversation[]; activeCheckpoint?: TemporalCheckpoint; processedFeeMonths: string[] }

export type NarrativeCharacter = { id: string; name: string; role: string }
export type CoachEvidenceAxis = 'risk' | 'play' | 'closeness' | 'discipline' | 'rotation' | 'boldness'
export type CoachEvidence = { axis: CoachEvidenceAxis; value: number; source: string }
export type PromiseState = { id: string; subjectId?: string; description: string; status: 'active' | 'fulfilled' | 'broken' }
export type FavorState = { id: string; description: string; sourceCharacterId: string; status: 'open' | 'settled' }
export type PlayerMatchRating = { matchId: string; rating: number; minutesPlayed: number; started: boolean; competitionType: 'FRIENDLY' | 'LEAGUE' }
export type PlayerSeasonStats = { appearances: number; starts?: number; goals: number; yellowCards: number; redCards: number; ratings?: PlayerMatchRating[] }
export type OnboardingMilestone = 'INTRO' | 'STAFF' | 'TACTICS' | 'SQUAD' | 'DRESSING_ROOM' | 'INBOX' | 'TRAINING_PLANNING' | 'FIRST_TRAINING' | 'FIRST_TRAINING_REPORT' | 'SECOND_TRAINING' | 'FIRST_FRIENDLY'
export type OnboardingState = { completed: OnboardingMilestone[]; active: Exclude<OnboardingMilestone, 'INTRO'> | 'FREE_PRESEASON' | 'COMPLETE' }

export type GameState = {
  temporal: TemporalState
  coachName: string
  president: NarrativeCharacter
  seasonObjective: SeasonObjective
  expectations: ClubExpectationsState
  inboxMessages: InboxMessage[]
  training: TrainingGameState
  sportsBudget: SportsBudget
  clubFinances: ClubFinances
  staff: StaffState
  staffSearchRequests: StaffSearchRequest[]
  physiotherapyContacts: PhysiotherapyContact[]
  physiotherapyPlans: PlayerPhysiotherapyPlan[]
  completedScenes: string[]
  coachEvidence: CoachEvidence[]
  promises: PromiseState[]
  favors: FavorState[]
  goalEvents: GoalEvent[]
  activeMatch?: MatchState
  playerSeasonStats: Record<number, PlayerSeasonStats>
  dressingRoomCohesion: number
  injuredPlayerIds: number[]
  squadSelections: Record<string, MatchSquadSelection>
  squadSelectionHistory: PlayerMatchSelectionRecord[]
  onboarding: OnboardingState
}
