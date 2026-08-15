import { useEffect } from 'react'
import type { Player, PlayerAttribute, PlayerPosition, ProvisionalAttributeProgress } from '../domain/models'
import { ARCHETYPE_DESCRIPTIONS, PREFERRED_FOOT_LABELS } from '../domain/playerGeneration'
import { POSITION_FAMILIARITY_LABELS, calculateTacticalRating, getPositionFamiliarity, getPositionPenalty } from '../domain/positionFamiliarity'
import { calculateGeneralRating, getBestRatedPosition, getPlayerPositions, getRatingsByPosition } from '../domain/playerRatings'
import './PlayerDetail.css'

const incomeFormatter = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })
const formatIncome = (income: number) => `${income > 0 ? '+' : ''}${incomeFormatter.format(income)}`
const ATTRIBUTE_GROUPS: ReadonlyArray<readonly [string, ReadonlyArray<readonly [PlayerAttribute, string]>]> = [
  ['Portería', [['paradas', 'Paradas'], ['juegoPiesPortero', 'Juego de pies'], ['juegoAereoPortero', 'Juego aéreo']]],
  ['Mentales', [['comunicacion', 'Comunicación'], ['intensidad', 'Intensidad'], ['mentalidad', 'Mentalidad']]],
  ['Físicos', [['rapidez', 'Rapidez'], ['alcanceAereo', 'Alcance aéreo'], ['fuerza', 'Fuerza'], ['resistencia', 'Resistencia'], ['agilidad', 'Agilidad']]],
  ['Técnicos', [['tecnica', 'Técnica'], ['regate', 'Regate'], ['pases', 'Pases'], ['remate', 'Remate'], ['balonParado', 'Balón parado'], ['entradas', 'Entradas'], ['marcaje', 'Marcaje']]],
]

type PlayerDetailProps = {
  player: Player
  onClose: () => void
  currentTacticalPosition?: PlayerPosition
  provisionalProgress?: ProvisionalAttributeProgress
}

export function PlayerDetail({ player, onClose, currentTacticalPosition, provisionalProgress }: PlayerDetailProps) {
  const naturalPositions = getPlayerPositions(player)
  const visibleAttributeGroups = naturalPositions.includes('POR')
    ? ATTRIBUTE_GROUPS.map(([group, attributes]) => group === 'Físicos'
      ? [group, attributes.filter(([key]) => key !== 'alcanceAereo')] as const
      : [group, attributes] as const)
    : ATTRIBUTE_GROUPS.filter(([, attributes]) => attributes[0][0] !== 'paradas')
  const ratings = getRatingsByPosition(player)
  const familiarity = currentTacticalPosition
    ? getPositionFamiliarity(player, currentTacticalPosition)
    : null

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [onClose])

  return <div className="player-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
    <article className="player-detail" role="dialog" aria-modal="true" aria-labelledby="player-detail-title">
      <header className="player-detail-header">
        <div><h3 id="player-detail-title">{player.name}</h3><p>{naturalPositions.join('/')} · {PREFERRED_FOOT_LABELS[player.preferredFoot]} · {player.age} años</p></div>
        <button type="button" onClick={onClose} autoFocus>Volver</button>
      </header>
      <section className="player-rating-summary">
        <div><span>Calidad General</span><strong>{Math.round(calculateGeneralRating(player))}</strong></div>
        <div><span>Mejor posición</span><strong>{getBestRatedPosition(player)}</strong></div>
        {currentTacticalPosition && <>
          <div><span>Posición actual</span><strong>{currentTacticalPosition}</strong></div>
          <div><span>Valoración actual</span><strong>{Math.round(calculateTacticalRating(player, currentTacticalPosition))}</strong></div>
          <div><span>Familiaridad</span><strong className="player-context-text">{familiarity ? POSITION_FAMILIARITY_LABELS[familiarity] : ''}</strong></div>
          <div><span>Penalización</span><strong className="player-context-text">{getPositionPenalty(player, currentTacticalPosition) === 0 ? 'Ninguna' : `-${getPositionPenalty(player, currentTacticalPosition)} a atributos relevantes`}</strong></div>
        </>}
        <ul>{naturalPositions.map((position) => <li key={position}><span>{position}</span> {Math.round(ratings[position] ?? 0)}</li>)}</ul>
      </section>
      <section className="player-profile"><h4>Perfil: {player.archetype}</h4><p>{ARCHETYPE_DESCRIPTIONS[player.archetype] ?? 'Jugador con virtudes claras y margen para sorprender en el fútbol modesto.'}</p></section>
      <dl className="player-existing-data">
        <div><dt>Forma</dt><dd>{player.form}</dd></div><div><dt>PJ</dt><dd>{player.appearances}</dd></div><div><dt>G</dt><dd>{player.goals}</dd></div>
        <div><dt>Personalidad</dt><dd>{player.personality}</dd></div><div><dt>Felicidad</dt><dd>{player.happiness}</dd></div><div><dt>Ingresos</dt><dd>{formatIncome(player.income)}</dd></div>
      </dl>
      <div className="attribute-groups">{visibleAttributeGroups.map(([group, attributes]) => <section key={group}><h4>{group}</h4><dl>{attributes.map(([key, label]) => { const progress = provisionalProgress?.[key] ?? 0; return <div key={key}><dt>{label}</dt><dd>{player.attributes[key]} {progress > 0 && (progress < 1 ? '↑' : `(+${Math.floor(progress)})`)}</dd></div> })}</dl></section>)}</div>
    </article>
  </div>
}
