import type { GameState } from '../domain/gameState'
import { initialClubExpectations } from './inboxData'
import { MANOLO_ESCUDERO } from './characters'
import { createInitialStaffState } from './staffData'

export function createNewGameState(seed: number): GameState {
  return {
    coachName: '', coachAge: null, president: MANOLO_ESCUDERO,
    expectations: { ...initialClubExpectations, expectations: initialClubExpectations.expectations.map((expectation) => ({ ...expectation })) },
    staff: createInitialStaffState(seed), completedScenes: [], coachEvidence: [], promises: [], favors: [],
  }
}
