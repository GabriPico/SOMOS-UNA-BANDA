import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from 'react'
import type { GameState } from '../domain/gameState'
import { respondFromPhone, type PhoneSection } from '../domain/clubPhone'
import { countUnreadMessages, getUnreadCount, markConversationRead } from '../domain/messages'

type PhoneView = { isPhoneOpen: boolean; activePhoneSection: PhoneSection; focusedMessageId?: string }
const closedView: PhoneView = { isPhoneOpen: false, activePhoneSection: 'ALL' }

export function useClubPhone(gameState: GameState, setGameState: Dispatch<SetStateAction<GameState>>, suspended: boolean) {
  const [view, setView] = useState<PhoneView>(closedView)
  const selectedConversationId = gameState.selectedConversationId
  const selected = gameState.conversations.find(item => item.id === selectedConversationId)
  const unread = selected ? getUnreadCount(selected) : 0

  const open = useCallback((conversationId?: string, messageId?: string) => {
    if (conversationId) setGameState(current => ({ ...current, selectedConversationId: conversationId }))
    setView(current => ({ ...current, isPhoneOpen: true, ...(conversationId ? { activePhoneSection: 'ALL', focusedMessageId: messageId } : {}) }))
  }, [setGameState])
  const minimize = useCallback(() => setView(current => ({ ...current, isPhoneOpen: false })), [])
  const selectConversation = useCallback((id?: string) => {
    setGameState(current => ({ ...current, selectedConversationId: id }))
    setView(current => ({ ...current, focusedMessageId: undefined }))
  }, [setGameState])
  const selectSection = useCallback((section: PhoneSection) => {
    setGameState(current => ({ ...current, selectedConversationId: undefined }))
    setView(current => ({ ...current, activePhoneSection: section, focusedMessageId: undefined }))
  }, [setGameState])
  const reset = useCallback((isPhoneOpen = false, messageId?: string) => setView({ ...closedView, isPhoneOpen, focusedMessageId: messageId }), [])
  const respond = useCallback((messageId: string, optionId: string) => setGameState(current => respondFromPhone(current, messageId, optionId)), [setGameState])

  // Arrival in the open, visible chat is read; arrival while minimized remains unread.
  useEffect(() => {
    if (view.isPhoneOpen && !suspended && selectedConversationId && unread) {
      setGameState(current => ({ ...current, conversations: markConversationRead(current.conversations, selectedConversationId) }))
    }
  }, [view.isPhoneOpen, suspended, selectedConversationId, unread, setGameState])

  return { ...view, selectedConversationId, unreadCount: countUnreadMessages(gameState.conversations), open, minimize, selectConversation, selectSection, reset, respond }
}
