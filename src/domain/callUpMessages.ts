import type { GameState } from './gameState'
import type { ConversationMessage } from './messages'
import type { LeagueMatch, Player } from './models'

const longDate = (date: string) => new Intl.DateTimeFormat('es-ES', {
  weekday: 'long', day: 'numeric', month: 'long',
}).format(new Date(`${date}T12:00:00`))

export function createCallUpMessage(
  state: GameState,
  match: LeagueMatch,
  playerIds: number[],
  players: Player[],
  homeName: string,
  awayName: string,
  reactions: ConversationMessage['reactions'],
): ConversationMessage {
  const playerNames = players.filter((player) => playerIds.includes(player.id)).map((player) => player.name)
  return {
    id: `call-up-${match.id}`,
    senderType: 'COACH',
    senderName: state.coachName || 'Míster',
    timestamp: state.temporal.currentDateTime,
    type: 'CALL_UP',
    text: `Convocatoria para ${match.competitionType === 'FRIENDLY' ? 'el amistoso' : `la jornada ${match.matchday}`} contra ${homeName === 'FC Poblenou' ? awayName : homeName}.`,
    callUp: {
      competition: match.competitionType === 'FRIENDLY' ? 'AMISTOSO' : `LIGA · JORNADA ${match.matchday}`,
      fixture: `${homeName} – ${awayName}`,
      date: longDate(match.date),
      venue: match.venue ?? 'Campo por confirmar',
      matchTime: match.time,
      meetingTime: match.callUpTime,
      playerNames,
      additionalText: 'Traed las dos equipaciones.',
      encouragement: 'Vamos equipo 💪',
    },
    read: true,
    relatedEventId: match.id,
    reactions,
  }
}
