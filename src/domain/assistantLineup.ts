import type { Player, TacticalPlan } from './models'
import type { StaffPerson } from './staff'
import type { TrainingGameState } from './trainingTypes'
import { calculateTacticalRating } from './positionFamiliarity'
import { getEffectiveMatchAttributes } from './trainingEngine'
import { selectLineupForFormation } from './lineupSelection'
import { getPhysicalIssueEffects } from './physicalIssues'
import { FORMATION_SLOTS } from './matchTactics'

const hash = (value: string, seed: number) => [...value].reduce((result, character) => Math.imul(result ^ character.charCodeAt(0), 16777619) >>> 0, seed >>> 0)

export type AssistantLineupProposal = { assistantId: string; assistantName: string; plan: TacticalPlan; lineupIds: number[]; reasons: string[] }

type ProposalPlayerChange = { playerId: number; name: string; position: string }
type ProposalPositionChange = { playerId: number; name: string; from: string; to: string; samePosition: boolean }
type ProposalInstructionChange = { label: string; from: string; to: string }

export type AssistantProposalSummary = {
  formationChange?: { from: string; to: string }
  entering: ProposalPlayerChange[]
  leaving: ProposalPlayerChange[]
  positionChanges: ProposalPositionChange[]
  instructionChanges: ProposalInstructionChange[]
  affectedSlots: number[]
  hasChanges: boolean
}

const instructionLabels: Array<[Exclude<keyof TacticalPlan, 'formation'>, string]> = [
  ['mentality', 'Mentalidad'], ['passingStyle', 'Pase'], ['tempo', 'Ritmo'],
  ['afterRecovery', 'Tras recuperar'], ['pressingHeight', 'Altura'],
  ['pressingIntensity', 'Presión'], ['afterLoss', 'Tras pérdida'],
  ['timeWasting', 'Perder tiempo'], ['aggression', 'Ser agresivos'],
]

export function summarizeAssistantLineupProposal(
  proposal: AssistantLineupProposal, currentPlan: TacticalPlan, currentLineupIds: number[], players: Player[],
): AssistantProposalSummary {
  const currentPositions = FORMATION_SLOTS[currentPlan.formation]
  const proposedPositions = FORMATION_SLOTS[proposal.plan.formation]
  const currentSlots = new Map(currentLineupIds.map((id, slot) => [id, slot]))
  const proposedSlots = new Map(proposal.lineupIds.map((id, slot) => [id, slot]))
  const names = new Map(players.map(player => [player.id, player.name]))
  const nameOf = (id: number) => names.get(id) ?? String(id)

  const entering = proposal.lineupIds.flatMap((id, slot) => currentSlots.has(id)
    ? [] : [{ playerId: id, name: nameOf(id), position: proposedPositions[slot] }])
  const leaving = currentLineupIds.flatMap((id, slot) => proposedSlots.has(id)
    ? [] : [{ playerId: id, name: nameOf(id), position: currentPositions[slot] }])
  const positionChanges = proposal.lineupIds.flatMap((id, slot) => {
    const previousSlot = currentSlots.get(id)
    if (previousSlot === undefined) return []
    const from = currentPositions[previousSlot]
    const to = proposedPositions[slot]
    if (previousSlot === slot && from === to) return []
    return [{ playerId: id, name: nameOf(id), from, to, samePosition: from === to }]
  })
  const instructionChanges = instructionLabels.flatMap(([key, label]) => currentPlan[key] === proposal.plan[key]
    ? [] : [{ label, from: currentPlan[key], to: proposal.plan[key] }])
  const formationChange = currentPlan.formation === proposal.plan.formation
    ? undefined : { from: currentPlan.formation, to: proposal.plan.formation }
  const affectedSlots = proposal.lineupIds.flatMap((id, slot) => id !== currentLineupIds[slot] || proposedPositions[slot] !== currentPositions[slot] ? [slot] : [])

  return {
    formationChange, entering, leaving, positionChanges, instructionChanges, affectedSlots,
    hasChanges: Boolean(formationChange || instructionChanges.length || affectedSlots.length),
  }
}

export function createAssistantLineupProposal(assistant: StaffPerson, players: Player[], training: TrainingGameState, currentPlan: TacticalPlan, seed: number, preseason: boolean): AssistantLineupProposal {
  const knowledge = assistant.capabilities?.footballKnowledge ?? 45
  const observation = assistant.capabilities?.observation ?? 45
  const assessment = knowledge * .45 + observation * .55
  const formation = currentPlan.formation
  const lineupIds = selectLineupForFormation(players, formation, (player, position, slot) => {
      const state = training.players[player.id]
      const effective = state ? { ...player, attributes: getEffectiveMatchAttributes(state) } : player
      const uncertainty = Math.max(1, Math.round((100 - assessment) / 12))
      const perceivedError = (hash(`${assistant.id}:${player.id}:${position}:${slot}`, seed) % (uncertainty * 2 + 1)) - uncertainty
      const physical = state ? (state.fitness - state.fatigue * .6) * .08 : 0
      const trialInterest = preseason && player.clubStatus === 'TRIAL' ? 1.5 + (hash(`${assistant.id}:${player.id}:trial`, seed) % 30) / 10 : 0
      const issuePenalty = getPhysicalIssueEffects(state?.currentIssue)?.recommendationPenalty ?? 0
      return calculateTacticalRating(effective, position) + perceivedError + physical + trialInterest - issuePenalty
  })
  const trial = lineupIds.map((id) => players.find((player) => player.id === id)).find((player) => player?.clubStatus === 'TRIAL')
  return { assistantId: assistant.id, assistantName: assistant.name, plan: { ...currentPlan, formation }, lineupIds, reasons: [`Prefiere partir de un ${formation}.`, trial ? `${assistant.name.split(' ')[0]} quiere ver a ${trial.name} de inicio.` : 'Prioriza a quienes cree que llegan mejor preparados.'] }
}
