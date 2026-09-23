import type { ComponentProps } from 'react'
import { PlayerDetail } from './PlayerDetail'

type Props = Omit<ComponentProps<typeof PlayerDetail>, 'variant' | 'className'> & {
  variant: 'inline' | 'page'
}

/** The frame stays outside the scrollable document in both player views. */
export function ClubPlayerFile({ variant, ...detail }: Props) {
  return <div className={`club-player-file-mount club-player-file-mount--${variant} club-sheet club-sheet--clipboard`}>
    <PlayerDetail {...detail} variant={variant} className="club-sheet club-player-file" />
  </div>
}
