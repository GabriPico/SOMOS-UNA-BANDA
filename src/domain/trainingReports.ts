import type { InboxMessage } from './inbox'
import type { StaffPerson } from './staff'
import type { FunctionalTrainingSession, TrainingSessionEvent } from './trainingTypes'

const describeEvent = (event: TrainingSessionEvent) => {
  if (event.type === 'PLAYER_ABSENCE') return event.planned ? 'una ausencia que ya estaba prevista' : 'una ausencia sin avisar'
  if (event.type === 'PLAYER_LATE') return 'un retraso'
  if (event.type === 'PLAYER_DISCOMFORT') return 'unas molestias musculares'
  if (event.type === 'PLAYER_INJURY') return 'una lesión durante la sesión'
  if (event.type === 'PLAYER_PERFORMANCE') return event.level === 'GOOD' ? 'un jugador especialmente fino' : 'un jugador por debajo de su nivel'
  return 'una observación del Staff'
}

export function createTrainingReportMessages(session: FunctionalTrainingSession, staff: StaffPerson[], createdAt: string, firstTraining: boolean): InboxMessage[] {
  if (!session.result) return []
  const events = session.result.events ?? []
  const author = staff.find((member) => member.role === 'SEGUNDO_ENTRENADOR' && session.result?.presentStaffIds?.includes(member.id))
  const interpretations = [...new Set(events.map(describeEvent))]
  const general: InboxMessage = {
    id: `training-report-${session.id}-${session.result.quality.toFixed(2)}`,
    senderType: 'staff', senderId: author?.id, senderName: author?.name ?? 'Manolo Escudero',
    subject: `Informe del entrenamiento del ${session.day.toLowerCase()}`,
    body: `${session.result.attendees.length} jugadores han completado una sesión ${session.result.qualityLabel?.toLowerCase() ?? 'normal'}. ${interpretations.length ? `Me quedo con ${interpretations.join(', ')}.` : 'No ha habido nada especialmente preocupante.'} ${session.intensity === 'Alta' ? 'Conviene vigilar la carga antes de la siguiente sesión.' : 'La carga ha quedado dentro de lo previsto.'}`,
    matchday: 0, status: 'new', attention: firstTraining ? 'REQUIRES_ATTENTION' : 'NORMAL', createdAt,
  }
  const medical = events.find((event) => event.type === 'PLAYER_DISCOMFORT' || event.type === 'PLAYER_INJURY')
  const physio = staff.find((member) => member.role === 'FISIO' && session.result?.presentStaffIds?.includes(member.id))
  if (!medical || !physio) return [general]
  const playerId = medical.playerId
  return [general, {
    id: `medical-report-${session.id}-${playerId}`,
    senderType: 'staff', senderId: physio.id, senderName: physio.name, subject: 'Seguimiento médico tras el entrenamiento',
    body: medical.type === 'PLAYER_INJURY' && medical.severity === 'SERIOUS'
      ? 'La lesión necesita una valoración más completa. De momento no contaría con el jugador.'
      : 'Parece una sobrecarga leve. Conviene controlar su carga en la próxima sesión.',
    matchday: 0, status: 'new', attention: medical.type === 'PLAYER_INJURY' && medical.severity === 'SERIOUS' ? 'IMPORTANT' : 'NORMAL', createdAt,
  }]
}

export function appendUniqueMessages(current: InboxMessage[], additions: InboxMessage[]) {
  const known = new Set(current.map((message) => message.id))
  return [...current, ...additions.filter((message) => !known.has(message.id))]
}
