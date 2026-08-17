import type { ClubExpectationsState, InboxMessage } from '../domain/inbox'

export const initialInboxMessages: InboxMessage[] = [
  {
    id: 'welcome-first-week', senderType: 'president', senderId: 'manolo', senderName: 'Manolo Escudero',
    subject: 'La primera semana', matchday: 0, status: 'new', attention: 'IMPORTANT', createdAt: '2026-08-25T18:05:00',
    body: 'Bienvenido. Esta semana tenemos dos entrenamientos y el amistoso del domingo. Aquí te irá llegando lo que necesites saber del club.',
  },
  {
    id: 'plan-first-training-week', senderType: 'staff', senderName: 'Manolo Escudero',
    subject: 'Prepara los entrenamientos', matchday: 0, status: 'new', attention: 'NORMAL', createdAt: '2026-08-25T18:06:00',
    body: 'Antes del martes deja preparadas las dos sesiones. Después de la primera podrás retocar la del jueves si el equipo acaba demasiado cargado.',
  },
]

export const initialClubExpectations: ClubExpectationsState = {
  presidentTrust: 63,
  expectations: [
    { id: 'league-playoff', type: 'league', title: 'Resultados', objective: 'Clasificarse para el playoff', assessment: 'on-track' },
    { id: 'good-dressing-room', type: 'dressing-room', title: 'Vestuario', objective: 'Mantener un buen ambiente', assessment: 'on-track' },
  ],
}
