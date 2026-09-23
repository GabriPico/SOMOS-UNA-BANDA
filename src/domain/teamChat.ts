import type { GameState, TeamChatMessage } from './gameState'

/** @deprecated Compatibilidad con partidas y pruebas anteriores a la unificación en conversations. */
export function appendTeamChatMessage(current: GameState, message: TeamChatMessage) {
  if (current.teamChat.messages.some((item) => item.id === message.id)) return current
  return { ...current, teamChat: { unlocked: true, messages: [...current.teamChat.messages, message] } }
}
