import { PageTitle } from '../components/ClubUi'
import { useState } from 'react'
import { PlayerDetail } from '../components/PlayerDetail'
import { ManagementIcon } from '../components/ManagementIcon'
import { TacticalDrag } from '../components/TacticalDrag'
import { TacticalBoard, TacticalInstructions, LineupList, TacticalSummary, type TacticalPlayerView, type TacticalSelection } from '../components/TacticalWorkspace'
import { players } from '../data/mockData'
import type { Player, TacticalPlan } from '../domain/models'
import { FORMATION_SLOTS } from '../domain/matchTactics'
import { getPositionFamiliarity, POSITION_FAMILIARITY_LABELS } from '../domain/positionFamiliarity'
import { calculateGeneralRating, getPlayerPositions } from '../domain/playerRatings'
import { calculateOverallFamiliarity } from '../domain/trainingEngine'
import type { PlayerEligibility } from '../domain/squadSelection'
import { getTacticalCardIndicators, getTacticalPositionFit, getTacticsSquad } from '../presentation/tacticalPlayerPresentation'
import type { TrainingGameState } from '../domain/trainingTypes'
import type { StaffPerson } from '../domain/staff'
import { createAssistantLineupProposal, type AssistantLineupProposal } from '../domain/assistantLineup'
import { getLineupSource, moveAvailableLineupPlayer, type LineupSource } from '../domain/tacticalLineup'
import './TacticsScreen.css'
import './TacticsWorkspaceScreen.css'

type Props = {
  onBack: () => void; tacticalPlan: TacticalPlan; onTacticalPlanChange: (plan: TacticalPlan) => void
  lineupIds: number[]; onLineupChange: (ids: number[]) => void; trainingState: TrainingGameState
  staffMembers?: StaffPerson[]; seed?: number; preseason?: boolean; selectablePlayerIds?: number[]
  injuredPlayerIds?: number[]; onOpenPlayer?: (id: number) => void
  eligibility?: Record<number, PlayerEligibility>; seasonLabel?: string; showTitle?: boolean
}

export function TacticsScreen({ onBack, tacticalPlan, onTacticalPlanChange, lineupIds, onLineupChange, trainingState, staffMembers = [], seed = 0, preseason = false, selectablePlayerIds, injuredPlayerIds = [], eligibility, onOpenPlayer, showTitle = true }: Props) {
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null)
  const [proposal, setProposal] = useState<AssistantLineupProposal | null>(null)
  const [lineupError, setLineupError] = useState<string>()
  const assistant = staffMembers.find(member => member.role === 'SEGUNDO_ENTRENADOR' && member.isUsuallyAvailable)
  const slots = FORMATION_SLOTS[tacticalPlan.formation]
  const { starters, bench, candidates } = getTacticsSquad(players, lineupIds, selectablePlayerIds)
  const selectablePlayers = selectablePlayerIds ? players.filter(player => selectablePlayerIds.includes(player.id)) : players
  const availablePlayers = selectablePlayers.filter(player => eligibility?.[player.id]?.eligible !== false)
  const selectedPlayer = players.find(player => player.id === selectedPlayerId)
  const selection: TacticalSelection = selectedPlayerId === null ? null : getLineupSource(selectedPlayerId, lineupIds)

  const playerEligibility = (player: Player): PlayerEligibility | undefined => selectablePlayerIds && !selectablePlayerIds.includes(player.id)
    ? { playerId: player.id, eligible: false, status: 'UNAVAILABLE', reason: 'No convocado para este partido' }
    : eligibility?.[player.id]
  const context = (player: Player) => ({ injured: injuredPlayerIds.includes(player.id), eligibility: playerEligibility(player) })
  const view = (player: Player, slot?: number): TacticalPlayerView => ({
    id: player.id, name: player.name, shirtNumber: player.shirtNumber, positions: getPlayerPositions(player).join(' · '),
    primaryPosition: player.primaryPosition, secondaryPositions: player.secondaryPositions,
    positionFit: slot === undefined ? undefined : getTacticalPositionFit(player, slots[slot]),
    secondary: slot === undefined ? undefined : POSITION_FAMILIARITY_LABELS[getPositionFamiliarity(player, slots[slot])],
    unavailable: playerEligibility(player)?.eligible === false,
    generalRating: calculateGeneralRating({ ...player, attributes: trainingState.players[player.id]?.baseAttributes ?? player.attributes }),
    cardIndicators: getTacticalCardIndicators(player, trainingState.players[player.id], context(player)),
  })

  const sourcePlayer = (source: LineupSource) => players.find(player => player.id === (source.group === 'field' ? lineupIds[source.slot] : source.playerId))
  const previewMove = (source: LineupSource, target: LineupSource) => moveAvailableLineupPlayer(lineupIds, source, target, slots, selectablePlayers, eligibility)
  const movePlayer = (source: LineupSource, target: LineupSource, nextSelectedId = sourcePlayer(source)?.id) => {
    const result = previewMove(source, target)
    setLineupError(result.error)
    if (!result.error) onLineupChange(result.lineupIds)
    setSelectedPlayerId(nextSelectedId ?? null)
  }
  const selectField = (slot: number) => {
    if (selection?.group === 'reserve' || (selection?.group === 'field' && selection.slot !== slot)) return movePlayer(selection, { group: 'field', slot }, lineupIds[slot])
    setSelectedPlayerId(selectedPlayerId === lineupIds[slot] ? null : lineupIds[slot] ?? null)
    setLineupError(undefined)
  }
  const selectReserve = (id: number) => {
    if (selection?.group === 'field') return movePlayer(selection, { group: 'reserve', playerId: id }, id)
    setSelectedPlayerId(selectedPlayerId === id ? null : id)
    setLineupError(undefined)
  }
  const changePlan = (plan: TacticalPlan) => { onTacticalPlanChange(plan); setLineupError(undefined) }
  const dropFeedback = (source: LineupSource, target: LineupSource) => {
    if (source.group === 'reserve' && target.group === 'reserve') return 'invalid' as const
    if (previewMove(source, target).error) return 'invalid' as const
    const player = sourcePlayer(target.group === 'field' ? source : target)
    const slot = target.group === 'field' ? target.slot : source.group === 'field' ? source.slot : undefined
    return player && slot !== undefined ? getTacticalPositionFit(player, slots[slot]).tone : 'compatible' as const
  }

  return <section className="tactics-screen tactics-screen--visual">
    {showTitle && <PageTitle className="tactics-header" title="Tácticas" subtitle={<TacticalSummary plan={tacticalPlan} />} actions={<button className="screen-back-button" type="button" onClick={onBack}>← Panel del club</button>} />}
    {proposal && <section className="assistant-lineup-preview" aria-label="Propuesta del segundo"><div><h3>{proposal.assistantName} propone {proposal.plan.formation}</h3>{proposal.reasons.map(reason => <p key={reason}>{reason}</p>)}<p>{proposal.lineupIds.map(id => players.find(player => player.id === id)?.name.split(' ')[0]).join(' · ')}</p></div><div className="assistant-proposal-actions">
      <button type="button" onClick={() => setProposal(null)}>CANCELAR</button><button className="primary-action" type="button" onClick={() => { onTacticalPlanChange(proposal.plan); onLineupChange(proposal.lineupIds); setSelectedPlayerId(null); setLineupError(undefined); setProposal(null) }}>APLICAR</button></div></section>}
    <TacticalDrag onMove={movePlayer} feedback={dropFeedback} getPlayer={source => { const player = sourcePlayer(source); return player ? view(player) : undefined }}>
      <TacticalInstructions grouped plan={tacticalPlan} onChange={changePlan} familiarity={calculateOverallFamiliarity(trainingState.familiarity, tacticalPlan)} assistant={assistant && <section className="assistant-lineup-proposal"><ManagementIcon name="staff" /><div><span>OPINIÓN DEL SEGUNDO</span><strong>Propuesta de {assistant.name.split(' ')[0]}</strong></div>
      <button type="button" disabled={availablePlayers.length < 11} title={availablePlayers.length < 11 ? 'Se necesitan once jugadores disponibles para preparar una propuesta.' : undefined}
        onClick={() => setProposal(createAssistantLineupProposal(assistant, availablePlayers, trainingState, tacticalPlan, seed, preseason))}>VER PROPUESTA</button></section>} />
      <section className="tactics-field-section" aria-label="Once inicial">
        <div className="tactics-pitch-viewport club-board-mount"><TacticalBoard variant="cards" formation={tacticalPlan.formation} players={starters.map((player, index) => player ? view(player, index) : undefined)} selection={selection} onSelect={selectField} onDeselect={() => setSelectedPlayerId(null)} onOpenPlayer={onOpenPlayer} /><div className="club-chalk-tray" aria-hidden="true"><span className="club-eraser" /><span className="club-chalk-stick" /></div></div>
        <p className="tactics-selection-hint" aria-live="polite">{selection ? 'Elige otro jugador para intercambiar · Campo vacío para cancelar' : 'Arrastra o selecciona dos jugadores para intercambiar'}</p>
        {lineupError && <p className="tactics-selection-error" role="alert">{lineupError}</p>}
      </section>
      <div className="tactics-right-column club-sheet club-sheet--clipboard">
        {selectedPlayer && <PlayerDetail variant="summary" player={selectedPlayer} trainingState={trainingState.players[selectedPlayer.id]} cardIndicators={getTacticalCardIndicators(selectedPlayer, trainingState.players[selectedPlayer.id], context(selectedPlayer))}
          currentTacticalPosition={slots[lineupIds.indexOf(selectedPlayer.id)]} onClose={() => setSelectedPlayerId(null)} onOpenFull={onOpenPlayer ? () => onOpenPlayer(selectedPlayer.id) : undefined} />}
        <LineupList formation={tacticalPlan.formation} starters={starters.map((player, index) => player ? view(player, index) : undefined)} bench={bench.map(player => view(player))}
          candidates={candidates.map(player => view(player))} selection={selection} announced={Boolean(selectablePlayerIds)} onSelectField={selectField} onSelectReserve={selectReserve} onOpenPlayer={onOpenPlayer} />
      </div>
    </TacticalDrag>
  </section>
}
