import type { Player, PlayerPosition } from './models'

export type LineupSource = { group: 'field'; slot: number } | { group: 'reserve'; playerId: number }

export function moveLineupPlayer(lineupIds: number[], source: LineupSource, target: LineupSource, slots: PlayerPosition[], players: Pick<Player, 'id' | 'primaryPosition' | 'secondaryPositions'>[]) {
  const next = [...lineupIds]
  if (source.group === 'field' && target.group === 'field') [next[source.slot], next[target.slot]] = [next[target.slot], next[source.slot]]
  else if (source.group === 'reserve' && target.group === 'field') next[target.slot] = source.playerId
  else if (source.group === 'field' && target.group === 'reserve') next[source.slot] = target.playerId
  else return { lineupIds, error: undefined }
  if (next.length !== 11 || new Set(next).size !== 11) return { lineupIds, error: 'El once debe contener once jugadores distintos.' }
  const goalkeeper = players.find((player) => player.id === next[0])
  if (slots[0] === 'POR' && goalkeeper && ![goalkeeper.primaryPosition, ...goalkeeper.secondaryPositions].includes('POR')) return { lineupIds, error: 'El puesto de portero necesita un portero natural.' }
  return { lineupIds: next, error: undefined }
}
