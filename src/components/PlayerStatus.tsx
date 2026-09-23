import type { Player, PlayerPosition } from '../domain/models'
import type { TrainingPlayerState } from '../domain/trainingTypes'
import { getHappinessPresentation, POSITION_POINTS, type PlayerStatusView } from '../presentation/playerPresentation'
import { getPlayerPositions } from '../domain/playerRatings'

export function HappinessIndicator({ player, training, showLabel = false }: { player: Player; training?: TrainingPlayerState; showLabel?: boolean }) {
  const { label, tone } = getHappinessPresentation(player, training)
  return <span className={`happiness-indicator is-${tone}`} title={label} role="img" aria-label={`Felicidad: ${label}`}>
    <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="currentColor" /><g stroke="var(--ui-face-ink)" strokeWidth="1.8" fill="none" strokeLinecap="round"><path d="M8 8h.1M16 8h.1" /><path d={tone === 'positive' ? 'M7 14q5 6 10 0' : tone === 'negative' ? 'M7 17q5-6 10 0' : 'M8 15h8'} /></g></svg>
    {showLabel && <strong aria-hidden="true">{label}</strong>}
  </span>
}

export function WarningBadge({ children }: { children: string }) {
  return <span className="warning-badge is-warning"><span aria-hidden="true">⚠</span> {children}</span>
}

export function PlayerStatus({ status }: { status: PlayerStatusView }) {
  return <span className={`player-status is-${status.tone}`} title={`${status.label}: ${status.description}`}><span aria-hidden="true">{status.tone === 'positive' ? '✓' : status.tone === 'negative' ? '×' : '⚠'}</span> {status.label}</span>
}

export function PositionMap({ player, compact = false }: { player: Player; compact?: boolean }) {
  const positions = getPlayerPositions(player)
  return <div className={`player-position-map${compact ? ' player-position-map--compact' : ''}`}>
    {!compact && <svg className="position-pitch" viewBox="0 0 200 108" role="img" aria-label={`Posición habitual ${player.primaryPosition}; secundarias ${player.secondaryPositions.join(', ') || 'ninguna'}`}>
      <rect x="2" y="2" width="196" height="104" rx="1" fill="var(--ui-pitch)" />
      <g stroke="var(--ui-pitch-line)" fill="none" strokeWidth="1"><path d="M100 2v104M2 23h29v62H2M198 23h-29v62h29M2 40h11v28H2M198 40h-11v28h11" /><circle cx="100" cy="54" r="17" /><rect x="2" y="2" width="196" height="104" /></g>
      {positions.map((position: PlayerPosition) => { const [x, y] = POSITION_POINTS[position]; return <g key={position}>{position === player.primaryPosition && <circle cx={x * 2} cy={y * 1.08} r="10" fill="none" stroke="var(--ui-warning-fill)" strokeWidth="2" />}<circle cx={x * 2} cy={y * 1.08} r="6" fill={position === player.primaryPosition ? 'var(--ui-warning-fill)' : 'var(--ui-positive-fill)'} stroke="var(--ui-pitch)" strokeWidth="1.5" /></g> })}
    </svg>}
    <ul>{positions.map((position, index) => <li key={position}><i className={index === 0 ? 'is-primary' : ''} /><b>{position}</b><span>Posición {index === 0 ? 'habitual' : 'secundaria'}</span></li>)}</ul>
  </div>
}
