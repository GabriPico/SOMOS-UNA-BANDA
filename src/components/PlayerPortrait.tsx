import { useState } from 'react'
import type { Player } from '../domain/models'
import { getPlayerPortraitSource, PLAYER_PORTRAIT_PLACEHOLDER } from '../data/playerPortraits'
import './PlayerPortrait.css'

type PlayerPortraitProps = {
  player: Pick<Player, 'id' | 'name'>
  size?: 'small' | 'medium' | 'large'
}

export function PlayerPortrait({ player, size = 'small' }: PlayerPortraitProps) {
  const source = getPlayerPortraitSource(player)
  const [failedSource, setFailedSource] = useState<string | null>(null)
  const missing = failedSource === source

  return <span className={`player-portrait player-portrait--${size}`}>
    <img
      key={source}
      src={missing ? PLAYER_PORTRAIT_PLACEHOLDER : source}
      alt={size === 'large' ? (missing ? `Retrato de ${player.name} pendiente` : `Retrato de ${player.name}`) : ''}
      width="240"
      height="280"
      onError={missing ? undefined : () => setFailedSource(source)}
    />
  </span>
}
