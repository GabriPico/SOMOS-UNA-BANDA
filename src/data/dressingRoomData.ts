import type { DressingRoomState } from '../domain/humanState'

export const initialDressingRoomState: DressingRoomState = {
  cohesion: 74,
  issues: [
    { id: 'good-results', title: 'Buen ambiente tras los últimos resultados', description: 'La buena dinámica ha mejorado el ánimo general.', severity: 'positive' },
    { id: 'playing-time', title: 'Algunos suplentes empiezan a impacientarse', description: '3 jugadores están descontentos con sus minutos.', severity: 'warning' },
    { id: 'oriol-roca', title: 'Oriol Roca está especialmente molesto', description: 'Considera que merece más oportunidades.', severity: 'negative' },
  ],
  changes: [
    { id: 'mood-up', text: 'El ánimo ha mejorado después de la última victoria.', direction: 'positive' },
    { id: 'oriol-down', text: 'Oriol Roca está cada vez más descontento por sus minutos.', direction: 'negative' },
    { id: 'cohesion-up', text: 'La cohesión del grupo está mejorando.', direction: 'positive' },
  ],
  players: [
    { playerId: 1, squadRole: 'Titular', coachRelationship: 78, socialRole: 'Capitán', influence: 88 },
    { playerId: 2, squadRole: 'Suplente', coachRelationship: 58, situation: 'Quiere jugar más', situationIssueId: 'playing-time', influence: 38 },
    { playerId: 3, squadRole: 'Titular', coachRelationship: 73, influence: 55 },
    { playerId: 4, squadRole: 'Rotación', coachRelationship: 62, influence: 48 },
    { playerId: 5, squadRole: 'Suplente', coachRelationship: 42, situation: 'Molesto por sus minutos', situationIssueId: 'oriol-roca', influence: 44 },
    { playerId: 6, squadRole: 'Rotación', coachRelationship: 67, influence: 50 },
    { playerId: 7, squadRole: 'Importante', coachRelationship: 82, socialRole: 'Segundo capitán', influence: 78 },
    { playerId: 8, squadRole: 'Titular', coachRelationship: 74, influence: 61 },
    { playerId: 9, squadRole: 'Suplente', coachRelationship: 55, situation: 'Quiere jugar más', situationIssueId: 'playing-time', influence: 41 },
    { playerId: 10, squadRole: 'Importante', coachRelationship: 77, influence: 64 },
    { playerId: 11, squadRole: 'Estrella', coachRelationship: 84, socialRole: 'Jugador popular', influence: 81 },
    { playerId: 12, squadRole: 'Rotación', coachRelationship: 57, socialRole: 'Veterano', influence: 70 },
    { playerId: 13, squadRole: 'Titular', coachRelationship: 71, influence: 53 },
    { playerId: 14, squadRole: 'Rotación', coachRelationship: 69, influence: 58 },
    { playerId: 15, squadRole: 'Importante', coachRelationship: 76, influence: 63 },
    { playerId: 16, squadRole: 'Titular', coachRelationship: 65, influence: 47 },
    { playerId: 17, squadRole: 'Titular', coachRelationship: 80, influence: 60 },
    { playerId: 18, squadRole: 'Estrella', coachRelationship: 72, influence: 66 },
    { playerId: 19, squadRole: 'Rotación', coachRelationship: 61, influence: 51 },
    { playerId: 20, squadRole: 'Suplente', coachRelationship: 59, situation: 'No está cómodo con su rol', influence: 43 },
  ],
}
