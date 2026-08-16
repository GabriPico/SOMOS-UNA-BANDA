import type { ClubExpectationsState } from './inbox'
import type { StaffState } from './staff'

export type NarrativeCharacter = { id: string; name: string; role: string }
export type CoachEvidenceAxis = 'risk' | 'play' | 'closeness' | 'discipline' | 'rotation' | 'boldness'
export type CoachEvidence = { axis: CoachEvidenceAxis; value: number; source: string }
export type PromiseState = { id: string; subjectId?: string; description: string; status: 'active' | 'fulfilled' | 'broken' }
export type FavorState = { id: string; description: string; sourceCharacterId: string; status: 'open' | 'settled' }

export type GameState = {
  coachName: string
  coachAge: number | null
  president: NarrativeCharacter
  expectations: ClubExpectationsState
  staff: StaffState
  completedScenes: string[]
  coachEvidence: CoachEvidence[]
  promises: PromiseState[]
  favors: FavorState[]
}
