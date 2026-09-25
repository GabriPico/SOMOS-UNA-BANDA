import { SITO } from '../data/characters'
import type { ClubCall } from '../domain/clubPhone'
import type { MessageConversation } from '../domain/messages'
import { STAFF_ROLE_LABELS, type StaffPerson } from '../domain/staff'

export const phoneHour = (value: string) => value.slice(11, 16)
export const phoneDay = (value: string) => new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' }).format(new Date(`${value.slice(0, 10)}T12:00:00Z`))
export const phoneListTime = (value: string, current: string) => value.slice(0, 10) === current.slice(0, 10) ? phoneHour(value) : `${value.slice(8, 10)}/${value.slice(5, 7)}`
export const phoneInitials = (name: string) => name.trim().split(/\s+/).map(part => part[0]).join('').slice(0, 2).toUpperCase()
export const phoneBadge = (count: number) => count > 99 ? '99+' : String(count)
export const phoneContactName = (contact: Pick<MessageConversation, 'participantName' | 'participantType' | 'participantId'>) => contact.participantType === 'PRESIDENT' ? 'Presidente' : contact.participantId === 'team-group' ? 'Plantilla' : contact.participantName
export function phoneContactRole(conversation: MessageConversation, staff: StaffPerson[]) {
  if (conversation.type === 'GROUP') return 'Grupo del club'
  if (conversation.participantType === 'PRESIDENT') return conversation.participantName
  if (conversation.participantId === SITO.id) return SITO.role
  const person = staff.find(member => member.id === conversation.participantId)
  return person ? STAFF_ROLE_LABELS[person.role] : conversation.participantType === 'PLAYER' ? 'Jugador' : 'Club'
}
export function phoneCallLabel(call: ClubCall) {
  if (call.status === 'MISSED') return 'Llamada perdida'
  const direction = call.direction === 'INCOMING' ? 'Entrante' : 'Saliente'
  const duration = call.durationSeconds === undefined ? '' : ` (${Math.floor(call.durationSeconds / 60)}:${String(call.durationSeconds % 60).padStart(2, '0')})`
  return `${call.medium === 'VIDEO' ? 'Videollamada · ' : ''}${direction}${duration}`
}
