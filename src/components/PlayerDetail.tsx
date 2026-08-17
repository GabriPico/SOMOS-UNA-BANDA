import { useEffect } from 'react'
import type { Player, PlayerAttribute, PlayerPosition, ProvisionalAttributeProgress } from '../domain/models'
import { ARCHETYPE_DESCRIPTIONS, PREFERRED_FOOT_LABELS } from '../domain/playerGeneration'
import { POSITION_FAMILIARITY_LABELS, calculateTacticalRating, getPositionFamiliarity, getPositionPenalty } from '../domain/positionFamiliarity'
import { calculateGeneralRating, getBestRatedPosition, getPlayerPositions, getRatingsByPosition } from '../domain/playerRatings'
import type { PlayerClubCompensation, PlayerFeePlan } from '../domain/playerFinance'
import { getPlayerFeeDetail } from '../domain/playerFinance'
import type { PlayerSeasonStats } from '../domain/gameState'
import type { TrainingPlayerState } from '../domain/trainingTypes'
import { getPlayerHappiness } from '../domain/trainingEngine'
import { getCoachRelationshipLabel, getConditionLabel, getFatigueLabel, getHappinessLabel, getTrainingSatisfactionLabel } from '../domain/humanState'
import { formatMatchRating, getAverageMatchRating, getFormLabel, getLastMatchRatings } from '../domain/playerPresentation'
import { StarRating } from './StarRating'
import './PlayerDetail.css'

const ATTRIBUTE_GROUPS: ReadonlyArray<readonly [string, ReadonlyArray<readonly [PlayerAttribute, string]>]> = [
  ['Portería', [['paradas', 'Paradas'], ['juegoPiesPortero', 'Juego de pies'], ['juegoAereoPortero', 'Juego aéreo']]],
  ['Mentales', [['comunicacion', 'Comunicación'], ['intensidad', 'Intensidad'], ['mentalidad', 'Mentalidad']]],
  ['Físicos', [['rapidez', 'Rapidez'], ['alcanceAereo', 'Alcance aéreo'], ['fuerza', 'Fuerza'], ['resistencia', 'Resistencia'], ['agilidad', 'Agilidad']]],
  ['Técnicos', [['tecnica', 'Técnica'], ['regate', 'Regate'], ['pases', 'Pases'], ['remate', 'Remate'], ['balonParado', 'Balón parado'], ['entradas', 'Entradas'], ['marcaje', 'Marcaje']]],
]

type PlayerDetailProps = { player: Player; onClose: () => void; currentTacticalPosition?: PlayerPosition; provisionalProgress?: ProvisionalAttributeProgress; playerFee?: PlayerFeePlan; playerCompensation?: PlayerClubCompensation; trainingState?: TrainingPlayerState; seasonStats?: PlayerSeasonStats; injured?: boolean }

export function PlayerDetail({ player, onClose, currentTacticalPosition, provisionalProgress, playerFee, playerCompensation, trainingState, seasonStats, injured = false }: PlayerDetailProps) {
  const naturalPositions = getPlayerPositions(player)
  const visibleAttributeGroups = naturalPositions.includes('POR') ? ATTRIBUTE_GROUPS.map(([group, attributes]) => group === 'Físicos' ? [group, attributes.filter(([key]) => key !== 'alcanceAereo')] as const : [group, attributes] as const) : ATTRIBUTE_GROUPS.filter(([, attributes]) => attributes[0][0] !== 'paradas')
  const ratings = getRatingsByPosition(player)
  const familiarity = currentTacticalPosition ? getPositionFamiliarity(player, currentTacticalPosition) : null
  const happiness = trainingState ? getPlayerHappiness(trainingState) : player.happiness
  const average = getAverageMatchRating(seasonStats)
  const latest = getLastMatchRatings(seasonStats)

  useEffect(() => { const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }; window.addEventListener('keydown', closeOnEscape); return () => window.removeEventListener('keydown', closeOnEscape) }, [onClose])

  return <div className="player-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
    <article className="player-detail" role="dialog" aria-modal="true" aria-labelledby="player-detail-title">
      <header className="player-detail-header"><div><h3 id="player-detail-title">{player.name}</h3><p>{naturalPositions.join('/')} · {player.age} años · {PREFERRED_FOOT_LABELS[player.preferredFoot]}</p>{player.clubStatus === 'TRIAL' && <span className="trial-player-badge">A prueba</span>}</div><button type="button" onClick={onClose} autoFocus>Volver</button></header>
      <section className="player-rating-summary">
        <div><span>Calidad general</span><strong><StarRating value={calculateGeneralRating(player)} /></strong></div><div><span>Forma</span><strong className="player-context-text">{getFormLabel(player.form)}</strong></div><div><span>Felicidad</span><strong className="player-context-text">{getHappinessLabel(happiness)}</strong></div><div><span>Mejor posición</span><strong>{getBestRatedPosition(player)}</strong></div>
        {currentTacticalPosition && <><div><span>Posición actual</span><strong>{currentTacticalPosition}</strong></div><div><span>Calidad en el puesto</span><strong><StarRating value={calculateTacticalRating(player, currentTacticalPosition)} /></strong></div><div><span>Familiaridad</span><strong className="player-context-text">{familiarity ? POSITION_FAMILIARITY_LABELS[familiarity] : ''}</strong></div><div><span>Adaptación</span><strong className="player-context-text">{getPositionPenalty(player, currentTacticalPosition) === 0 ? 'Natural' : 'Fuera de posición'}</strong></div></>}
        <ul>{naturalPositions.map((position) => <li key={position}><span>{position}</span><StarRating value={ratings[position] ?? 0} /></li>)}</ul>
      </section>
      <div className="player-state-sections">
        <section><h4>Estado físico</h4><dl><div><dt>Condición</dt><dd>{getConditionLabel(trainingState?.fitness ?? player.fitness)}</dd></div><div><dt>Cansancio</dt><dd>{trainingState ? getFatigueLabel(trainingState.fatigue) : '—'}</dd></div><div><dt>Disponibilidad</dt><dd>{injured ? 'Lesionado' : 'Disponible'}</dd></div></dl></section>
        <section><h4>Vestuario</h4><dl><div><dt>Felicidad</dt><dd>{getHappinessLabel(happiness)}</dd></div><div><dt>Relación contigo</dt><dd>{trainingState ? getCoachRelationshipLabel(trainingState.authorityWithCoach) : '—'}</dd></div><div><dt>Personalidad</dt><dd>{trainingState?.personality ?? player.personality}</dd></div><div><dt>Satisfacción entrenamientos</dt><dd>{trainingState ? getTrainingSatisfactionLabel(trainingState.happiness.training) : '—'}</dd></div></dl></section>
      </div>
      <section className="player-performance"><h4>Rendimiento esta temporada</h4><dl><div><dt>PJ</dt><dd>{seasonStats?.appearances ?? player.appearances}</dd></div><div><dt>Titular</dt><dd>{seasonStats?.starts ?? '—'}</dd></div><div><dt>Goles</dt><dd>{seasonStats?.goals ?? player.goals}</dd></div><div><dt>Valoración media</dt><dd>{average === null ? '—' : formatMatchRating(average)}</dd></div></dl><h5>Últimos 5</h5><p>{latest.length ? latest.map((item) => formatMatchRating(item.rating)).join(' · ') : '—'}</p></section>
      <section className="player-profile"><h4>Perfil: {player.archetype}</h4><p>{ARCHETYPE_DESCRIPTIONS[player.archetype] ?? 'Jugador con virtudes claras y margen para sorprender en el fútbol modesto.'}</p></section>
      {playerFee && <dl className="player-existing-data"><div><dt>Cuota del club</dt><dd>{getPlayerFeeDetail(playerFee, playerCompensation?.monthlyAmount)}</dd></div></dl>}
      <div className="attribute-groups">{visibleAttributeGroups.map(([group, attributes]) => <section key={group}><h4>{group}</h4><dl>{attributes.map(([key, label]) => { const progress = provisionalProgress?.[key] ?? 0; return <div key={key}><dt>{label}</dt><dd>{player.attributes[key]} {progress > 0 && (progress < 1 ? '↑' : `(+${Math.floor(progress)})`)}</dd></div> })}</dl></section>)}</div>
    </article>
  </div>
}
