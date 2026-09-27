import { PageTitle } from '../components/ClubUi'
import { useEffect, useRef, type ComponentProps } from 'react'
import { PlayerDetail } from '../components/PlayerDetail'
import { ClubPlayerFile } from '../components/ClubPlayerFile'
import './PlayerProfileScreen.css'

type Props = Omit<ComponentProps<typeof PlayerDetail>, 'variant' | 'onClose' | 'onOpenFull'> & {
  origin: 'tactics' | 'squad'; onBack: () => void
}

/** Dedicated profile using the same player data and detail component as Equipo. */
export function PlayerProfileScreen({ origin, onBack, ...detail }: Props) {
  const backButton = useRef<HTMLButtonElement>(null)
  useEffect(() => { window.scrollTo(0, 0); backButton.current?.focus({ preventScroll: true }) }, [])
  return <section className="player-profile-screen" aria-label={`Perfil de ${detail.player.name}`}>
    <PageTitle title="Perfil de jugador" subtitle={detail.player.name} actions={<button type="button" ref={backButton} onClick={onBack}>← Volver a {origin === "tactics" ? "Tácticas" : "Equipo"}</button>} />
    <ClubPlayerFile {...detail} variant="page" />
  </section>
}
