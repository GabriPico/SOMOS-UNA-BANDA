import type { ClubExpectationsState, InboxMessage } from '../domain/inbox'

export const initialInboxMessages: InboxMessage[] = [
  {
    id: 'season-expectations', senderType: 'president', senderName: 'Presidente',
    subject: 'Expectativas para esta temporada', matchday: 1, status: 'read',
    body: 'Queremos estar arriba este año. Creemos que esta plantilla tiene nivel suficiente para clasificarse para el playoff. También esperamos que mantengas un buen ambiente dentro del vestuario.',
  },
  {
    id: 'staff-oriol', senderType: 'staff', senderName: 'Toni Casals · Segundo entrenador',
    subject: 'Sobre Oriol Roca', matchday: 8, status: 'new',
    body: 'Oriol lleva unas semanas incómodo con sus minutos. Todavía no ha montado ningún drama, pero convendría hablar con él antes de que el malestar vaya a más.',
    senderId: 2,
  },
  {
    id: 'oriol-playing-time', senderType: 'player', senderId: 5, senderName: 'Oriol Roca',
    subject: 'Quería hablar contigo', matchday: 9, status: 'requires-response',
    body: 'Míster, llevo varias jornadas jugando muy poco. Pensaba que iba a tener más oportunidades este año y creo que puedo ayudar al equipo.',
    responseOptions: [
      { id: 'opportunities', label: 'Tendrás oportunidades.' },
      { id: 'earn-it', label: 'Tienes que ganártelo entrenando.' },
      { id: 'others-ahead', label: 'Ahora mismo hay compañeros por delante.' },
      { id: 'no-promises', label: 'No puedo prometerte minutos.' },
    ],
  },
  {
    id: 'sanction-confirmed', senderType: 'competition', senderName: 'Comité de Competición',
    subject: 'Sanción confirmada', matchday: 9, status: 'resolved',
    body: 'La sanción comunicada al club ha quedado confirmada. El jugador afectado no estará disponible durante el periodo indicado.',
  },
  {
    id: 'recent-results', senderType: 'president', senderName: 'Presidente',
    subject: 'Sobre los últimos resultados', matchday: 10, status: 'new',
    body: 'El equipo sigue dentro de lo que esperábamos a estas alturas. Hay margen de mejora, pero la pelea por el playoff continúa bien encaminada.',
  },
]

export const initialClubExpectations: ClubExpectationsState = {
  presidentTrust: 63,
  expectations: [
    { id: 'league-playoff', type: 'league', title: 'Resultados', objective: 'Clasificarse para el playoff', assessment: 'on-track' },
    { id: 'good-dressing-room', type: 'dressing-room', title: 'Vestuario', objective: 'Mantener un buen ambiente', assessment: 'on-track' },
  ],
}
