import type { ClubExpectationsState, InboxMessage } from '../domain/inbox'

export const initialInboxMessages: InboxMessage[] = [
  {
    id: 'welcome-first-week', senderType: 'president', senderId: 'manolo-escudero', senderName: 'Manolo Escudero',
    subject: 'Antes del primer entrenamiento', matchday: 0, status: 'read', attention: 'IMPORTANT', createdAt: '2026-08-25T18:05:00',
    body: 'Antes del primer entrenamiento quiero que veas bien qué plantilla tienes, dejes preparada la táctica y planifiques los dos entrenamientos de esta semana.',
  },
  {
    id: 'plan-first-training-week', senderType: 'president', senderId: 'manolo-escudero', senderName: 'Manolo Escudero',
    subject: 'La semana', matchday: 0, status: 'read', attention: 'NORMAL', createdAt: '2026-08-25T18:06:00',
    body: 'Después del primer entrenamiento podrás revisar la sesión del jueves si el equipo acaba demasiado cargado.',
  },
]

export const initialClubExpectations: ClubExpectationsState = {
  presidentTrust: 63,
  expectations: [
    { id: 'league-playoff', type: 'league', title: 'Resultados', objective: 'Clasificarse para el playoff', assessment: 'on-track' },
    { id: 'good-dressing-room', type: 'dressing-room', title: 'Vestuario', objective: 'Mantener un buen ambiente', assessment: 'on-track' },
  ],
}
