import { useState } from 'react'
import { PlayerDetail } from '../components/PlayerDetail'
import { DressingRoomProblems } from '../components/DressingRoomProblems'
import { ChangeHistory } from '../components/ChangeHistory'
import { AlertItem, CompactIndicator, PlayerIdentity, PlayerSection, PlayerTable, SectionHeader, StatusBadge } from '../components/PlayerUi'
import { initialDressingRoomState } from '../data/dressingRoomData'
import { players } from '../data/mockData'
import {
  getAuthorityDescription, getAuthorityLabel,
  getCohesionDescription, getCohesionLabel,
  getDressingRoomSummary, getMoodDescription,
  getHappinessLabel,
} from '../domain/humanState'
import { getDressingRoomCommitments, getDressingRoomOverview, getDressingRoomPresentation, getDressingRoomProblems, ROOM_INFLUENCE_LABELS, ROOM_PRIORITY_LABELS } from '../domain/dressingRoomPresentation'
import type { Player } from '../domain/models'
import type { PlayerSeasonStats, PromiseState } from '../domain/gameState'
import { getTeamAuthority, getTeamHappiness } from '../domain/trainingEngine'
import type { TrainingGameState } from '../domain/trainingTypes'
import type { PlayerClubCompensation, PlayerFeePlan } from '../domain/playerFinance'
import { getTeamFeeSummary } from '../domain/playerFinance'
import './DressingRoomScreen.css'

type DressingRoomScreenProps = {
  cohesion: number; morale: number; trainingState: TrainingGameState
  playerFees: Record<number, PlayerFeePlan>; playerCompensations: Record<number, PlayerClubCompensation>
  playerSeasonStats: Record<number, PlayerSeasonStats>; injuredPlayerIds: number[]; onBack: () => void
  promises?: readonly PromiseState[]; onOpenSquad?: () => void
}

export function DressingRoomScreen({ cohesion, morale, trainingState, playerFees, playerCompensations, playerSeasonStats, injuredPlayerIds, onBack, promises = [], onOpenSquad }: DressingRoomScreenProps) {
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)
  const authority = getTeamAuthority(trainingState)
  const happiness = getTeamHappiness(trainingState)
  const playerById = new Map(players.map((player) => [player.id, player]))
  const { unhappyPlayers, issues } = getDressingRoomPresentation(initialDressingRoomState, trainingState)
  const feeSummary = getTeamFeeSummary(playerFees, playerCompensations)
  const problems = getDressingRoomProblems(initialDressingRoomState, trainingState, players, feeSummary, playerFees)
  const { watchPlayers, hierarchy, voices } = getDressingRoomOverview(initialDressingRoomState, trainingState, players, problems)
  const commitments = getDressingRoomCommitments(promises, players)

  return <section className="dressing-room-screen">
    <div className="management-theme dressing-room-dashboard">
      <header className="management-screen-header">
        <div><h2>Estado del vestuario</h2><p className="management-screen-description">{getDressingRoomSummary(cohesion, morale, authority, unhappyPlayers)}</p></div>
        <button className="management-back-button" type="button" onClick={onBack}>Panel del club →</button>
      </header>

      <section className="dressing-room-summary" aria-label="Resumen del vestuario">
        <CompactIndicator label="Cohesión" value={getCohesionLabel(cohesion)} level={cohesion} description={getCohesionDescription(cohesion)} icon="group" />
        <CompactIndicator label="Felicidad" value={getHappinessLabel(happiness)} level={happiness} description={getMoodDescription(happiness)} icon="mood" />
        <CompactIndicator label="Autoridad" value={getAuthorityLabel(authority)} level={authority} description={getAuthorityDescription(authority)} icon="authority" />
      </section>

      {issues.length > 0 && <section className="dressing-room-section" aria-label="Situación actual">
        <div className="dressing-room-issues">{issues.slice(0, 3).map((issue) => <AlertItem key={issue.id} title={issue.title} description={issue.description} tone={issue.severity} />)}</div>
      </section>}

      <div className="dressing-room-workspace">
        <section className="player-section dressing-room-roster club-sheet club-sheet--stacked club-sheet--taped">
          <div className="dressing-room-panel-heading">
            <SectionHeader title="Jugadores a seguir" icon="players" />
            {onOpenSquad && <button className="dressing-room-text-link" type="button" onClick={onOpenSquad}>Ver plantilla →</button>}
          </div>
          <PlayerTable className="dressing-room-table" label="Jugadores a seguir">
            <thead><tr><th scope="col">Jugador</th><th scope="col">Situación</th><th scope="col">Influencia</th><th scope="col">Prioridad</th></tr></thead>
            <tbody>{watchPlayers.map((entry) => {
              const player = playerById.get(entry.playerId)
              if (!player) return null
              return <tr key={player.id} className={selectedPlayer?.id === player.id ? 'is-selected' : undefined} onClick={() => setSelectedPlayer(player)}>
                <td><PlayerIdentity player={player} onSelect={() => setSelectedPlayer(player)} /></td>
                <td className="dressing-room-player-situation">{entry.situation}</td>
                <td>{ROOM_INFLUENCE_LABELS[entry.influence]}</td>
                <td><StatusBadge tone={entry.priority === 'SEVERE' ? 'negative' : entry.priority === 'RELEVANT' ? 'warning' : entry.priority === 'SUPPORT' ? 'positive' : 'info'}>{ROOM_PRIORITY_LABELS[entry.priority]}</StatusBadge></td>
              </tr>
            })}</tbody>
          </PlayerTable>
          {watchPlayers.length > 5 && <p className="dressing-room-roster-note">{watchPlayers.length} jugadores en seguimiento · Desplaza la lista para verlos todos</p>}
          {watchPlayers.length === 0 && <p className="management-empty">Ningún jugador requiere atención especial.</p>}
        </section>

        <DressingRoomProblems problems={problems} players={players} onSelectPlayer={setSelectedPlayer} compact maxVisible={3} />

        <PlayerSection title="Jerarquía del vestuario" icon="group" className="dressing-room-hierarchy club-sheet" scrollable>
          <ul>{hierarchy.map(group => <li key={group.influence}>
            <div><span>{group.label}</span><strong>{group.count}</strong></div>
            <meter min={0} max={players.length || 1} value={group.count} aria-label={group.label}>{group.count}</meter>
          </li>)}</ul>
        </PlayerSection>

        <PlayerSection title="Voces del vestuario" icon="voices" className="dressing-room-voices-panel club-sheet" scrollable>
          <div className="management-person-list">{voices.map((voice) => {
            const player = playerById.get(voice.playerId)
            return player && <article key={player.id}>
              <div className="dressing-room-voice-heading"><PlayerIdentity player={player} onSelect={() => setSelectedPlayer(player)} /><span>{voice.role}</span></div>
              <div className="management-person-context"><blockquote>“{voice.quote}”</blockquote></div>
            </article>
          })}{voices.length === 0 && <p className="management-empty">Ninguna voz destacada por ahora.</p>}</div>
        </PlayerSection>

        <PlayerSection title="Compromisos" icon="calendar" className="dressing-room-commitments club-sheet" scrollable>
          {commitments.length ? <>
            <ul className="dressing-room-commitment-list">{commitments.slice(0, 3).map(commitment => <li key={commitment.id}>
              <strong>{commitment.description}</strong>
              {commitment.playerId !== undefined && <button className="dressing-room-text-link" type="button" onClick={() => setSelectedPlayer(playerById.get(commitment.playerId!) ?? null)}>{playerById.get(commitment.playerId)?.name}</button>}
              <small>{commitment.deadline}</small>
            </li>)}</ul>
            {commitments.length > 3 && <details className="dressing-room-more-commitments"><summary>Ver {commitments.length - 3} compromisos más</summary><ul className="dressing-room-commitment-list">{commitments.slice(3).map(commitment => <li key={commitment.id}><strong>{commitment.description}</strong><small>{commitment.playerId !== undefined && `${playerById.get(commitment.playerId)?.name} · `}{commitment.deadline}</small></li>)}</ul></details>}
          </> : <p className="management-empty">No tienes compromisos pendientes con jugadores.</p>}
        </PlayerSection>

        <ChangeHistory changes={initialDressingRoomState.changes.slice(0, 3)} className="dressing-room-history club-sheet" compact scrollable />
      </div>
    </div>
    {selectedPlayer && <PlayerDetail player={selectedPlayer} trainingState={trainingState.players[selectedPlayer.id]} seasonStats={playerSeasonStats[selectedPlayer.id]} injured={injuredPlayerIds.includes(selectedPlayer.id)} playerFee={selectedPlayer.clubStatus === 'TRIAL' ? undefined : playerFees[selectedPlayer.id]} playerCompensation={selectedPlayer.clubStatus === 'TRIAL' ? undefined : playerCompensations[selectedPlayer.id]} onClose={() => setSelectedPlayer(null)} />}
  </section>
}
