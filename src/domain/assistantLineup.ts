import type { Player, TacticalPlan } from './models'
import type { StaffPerson } from './staff'
import type { TrainingGameState } from './trainingTypes'
import { calculateTacticalRating } from './positionFamiliarity'
import { getEffectiveMatchAttributes } from './trainingEngine'
import { selectLineupForFormation } from './lineupSelection'
import { getPhysicalIssueEffects } from './physicalIssues'

const hash = (value: string, seed: number) => [...value].reduce((result, character) => Math.imul(result ^ character.charCodeAt(0), 16777619) >>> 0, seed >>> 0)

export type AssistantLineupProposal = { assistantId: string; assistantName: string; plan: TacticalPlan; lineupIds: number[]; reasons: string[] }

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
