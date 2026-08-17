import type { DialogueEffect, DialogueScene } from '../domain/dialogue'
import type { StaffSearchRequestRole } from '../domain/staff'
import { MANOLO_ESCUDERO } from './characters'
import { scheduleStaffSearch } from '../domain/gameTime'

const createStaffRequest = (requestedRole: StaffSearchRequestRole): DialogueEffect => (context) => {
  if (context.game.staffSearchRequests.some((request) => request.status === 'PENDING')) return context
  const request = scheduleStaffSearch({ id: `staff-search-${context.game.staffSearchRequests.length + 1}`, requestedRole, status: 'PENDING', origin: 'MANOLO', candidateIds: [] }, context.game.temporal.currentDateTime, context.game.temporal.seed)
  return { ...context, game: { ...context.game, staffSearchRequests: [...context.game.staffSearchRequests, request] } }
}

export function createManoloStaffSearchResultConversation(requestId: string): DialogueScene {
  const clearPending: DialogueEffect = (context) => ({ ...context, game: { ...context.game, temporal: { ...context.game.temporal, pendingConversations: context.game.temporal.pendingConversations.filter((item) => item.relatedId !== requestId), activeCheckpoint: undefined } } })
  return { id: `manolo-staff-result-${requestId}`, location: 'Oficinas del club', startNodeId: 'result', completionFlow: 'CONTINUE', nodes: {
    result: { id: 'result', type: 'dialogue', character: MANOLO_ESCUDERO, text: ({ game }) => { const request = game.staffSearchRequests.find((item) => item.id === requestId); return request?.candidateIds.length ? '—He encontrado a alguien. Pásate por Staff y mira el perfil; luego hablamos con calma.' : '—He preguntado, pero de momento no hay nadie que encaje. Seguiré atento.' }, next: 'end' },
    end: { id: 'end', type: 'end', text: 'Manolo vuelve a mirar el móvil. El asunto queda anotado.', actionLabel: 'CONTINUAR', effects: [clearPending] },
  } }
}

export function createManoloConversation(canRequestStaff: boolean): DialogueScene {
  return {
    id: 'talk-to-manolo', location: 'Oficinas del club', startNodeId: 'greeting',
    nodes: {
      greeting: { id: 'greeting', type: 'dialogue', character: MANOLO_ESCUDERO, text: '—¿Qué pasa?', next: 'topics' },
      topics: { id: 'topics', type: 'choice', character: MANOLO_ESCUDERO, text: 'Manolo deja el móvil boca abajo sobre la mesa.', choices: [
        { id: 'need-help', label: 'Necesito a alguien que me eche una mano.', next: canRequestStaff ? 'ask-role' : 'too-soon', when: ({ game }) => !game.staffSearchRequests.some((request) => request.status === 'PENDING') },
        { id: 'pending-search', label: '¿Sabes algo de la persona que te pedí?', next: 'still-looking', when: ({ game }) => game.staffSearchRequests.some((request) => request.status === 'PENDING') },
        { id: 'expectations', label: 'Quería confirmar qué esperas del equipo.', next: 'expectations' },
        { id: 'leave', label: 'Nada, déjalo.', next: 'end' },
      ] },
      'too-soon': { id: 'too-soon', type: 'dialogue', character: MANOLO_ESCUDERO, text: '—Llevas aquí dos días. Primero mira lo que tienes y termina algún entrenamiento.', next: 'end' },
      'ask-role': { id: 'ask-role', type: 'choice', character: MANOLO_ESCUDERO, text: '—¿Qué necesitas?', choices: [
        { id: 'assistant', label: 'Un segundo entrenador.', next: 'accepted', effects: [createStaffRequest('SEGUNDO_ENTRENADOR')] },
        { id: 'delegate', label: 'Un delegado.', next: 'accepted', effects: [createStaffRequest('DELEGADO')] },
        { id: 'any-help', label: 'Alguien que ayude con el equipo.', next: 'accepted', effects: [createStaffRequest('ANY_HELP')] },
        { id: 'cancel', label: 'Nada, déjalo.', next: 'end' },
      ] },
      accepted: { id: 'accepted', type: 'dialogue', character: MANOLO_ESCUDERO, text: '—Vale. Preguntaré por ahí. Cuando sepa algo, ya te buscaré.', next: 'end' },
      'still-looking': { id: 'still-looking', type: 'dialogue', character: MANOLO_ESCUDERO, text: '—Estoy preguntando. Cuando tenga algo que enseñarte, te aviso. No me llames cada tarde.', next: 'end' },
      expectations: { id: 'expectations', type: 'dialogue', character: MANOLO_ESCUDERO, text: '—Subir a 3a Catalana. Directos o por playoff. Eso no ha cambiado desde la última vez que hablamos.', next: 'end' },
      end: { id: 'end', type: 'end', text: 'La conversación termina.', actionLabel: 'VOLVER A STAFF' },
    },
  }
}
