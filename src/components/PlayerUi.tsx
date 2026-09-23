import type { ReactNode } from 'react'
import type { Player } from '../domain/models'
import { PlayerPortrait } from './PlayerPortrait'
import { ManagementIcon, type ManagementIconName } from './ManagementIcon'
import { getApproximateStatusLevel, getManagementStatusTone, type StatusTone } from '../presentation/managementPresentation'
import './PlayerUi.css'
import '../styles/managementTheme.css'
import { getAttributePresentation } from '../presentation/playerPresentation'
import { RatingStars } from './StarRating'

// Presentation only: colors follow existing domain labels, never new thresholds.
const labelTones: Record<string, StatusTone> = {
  'Muy buena': 'positive', Buena: 'positive', Excelente: 'positive', Óptima: 'positive',
  'Muy feliz': 'positive', Feliz: 'positive', 'Muy contento': 'positive', Contento: 'positive',
  Fresco: 'positive', Bien: 'positive', Disponible: 'positive',
  Normal: 'neutral', Conforme: 'neutral', Rotación: 'neutral', Pasota: 'neutral',
  Justa: 'warning', 'Algo cansado': 'warning', Cansado: 'warning',
  Mala: 'negative', 'Muy mala': 'negative', Baja: 'negative', 'Muy baja': 'negative',
  Descontento: 'negative', 'Muy descontento': 'negative', 'Muy cansado': 'negative', Lesionado: 'negative',
  Titular: 'info', Importante: 'info', Estrella: 'info', Suplente: 'neutral',
}

export function StatusBadge({ children, tone }: { children: string; tone?: StatusTone }) {
  return <span className={`player-status-badge is-${tone ?? labelTones[children] ?? 'neutral'}`}>{children}</span>
}

export function StatusText({ children }: { children: string }) {
  return <span className={`management-status-text is-${getManagementStatusTone(children)}`}>{children}</span>
}

export function SectionHeader({ title, level = 3, icon, count, id, className = 'player-section-title' }: { title: string; level?: 3 | 4; icon?: ManagementIconName; count?: number; id?: string; className?: string }) {
  const Heading = level === 3 ? 'h3' : 'h4'
  return <Heading id={id} className={className}>{icon && <ManagementIcon name={icon} />}{title}{count !== undefined && <span className="management-count">{count}</span>}</Heading>
}

export function PlayerIdentity({ player, onSelect, onOpenPlayer }: { player: Player; onSelect: () => void; onOpenPlayer?: (id: number) => void }) {
  return <div className="player-identity">
    {onOpenPlayer ? <div className="player-identity-button"><button className="player-portrait-select" type="button" aria-label={`Seleccionar a ${player.name}`} onClick={event => { event.stopPropagation(); onSelect() }}><PlayerPortrait player={player} /></button><button className="player-profile-link" type="button" onClick={event => { event.stopPropagation(); onOpenPlayer(player.id) }}>{player.name}</button></div> : <button className="player-identity-button" type="button" onClick={onSelect}>
      <PlayerPortrait player={player} /><span>{player.name}</span>
    </button>}
    {player.clubStatus === 'TRIAL' && <span className="trial-player-badge">A prueba</span>}
  </div>
}

export function PlayerTable({ label, className = '', children }: { label: string; className?: string; children: ReactNode }) {
  return <div className="player-table-wrapper" tabIndex={0} role="region" aria-label={label}>
    <table className={`player-table ${className}`} aria-label={label}>{children}</table>
  </div>
}

export function PlayerSection({ title, children, className = '', level = 3, icon, scrollable = false }: { title: string; children: ReactNode; className?: string; level?: 3 | 4; icon?: ManagementIconName; scrollable?: boolean }) {
  return <section className={`player-section ${className}`}>
    <SectionHeader title={title} level={level} icon={icon} />
    <div className="player-section-body" tabIndex={scrollable ? 0 : undefined} role={scrollable ? 'region' : undefined} aria-label={scrollable ? title : undefined}>{children}</div>
  </section>
}

export function StatusBar({ label, value, level }: { label: string; value: string; level: number }) {
  return <meter min={0} max={100} value={getApproximateStatusLevel(level)} aria-label={label} aria-valuetext={value} className={`management-status-bar is-${getManagementStatusTone(value)}`}>{value}</meter>
}

export function CompactIndicator({ label, value, level, description, icon }: { label: string; value: string; level: number; description: string; icon?: ManagementIconName }) {
  return <article className={`player-compact-indicator is-${getManagementStatusTone(value)}`}>
    {icon && <span className="management-indicator-icon"><ManagementIcon name={icon} /></span>}
    <div className="player-compact-indicator-heading"><span>{label}</span><strong><StatusText>{value}</StatusText></strong></div>
    <StatusBar label={label} value={value} level={level} />
    <p>{description}</p>
  </article>
}

export function AlertItem({ title, description, tone }: { title: string; description: string; tone: 'positive' | 'warning' | 'negative' }) {
  return <article className={`management-alert is-${tone}`}>
    <span className="management-alert-icon" aria-label={tone === 'negative' ? 'Problema' : tone === 'warning' ? 'Advertencia' : 'Positivo'}><ManagementIcon name={tone === 'positive' ? 'positive' : 'alert'} /></span>
    <div><strong>{title}</strong><p>{description}</p></div>
  </article>
}

export function AttributeStars({ label, value }: { label: string; value: number }) {
  return <RatingStars className="attribute-stars" label={label} stars={getAttributePresentation(value).stars} />
}

export function PlayerAttributeRow({ label, value, progress = 0 }: { label: string; value: number; progress?: number }) {
  return <div className="player-attribute-row">
    <dt>{label}</dt>
    <dd>
      <AttributeStars label={label} value={value} />
      {progress > 0 && <small className="player-attribute-progress" title="Mejora provisional de entrenamiento" aria-label="Mejora provisional de entrenamiento">↑</small>}
    </dd>
  </div>
}
