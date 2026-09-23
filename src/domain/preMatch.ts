import type { GameState, PreMatchPreparation } from './gameState'
import type { LeagueSanction, Player } from './models'
import { validateOfficialSquad } from './squadSelection'

export function validatePreMatchPreparation(state: GameState, matchId: string, players?: Player[], sanctions: LeagueSanction[] = []): string[] {
  const preparation = state.preMatchPreparations?.[matchId]
  const selection = state.squadSelections[matchId]
  if (!preparation) return ['Prepara la alineación antes de entrar al vestuario.']
  const errors: string[] = []
  if (preparation.lineupIds.length !== 11) errors.push('Debes seleccionar 11 titulares antes de comenzar el partido.')
  if (new Set(preparation.lineupIds).size !== preparation.lineupIds.length) errors.push('No puede haber jugadores duplicados en el once.')
  if (!selection?.announced || preparation.lineupIds.some((id) => !selection.playerIds.includes(id))) errors.push('El once solo puede incluir jugadores convocados.')
  if (players) {
    const goalkeeper = players.find((player) => player.id === preparation.lineupIds[0])
    if (!goalkeeper || ![goalkeeper.primaryPosition, ...goalkeeper.secondaryPositions].includes('POR')) errors.push('El portero debe tener POR como posición natural.')
    if (preparation.lineupIds.some((id) => !players.some((player) => player.id === id))) errors.push('Hay jugadores desconocidos en el once.')
    const match = state.temporal.calendar.find((item) => item.id === matchId)
    if (match && selection) errors.push(...validateOfficialSquad(state, match, selection.playerIds, players, sanctions))
  }
  return errors
}

export function savePreMatchPreparation(state: GameState, preparation: PreMatchPreparation): GameState {
  // The announced plan is frozen once the locker-room scene starts, including on remount.
  if (state.preMatchPreparations[preparation.matchId]?.talk) return state
  const errors = validatePreMatchPreparation({ ...state, preMatchPreparations: { ...state.preMatchPreparations, [preparation.matchId]: preparation } }, preparation.matchId)
  return { ...state, preMatchPreparations: { ...state.preMatchPreparations, [preparation.matchId]: { ...preparation, completed: errors.length === 0 } } }
}
