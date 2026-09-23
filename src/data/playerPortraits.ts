import type { Player } from '../domain/models'

// Optional exceptions: player ID → original filename, including its extension.
// Without an override, adding public/assets/players/portraits/<id>.png is enough.
export const PLAYER_PORTRAIT_FILES: Readonly<Partial<Record<Player['id'], string>>> = {}

const portraitDirectory = `${import.meta.env.BASE_URL}assets/players/portraits/`
export const PLAYER_PORTRAIT_PLACEHOLDER = `${portraitDirectory}placeholder.svg`

export function getPlayerPortraitSource(player: Pick<Player, 'id'>) {
  const filename = PLAYER_PORTRAIT_FILES[player.id] ?? `${player.id}.png`
  return `${portraitDirectory}${encodeURIComponent(filename)}`
}
