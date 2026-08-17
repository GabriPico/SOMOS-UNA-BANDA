import type { Formation, Player, TacticalPlan } from './models'
import type { StaffPerson } from './staff'
import type { TrainingGameState } from './trainingTypes'
import { FORMATION_SLOTS } from './matchTactics'
import { calculateTacticalRating } from './positionFamiliarity'
import { getEffectiveMatchAttributes } from './trainingEngine'

const FORMATIONS: Formation[] = ['4-4-2', '4-3-3', '4-2-3-1', '3-5-2', '5-4-1']
const hash = (value: string, seed: number) => [...value].reduce((result, character) => Math.imul(result ^ character.charCodeAt(0), 16777619) >>> 0, seed >>> 0)

export type AssistantLineupProposal = { assistantId: string; assistantName: string; plan: TacticalPlan; lineupIds: number[]; reasons: string[] }

export function createAssistantLineupProposal(assistant: StaffPerson, players: Player[], training: TrainingGameState, currentPlan: TacticalPlan, seed: number, preseason: boolean): AssistantLineupProposal {
  const knowledge = assistant.capabilities?.footballKnowledge ?? 45
  const observation = assistant.capabilities?.observation ?? 45
  const formationIndex = hash(`${assistant.id}:formation:${assistant.assistantProfile ?? ''}`, seed) % FORMATIONS.length
  const formation = knowledge >= 72 ? currentPlan.formation : FORMATIONS[formationIndex]
  const slots = FORMATION_SLOTS[formation]
  const available = [...players]
  const lineupIds = slots.map((position, slot) => {
    const ranked = available.map((player) => {
      const state = training.players[player.id]
      const effective = state ? { ...player, attributes: getEffectiveMatchAttributes(state) } : player
      const uncertainty = Math.max(1, Math.round((100 - observation) / 12))
      const perceivedError = (hash(`${assistant.id}:${player.id}:${position}:${slot}`, seed) % (uncertainty * 2 + 1)) - uncertainty
      const physical = state ? (state.fitness - state.fatigue * .6) * .08 : 0
      const trialInterest = preseason && player.clubStatus === 'TRIAL' ? 1.5 + (hash(`${assistant.id}:${player.id}:trial`, seed) % 30) / 10 : 0
      return { player, score: calculateTacticalRating(effective, position) + perceivedError + physical + trialInterest }
    }).sort((a, b) => b.score - a.score || a.player.id - b.player.id)
    const chosen = position === 'POR' ? ranked.find(({ player }) => [player.primaryPosition, ...player.secondaryPositions].includes('POR')) ?? ranked[0] : ranked[0]
    available.splice(available.findIndex((player) => player.id === chosen.player.id), 1)
    return chosen.player.id
  })
  const trial = lineupIds.map((id) => players.find((player) => player.id === id)).find((player) => player?.clubStatus === 'TRIAL')
  return { assistantId: assistant.id, assistantName: assistant.name, plan: { ...currentPlan, formation }, lineupIds, reasons: [`Prefiere partir de un ${formation}.`, trial ? `${assistant.name.split(' ')[0]} quiere ver a ${trial.name} de inicio.` : 'Prioriza a quienes cree que llegan mejor preparados.'] }
}
