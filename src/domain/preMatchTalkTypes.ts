import type { GameState } from './gameState'
import type { Formation, LeagueMatch, MatchOutcome, RivalTeamProfile, StandingRow, TacticalPlan, TrainingBlock } from './models'
import type { AssistantProfile } from './staff'
import type { BetaPersonality } from './trainingTypes'

export type TalkDuration = 'SHORT' | 'MEDIUM' | 'LONG'
export type TalkIntent = 'SIMPLIFY' | 'TRUST' | 'DEMAND' | 'FOCUS' | 'PROVOKE' | 'CALM'
export type TalkEmotion = 'motivation' | 'confidence' | 'concentration' | 'nerves' | 'tension' | 'involvement'
export type TalkEmotions = Record<TalkEmotion, number>
export type TalkBeat = { id: string; duration: TalkDuration; speaker?: 'COACH' | 'ASSISTANT' | 'OBSERVATION'; intent?: TalkIntent; mentions?: string[]; delivery?: 'CLEAR' | 'RAMBLING' | 'CONNECTED' }
export type TalkSituation = 'FIRST_FRIENDLY' | 'FRIENDLY' | 'LEAGUE_DEBUT' | 'LEAGUE' | 'DIRECT_RIVAL' | 'DERBY' | 'GOOD_RUN' | 'BAD_RUN' | 'REACTION' | 'STRONG_RIVAL' | 'WEAK_RIVAL' | 'PRESIDENT' | 'PROMOTION' | 'PLAYOFF_RACE' | 'DECISIVE' | 'PLAYOFF_SEMIFINAL' | 'PLAYOFF_FINAL' | 'INCIDENT'
export type TalkInstruction = Exclude<keyof TacticalPlan, 'formation' | 'timeWasting' | 'aggression'>
export type TalkTrainingConnection = { block: TrainingBlock; days: string[]; instruction?: TalkInstruction; familiarity: number; changed: boolean; habitualValue?: string }
export type TalkParticipant = { id: number; name: string; personality: BetaPersonality; authority: number; happiness: number; relationship: number; confidence: number }

/** A frozen pre-kickoff snapshot, never a second editable source for tactics or human state. */
export type PrematchTalkContext = {
  version?: 2 | 3
  teamName?: string
  huddleLeader?: { id: number; name: string }
  matchId: string
  seed: number
  match: LeagueMatch
  situations: TalkSituation[]
  primarySituation: TalkSituation
  importance: number
  playedMatches: number
  recentResults: MatchOutcome[]
  standings: StandingRow[]
  objective: GameState['seasonObjective']
  expectation?: string
  incidentId?: string
  rival: { id: string; name: string; knowledge: 'LIMITED' | 'OBSERVED'; facts: Array<{ id: string; text: string }>; response?: RivalTeamProfile['scouting']['response']; previousMeetings?: number; analysisReason?: 'IMPORTANT' | 'PREVIOUS_MEETING' | 'PREPARED' | 'PERSONAL_KNOWLEDGE' }
  assistant?: { id: string; name: string; profile?: AssistantProfile; voice: 'ANALYTICAL' | 'PRAGMATIC' | 'DIRECT' | 'CAUTIOUS'; reliability: number; planDelivery?: TalkBeat['delivery'] }
  coachId: string
  plan: TacticalPlan
  previousPlan?: TacticalPlan
  habitualFormation?: Formation
  formationUse: 'FIRST' | 'NEW' | 'LITTLE_USED' | 'RECENT' | 'HABITUAL'
  formationFamiliarity: number
  formationTrainingDays: string[]
  tacticalConnections: TalkTrainingConnection[]
  physicalLoadRelevant: boolean
  authority: number
  cohesion: number
  participants: TalkParticipant[]
}
export type PrematchTalkState = { context: PrematchTalkContext; beats: TalkBeat[]; completed: boolean }
