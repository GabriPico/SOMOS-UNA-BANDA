import { appendConversationMessages } from './messages'
import type { ConversationMessage, MessageConversation } from './messages'
import type { StaffPerson } from './staff'
import type { FunctionalTrainingSession, TrainingSessionEvent } from './trainingTypes'
import type { TrainingGameState } from './trainingTypes'
import type { Player } from './models'
import { createAssistantTrainingVoice } from './assistantPersonality'

const describeEvent = (event: TrainingSessionEvent) => {
  if (event.type === 'PLAYER_ABSENCE') return event.planned ? 'una ausencia que ya estaba prevista' : 'una ausencia sin avisar'
  if (event.type === 'PLAYER_LATE') return 'un retraso'
  if (event.type === 'PLAYER_DISCOMFORT') return 'unas molestias musculares'
  if (event.type === 'PLAYER_INJURY') return 'una lesión durante la sesión'
  if (event.type === 'PLAYER_PERFORMANCE') return event.level === 'GOOD' ? 'un jugador especialmente fino' : 'un jugador por debajo de su nivel'
  return 'una observación del Staff'
}

export type TrainingReport = { conversation: Omit<MessageConversation, 'id' | 'messages'>; messages: ConversationMessage[] }

export function createTrainingReportMessages(session: FunctionalTrainingSession, staff: StaffPerson[], createdAt: string, week: number, nextSession?: FunctionalTrainingSession, training?: TrainingGameState, players: Player[] = []): TrainingReport[] {
  if (!session.result) return []
  const events = session.result.events ?? []
  const present = staff.filter((member) => member.role !== 'PRIMER_ENTRENADOR' && session.result?.presentStaffIds?.includes(member.id))
  const author = present.find((member) => member.role === 'SEGUNDO_ENTRENADOR')
    ?? present.filter((member) => member.capabilities).sort((a, b) => (b.capabilities!.training + b.capabilities!.footballKnowledge) - (a.capabilities!.training + a.capabilities!.footballKnowledge))[0]
    ?? staff.find((member) => member.role === 'SEGUNDO_ENTRENADOR' && member.isUsuallyAvailable)
    ?? staff.filter((member) => member.role !== 'PRIMER_ENTRENADOR' && member.capabilities && member.isUsuallyAvailable).sort((a, b) => (b.capabilities!.training + b.capabilities!.footballKnowledge) - (a.capabilities!.training + a.capabilities!.footballKnowledge))[0]
  const authorId = author?.id ?? 'training-follow-up'
  const authorName = author?.name ?? 'Seguimiento deportivo'
  const assistantVoice = author?.role === 'SEGUNDO_ENTRENADOR' && training ? createAssistantTrainingVoice(author, session, training, players) : undefined
  const interpretations = [...new Set(events.map(describeEvent))]
  const attendanceTone = session.result.attendees.length >= session.totalPlayers - 2 ? 'Ha venido casi todo el mundo' : session.result.attendees.length >= 13 ? 'De asistencia hemos estado bien' : 'Hoy hemos ido bastante justos de gente'
  const qualityTone = session.result.qualityLabel === 'Excelente' || session.result.qualityLabel === 'Buena'
    ? 'En general la sesión ha salido bastante bien.'
    : session.result.qualityLabel === 'Floja' || session.result.qualityLabel === 'Mala' || session.result.qualityLabel === 'De mínimos'
      ? 'Nos ha costado que la sesión cogiera ritmo.'
      : 'La sesión ha sido correcta, sin grandes alardes.'
  const loadTone = session.intensity === 'Alta' || (session.result.appliedEffects?.teamFatigueDelta ?? 0) >= 8
    ? 'Al final se ha notado el cansancio, pero han respondido.'
    : session.intensity === 'Baja' ? 'Han terminado con bastante buena cara.' : 'La carga ha quedado dentro de lo previsto.'
  const incidentTone = interpretations.length ? `Eso sí, hemos tenido ${interpretations.join(' y ')}.` : 'No ha habido nada serio que destacar.'
  const legacyIds = typeof week === 'boolean'
  const general: ConversationMessage = {
    id: legacyIds ? `training-report-${session.id}` : `training-report-week-${week}-${session.id}`,
    senderType: author ? 'STAFF' : 'SYSTEM', senderId: authorId, senderName: authorName,
    text: assistantVoice?.report ?? `${attendanceTone}. ${qualityTone} ${loadTone} ${incidentTone}`,
    timestamp: createdAt, read: false, relatedEventId: `training-${session.id}`,
  }
  const planningQuestion: ConversationMessage | undefined = nextSession ? {
    id: legacyIds ? `second-session-plan-${session.id}` : `second-session-plan-week-${week}-${session.id}`,
    senderType: author ? 'STAFF' : 'SYSTEM', senderId: authorId, senderName: authorName,
    text: assistantVoice?.planningQuestion ?? `Para el ${nextSession.day.toLowerCase()} tenemos preparada la segunda sesión. ¿Quieres mantener lo que habíamos planificado o prefieres tocarla?`,
    timestamp: createdAt, read: false, relatedEventId: `second-session-plan:${week}:${session.id}:${nextSession.id}`,
    responseOptions: [
      { id: 'KEEP_SECOND_SESSION', label: 'Mantener la planificación', coachText: 'Mantengamos lo que teníamos preparado.', replyText: assistantVoice?.keepReply ?? 'Perfecto. Seguimos con eso en la segunda sesión.' },
      { id: 'REVIEW_SECOND_SESSION', label: 'Modificar segunda sesión', coachText: 'Prefiero cambiarla.', replyText: assistantVoice?.reviewReply ?? 'Vale. Échale un vistazo antes de la sesión y déjala preparada.' },
    ],
  } : undefined
  const conversation = { participantId: authorId, participantName: authorName, participantType: author ? 'STAFF' as const : 'CLUB' as const, type: 'DIRECT' as const }
  const medical = events.find((event) => event.type === 'PLAYER_DISCOMFORT' || event.type === 'PLAYER_INJURY')
  const physio = staff.find((member) => member.role === 'FISIO' && session.result?.presentStaffIds?.includes(member.id))
  const reports: TrainingReport[] = [{ conversation, messages: [general, ...(planningQuestion ? [planningQuestion] : [])] }]
  if (!medical || !physio) return reports
  reports.push({ conversation: { participantId: physio.id, participantName: physio.name, participantType: 'STAFF', type: 'DIRECT' }, messages: [{
    id: `medical-report-${session.id}-${medical.playerId}`,
    senderType: 'STAFF', senderId: physio.id, senderName: physio.name,
    text: medical.type === 'PLAYER_INJURY' && medical.severity === 'SERIOUS'
      ? 'La lesión necesita una valoración más completa. De momento no contaría con el jugador.'
      : 'Parece una sobrecarga leve. Conviene controlar su carga en la próxima sesión.',
    timestamp: createdAt, read: false, relatedEventId: `training-medical-${session.id}`,
  }] })
  return reports
}

export function appendTrainingReport(current: MessageConversation[], reports: TrainingReport[]) {
  return reports.reduce((conversations, report) => appendConversationMessages(conversations, report.conversation, report.messages), current)
}
