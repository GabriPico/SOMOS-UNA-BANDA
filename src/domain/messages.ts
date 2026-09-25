export type ConversationType = 'DIRECT' | 'GROUP'
export type ConversationParticipantType = 'PRESIDENT' | 'STAFF' | 'PLAYER' | 'GROUP' | 'CLUB'
export type MessageSenderType = 'COACH' | 'PRESIDENT' | 'STAFF' | 'PLAYER' | 'CLUB' | 'COMPETITION' | 'SYSTEM'
export type MessageResponseOption = { id: string; label: string; coachText?: string; replyText?: string }
export type CallUpMessageContent = {
  competition: string
  fixture: string
  date: string
  venue: string
  matchTime: string
  meetingTime?: string
  playerNames: string[]
  additionalText?: string
  encouragement?: string
}

export type ConversationMessage = {
  id: string
  senderType: MessageSenderType
  senderId?: string | number
  senderName: string
  timestamp: string
  order?: number
  text: string
  type?: 'TEXT' | 'CALL_UP'
  callUp?: CallUpMessageContent
  read: boolean
  responseOptions?: MessageResponseOption[]
  chosenResponse?: { optionId: string; label: string; chosenAt: string }
  relatedEventId?: string
  reactions?: { emoji: string; count: number }[]
}

export type MessageConversation = {
  id: string
  participantId: string
  participantName: string
  participantType: ConversationParticipantType
  type: ConversationType
  messages: ConversationMessage[]
}

export type LegacyInboxMessage = {
  id: string
  senderType: 'president' | 'staff' | 'player' | 'club' | 'competition'
  senderId?: string | number
  senderName: string
  subject: string
  body: string
  status: 'new' | 'read' | 'requires-response' | 'resolved'
  createdAt: string
  responseOptions?: MessageResponseOption[]
}

const LEGACY_ID_BY_NAME: Record<string, string> = { 'Manolo Escudero': 'manolo-escudero', 'Toni Casals': 'staff-toni', Sito: 'sito', 'Grupo del equipo': 'team-group' }
const canonicalParticipantId = (id: string | number | undefined, name: string) => {
  const raw = String(id ?? LEGACY_ID_BY_NAME[name] ?? `legacy-${name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-')}`)
  if (raw === 'manolo' || raw === 'contact-manolo' || raw === 'contact-manolo-escudero') return 'manolo-escudero'
  if (raw === 'group-team') return 'team-group'
  return raw
}
export const conversationIdForParticipant = (participantId: string) => `conversation-${participantId}`

export type NewClubMessage = {
  id: string
  conversationId: string
  /** Required only when creating a new conversation. */
  participant?: Omit<MessageConversation, 'id' | 'messages'>
  sender: { type: MessageSenderType; id?: string | number; name: string }
  body: string
  timestamp: string
  responseOptions?: MessageResponseOption[]
  relatedEventId?: string
}

/** Shared entry point for game systems; stable event IDs make delivery idempotent. */
export function addMessage(conversations: MessageConversation[], input: NewClubMessage): MessageConversation[] {
  const participant = conversations.find(item => item.id === input.conversationId) ?? input.participant
  if (!participant || conversationIdForParticipant(participant.participantId) !== input.conversationId) {
    throw new Error(`Unknown or mismatched conversation: ${input.conversationId}`)
  }
  return appendConversationMessages(conversations, participant, [{
    id: input.id, senderType: input.sender.type, senderId: input.sender.id,
    senderName: input.sender.name, text: input.body, timestamp: input.timestamp,
    read: input.sender.type === 'COACH', responseOptions: input.responseOptions,
    relatedEventId: input.relatedEventId,
  }])
}
const compareMessages = (a: ConversationMessage, b: ConversationMessage) => a.timestamp.localeCompare(b.timestamp) || (a.order ?? 0) - (b.order ?? 0) || a.id.localeCompare(b.id)
const participantTypeFromLegacy = (type: LegacyInboxMessage['senderType']): ConversationParticipantType => type === 'president' ? 'PRESIDENT' : type === 'staff' ? 'STAFF' : type === 'player' ? 'PLAYER' : 'CLUB'

export function migrateLegacyInbox(messages: LegacyInboxMessage[]): MessageConversation[] {
  return messages.reduce<MessageConversation[]>((conversations, legacy) => {
    const participantId = canonicalParticipantId(legacy.senderId, legacy.senderName)
    const id = conversationIdForParticipant(participantId)
    let conversation = conversations.find((item) => item.participantId === participantId)
    if (!conversation) {
      conversation = { id, participantId, participantName: legacy.senderName, participantType: participantTypeFromLegacy(legacy.senderType), type: 'DIRECT', messages: [] }
      conversations.push(conversation)
    }
    conversation.messages.push({
      id: legacy.id,
      senderType: legacy.senderType.toUpperCase() as MessageSenderType,
      senderId: participantId,
      senderName: legacy.senderName,
      timestamp: legacy.createdAt,
      text: legacy.body,
      read: legacy.status === 'read' || legacy.status === 'resolved',
      responseOptions: legacy.responseOptions,
      chosenResponse: legacy.status === 'resolved' && legacy.responseOptions
        ? { optionId: 'legacy-resolved', label: 'Respuesta registrada', chosenAt: legacy.createdAt }
        : undefined,
      relatedEventId: legacy.subject,
      order: conversation.messages.length + 1,
    })
    return conversations
  }, [])
}

export function normalizeConversations(conversations: MessageConversation[]): MessageConversation[] {
  return conversations.reduce<MessageConversation[]>((normalized, source) => {
    const participantId = canonicalParticipantId(source.participantId, source.participantName)
    const existing = normalized.find((item) => item.participantId === participantId)
    const messages = source.messages.map((message, index) => ({ ...message, order: message.order ?? index + 1, senderId: message.senderType === 'COACH' ? message.senderId : canonicalParticipantId(message.senderId, message.senderName) }))
    if (existing) existing.messages = [...existing.messages, ...messages.filter((message) => !existing.messages.some((item) => item.id === message.id))].sort(compareMessages)
    else normalized.push({ ...source, id: conversationIdForParticipant(participantId), participantId, participantType: source.participantType ?? (source.type === 'GROUP' ? 'GROUP' : 'CLUB'), messages })
    return normalized
  }, [])
}

export function restoreConversations(state: { conversations?: MessageConversation[]; inboxMessages?: LegacyInboxMessage[]; teamChat?: { messages?: { id:string; senderId?:string; senderType:'COACH'|'PLAYER'|'SYSTEM'; senderName:string; timestamp:string; type:'TEXT'|'CALL_UP'|'NOTICE'; content:string; reactions?:{emoji:string;count:number}[]; relatedEventId?:string }[] } }) {
  const conversations = state.conversations?.length ? normalizeConversations(state.conversations) : migrateLegacyInbox(state.inboxMessages ?? [])
  const legacyGroupMessages: ConversationMessage[] = (state.teamChat?.messages ?? []).map((message) => ({ id:message.id,senderId:message.senderId,senderType:message.senderType,senderName:message.senderName,timestamp:message.timestamp,type:message.type==='CALL_UP'?'CALL_UP':'TEXT',text:message.content,read:true,reactions:message.reactions,relatedEventId:message.relatedEventId }))
  return appendConversationMessages(conversations, { participantId:'team-group',participantName:'Grupo del equipo',participantType:'GROUP',type:'GROUP' }, legacyGroupMessages)
}

export const getUnreadCount = (conversation: MessageConversation) => conversation.messages.filter((message) => !message.read).length
export const countUnreadMessages = (conversations: MessageConversation[]) => conversations.reduce((sum, conversation) => sum + getUnreadCount(conversation), 0)
export const countUnreadConversations = (conversations: MessageConversation[]) => conversations.filter((conversation) => getUnreadCount(conversation) > 0).length
export const messageNeedsResponse = (message: ConversationMessage) => Boolean(message.responseOptions?.length && !message.chosenResponse)
export const conversationNeedsResponse = (conversation: MessageConversation) => conversation.messages.some(messageNeedsResponse)
export const countPendingResponses = (conversations: MessageConversation[]) => conversations.filter(conversationNeedsResponse).length
export const getNextPendingResponse = (conversations: MessageConversation[]) => conversations.flatMap((conversation) => conversation.messages.map((message) => ({ conversation, message }))).find(({ message }) => messageNeedsResponse(message))

export function getOrCreateConversation(current: MessageConversation[], participant: Omit<MessageConversation, 'id' | 'messages'>) {
  const normalized = normalizeConversations(current)
  const existing = normalized.find((item) => item.participantId === participant.participantId)
  return existing ? { conversations: normalized, conversation: existing } : { conversations: [...normalized, { ...participant, id: conversationIdForParticipant(participant.participantId), messages: [] }], conversation: { ...participant, id: conversationIdForParticipant(participant.participantId), messages: [] } }
}

export function appendConversationMessages(current: MessageConversation[], participant: Omit<MessageConversation, 'id' | 'messages'>, additions: ConversationMessage[]) {
  const known = new Set(current.flatMap((item) => item.messages.map((message) => message.id)))
  const unique = additions.filter((message) => !known.has(message.id))
  if (!unique.length) return current
  const prepared = getOrCreateConversation(current, participant).conversations
  return prepared.map((item) => {
    if (item.participantId !== participant.participantId) return item
    let lastTimestamp = item.messages.slice().sort(compareMessages).at(-1)?.timestamp ?? ''
    let nextOrder = Math.max(0, ...item.messages.map((message) => message.order ?? 0)) + 1
    const ordered = unique.map((message) => {
      const timestamp = lastTimestamp && message.timestamp < lastTimestamp ? lastTimestamp : message.timestamp
      lastTimestamp = timestamp
      return { ...message, timestamp, order: message.order ?? nextOrder++ }
    })
    return { ...item, messages: [...item.messages, ...ordered].sort(compareMessages) }
  })
}

export const sortConversationsByLatest = (conversations: MessageConversation[]) => [...conversations].sort((a, b) => (b.messages.at(-1)?.timestamp ?? '').localeCompare(a.messages.at(-1)?.timestamp ?? ''))

export function markConversationRead(conversations: MessageConversation[], conversationId: string) {
  return conversations.map((conversation) => conversation.id === conversationId
    ? { ...conversation, messages: conversation.messages.map((message) => ({ ...message, read: true })) }
    : conversation)
}

export function chooseMessageResponse(conversations: MessageConversation[], conversationId: string, messageId: string, optionId: string, coachName: string, chosenAt: string) {
  return conversations.map((conversation) => {
    if (conversation.id !== conversationId) return conversation
    const target = conversation.messages.find((message) => message.id === messageId)
    if (!target || target.chosenResponse) return conversation
    const option = target.responseOptions?.find((item) => item.id === optionId)
    if (!option) return conversation
    const latest = conversation.messages.slice().sort(compareMessages).at(-1)
    const timestamp = latest && chosenAt < latest.timestamp ? latest.timestamp : chosenAt
    const nextOrder = Math.max(0, ...conversation.messages.map((message) => message.order ?? 0)) + 1
    const response: ConversationMessage = { id: `${messageId}-response`, senderType: 'COACH', senderName: coachName || 'Míster', timestamp, order: nextOrder, text: option.coachText ?? option.label, read: true, relatedEventId: messageId }
    const reply: ConversationMessage | undefined = option.replyText ? { id: `${messageId}-reply-${option.id}`, senderType: target.senderType, senderId: target.senderId, senderName: target.senderName, timestamp, order: nextOrder + 1, text: option.replyText, read: false, relatedEventId: messageId } : undefined
    return {
      ...conversation,
      messages: [
        ...conversation.messages.map((message) => message.id === messageId ? { ...message, read: true, chosenResponse: { optionId, label: option.label, chosenAt: timestamp } } : message),
        response,
        ...(reply ? [reply] : []),
      ].sort(compareMessages),
    }
  })
}
