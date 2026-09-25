import type { ClubExpectationsState } from './inbox'
import type { AssistantArchetype, StaffState } from './staff'
import type { SportsBudget } from './economy'
import type { SeasonObjective } from './season'
import type { ClubFinances } from './playerFinance'
import type { PhysiotherapyContact, PlayerPhysiotherapyPlan } from './medicalServices'
import type { StaffSearchRequest } from './staff'
import type { GoalEvent, LeagueMatch } from './models'
import type { MatchState } from './matchTypes'
import type { MatchReport } from './matchReport'
import type { MessageConversation } from './messages'
import type { ClubCall } from './clubPhone'
import type { InboxMessage } from './inbox'
import type { TrainingGameState } from './trainingTypes'
import type { MatchSquadSelection, PlayerMatchSelectionRecord } from './squadSelection'
import type { TacticalPlan } from './models'
import type { ConsequenceState } from './consequences'
import type { PrematchTalkState } from './preMatchTalkTypes'
import type { NarrativeRuntime } from './narrative'

export type PreMatchTalkId = 'CALM' | 'INTENSE' | 'CONFIDENT' | 'DEMANDING'
export type PreMatchPreparation = {
  matchId: string
  lineupIds: number[]
  tacticalPlan: TacticalPlan
  /** @deprecated Compatibility only: a legacy card never completes the cinematic. */
  talkId?: PreMatchTalkId
  talk?: PrematchTalkState
  completed: boolean
}

export type SecondSessionPlanningDecision = {
  week: number
  firstSessionId: string
  targetSessionId: string
  messageId: string
  status: 'PENDING' | 'KEPT' | 'REVIEW_REQUIRED' | 'REVIEWED'
}

export type TimePhase = 'MORNING' | 'AFTERNOON' | 'EVENING'
export type TemporalEvent = { id: string; at: string; type: 'STAFF_SEARCH_RESULT' | 'FEE_DUE' | 'CONTEXTUAL'; priority: number; requiresDecision: boolean; sourceCharacterId?: string; relatedId?: string; status: 'SCHEDULED' | 'PENDING' | 'RESOLVED' }
export type PendingConversation = { id: string; sceneId: 'MANOLO_STAFF_SEARCH_RESULT'; sourceCharacterId: string; relatedId?: string; createdAt: string }
export type TemporalCheckpoint = { type: 'TRAINING' | 'CONVERSATION' | 'EVENT' | 'PRE_MATCH'; at: string; label: string; relatedId?: string; availableStaffIds?: string[]; staffAbsenceNotes?: string[] }
export type TemporalState = { startedAt: string; currentDateTime: string; phase: TimePhase; seed: number; calendar: LeagueMatch[]; events: TemporalEvent[]; pendingConversations: PendingConversation[]; activeCheckpoint?: TemporalCheckpoint; processedFeeMonths: string[] }

export type NarrativeCharacter = { id: string; name: string; role: string }
export type CoachEvidenceAxis = 'risk' | 'play' | 'closeness' | 'discipline' | 'rotation' | 'boldness'
export type CoachEvidence = { axis: CoachEvidenceAxis; value: number; source: string }
export type PromiseState = { id: string; subjectId?: string; description: string; status: 'active' | 'fulfilled' | 'broken'; kind?: 'LOWER_TRAINING_LOAD' | 'MORE_BALL'; resolvedAt?: string }
export type NarrativeFact = { id: string; occurredAt: string; subjectId?: string; relatedEventId?: string }
export type TeamChatReaction = { emoji: string; count: number }
export type TeamChatMessage = { id: string; senderId?: string; senderType: 'COACH' | 'PLAYER' | 'SYSTEM'; senderName: string; timestamp: string; type: 'TEXT' | 'CALL_UP' | 'NOTICE'; content: string; reactions: TeamChatReaction[]; relatedEventId?: string }
export type TeamChatState = { unlocked: boolean; messages: TeamChatMessage[] }
export type FavorState = { id: string; description: string; sourceCharacterId: string; status: 'open' | 'settled' }
export type PlayerMatchRating = { matchId: string; rating: number; minutesPlayed: number; started: boolean; competitionType: 'FRIENDLY' | 'LEAGUE' }
export type PlayerSeasonStats = { appearances: number; starts?: number; goals: number; yellowCards: number; redCards: number; ratings?: PlayerMatchRating[] }
export type OnboardingMilestone = 'INTRO' | 'SECOND_COACH_INTRO' | 'CLUB_PANEL_INTRO' | 'CONTINUE_EXPLANATION' | 'STAFF_HIGHLIGHT' | 'STAFF_TUTORIAL' | 'MESSAGES_HIGHLIGHT' | 'MANOLO_MESSAGE' | 'TEAM_HIGHLIGHT' | 'TEAM_TUTORIAL' | 'TACTICS_HIGHLIGHT' | 'TACTICS_TUTORIAL' | 'TRAINING_HIGHLIGHT' | 'TRAINING_TUTORIAL' | 'LOCKER_ROOM_HIGHLIGHT' | 'NEXT_MATCH_HIGHLIGHT' | 'LEAGUE_HIGHLIGHT' | 'MEET_SQUAD' | 'FIRST_TRAINING_TALK' | 'FIRST_TRAINING_READY' | 'CLUB_PANEL_TOUR' | 'STAFF' | 'INBOX' | 'SQUAD' | 'TACTICS' | 'TRAINING_PLANNING' | 'DRESSING_ROOM' | 'NEXT_MATCH' | 'LEAGUE' | 'FIRST_TRAINING' | 'FIRST_TRAINING_REPORT' | 'SECOND_TRAINING' | 'FRIENDLY_CALL_UP' | 'TEAM_CHAT' | 'FIRST_FRIENDLY'
export type OnboardingState = {
  completed: OnboardingMilestone[]
  active: Exclude<OnboardingMilestone, 'INTRO'> | 'FREE_PRESEASON' | 'COMPLETE'
  clubPanelTourCompleted: boolean
  clubPanelTourStep: number
  trainingTutorialCompleted: boolean
  trainingTutorialStep: number
}

export type GameState = {
  temporal: TemporalState
  coachName: string
  president: NarrativeCharacter
  presidentRelationship: { relationshipWithManager: number; satisfaction: number }
  assistantArchetype: AssistantArchetype
  seasonObjective: SeasonObjective
  expectations: ClubExpectationsState
  conversations: MessageConversation[]
  calls?: ClubCall[]
  selectedConversationId?: string
  secondSessionPlanningDecision?: SecondSessionPlanningDecision
  /** @deprecated Solo se conserva para cargar estados antiguos; la UI usa conversations. */
  inboxMessages?: InboxMessage[]
  training: TrainingGameState
  sportsBudget: SportsBudget
  clubFinances: ClubFinances
  staff: StaffState
  staffSearchRequests: StaffSearchRequest[]
  physiotherapyContacts: PhysiotherapyContact[]
  physiotherapyPlans: PlayerPhysiotherapyPlan[]
  completedScenes: string[]
  narrativeRuntimes?: Record<string, NarrativeRuntime>
  coachEvidence: CoachEvidence[]
  promises: PromiseState[]
  narrativeFacts: NarrativeFact[]
  teamChat: TeamChatState
  favors: FavorState[]
  goalEvents: GoalEvent[]
  activeMatch?: MatchState
  matchReports?: Record<string, MatchReport>
  playerSeasonStats: Record<number, PlayerSeasonStats>
  manager: { generalAuthority: number }
  team: { cohesion: number; recentResultsMood: number }
  consequences: ConsequenceState
  /** @deprecated Se migra a team.cohesion al hidratar partidas antiguas. */
  dressingRoomCohesion?: number
  injuredPlayerIds: number[]
  squadSelections: Record<string, MatchSquadSelection>
  squadSelectionHistory: PlayerMatchSelectionRecord[]
  preMatchPreparations: Record<string, PreMatchPreparation>
  tacticalPlan: TacticalPlan
  lineupIds: number[]
  onboarding: OnboardingState
}
