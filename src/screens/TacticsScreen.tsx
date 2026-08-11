import { useState } from 'react'
import { PlayerDetail } from '../components/PlayerDetail'
import { players, tactics } from '../data/mockData'
import type { Player, PlayerPosition } from '../domain/models'
import { calculateTacticalRating, getPositionFamiliarity } from '../domain/positionFamiliarity'
import { calculateGeneralRating, getPlayerPositions } from '../domain/playerRatings'
import './TacticsScreen.css'

const formations = ['4-4-2', '4-3-3', '4-2-3-1', '3-5-2', '5-4-1'] as const
type Formation = (typeof formations)[number]
type FormationSlot = { position: PlayerPosition; x: number; y: number }

const formationLayouts: Record<Formation, FormationSlot[]> = {
  '4-4-2': [
    { position: 'POR', x: 50, y: 91 },
    { position: 'LD', x: 84, y: 73 },
    { position: 'DFC', x: 61, y: 79 },
    { position: 'DFC', x: 39, y: 79 },
    { position: 'LI', x: 16, y: 73 },
    { position: 'MC', x: 61, y: 49 },
    { position: 'MC', x: 39, y: 49 },
    { position: 'MD', x: 84, y: 43 },
    { position: 'DC', x: 38, y: 17 },
    { position: 'MI', x: 16, y: 43 },
    { position: 'DC', x: 62, y: 17 },
  ],
  '4-3-3': [
    { position: 'POR', x: 50, y: 91 },
    { position: 'LD', x: 84, y: 73 },
    { position: 'DFC', x: 61, y: 79 },
    { position: 'DFC', x: 39, y: 79 },
    { position: 'LI', x: 16, y: 73 },
    { position: 'MC', x: 50, y: 53 },
    { position: 'MC', x: 30, y: 47 },
    { position: 'ED', x: 82, y: 19 },
    { position: 'MC', x: 70, y: 47 },
    { position: 'EI', x: 18, y: 19 },
    { position: 'DC', x: 50, y: 15 },
  ],
  '4-2-3-1': [
    { position: 'POR', x: 50, y: 91 },
    { position: 'LD', x: 84, y: 73 },
    { position: 'DFC', x: 61, y: 79 },
    { position: 'DFC', x: 39, y: 79 },
    { position: 'LI', x: 16, y: 73 },
    { position: 'MC', x: 63, y: 56 },
    { position: 'MC', x: 37, y: 56 },
    { position: 'ED', x: 82, y: 34 },
    { position: 'MP', x: 50, y: 36 },
    { position: 'EI', x: 18, y: 34 },
    { position: 'DC', x: 50, y: 14 },
  ],
  '3-5-2': [
    { position: 'POR', x: 50, y: 91 },
    { position: 'CAD', x: 86, y: 48 },
    { position: 'DFC', x: 70, y: 75 },
    { position: 'DFC', x: 50, y: 79 },
    { position: 'DFC', x: 30, y: 75 },
    { position: 'MC', x: 67, y: 49 },
    { position: 'MC', x: 50, y: 53 },
    { position: 'MC', x: 33, y: 49 },
    { position: 'DC', x: 62, y: 17 },
    { position: 'CAI', x: 14, y: 48 },
    { position: 'DC', x: 38, y: 17 },
  ],
  '5-4-1': [
    { position: 'POR', x: 50, y: 91 },
    { position: 'LD', x: 88, y: 72 },
    { position: 'DFC', x: 69, y: 78 },
    { position: 'DFC', x: 50, y: 81 },
    { position: 'LI', x: 12, y: 72 },
    { position: 'DFC', x: 31, y: 78 },
    { position: 'MC', x: 39, y: 49 },
    { position: 'MD', x: 84, y: 43 },
    { position: 'MC', x: 61, y: 49 },
    { position: 'MI', x: 16, y: 43 },
    { position: 'DC', x: 50, y: 16 },
  ],
}

type TacticsScreenProps = { onBack: () => void }
type PlayerSelection =
  | { group: 'field'; slot: number }
  | { group: 'reserve'; playerId: number }
  | null
type OptionGroupProps = {
  label: string
  options: readonly string[]
  value: string
  onChange: (value: string) => void
}

function OptionGroup({ label, options, value, onChange }: OptionGroupProps) {
  return (
    <fieldset className="tactics-option-group">
      <legend>{label}</legend>
      <div className="tactics-segmented-control">
        {options.map((option) => (
          <button
            className={option === value ? 'is-selected' : ''}
            key={option}
            type="button"
            aria-pressed={option === value}
            onClick={() => onChange(option)}
          >
            {option}
          </button>
        ))}
      </div>
    </fieldset>
  )
}

export function TacticsScreen({ onBack }: TacticsScreenProps) {
  const [formation, setFormation] = useState<Formation>('4-4-2')
  const [lineupIds, setLineupIds] = useState(() => [...tactics.startingEleven])
  const [selection, setSelection] = useState<PlayerSelection>(null)
  const [detail, setDetail] = useState<{ player: Player; position?: PlayerPosition } | null>(null)
  const [mentality, setMentality] = useState('Equilibrada')
  const [passingStyle, setPassingStyle] = useState('Mixto')
  const [tempo, setTempo] = useState('Medio')
  const [afterRecovery, setAfterRecovery] = useState('Equilibrada')
  const [pressingHeight, setPressingHeight] = useState('Media')
  const [pressingIntensity, setPressingIntensity] = useState('Media')
  const [afterLoss, setAfterLoss] = useState('Mixto')
  const [timeWasting, setTimeWasting] = useState('No')
  const [aggression, setAggression] = useState('No')
  const startingPlayers = lineupIds
    .map((id) => players.find((player) => player.id === id))
    .filter((player) => player !== undefined)
  const reservePlayers = players.filter((player) => !lineupIds.includes(player.id))
  const activeLayout = formationLayouts[formation]

  function swapPlayer(slot: number, reserveId: number) {
    setLineupIds((currentLineup) =>
      currentLineup.map((id, index) => index === slot ? reserveId : id),
    )
    setSelection(null)
  }

  function selectFieldPlayer(slot: number) {
    if (selection?.group === 'reserve') {
      swapPlayer(slot, selection.playerId)
      return
    }

    if (selection?.group === 'field') {
      if (selection.slot === slot) {
        setSelection(null)
        return
      }
      setLineupIds((currentLineup) => {
        const nextLineup = [...currentLineup]
        ;[nextLineup[selection.slot], nextLineup[slot]] = [nextLineup[slot], nextLineup[selection.slot]]
        return nextLineup
      })
      setSelection(null)
      return
    }

    setSelection({ group: 'field', slot })
  }

  function selectReservePlayer(playerId: number) {
    if (selection?.group === 'field') {
      swapPlayer(selection.slot, playerId)
      return
    }

    setSelection({ group: 'reserve', playerId })
  }

  function getNaturalPositions(playerId: number, fallbackPosition: string) {
    const player = players.find((candidate) => candidate.id === playerId)
    return player ? getPlayerPositions(player).join('/') : fallbackPosition
  }

  return (
    <section className="tactics-screen">
      <header className="tactics-header screen-header">
        <button className="screen-back-button" type="button" onClick={onBack}>← Panel del club</button>
        <h2>Táctica</h2>
      </header>

      <div className="tactics-layout">
        <aside className="tactics-panel tactics-formations">
          <h3>Formación</h3>
          <div className="formation-options">
            {formations.map((option) => (
              <label key={option}>
                <input type="radio" name="formation" checked={formation === option} onChange={() => setFormation(option)} />
                {option}
              </label>
            ))}
          </div>
        </aside>

        <section className="tactics-pitch-zone">
          <div className="pitch-area">
            <div className="football-pitch" aria-label={`Once titular en formación ${formation}`}>
              <div className="pitch-circle" />
              <div className="pitch-halfway-line" />
              <div className="penalty-area penalty-area-top" />
              <div className="penalty-area penalty-area-bottom" />
              {startingPlayers.map((player, index) => {
                const tacticalPosition = activeLayout[index].position
                const familiarity = getPositionFamiliarity(player, tacticalPosition)
                const tacticalRating = Math.round(calculateTacticalRating(player, tacticalPosition))
                const isOutOfPosition = familiarity !== 'NATURAL'
                return <div
                  className={`pitch-player${selection?.group === 'field' && selection.slot === index ? ' is-selected' : ''}`}
                  key={player.id}
                  style={{ left: `${activeLayout[index].x}%`, top: `${activeLayout[index].y}%` }}
                >
                  <button className="pitch-player-select" type="button" aria-label={`${player.name}, posición táctica ${tacticalPosition}, valoración ${tacticalRating}${isOutOfPosition ? ', fuera de posición' : ''}, posición natural ${getNaturalPositions(player.id, player.primaryPosition)}`} aria-pressed={selection?.group === 'field' && selection.slot === index} onClick={() => selectFieldPlayer(index)}>
                    <span>{tacticalPosition}</span>
                    <strong>{player.name.split(' ')[0]} <b>{tacticalRating}{isOutOfPosition && <span className="out-of-position-marker" aria-hidden="true"> ↓</span>}</b></strong>
                    <small>{getNaturalPositions(player.id, player.primaryPosition)}</small>
                  </button>
                  <button className="player-detail-trigger" type="button" aria-label={`Abrir ficha de ${player.name}`} title="Abrir ficha" onClick={() => setDetail({ player, position: tacticalPosition })}>i</button>
                </div>
              })}
            </div>
          </div>

          <aside className="reserve-players" aria-label="Jugadores fuera del once">
            <div className="reserve-players-header">
              <h3>Resto de la plantilla</h3>
              <p>
                {selection?.group === 'field'
                  ? `Elige quién ocupará el slot ${activeLayout[selection.slot].position}.`
                  : selection?.group === 'reserve'
                    ? 'Elige el titular con quien intercambiarlo.'
                    : 'Selecciona un jugador del campo o de esta lista.'}
              </p>
            </div>
            <div className="reserve-player-list">
              {reservePlayers.map((player) => (
                <div
                  className={`reserve-player${selection?.group === 'reserve' && selection.playerId === player.id ? ' is-selected' : ''}`}
                  key={player.id}
                >
                <button
                  className="reserve-player-select"
                  type="button"
                  aria-pressed={selection?.group === 'reserve' && selection.playerId === player.id}
                  onClick={() => selectReservePlayer(player.id)}
                >
                  <span>{player.name} <b>{Math.round(calculateGeneralRating(player))}</b></span>
                  <small>{getNaturalPositions(player.id, player.primaryPosition)}</small>
                </button>
                <button className="player-detail-trigger" type="button" aria-label={`Abrir ficha de ${player.name}`} title="Abrir ficha" onClick={() => setDetail({ player })}>i</button>
                </div>
              ))}
            </div>
          </aside>
        </section>

        <div className="tactics-controls">
          <section className="tactics-panel tactics-with-ball">
            <h3>Con balón</h3>
            <OptionGroup label="Mentalidad" options={['Ofensiva', 'Equilibrada', 'Cauta']} value={mentality} onChange={setMentality} />
            <OptionGroup label="Estilo de pase" options={['En corto', 'Mixto', 'Directo']} value={passingStyle} onChange={setPassingStyle} />
            <OptionGroup label="Ritmo" options={['Alto', 'Medio', 'Bajo']} value={tempo} onChange={setTempo} />
            <OptionGroup label="Tras recuperación" options={['Contraataque', 'Equilibrada', 'Mantener posición']} value={afterRecovery} onChange={setAfterRecovery} />
          </section>

          <section className="tactics-panel tactics-without-ball">
            <h3>Sin balón</h3>
            <OptionGroup label="Altura de presión" options={['Alta', 'Media', 'Baja']} value={pressingHeight} onChange={setPressingHeight} />
            <OptionGroup label="Intensidad de presión" options={['Alta', 'Media', 'Baja']} value={pressingIntensity} onChange={setPressingIntensity} />
            <OptionGroup label="Tras pérdida" options={['Presión tras pérdida', 'Mixto', 'Repliegue']} value={afterLoss} onChange={setAfterLoss} />
            <OptionGroup label="Perder tiempo" options={['Sí', 'No']} value={timeWasting} onChange={setTimeWasting} />
            <OptionGroup label="Ser agresivos" options={['Sí', 'No']} value={aggression} onChange={setAggression} />
          </section>
        </div>
      </div>
      {detail && <PlayerDetail player={detail.player} currentTacticalPosition={detail.position} onClose={() => setDetail(null)} />}
    </section>
  )
}
