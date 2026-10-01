import { PageTitle } from '../components/ClubUi'
import { useState } from 'react'
import { ClubPlayerFile } from '../components/ClubPlayerFile'
import { PlayerTable } from '../components/PlayerUi'
import { PlayerRow } from '../components/PlayerRow'
import { ManagementIcon } from '../components/ManagementIcon'
import { players } from '../data/mockData'
import type { PlayerSeasonStats } from '../domain/gameState'
import type { PlayerClubCompensation, PlayerFeePlan } from '../domain/playerFinance'
import type { PlayerEligibility } from '../domain/squadSelection'
import type { TrainingGameState } from '../domain/trainingTypes'
import { filterAndSortSquad, getPlayerStatus, getTrainingObservations, POSITION_LABELS, type SquadSort } from '../presentation/playerPresentation'
import './TeamScreen.css'

type TeamScreenProps = { playerSeasonStats: Record<number, PlayerSeasonStats>; trainingState: TrainingGameState; injuredPlayerIds: number[]; playerFees: Record<number, PlayerFeePlan>; playerCompensations: Record<number, PlayerClubCompensation>; eligibility?: Record<number, PlayerEligibility>; seasonLabel?: string; onBack: () => void; onOpenPlayer?: (id: number) => void }

export function TeamScreen({ playerSeasonStats, trainingState, injuredPlayerIds, playerFees, playerCompensations, eligibility, seasonLabel, onBack, onOpenPlayer }: TeamScreenProps) {
  const [selectedId, setSelectedId] = useState(players[0]?.id)
  const [position, setPosition] = useState('')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SquadSort>('position')
  const visiblePlayers = filterAndSortSquad(players, position, search, sort, playerSeasonStats)
  // A search never closes the inspector or resets selection.
  const selectedPlayer = players.find(player => player.id === selectedId) ?? players[0]
  const statusFor = (player: typeof players[number]) => getPlayerStatus(player, trainingState.players[player.id], { injured: injuredPlayerIds.includes(player.id), eligibility: eligibility?.[player.id], observations: getTrainingObservations(trainingState, player.id) })
  return <section className="team-screen">
    <PageTitle className="team-wall-title" title="Plantilla" subtitle={<>{players.length} jugadores{visiblePlayers.length !== players.length && (" · " + visiblePlayers.length + " visibles")}</>} actions={<button type="button" className="screen-back-button team-back-button" onClick={onBack}>← Volver al Panel del Club</button>} />
    <div className="team-filter-bar">
      <div className="team-filters">
        <select aria-label="Filtrar por posición" value={position} onChange={event => setPosition(event.target.value)}><option value="">Todas las posiciones</option>{Object.entries(POSITION_LABELS).map(([id, label]) => <option key={id} value={id}>{id} · {label}</option>)}</select>
        <select aria-label="Ordenar plantilla" value={sort} onChange={event => setSort(event.target.value as SquadSort)}><option value="position">Orden: Posición</option><option value="name">Orden: Nombre</option><option value="age">Orden: Edad</option><option value="appearances">Orden: Partidos</option><option value="minutes">Orden: Minutos</option><option value="goals">Orden: Goles</option></select>
        <label className="team-search"><ManagementIcon name="search" /><input type="search" aria-label="Buscar jugador" placeholder="Buscar jugador…" value={search} onChange={event => setSearch(event.target.value)} /></label>
      </div>
    </div>
    <div className="team-workspace">
      <div className="team-roster club-sheet"><PlayerTable className="team-table" label="Tabla de jugadores del equipo">
        <colgroup>{['number', 'name', 'positions', 'age', 'played', 'minutes', 'goals', 'happiness', 'status', 'notes'].map(name => <col key={name} className={`column-${name}`} />)}</colgroup>
        <thead><tr><th scope="col">Nº</th><th scope="col">Nombre</th><th scope="col">Posiciones</th><th scope="col" className="is-numeric">Edad</th><th scope="col" className="is-numeric" title="Partidos jugados (titularidades)">PJ(TIT)</th><th scope="col" className="is-numeric">Min</th><th scope="col" className="is-numeric">G</th><th scope="col" className="is-numeric">Felicidad</th><th scope="col">Estado</th><th scope="col">Observaciones</th></tr></thead>
        <tbody>{visiblePlayers.map(player => <PlayerRow key={player.id} player={player} stats={playerSeasonStats[player.id]} training={trainingState.players[player.id]} status={statusFor(player)} selected={player.id === selectedPlayer?.id} onSelect={() => setSelectedId(player.id)} onOpenPlayer={onOpenPlayer} />)}</tbody>
      </PlayerTable>
      {visiblePlayers.length === 0 && <div className="team-empty"><p>No hay jugadores con estos filtros.</p><button type="button" onClick={() => { setPosition(''); setSearch('') }}>Limpiar filtros</button></div>}
      <footer className="team-table-note">PJ(TIT): partidos y titularidades · Estadísticas de Liga · — Dato sin registrar</footer></div>
      {selectedPlayer && <ClubPlayerFile key={selectedPlayer.id} variant="inline" onOpenFull={onOpenPlayer ? () => onOpenPlayer(selectedPlayer.id) : undefined} player={selectedPlayer} trainingState={trainingState.players[selectedPlayer.id]} seasonStats={playerSeasonStats[selectedPlayer.id]} status={statusFor(selectedPlayer)} seasonLabel={seasonLabel} playerFee={selectedPlayer.clubStatus === 'TRIAL' ? undefined : playerFees[selectedPlayer.id]} playerCompensation={selectedPlayer.clubStatus === 'TRIAL' ? undefined : playerCompensations[selectedPlayer.id]} />}
    </div>
  </section>
}
