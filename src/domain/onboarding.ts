import type { GameState, OnboardingMilestone } from './gameState'

export type OnboardingDestination =
  | { kind: 'SCENE'; id: 'STAFF' | 'TACTICS' | 'SQUAD' }
  | { kind: 'SCREEN'; id: 'staff' | 'tactics' | 'squad' | 'dressing-room' | 'inbox' | 'training' | 'next-match' }
  | { kind: 'TIME' }

const addCompleted = (state: GameState, milestone: OnboardingMilestone): GameState => state.onboarding.completed.includes(milestone)
  ? state
  : { ...state, onboarding: { ...state.onboarding, completed: [...state.onboarding.completed, milestone] } }

export function completeOnboardingMilestone(state: GameState, milestone: OnboardingMilestone): GameState {
  const completed = addCompleted(state, milestone)
  const active = ({ INTRO: 'STAFF', STAFF: 'TACTICS', TACTICS: 'SQUAD', SQUAD: 'DRESSING_ROOM', DRESSING_ROOM: 'INBOX', INBOX: 'TRAINING_PLANNING', TRAINING_PLANNING: 'FIRST_TRAINING', FIRST_TRAINING: 'FIRST_TRAINING_REPORT', FIRST_TRAINING_REPORT: 'SECOND_TRAINING', SECOND_TRAINING: 'FIRST_FRIENDLY', FIRST_FRIENDLY: 'FREE_PRESEASON' } as const)[milestone]
  return active ? { ...completed, onboarding: { ...completed.onboarding, active } } : completed
}

export function getOnboardingDestination(state: GameState): OnboardingDestination {
  switch (state.onboarding.active) {
    case 'STAFF': return state.completedScenes.includes('onboarding-staff') ? { kind: 'SCREEN', id: 'staff' } : { kind: 'SCENE', id: 'STAFF' }
    case 'TACTICS': return state.completedScenes.includes('onboarding-tactics') ? { kind: 'SCREEN', id: 'tactics' } : { kind: 'SCENE', id: 'TACTICS' }
    case 'SQUAD': return state.completedScenes.includes('onboarding-squad') ? { kind: 'SCREEN', id: 'squad' } : { kind: 'SCENE', id: 'SQUAD' }
    case 'DRESSING_ROOM': return { kind: 'SCREEN', id: 'dressing-room' }
    case 'INBOX':
    case 'FIRST_TRAINING_REPORT': return { kind: 'SCREEN', id: 'inbox' }
    case 'TRAINING_PLANNING': return { kind: 'SCREEN', id: 'training' }
    case 'FIRST_TRAINING': return { kind: 'TIME' }
    case 'SECOND_TRAINING': return { kind: 'SCREEN', id: 'training' }
    case 'FIRST_FRIENDLY': return state.temporal.activeCheckpoint?.type === 'PRE_MATCH' ? { kind: 'SCREEN', id: 'next-match' } : { kind: 'TIME' }
    default: return { kind: 'TIME' }
  }
}

export const isGuidedTraining = (state: GameState) => state.onboarding.active === 'TRAINING_PLANNING' || state.onboarding.active === 'FIRST_TRAINING'
export const isPreseason = (state: GameState) => !state.onboarding.completed.includes('FIRST_FRIENDLY') || state.temporal.calendar.some((match) => match.competitionType === 'LEAGUE' && match.status === 'scheduled' && match.matchday === 1 && match.date > state.temporal.currentDateTime.slice(0, 10))
