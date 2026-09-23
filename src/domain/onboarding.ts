import type { GameState, OnboardingMilestone, OnboardingState } from './gameState'
import type { ScreenId } from './models'

export type OnboardingDestination =
  | { kind: 'SCENE'; id: 'SECOND_COACH_INTRO' | 'STAFF_TUTORIAL' | 'MEET_SQUAD' | 'FIRST_TRAINING_TALK' }
  | { kind: 'SCREEN'; id: 'club-panel' | 'staff' | 'tactics' | 'squad' | 'dressing-room' | 'inbox' | 'training' | 'next-match' | 'friendly-call-up' }
  | { kind: 'TIME' }

export function normalizeOnboardingState(onboarding: Partial<OnboardingState>): OnboardingState {
  const completed = onboarding.completed ?? []
  const onboardingCompleted = onboarding.active === 'COMPLETE' || onboarding.active === 'FREE_PRESEASON' || completed.includes('FIRST_FRIENDLY')
  const oldGamePastIntro = completed.includes('INTRO') && onboarding.active !== 'CLUB_PANEL_TOUR'
  return {
    completed,
    active: onboardingCompleted ? 'COMPLETE' : onboarding.active ?? 'CLUB_PANEL_INTRO',
    clubPanelTourCompleted: onboardingCompleted || (onboarding.clubPanelTourCompleted ?? oldGamePastIntro),
    clubPanelTourStep: onboarding.clubPanelTourStep ?? 0,
    trainingTutorialCompleted: onboardingCompleted || (onboarding.trainingTutorialCompleted ?? completed.includes('TRAINING_PLANNING')),
    trainingTutorialStep: onboarding.trainingTutorialStep ?? 0,
  }
}

const addCompleted = (state: GameState, milestone: OnboardingMilestone): GameState => state.onboarding.completed.includes(milestone)
  ? state
  : { ...state, onboarding: { ...state.onboarding, completed: [...state.onboarding.completed, milestone] } }

export function completeOnboardingMilestone(state: GameState, milestone: OnboardingMilestone): GameState {
  const completed = addCompleted(state, milestone)
  const active = milestone === 'TRAINING_PLANNING' && !state.onboarding.completed.includes('SECOND_COACH_INTRO')
    ? 'FIRST_TRAINING_TALK'
    : milestone === 'FIRST_TRAINING_TALK' && !state.onboarding.completed.includes('SECOND_COACH_INTRO')
      ? 'FIRST_TRAINING'
    : ({ INTRO: 'SECOND_COACH_INTRO', SECOND_COACH_INTRO: 'CLUB_PANEL_INTRO', CLUB_PANEL_INTRO: 'CONTINUE_EXPLANATION', CONTINUE_EXPLANATION: 'STAFF_HIGHLIGHT', STAFF_HIGHLIGHT: 'STAFF_TUTORIAL', STAFF_TUTORIAL: 'MESSAGES_HIGHLIGHT', MESSAGES_HIGHLIGHT: 'MANOLO_MESSAGE', MANOLO_MESSAGE: 'TEAM_HIGHLIGHT', TEAM_HIGHLIGHT: 'TEAM_TUTORIAL', TEAM_TUTORIAL: 'TACTICS_HIGHLIGHT', TACTICS_HIGHLIGHT: 'TACTICS_TUTORIAL', TACTICS_TUTORIAL: 'TRAINING_HIGHLIGHT', TRAINING_HIGHLIGHT: 'TRAINING_TUTORIAL', TRAINING_TUTORIAL: 'LOCKER_ROOM_HIGHLIGHT', LOCKER_ROOM_HIGHLIGHT: 'NEXT_MATCH_HIGHLIGHT', NEXT_MATCH_HIGHLIGHT: 'LEAGUE_HIGHLIGHT', LEAGUE_HIGHLIGHT: 'MEET_SQUAD', MEET_SQUAD: 'FIRST_TRAINING_TALK', FIRST_TRAINING_TALK: 'FIRST_TRAINING_READY', FIRST_TRAINING_READY: 'FIRST_TRAINING', CLUB_PANEL_TOUR: 'STAFF', STAFF: 'INBOX', INBOX: 'SQUAD', SQUAD: 'TACTICS', TACTICS: 'TRAINING_PLANNING', TRAINING_PLANNING: 'DRESSING_ROOM', DRESSING_ROOM: 'NEXT_MATCH', NEXT_MATCH: 'LEAGUE', LEAGUE: 'MEET_SQUAD', FIRST_TRAINING: 'FIRST_TRAINING_REPORT', FIRST_TRAINING_REPORT: 'SECOND_TRAINING', SECOND_TRAINING: 'FRIENDLY_CALL_UP', FRIENDLY_CALL_UP: 'TEAM_CHAT', TEAM_CHAT: 'FIRST_FRIENDLY', FIRST_FRIENDLY: 'FREE_PRESEASON' } as const)[milestone]
  const terminalActive = milestone === 'FIRST_FRIENDLY' ? 'COMPLETE' : active
  return terminalActive ? { ...completed, onboarding: { ...completed.onboarding, active: terminalActive, ...(milestone === 'CLUB_PANEL_TOUR' ? { clubPanelTourCompleted: true } : {}) } } : completed
}

export function setClubPanelTourStep(state: GameState, step: number): GameState {
  return { ...state, onboarding: { ...state.onboarding, clubPanelTourStep: Math.max(0, Math.floor(step)) } }
}

const REQUIRED_NAVIGATION_SCREEN: Partial<Record<OnboardingState['active'], ScreenId>> = {
  STAFF_TUTORIAL: 'staff', MANOLO_MESSAGE: 'inbox', TEAM_TUTORIAL: 'squad', TACTICS_TUTORIAL: 'tactics',
  TRAINING_TUTORIAL: 'training', STAFF: 'staff', INBOX: 'inbox', SQUAD: 'squad', TACTICS: 'tactics',
  TRAINING_PLANNING: 'training',
}

export const isOnboardingCompleted = (onboarding: OnboardingState) =>
  onboarding.active === 'COMPLETE' || onboarding.active === 'FREE_PRESEASON' || onboarding.completed.includes('FIRST_FRIENDLY')

// Narrative/temporal milestones continue after the guided tutorial has ended.
// Also recognize older saves and DEV checkpoints without a complete history.
export const isGuidedTutorialCompleted = (onboarding: OnboardingState) =>
  isOnboardingCompleted(onboarding)
  || onboarding.completed.includes('FIRST_TRAINING')
  || ['FIRST_TRAINING_REPORT', 'SECOND_TRAINING', 'FRIENDLY_CALL_UP', 'TEAM_CHAT', 'FIRST_FRIENDLY'].includes(onboarding.active)

export const getTutorialNavigationLock = (onboarding: OnboardingState): ScreenId | undefined =>
  isGuidedTutorialCompleted(onboarding) ? undefined : REQUIRED_NAVIGATION_SCREEN[onboarding.active]

export const canNavigateDuringTutorial = (onboarding: OnboardingState, screen: ScreenId) => {
  const requiredScreen = getTutorialNavigationLock(onboarding)
  return requiredScreen === undefined || requiredScreen === screen
}

export function setTrainingTutorialStep(state: GameState, step: number): GameState {
  return { ...state, onboarding: { ...state.onboarding, trainingTutorialStep: Math.max(0, Math.floor(step)) } }
}

export function completeTrainingTutorial(state: GameState): GameState {
  return { ...state, onboarding: { ...state.onboarding, trainingTutorialCompleted: true } }
}

export function getOnboardingDestination(state: GameState): OnboardingDestination {
  switch (state.onboarding.active) {
    case 'SECOND_COACH_INTRO': return { kind: 'SCENE', id: 'SECOND_COACH_INTRO' }
    case 'STAFF_TUTORIAL': return { kind: 'SCENE', id: 'STAFF_TUTORIAL' }
    case 'CLUB_PANEL_INTRO':
    case 'CONTINUE_EXPLANATION':
    case 'STAFF_HIGHLIGHT':
    case 'MESSAGES_HIGHLIGHT': return { kind: 'SCREEN', id: 'club-panel' }
    case 'MANOLO_MESSAGE': return { kind: 'SCREEN', id: 'inbox' }
    case 'TEAM_HIGHLIGHT':
    case 'TACTICS_HIGHLIGHT':
    case 'TRAINING_HIGHLIGHT':
    case 'LOCKER_ROOM_HIGHLIGHT':
    case 'NEXT_MATCH_HIGHLIGHT':
    case 'LEAGUE_HIGHLIGHT': return { kind: 'SCREEN', id: 'club-panel' }
    case 'TEAM_TUTORIAL': return { kind: 'SCREEN', id: 'squad' }
    case 'TACTICS_TUTORIAL': return { kind: 'SCREEN', id: 'tactics' }
    case 'TRAINING_TUTORIAL': return { kind: 'SCREEN', id: 'training' }
    case 'CLUB_PANEL_TOUR': return { kind: 'SCREEN', id: 'club-panel' }
    case 'STAFF': return { kind: 'SCREEN', id: 'club-panel' }
    case 'TACTICS': return { kind: 'SCREEN', id: 'club-panel' }
    case 'SQUAD': return { kind: 'SCREEN', id: 'club-panel' }
    case 'DRESSING_ROOM':
    case 'NEXT_MATCH':
    case 'LEAGUE': return { kind: 'SCREEN', id: 'club-panel' }
    case 'MEET_SQUAD': return { kind: 'SCENE', id: 'MEET_SQUAD' }
    case 'INBOX':
    case 'FIRST_TRAINING_REPORT': return { kind: 'SCREEN', id: 'inbox' }
    case 'TRAINING_PLANNING': return { kind: 'SCREEN', id: 'training' }
    case 'FIRST_TRAINING_TALK': return { kind: 'SCENE', id: 'FIRST_TRAINING_TALK' }
    case 'FIRST_TRAINING_READY':
    case 'FIRST_TRAINING': return { kind: 'TIME' }
    case 'SECOND_TRAINING': return { kind: 'TIME' }
    case 'FRIENDLY_CALL_UP': return { kind: 'SCREEN', id: 'friendly-call-up' }
    case 'TEAM_CHAT': return { kind: 'SCREEN', id: 'inbox' }
    case 'FIRST_FRIENDLY': return state.temporal.activeCheckpoint?.type === 'PRE_MATCH' ? { kind: 'SCREEN', id: 'next-match' } : { kind: 'TIME' }
    default: return { kind: 'TIME' }
  }
}

export const isGuidedTraining = (state: GameState) => state.onboarding.active === 'TRAINING_TUTORIAL' || state.onboarding.active === 'TRAINING_PLANNING' || state.onboarding.active === 'FIRST_TRAINING_READY' || state.onboarding.active === 'FIRST_TRAINING'
export const isPreseason = (state: GameState) => !state.onboarding.completed.includes('FIRST_FRIENDLY') || state.temporal.calendar.some((match) => match.competitionType === 'LEAGUE' && match.status === 'scheduled' && match.matchday === 1 && match.date > state.temporal.currentDateTime.slice(0, 10))
