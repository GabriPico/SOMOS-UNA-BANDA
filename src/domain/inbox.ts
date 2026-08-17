export type MessageSenderType = 'president' | 'staff' | 'player' | 'club' | 'competition'
export type MessageStatus = 'new' | 'read' | 'requires-response' | 'resolved'
export type MessageAttention = 'NORMAL' | 'IMPORTANT' | 'REQUIRES_ATTENTION'
export type ExpectationAssessment = 'far-above' | 'above' | 'on-track' | 'below' | 'far-below'
export type ClubExpectationType = 'league' | 'dressing-room'

export type MessageResponseOption = { id: string; label: string }
export type InboxMessage = {
  id: string
  senderType: MessageSenderType
  senderId?: string | number
  senderName: string
  subject: string
  body: string
  matchday: number
  status: MessageStatus
  attention: MessageAttention
  createdAt: string
  responseOptions?: MessageResponseOption[]
}
export type ClubExpectation = {
  id: string
  type: ClubExpectationType
  title: string
  objective: string
  assessment: ExpectationAssessment
}
export type ClubExpectationsState = { presidentTrust: number; expectations: ClubExpectation[] }

export const MESSAGE_STATUS_LABELS: Record<MessageStatus, string> = {
  new: 'Nuevo', read: 'Leído', 'requires-response': 'Requiere respuesta', resolved: 'Resuelto',
}
export const EXPECTATION_ASSESSMENT_LABELS: Record<ExpectationAssessment, string> = {
  'far-above': 'Muy por encima de lo esperado', above: 'Por encima de lo esperado',
  'on-track': 'Según lo esperado', below: 'Por debajo de lo esperado',
  'far-below': 'Muy por debajo de lo esperado',
}

export function getPresidentTrustLabel(value: number) {
  if (value >= 84) return 'Confianza total'
  if (value >= 68) return 'Satisfecho'
  if (value >= 56) return 'Conforme'
  if (value >= 44) return 'Preocupado'
  if (value >= 30) return 'Muy preocupado'
  return 'Al límite'
}

export const countNewMessages = (messages: InboxMessage[]) => messages.filter((message) => message.status === 'new').length
export const countMessagesRequiringResponse = (messages: InboxMessage[]) => messages.filter((message) => message.status === 'requires-response').length
export const countMessagesRequiringAttention = (messages: InboxMessage[]) => messages.filter((message) => message.attention === 'REQUIRES_ATTENTION' && message.status !== 'read' && message.status !== 'resolved').length
export const getNextMessageRequiringAttention = (messages: InboxMessage[]) => messages.find((message) => message.attention === 'REQUIRES_ATTENTION' && message.status !== 'read' && message.status !== 'resolved')
