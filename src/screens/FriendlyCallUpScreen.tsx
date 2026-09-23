import { useState } from 'react'
import type { GameState } from '../domain/gameState'
import type { LeagueMatch, Player } from '../domain/models'
import { getConditionLabel, getFatigueLabel } from '../domain/humanState'
import { getPlayerPositions } from '../domain/playerRatings'
import './FriendlyCallUpScreen.css'

function physicalStatus(game: GameState, player: Player) {
  if (game.injuredPlayerIds.includes(player.id)) return 'Lesionado'
  const state = game.training.players[player.id]
  if (!state) return 'Disponible'
  if (state.currentIssue) return 'Molestias'
  if (state.fatigue >= 65) return getFatigueLabel(state.fatigue)
  if (state.fitness < 45) return getConditionLabel(state.fitness)
  return 'Disponible'
}

export function FriendlyCallUpScreen({ gameState, match, players, onSend, onBack }: { gameState: GameState; match: LeagueMatch; players: Player[]; onSend: (ids: number[]) => string[]; onBack: () => void }) {
  const announced = gameState.squadSelections[match.id]
  const [selected, setSelected] = useState(() => announced?.playerIds ?? players.map((player) => player.id))
  const [errors, setErrors] = useState<string[]>([])
  return <section className="friendly-call-up-screen">
    <header><div><span>PRIMER AMISTOSO</span><h2>Preparar convocatoria</h2><p>Ya está todo preparado. Solo falta comunicar la convocatoria al equipo.</p></div><button type="button" onClick={onBack}>VOLVER</button></header>
    <div className="friendly-call-up-count">Convocados: <strong>{selected.length} de {players.length}</strong></div>
    <div className="friendly-call-up-list">{players.map((player) => <label key={player.id} className={selected.includes(player.id) ? 'is-selected' : ''}>
      <input type="checkbox" checked={selected.includes(player.id)} disabled={Boolean(announced)} onChange={() => setSelected((ids) => ids.includes(player.id) ? ids.filter((id) => id !== player.id) : [...ids, player.id])}/>
      <span className="player-position">{getPlayerPositions(player).join('/')}</span><strong>{player.name}</strong>{player.clubStatus === 'TRIAL' && <small>A PRUEBA</small>}<span>{physicalStatus(gameState, player)}</span>
    </label>)}</div>
    {errors.map((error) => <p className="friendly-call-up-error" key={error}>{error}</p>)}
    <button className="primary-action" type="button" disabled={Boolean(announced)} onClick={() => setErrors(onSend(selected))}>{announced ? 'CONVOCATORIA ENVIADA' : 'ENVIAR CONVOCATORIA'}</button>
  </section>
}
