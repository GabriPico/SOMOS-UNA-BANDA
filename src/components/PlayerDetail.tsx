import { useEffect, useId, useRef } from 'react'
import type { Player, PlayerPosition, ProvisionalAttributeProgress } from '../domain/models'
import { ARCHETYPE_DESCRIPTIONS, PREFERRED_FOOT_LABELS } from '../domain/playerGeneration'
import { POSITION_FAMILIARITY_LABELS, calculateTacticalRating, getPositionFamiliarity } from '../domain/positionFamiliarity'
import { calculateGeneralRating } from '../domain/playerRatings'
import type { PlayerClubCompensation, PlayerFeePlan } from '../domain/playerFinance'
import { getPlayerFeeDetail } from '../domain/playerFinance'
import type { PlayerSeasonStats } from '../domain/gameState'
import type { TrainingPlayerState } from '../domain/trainingTypes'
import { getEffectiveMatchAttributes } from '../domain/trainingEngine'
import { getCoachRelationshipLabel, getConditionLabel, getFatigueLabel, getTrainingSatisfactionLabel } from '../domain/humanState'
import { formatMatchRating, getAverageMatchRating, getFormLabel, getLastMatchRatings } from '../domain/playerPresentation'
import { getPlayerRolePresentation, getPlayerStatus, getSeasonStatsPresentation, getVisibleAttributeGroups, POSITION_LABELS, type PlayerStatusView } from '../presentation/playerPresentation'
import { initialDressingRoomState } from '../data/dressingRoomData'
import { StarRating } from './StarRating'
import { PlayerPortrait } from './PlayerPortrait'
import { PlayerAttributeRow, StatusBadge } from './PlayerUi'
import { HappinessIndicator, PlayerStatus, PositionMap } from './PlayerStatus'
import './PlayerDetail.css'
import { TacticalNaturalPositions, TacticalPhysicalIndicators } from './TacticalPlayerCard'
import { getPlayerPositions } from '../domain/playerRatings'
import { getTacticalPositionFit, type TacticalCardIndicators } from '../presentation/tacticalPlayerPresentation'

type PlayerDetailProps = {
  player: Player; onClose?: () => void; variant?: 'modal' | 'inline' | 'summary' | 'page'; currentTacticalPosition?: PlayerPosition
  onOpenFull?: () => void; cardIndicators?: TacticalCardIndicators
  provisionalProgress?: ProvisionalAttributeProgress; playerFee?: PlayerFeePlan; playerCompensation?: PlayerClubCompensation
  trainingState?: TrainingPlayerState; seasonStats?: PlayerSeasonStats; injured?: boolean
  status?: PlayerStatusView; seasonLabel?: string; className?: string
}

export function PlayerDetail({ player, onClose, onOpenFull, cardIndicators, variant = 'modal', currentTacticalPosition, provisionalProgress, playerFee, playerCompensation, trainingState, seasonStats, injured = false, status: givenStatus, seasonLabel = 'Temporada actual', className = '' }: PlayerDetailProps) {
  const dialogRef = useRef<HTMLElement>(null)
  const titleId = useId()
  const isRosterSummary = variant === 'inline'
  const status = givenStatus ?? getPlayerStatus(player, trainingState, { injured })
  const stats = getSeasonStatsPresentation(player, seasonStats)
  const currentPlayer = trainingState ? { ...player, attributes: trainingState.baseAttributes } : player
  const effectivePlayer = trainingState ? { ...player, attributes: getEffectiveMatchAttributes(trainingState) } : player
  const average = getAverageMatchRating(seasonStats)
  const latest = getLastMatchRatings(seasonStats)
  const teamRole = getPlayerRolePresentation(player, initialDressingRoomState.players.find(profile => profile.playerId === player.id))

  useEffect(() => {
    if (variant !== 'modal') return
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialogRef.current?.querySelector<HTMLButtonElement>('button')?.focus()
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); onClose?.() }
      if (event.key !== 'Tab') return
      const controls = dialogRef.current?.querySelectorAll<HTMLElement>('button, summary, a[href], input, select, textarea, [tabindex="0"]')
      if (!controls?.length) return
      const first = controls[0], last = controls[controls.length - 1]
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
    }
    window.addEventListener('keydown', handleKey)
    return () => { window.removeEventListener('keydown', handleKey); document.body.style.overflow = previousOverflow; previousFocus?.focus() }
  }, [onClose, variant])

  if (variant === 'summary') return <section className="tactics-selected-player" aria-label={`Jugador seleccionado: ${player.name}`}>
    <header><span>Jugador seleccionado</span><button type="button" onClick={onClose} aria-label="Deseleccionar jugador">×</button></header>
    <div className="selected-player-identity"><PlayerPortrait player={player} /><div><h3><span title={player.shirtNumber === undefined ? 'Dorsal no asignado' : 'Dorsal'}>{player.shirtNumber ?? '—'} </span>{onOpenFull ? <button className="player-profile-link" type="button" onClick={onOpenFull}>{player.name}</button> : player.name}</h3><TacticalNaturalPositions player={{ ...player, positions: getPlayerPositions(player).join(' · ') }} /><div className="selected-player-quality"><span>Calidad general</span><StarRating value={calculateGeneralRating(currentPlayer)} /></div></div></div>
    <dl className="selected-player-profile"><div><dt>Rol</dt><dd title={teamRole.description}>{teamRole.label}</dd></div><div><dt>Personalidad</dt><dd>{trainingState?.personality ?? player.personality}</dd></div></dl>
    <div className="selected-player-wellbeing"><HappinessIndicator player={player} training={trainingState} showLabel /><div><TacticalPhysicalIndicators indicators={cardIndicators} /><small>{cardIndicators?.condition.label} · {cardIndicators?.stamina?.label ?? 'Stamina sin registrar'}</small></div></div>
    {cardIndicators?.special && <p className="selected-player-warning">{cardIndicators.special.icon} {cardIndicators.special.label}</p>}
    {currentTacticalPosition && getTacticalPositionFit(player, currentTacticalPosition).tone === 'warning' && <p className="selected-player-warning">⚠ Fuera de posición · {currentTacticalPosition}</p>}
    <button className="selected-player-full" type="button" onClick={onOpenFull}>VER FICHA COMPLETA</button>
  </section>

  const card = <article ref={dialogRef} className={`player-detail player-detail--${variant}${className ? ` ${className}` : ''}`} role={variant === 'modal' ? 'dialog' : 'region'} aria-modal={variant === 'modal' ? true : undefined} aria-labelledby={titleId}>
    {variant === 'modal' && <header className="player-detail-toolbar"><span>Ficha del jugador</span><button type="button" onClick={onClose}>Cerrar ×</button></header>}
    <header className="player-detail-header">
      <PlayerPortrait player={player} size="large" />
      <div className="player-detail-identity">
        {player.shirtNumber !== undefined && <span className="player-detail-number" title="Dorsal">{player.shirtNumber}</span>}
        <h3 id={titleId}>{onOpenFull ? <button className="player-profile-link" type="button" onClick={onOpenFull}>{player.name}</button> : player.name}</h3>
        <p>{POSITION_LABELS[player.primaryPosition]}</p><em>{player.archetype}</em>
        {player.clubStatus === 'TRIAL' && <span className="trial-player-badge">A prueba</span>}
      </div>
      <div className="player-detail-happiness"><HappinessIndicator player={player} training={trainingState} showLabel /></div>
    </header>
    <div className="player-detail-content">
      <section className="player-overview" aria-label="Perfil del jugador">
        <div className="player-overview-quality"><h4>Calidad general</h4><StarRating value={calculateGeneralRating(currentPlayer)} /></div>
        <div className="player-overview-role"><h4>Rol en el equipo</h4><strong title={teamRole.description}>{teamRole.label}</strong>{variant === 'modal' && <p>{teamRole.description}</p>}</div>
        <div className="player-overview-personality"><h4>Personalidad</h4><strong>{trainingState?.personality ?? player.personality}</strong></div>
      </section>
      <div className="player-personal-info">
        <span><b>{player.age} años</b>{player.birthDate && <small> ({player.birthDate.split('-').reverse().join('/')})</small>}</span>
        <span>{player.heightCm ? `${(player.heightCm / 100).toLocaleString('es-ES', { minimumFractionDigits: 2 })} m` : 'Altura —'} · {player.weightKg ? `${player.weightKg} kg` : 'Peso —'}</span>
        <span>{PREFERRED_FOOT_LABELS[player.preferredFoot] === 'Derecha' ? 'Diestro' : player.preferredFoot === 'LEFT' ? 'Zurdo' : 'Ambidiestro'}</span>
      </div>
      <section className="player-detail-section player-positions-panel"><h4>Posiciones</h4><PositionMap player={player} compact={isRosterSummary || variant === 'page'} /></section>
      {currentTacticalPosition && <section className="player-tactical-context" aria-label="Contexto táctico"><span>Puesto actual <b>{currentTacticalPosition}</b></span><StarRating value={calculateTacticalRating(effectivePlayer, currentTacticalPosition)} /><span>{POSITION_FAMILIARITY_LABELS[getPositionFamiliarity(player, currentTacticalPosition)]}</span></section>}
      {!isRosterSummary && <section className="player-detail-section player-attributes-panel"><h4>Atributos</h4>
        <div className="attribute-groups">{getVisibleAttributeGroups(player).map(group => <section key={group.title} className={`attribute-group attribute-group--${group.color}`}><h5>{group.title}</h5><dl>{group.attributes.map(([key, label]) => <PlayerAttributeRow key={key} label={label} value={currentPlayer.attributes[key]} progress={provisionalProgress?.[key] ?? trainingState?.attributes[key]?.bonus} />)}</dl></section>)}</div>
      </section>}
      <section className="player-detail-section player-performance"><h4>{seasonLabel}</h4><dl>
        <div><dt>Partidos</dt><dd title="Partidos jugados (titularidades)">{stats.played}</dd></div>
        <div><dt>Goles</dt><dd>{stats.goals}</dd></div>
        <div><dt><i className="discipline-card yellow" aria-hidden="true" /> Amarillas</dt><dd>{stats.yellowCards ?? '—'}</dd></div>
        <div><dt><i className="discipline-card red" aria-hidden="true" /> Rojas</dt><dd>{stats.redCards ?? '—'}</dd></div>
        <div><dt>Minutos</dt><dd title={stats.minutesNote}>{stats.minutes ?? '—'}</dd></div>
      </dl></section>
      <div className="player-state-sections">
        <section className="player-detail-section"><h4>Estado</h4><PlayerStatus status={status} />{!isRosterSummary && <p>{status.description}</p>}<small>Condición {getConditionLabel(trainingState?.fitness ?? player.fitness).toLowerCase()}{trainingState && ` · ${getFatigueLabel(trainingState.fatigue)}`}</small>{variant === 'page' && <div className="profile-physical-state"><div><span>Condición · Stamina</span><TacticalPhysicalIndicators indicators={cardIndicators} /></div>{cardIndicators?.special && <p>{cardIndicators.special.icon} {cardIndicators.special.label}</p>}</div>}</section>
        {(!isRosterSummary || status.observations.length > 0) && <section className="player-detail-section"><h4>Observaciones</h4>{status.observations.length ? status.observations.map(note => <p key={note}>{note}</p>) : <p>Sin observaciones.</p>}</section>}
      </div>
      {!isRosterSummary && <details className="player-profile-extra"><summary>Perfil y vestuario</summary>
        <p>Forma {getFormLabel(player.form).toLowerCase()}</p>
        <p>{ARCHETYPE_DESCRIPTIONS[player.archetype]}</p>
        <dl className="player-state-list">{trainingState && <><div><dt>Relación contigo</dt><dd><StatusBadge>{getCoachRelationshipLabel(trainingState.managerRelationship)}</StatusBadge></dd></div><div><dt>Entrenamientos</dt><dd><StatusBadge>{getTrainingSatisfactionLabel(trainingState.happiness.training)}</StatusBadge></dd></div></>}</dl>
        {playerFee && <p>{getPlayerFeeDetail(playerFee, playerCompensation?.monthlyAmount)}</p>}
        {average !== null && <p>Valoración media: {formatMatchRating(average)}</p>}
        {latest.length > 0 && <p>Últimos 5: {latest.map(item => formatMatchRating(item.rating)).join(' · ')}</p>}
      </details>}
      {isRosterSummary && onOpenFull && <button className="player-summary-full" type="button" onClick={onOpenFull}>Ver ficha completa →</button>}
    </div>
  </article>
  return variant !== 'modal' ? card : <div className="player-modal-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) onClose?.() }}>{card}</div>
}
