import type { ClubCall } from '../domain/clubPhone'
import type { GameState } from '../domain/gameState'
import { SITO } from './characters'

/** Illustrative history only. Never creates messages or game consequences. */
export function createExampleClubCalls(state: Pick<GameState, 'president' | 'staff' | 'temporal'>): ClubCall[] {
  const assistant = state.staff.members.find(member => member.role === 'SEGUNDO_ENTRENADOR')
  const contacts = [
    { participantId: state.president.id, participantName: state.president.name, participantType: 'PRESIDENT' as const },
    ...(assistant ? [{ participantId: assistant.id, participantName: assistant.name, participantType: 'STAFF' as const }] : []),
    { participantId: SITO.id, participantName: SITO.name, participantType: 'CLUB' as const },
    { participantId: 'team-group', participantName: 'Plantilla', participantType: 'GROUP' as const },
    { participantId: 'staff-group', participantName: 'Cuerpo técnico', participantType: 'GROUP' as const },
  ]
  const start = Date.parse(`${state.temporal.startedAt.slice(0, 10)}T00:00:00Z`)
  return contacts.map((contact, index) => ({
    ...contact, id: `example-call-${contact.participantId}`, source: 'EXAMPLE',
    timestamp: new Date(start - (index + 1) * 86400000 + 18 * 3600000).toISOString().slice(0, 19),
    direction: index === 0 || index % 2 ? 'INCOMING' : 'OUTGOING',
    status: index === 0 ? 'MISSED' : 'COMPLETED',
    medium: index === 3 ? 'VIDEO' : 'VOICE',
    ...(index === 0 ? {} : { durationSeconds: [0, 734, 206, 495, 108][index] }),
  }))
}
