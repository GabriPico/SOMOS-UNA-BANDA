import type { CSSProperties } from 'react'
import type { LineupSource } from '../domain/tacticalLineup'
import type { PlayerPosition } from '../domain/models'
import type { TacticalCardIndicators, TacticalPositionFit } from '../presentation/tacticalPlayerPresentation'
import { useTacticalDrop } from './tacticalDragContext'
import { PlayerPortrait } from './PlayerPortrait'
import { StarRating } from './StarRating'
import './TacticalPlayerCard.css'

export type TacticalCardPlayer = {
  id: number; name: string; shirtNumber?: number; positions: string
  unavailable?: boolean; secondary?: string; cardIndicators?: TacticalCardIndicators; generalRating?: number
  primaryPosition?: PlayerPosition; secondaryPositions?: PlayerPosition[]; positionFit?: TacticalPositionFit
}

export function TacticalNaturalPositions({ player }: { player: Pick<TacticalCardPlayer, 'primaryPosition' | 'secondaryPositions' | 'positions'> }) {
  return <span className="tactical-natural-positions" title={`Posiciones naturales: ${player.positions}`}><b>{player.primaryPosition ?? player.positions}</b>{Boolean(player.secondaryPositions?.length) && <small> · {player.secondaryPositions!.join(' · ')}</small>}</span>
}

export function TacticalPhysicalIndicators({ indicators }: { indicators?: TacticalCardIndicators }) {
  return <div className="tactical-card-physical">
    {indicators && <span className={`tactical-card-condition is-${indicators.condition.tone}`} role="img" aria-label={`Condición física: ${indicators.condition.label}`} title={`Condición física: ${indicators.condition.label}`}>
      <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 21 3.5 12.7C-2 7.2 5.5-1 12 5.6 18.5-1 26 7.2 20.5 12.7Z" /></svg>
    </span>}
    {indicators?.stamina ? <span className={`tactical-card-stamina is-${indicators.stamina.tone}`} role="img" aria-label={`Stamina: ${indicators.stamina.label}`} title={`Stamina · ${indicators.stamina.label}`}><span style={{ width: `${indicators.stamina.level}%` }} /></span> : <span className="tactical-card-stamina-unknown" title="Cansancio sin registrar">—</span>}
  </div>
}

export function TacticalPlayerCard({ player, position, source, selected = false, style, onSelect, onOpenPlayer, variant = 'card', rowLabel }: {
  player: TacticalCardPlayer; position?: string; source: LineupSource; selected?: boolean; style?: CSSProperties
  onSelect?: () => void
  onOpenPlayer?: (id: number) => void
  variant?: 'card' | 'row'; rowLabel?: string
}) {
  const indicators = player.cardIndicators
  const dropClass = useTacticalDrop(source)
  const disabled = !onSelect
  return <article className={`tactical-player-card${variant === 'row' ? ' lineup-player-row' : source.group === 'field' ? ' tactical-player-card--field' : ''}${selected ? ' is-selected' : ''}${player.unavailable ? ' is-unavailable' : ''}${indicators?.special ? ` has-${indicators.special.tone}` : ''}${dropClass}`}
    style={style} data-player-id={player.id} data-slot={source.group === 'field' ? source.slot : undefined}
    data-lineup-source={JSON.stringify(source)} data-drag-disabled={disabled || (source.group === 'reserve' && player.unavailable)}
    onClick={event => { if (event.target instanceof Element && !event.target.closest('button') && !disabled) onSelect?.() }}>
    <button className="tactical-card-select" type="button" disabled={disabled} aria-pressed={selected}
      aria-label={`Seleccionar a ${player.name}${position ? `, ${position}` : ''}${player.unavailable ? ', no disponible' : ''}`}
      onClick={onSelect} />
    {variant === 'row' && <span className={`lineup-row-slot${player.positionFit?.tone === 'warning' ? ' is-out-of-position' : ''}`} title={player.positionFit?.label}>{rowLabel ?? position}{player.positionFit?.tone === 'warning' && ' ⚠'}</span>}
    <button className="tactical-card-portrait" type="button" aria-label={`Seleccionar a ${player.name}`} onClick={onSelect} disabled={disabled} tabIndex={-1}>
      <PlayerPortrait player={player} />
    </button>
    <span className="tactical-card-number" title={player.shirtNumber === undefined ? 'Dorsal no asignado' : 'Dorsal'}>{player.shirtNumber ?? '—'}</span>
    <button className={`tactical-card-name${onOpenPlayer ? ' player-profile-link' : ''}`} type="button" onClick={event => { event.stopPropagation(); if (onOpenPlayer) onOpenPlayer(player.id); else onSelect?.() }} disabled={!onOpenPlayer && disabled} tabIndex={onOpenPlayer ? 0 : -1} aria-label={onOpenPlayer ? `Ver perfil de ${player.name}` : undefined} title={`${player.name} · Posiciones naturales: ${player.positions}`}><span>{variant === 'card' ? player.name.split(' ')[0] : player.name}</span></button>
    {variant === 'row' && <TacticalNaturalPositions player={player} />}
    <span className={`tactical-card-position${player.positionFit?.tone === 'warning' ? ' is-out-of-position' : ''}`} title={position ? `Puesto ocupado: ${position} · ${player.positionFit?.label ?? player.secondary ?? ''} · Posiciones naturales: ${player.positions}` : player.positions}>{position ?? player.primaryPosition}{player.positionFit?.tone === 'warning' && ' ⚠'}</span>
    {variant === 'row' && player.generalRating !== undefined && <span className="lineup-row-quality" title="Calidad general"><StarRating value={player.generalRating} /></span>}
    <TacticalPhysicalIndicators indicators={indicators} />
    {indicators?.special && <span className={`tactical-card-special is-${indicators.special.tone}`} role="img" title={indicators.special.label} aria-label={indicators.special.label}>{indicators.special.icon}</span>}
  </article>
}
