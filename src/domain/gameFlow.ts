import type { GameState, OnboardingMilestone, TemporalCheckpoint } from './gameState'
import { findNextCheckpoint } from './gameTime'
import { getNextMessageRequiringAttention } from './inbox'
import type { ScreenId } from './models'

export type NextPendingGameEvent =
  | { kind: 'ONBOARDING'; label: string; screen: ScreenId; milestone: OnboardingMilestone }
  | { kind: 'PLAN_TRAINING'; label: string; screen: 'training' }
  | { kind: 'INBOX_ATTENTION'; label: string; screen: 'inbox'; messageId: string }
  | { kind: 'SQUAD_SELECTION'; label: string; screen: 'next-match'; matchId: string }
  | { kind: 'TEMPORAL'; label: string; checkpoint?: TemporalCheckpoint }

const onboardingScreen: Partial<Record<GameState['onboarding']['active'], { screen: ScreenId; label: string }>> = {
  STAFF: { screen: 'staff', label: 'Conoce al Staff' },
  TACTICS: { screen: 'tactics', label: 'Prepara la táctica' },
  SQUAD: { screen: 'squad', label: 'Conoce la plantilla' },
  DRESSING_ROOM: { screen: 'dressing-room', label: 'Estado del vestuario' },
  INBOX: { screen: 'inbox', label: 'Revisa el Buzón' },
  TRAINING_PLANNING: { screen: 'training', label: 'Prepara las dos sesiones' },
  FIRST_TRAINING_REPORT: { screen: 'inbox', label: 'Informe del entrenamiento' },
}

export function areWeeklySessionsPlanned(state: GameState) {
  return state.training.sessions.every((session) => session.planningStatus === 'PLANNED' || session.planningStatus === 'COMPLETED')
}

export function getNextPendingGameEvent(state: GameState): NextPendingGameEvent {
  const onboarding = onboardingScreen[state.onboarding.active]
  if (onboarding) {
    if (state.onboarding.active === 'TRAINING_PLANNING' && areWeeklySessionsPlanned(state)) {
      return { kind: 'TEMPORAL', label: 'Entrenamiento · martes 19:30', checkpoint: findNextCheckpoint(state, completedSessions(state)) }
    }
    return { kind: 'ONBOARDING', ...onboarding, milestone: state.onboarding.active as OnboardingMilestone }
  }
  const attention = getNextMessageRequiringAttention(state.inboxMessages)
  if (attention) return { kind: 'INBOX_ATTENTION', label: `${attention.senderName} · ${attention.subject}`, screen: 'inbox', messageId: attention.id }
  const checkpoint = state.temporal.activeCheckpoint ?? findNextCheckpoint(state, completedSessions(state))
  if (checkpoint?.type === 'PRE_MATCH') {
    const match = state.temporal.calendar.find((item) => item.id === checkpoint.relatedId)
    if (match?.competitionType !== 'FRIENDLY' && !state.squadSelections[match?.id ?? '']?.announced) return { kind: 'SQUAD_SELECTION', label: 'Anunciar convocatoria', screen: 'next-match', matchId: match!.id }
  }
  const nextSession = checkpoint?.type === 'TRAINING' ? state.training.sessions.find((session) => session.id === checkpoint.relatedId) : undefined
  if (nextSession && nextSession.planningStatus === 'UNPLANNED') return { kind: 'PLAN_TRAINING', label: `${nextSession.day}: falta preparar la sesión`, screen: 'training' }
  return { kind: 'TEMPORAL', label: checkpoint?.label ?? 'No hay acontecimientos pendientes', checkpoint }
}

const completedSessions = (state: GameState) => state.training.sessions.filter((session) => session.status === 'completed').map((session) => session.id)
