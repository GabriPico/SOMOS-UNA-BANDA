import { useState } from 'react'
import { PlayerDetail } from '../components/PlayerDetail'
import { TacticalBoard, TacticalInstructions, TacticalSquadList, TacticalSummary, type TacticalPlayerView, type TacticalSelection } from '../components/TacticalWorkspace'
import { players } from '../data/mockData'
import type { Player, PlayerPosition, TacticalPlan } from '../domain/models'
import { FORMATION_SLOTS } from '../domain/matchTactics'
import { calculateTacticalRating, getPositionFamiliarity, POSITION_FAMILIARITY_LABELS } from '../domain/positionFamiliarity'
import { calculateGeneralRating, getPlayerPositions } from '../domain/playerRatings'
import { calculateOverallFamiliarity, getEffectiveMatchAttributes } from '../domain/trainingEngine'
import type { TrainingGameState } from '../domain/trainingTypes'
import './TacticsScreen.css'
import './TacticsWorkspaceScreen.css'
import type { StaffPerson } from '../domain/staff'
import { createAssistantLineupProposal, type AssistantLineupProposal } from '../domain/assistantLineup'
import { moveLineupPlayer, type LineupSource } from '../domain/tacticalLineup'
import { getTacticalHumanLabels } from '../domain/trainingPresentation'

type Props = { onBack: () => void; tacticalPlan: TacticalPlan; onTacticalPlanChange: (plan: TacticalPlan) => void; lineupIds: number[]; onLineupChange: (ids: number[]) => void; trainingState: TrainingGameState; staffMembers?: StaffPerson[]; seed?: number; preseason?: boolean; selectablePlayerIds?: number[] }
export function TacticsScreen({ onBack, tacticalPlan, onTacticalPlanChange, lineupIds, onLineupChange, trainingState, staffMembers = [], seed = 0, preseason = false, selectablePlayerIds }: Props) {
  const [selection, setSelection] = useState<TacticalSelection>(null)
  const [detail, setDetail] = useState<{player: Player; position?: PlayerPosition} | null>(null)
  const [proposal, setProposal] = useState<AssistantLineupProposal | null>(null)
  const [lineupError, setLineupError] = useState<string>()
  const assistant = staffMembers.find((member) => member.role === 'SEGUNDO_ENTRENADOR' && member.isUsuallyAvailable)
  const slots = FORMATION_SLOTS[tacticalPlan.formation]
  const selectablePlayers = selectablePlayerIds ? players.filter((player) => selectablePlayerIds.includes(player.id)) : players
  const starters = lineupIds.map(id => selectablePlayers.find(player => player.id === id)).filter((player): player is Player => Boolean(player))
  const reserves = selectablePlayers.filter(player => !lineupIds.includes(player.id))
  const view = (player: Player, slot?: number): TacticalPlayerView => {
    const training = trainingState.players[player.id]
    const current = training ? {...player, attributes:getEffectiveMatchAttributes(training)} : player
    const human = training ? getTacticalHumanLabels(training) : undefined
    return { id:player.id, name:player.name, positions:getPlayerPositions(player).join('/'), rating:Math.round(slot === undefined ? calculateGeneralRating(current) : calculateTacticalRating(current, slots[slot])), secondary:slot===undefined ? undefined : POSITION_FAMILIARITY_LABELS[getPositionFamiliarity(player, slots[slot])], fatigueLabel:human?.fatigue, conditionAlert:human?.conditionAlert ?? undefined }
  }
  const replace = (slot: number, id: number) => { onLineupChange(lineupIds.map((current,index) => index === slot ? id : current)); setSelection(null) }
  const selectField = (slot: number) => { if (selection?.group === 'reserve') return replace(slot, selection.playerId); if (selection?.group === 'field' && selection.slot !== slot) { const next=[...lineupIds]; [next[selection.slot],next[slot]]=[next[slot],next[selection.slot]]; onLineupChange(next); setSelection(null); return } setSelection(selection?.group === 'field' && selection.slot === slot ? null : {group:'field',slot}) }
  const selectReserve = (id: number) => { if (selection?.group === 'field') return replace(selection.slot,id); setSelection(selection?.group === 'reserve' && selection.playerId === id ? null : {group:'reserve',playerId:id}) }
  const movePlayer = (source: LineupSource, target: LineupSource) => { const result=moveLineupPlayer(lineupIds,source,target,slots,selectablePlayers); setLineupError(result.error); if(!result.error)onLineupChange(result.lineupIds) }
  const selectedPlayer = selection?.group === 'field' ? starters[selection.slot] : selection?.group === 'reserve' ? reserves.find(player => player.id === selection.playerId) : undefined
  return <section className="tactics-screen">
    <header className="tactics-header screen-header"><button className="screen-back-button" type="button" onClick={onBack}>← Panel del club</button><div><h2>Táctica</h2><TacticalSummary plan={tacticalPlan} familiarity={calculateOverallFamiliarity(trainingState.familiarity,tacticalPlan)}/></div></header>
    {assistant && <section className="assistant-lineup-proposal"><div><span>OPINIÓN DEL SEGUNDO</span><strong>Propuesta de {assistant.name.split(' ')[0]}</strong></div><button type="button" onClick={() => setProposal(createAssistantLineupProposal(assistant, selectablePlayers, trainingState, tacticalPlan, seed, preseason))}>VER PROPUESTA</button></section>}
    {proposal && <section className="assistant-lineup-preview"><h3>{proposal.assistantName} propone {proposal.plan.formation}</h3>{proposal.reasons.map((reason) => <p key={reason}>{reason}</p>)}<p>{proposal.lineupIds.map((id) => players.find((player) => player.id === id)?.name.split(' ')[0]).join(' · ')}</p><div><button type="button" onClick={() => setProposal(null)}>CANCELAR</button><button className="primary-action" type="button" onClick={() => { onTacticalPlanChange(proposal.plan); onLineupChange(proposal.lineupIds); setProposal(null) }}>APLICAR</button></div></section>}
    <div className="tactical-workspace"><TacticalBoard formation={tacticalPlan.formation} players={starters.map((player,index)=>view(player,index))} selection={selection} onSelect={selectField} onMove={movePlayer}/><TacticalSquadList title="Resto de la plantilla" players={reserves.map(player=>view(player))} selection={selection} onSelect={selectReserve} onMove={movePlayer}/></div>
    {lineupError && <p className="tactics-selection-error">{lineupError}</p>}
    <p className="tactics-selection-hint">{selection ? 'Elige el jugador con quien intercambiarlo.' : 'Selecciona dos jugadores para intercambiar sus puestos. La valoración refleja el puesto ocupado.'}</p>
    {selectedPlayer && <section className="tactics-selected-player"><div><strong>{selectedPlayer.name}</strong><span>{getPlayerPositions(selectedPlayer).join(' / ')}</span></div><button type="button" onClick={()=>setDetail({player:selectedPlayer,position:selection?.group === 'field' ? slots[selection.slot] : undefined})}>VER FICHA</button></section>}
    <TacticalInstructions plan={tacticalPlan} onChange={onTacticalPlanChange}/>
    {detail && <PlayerDetail player={detail.player} trainingState={trainingState.players[detail.player.id]} currentTacticalPosition={detail.position} onClose={()=>setDetail(null)}/>}
  </section>
}
