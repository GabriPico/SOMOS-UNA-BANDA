import type { GameState, OnboardingMilestone, TemporalCheckpoint } from './gameState'
import { findNextCheckpoint } from './gameTime'
import { getNextPendingResponse } from './messages'
import type { ScreenId } from './models'

export type NextPendingGameEvent =
  | { kind: 'ONBOARDING'; label: string; screen: ScreenId; milestone: OnboardingMilestone }
  | { kind: 'PLAN_TRAINING'; label: string; screen: 'training' }
  | { kind: 'INBOX_ATTENTION'; label: string; screen: 'inbox'; messageId: string }
  | { kind: 'SQUAD_SELECTION'; label: string; screen: 'next-match'; matchId: string }
  | { kind: 'TEMPORAL'; label: string; checkpoint?: TemporalCheckpoint }

const onboardingScreen: Partial<Record<GameState['onboarding']['active'], { screen: ScreenId; label: string }>> = {
  CLUB_PANEL_INTRO: { screen: 'club-panel', label: 'Conoce el Panel del club' }, CONTINUE_EXPLANATION: { screen: 'club-panel', label: 'CONTINUAR TUTORIAL' }, STAFF_HIGHLIGHT: { screen: 'club-panel', label: 'Entra en Staff' }, MESSAGES_HIGHLIGHT: { screen: 'club-panel', label: 'Lee el mensaje de Manolo' }, MANOLO_MESSAGE: { screen: 'inbox', label: 'Lee el mensaje de Manolo' },
  TEAM_HIGHLIGHT: { screen: 'club-panel', label: 'Entra en Equipo' }, TEAM_TUTORIAL: { screen: 'squad', label: 'Conoce la plantilla' }, TACTICS_HIGHLIGHT: { screen: 'club-panel', label: 'Entra en Táctica' }, TACTICS_TUTORIAL: { screen: 'tactics', label: 'Prepara la táctica' }, TRAINING_HIGHLIGHT: { screen: 'club-panel', label: 'Entra en Entrenamiento' }, TRAINING_TUTORIAL: { screen: 'training', label: 'Prepara los dos entrenamientos' }, LOCKER_ROOM_HIGHLIGHT: { screen: 'club-panel', label: 'CONTINUAR TUTORIAL' }, NEXT_MATCH_HIGHLIGHT: { screen: 'club-panel', label: 'CONTINUAR TUTORIAL' }, LEAGUE_HIGHLIGHT: { screen: 'club-panel', label: 'CONOCER A LA PLANTILLA' },
  CLUB_PANEL_TOUR: { screen: 'club-panel', label: 'Descubre el Panel del club' }, STAFF: { screen: 'club-panel', label: 'Ve a Staff desde el Panel' },
  TACTICS: { screen: 'club-panel', label: 'Ve a Táctica desde el Panel' }, SQUAD: { screen: 'club-panel', label: 'Ve a Equipo desde el Panel' },
  DRESSING_ROOM: { screen: 'club-panel', label: 'Conoce el Estado del vestuario' }, NEXT_MATCH: { screen: 'club-panel', label: 'Conoce el próximo partido' }, LEAGUE: { screen: 'club-panel', label: 'Conoce La Liga' }, INBOX: { screen: 'club-panel', label: 'Revisa el mensaje de Manolo' },
  TRAINING_PLANNING: { screen: 'training', label: 'Prepara los entrenamientos' }, FIRST_TRAINING_REPORT: { screen: 'inbox', label: 'Mensaje del staff' },
  FRIENDLY_CALL_UP: { screen: 'friendly-call-up', label: 'Preparar convocatoria del amistoso' }, TEAM_CHAT: { screen: 'inbox', label: 'Revisa el grupo del equipo en Mensajes' },
}

export function areWeeklySessionsPlanned(state: GameState) { return state.training.sessions.every((session) => session.planningStatus === 'PLANNED' || session.planningStatus === 'COMPLETED') }
export function shouldValidateTrainingPlanning(state: GameState) {
  return state.onboarding.active === 'TRAINING_PLANNING' || state.onboarding.completed.includes('TRAINING_PLANNING')
}

export function getNextPendingGameEvent(state: GameState): NextPendingGameEvent {
  if (state.onboarding.active === 'FIRST_TRAINING_READY' || state.onboarding.active === 'FIRST_TRAINING') return { kind: 'TEMPORAL', label: 'EMPEZAR ENTRENAMIENTO', checkpoint: state.temporal.activeCheckpoint ?? findNextCheckpoint(state, completedSessions(state)) }
  const onboarding = onboardingScreen[state.onboarding.active]
  if (onboarding) {
    if (state.onboarding.active === 'TRAINING_PLANNING' && areWeeklySessionsPlanned(state)) return { kind: 'TEMPORAL', label: 'Entrenamiento · martes 19:30', checkpoint: findNextCheckpoint(state, completedSessions(state)) }
    return { kind: 'ONBOARDING', ...onboarding, milestone: state.onboarding.active as OnboardingMilestone }
  }
  const attention = getNextPendingResponse(state.conversations)
  if (attention) return { kind: 'INBOX_ATTENTION', label: `${attention.conversation.participantName} · respuesta pendiente`, screen: 'inbox', messageId: attention.message.id }
  if (state.secondSessionPlanningDecision?.status === 'REVIEW_REQUIRED') return { kind: 'PLAN_TRAINING', label: 'Revisa y guarda la sesión del jueves', screen: 'training' }
  const checkpoint = state.temporal.activeCheckpoint ?? findNextCheckpoint(state, completedSessions(state))
  if (checkpoint?.type === 'PRE_MATCH') {
    const match = state.temporal.calendar.find((item) => item.id === checkpoint.relatedId)
    if (match?.competitionType !== 'FRIENDLY' && !state.squadSelections[match?.id ?? '']?.announced) return { kind: 'SQUAD_SELECTION', label: 'Anunciar convocatoria', screen: 'next-match', matchId: match!.id }
  }
  const nextSession = checkpoint?.type === 'TRAINING' ? state.training.sessions.find((session) => session.id === checkpoint.relatedId) : undefined
  if (nextSession && nextSession.planningStatus !== 'PLANNED' && nextSession.status !== 'completed') return { kind: 'PLAN_TRAINING', label: `${nextSession.day}: falta guardar la sesión`, screen: 'training' }
  return { kind: 'TEMPORAL', label: checkpoint?.label ?? 'No hay acontecimientos pendientes', checkpoint }
}
const completedSessions = (state: GameState) => state.training.sessions.filter((session) => session.status === 'completed').map((session) => session.id)
