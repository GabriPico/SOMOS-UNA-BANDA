import type { GameState } from './gameState'
import { chooseMessageResponse, getNextPendingResponse, getUnreadCount, messageNeedsResponse } from './messages'

export type PhoneSection = 'ALL' | 'UNREAD' | 'CALLS'
export type ClubCall = {
  id: string
  participantId: string
  participantName: string
  participantType: 'PRESIDENT' | 'STAFF' | 'GROUP' | 'CLUB' | 'PLAYER'
  timestamp: string
  direction: 'INCOMING' | 'OUTGOING'
  status: 'COMPLETED' | 'MISSED'
  medium: 'VOICE' | 'VIDEO'
  durationSeconds?: number
  source?: 'EXAMPLE' | 'GAME'
}

const phoneGuides: Partial<Record<GameState['onboarding']['active'], string>> = {
  INBOX: 'Manolo pide revisar la plantilla, preparar una táctica y dejar listas las dos sesiones. Vale, vamos a ello.',
  MANOLO_MESSAGE: 'Manolo pide revisar la plantilla, preparar una táctica y dejar listas las dos sesiones. Vale, vamos a ello.',
  FIRST_TRAINING_REPORT: 'El entrenamiento ya ha terminado. Aquí encontrarás la interpretación del Staff y cualquier seguimiento posterior.',
  TEAM_CHAT: 'La convocatoria ya está en el historial del grupo. Desde aquí seguirán llegando las comunicaciones del equipo.',
}

/** A phone destination is independent of the screen behind it. */
export function getPhoneAttentionTarget(state: GameState) {
  const milestone = state.onboarding.active
  const pending = getNextPendingResponse(state.conversations)
  const conversation = ['INBOX', 'MANOLO_MESSAGE', 'MESSAGES_HIGHLIGHT'].includes(milestone)
    ? state.conversations.find(item => item.participantId === state.president.id)
    : milestone === 'TEAM_CHAT'
      ? state.conversations.find(item => item.participantId === 'team-group')
      : milestone === 'FIRST_TRAINING_REPORT'
        ? state.conversations.find(item => item.messages.some(message => message.id === state.secondSessionPlanningDecision?.messageId))
          ?? state.conversations.filter(item => item.participantType === 'STAFF').sort((a, b) => (b.messages.at(-1)?.timestamp ?? '').localeCompare(a.messages.at(-1)?.timestamp ?? ''))[0]
        : pending?.conversation
  return {
    conversationId: conversation?.id,
    messageId: conversation?.messages.find(message => message.id === pending?.message.id)?.id
      ?? conversation?.messages.find(message => !message.read)?.id ?? conversation?.messages.at(-1)?.id,
  }
}

export function getPhoneGuide(state: GameState) {
  const text = phoneGuides[state.onboarding.active]
  if (!text) return undefined
  const target = getPhoneAttentionTarget(state)
  const conversation = state.conversations.find(item => item.id === target.conversationId)
  return { text, conversationId: target.conversationId, canContinue: Boolean(conversation && getUnreadCount(conversation) === 0) }
}

/** Preserve the existing training decision, applying a response at most once. */
export function respondFromPhone(state: GameState, messageId: string, optionId: string): GameState {
  const conversationId = state.selectedConversationId
  const message = state.conversations.find(item => item.id === conversationId)?.messages.find(item => item.id === messageId)
  if (!conversationId || !message || !messageNeedsResponse(message) || !message.responseOptions?.some(option => option.id === optionId)) return state
  return { ...state,
    conversations: chooseMessageResponse(state.conversations, conversationId, messageId, optionId, state.coachName, state.temporal.currentDateTime),
    secondSessionPlanningDecision: state.secondSessionPlanningDecision?.messageId === messageId
      ? { ...state.secondSessionPlanningDecision, status: optionId === 'REVIEW_SECOND_SESSION' ? 'REVIEW_REQUIRED' : 'KEPT' }
      : state.secondSessionPlanningDecision,
  }
}
