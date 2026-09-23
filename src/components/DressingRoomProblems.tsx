import { useState } from 'react'
import type { Player } from '../domain/models'
import { DRESSING_ROOM_PROBLEM_SEVERITY_LABELS, type DressingRoomProblem } from '../domain/dressingRoomPresentation'
import { PlayerIdentity, PlayerTable, SectionHeader, StatusBadge } from './PlayerUi'
import './DressingRoomProblems.css'

type DressingRoomProblemsProps = {
  problems: DressingRoomProblem[]
  players: readonly Player[]
  onSelectPlayer: (player: Player) => void
  compact?: boolean
  maxVisible?: number
}

export function DressingRoomProblems({ problems, players, onSelectPlayer, compact = false, maxVisible }: DressingRoomProblemsProps) {
  const [expanded, setExpanded] = useState(false)
  const playerById = new Map(players.map((player) => [player.id, player]))
  const visibleProblems = compact && !expanded && maxVisible ? problems.slice(0, maxVisible) : problems

  return <section className={`player-section dressing-room-problems${compact ? ' dressing-room-problems--compact club-sheet' : ''}`} aria-labelledby="dressing-room-problems-title">
    <SectionHeader id="dressing-room-problems-title" title="Problemas" icon="alert" count={problems.length || undefined} />
    {problems.length === 0 ? <p className="management-empty">No hay problemas relevantes ahora mismo.</p> : compact ? <div className="dressing-room-problems-scroll" tabIndex={0} role="region" aria-label="Problemas activos del vestuario">
      <ul className="dressing-room-problem-list">{visibleProblems.map((problem) => {
        const player = problem.playerId === undefined ? undefined : playerById.get(problem.playerId)
        return <li key={problem.id}>
          <div className="dressing-room-problem-heading">
            {player ? <button type="button" onClick={() => onSelectPlayer(player)}>{player.name}</button> : <strong>Vestuario</strong>}
            <StatusBadge tone={problem.severity === 'SEVERE' ? 'negative' : problem.severity === 'RELEVANT' ? 'warning' : 'info'}>{problem.severity === 'MINOR' ? 'Baja' : DRESSING_ROOM_PROBLEM_SEVERITY_LABELS[problem.severity]}</StatusBadge>
          </div>
          <p>{problem.subject}<span className="dressing-room-problem-state"> · {problem.status}</span></p>
        </li>
      })}</ul>
    </div> : <PlayerTable className="dressing-room-problems-table" label="Problemas activos del vestuario">
      <thead><tr><th scope="col">Severidad</th><th scope="col">Jugador</th><th scope="col">Asunto</th><th scope="col">Estado</th></tr></thead>
      <tbody>{problems.map((problem) => {
        const player = problem.playerId === undefined ? undefined : playerById.get(problem.playerId)
        return <tr key={problem.id}>
          <td><StatusBadge tone={problem.severity === 'SEVERE' ? 'negative' : problem.severity === 'RELEVANT' ? 'warning' : 'neutral'}>{DRESSING_ROOM_PROBLEM_SEVERITY_LABELS[problem.severity]}</StatusBadge></td>
          <td>{player ? <PlayerIdentity player={player} onSelect={() => onSelectPlayer(player)} /> : 'Vestuario'}</td>
          <td className="dressing-room-problem-subject">{problem.subject}</td>
          <td className="dressing-room-problem-state">{problem.status}</td>
        </tr>
      })}</tbody>
    </PlayerTable>}
    {compact && maxVisible && problems.length > maxVisible && <button className="dressing-room-text-link dressing-room-problems-toggle" type="button" aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>{expanded ? 'Ver menos' : `Ver todas las incidencias (${problems.length})`}</button>}
  </section>
}
