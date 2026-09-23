import type { Player } from './models'
import type { BetaPersonality, TrainingPlayerState } from './trainingTypes'

type PersonalityModifiers = { highIntensityPreference: number; lowIntensityPreference: number; physicalTrainingPreference: number; tacticalTrainingPreference: number; funTrainingPreference: number; restPreference: number; playingTimeSensitivity: number; resultsSensitivity: number; trainingQualitySensitivity: number; personalImprovementSensitivity: number; demandRespect: number; authoritySensitivity: number; conflictProneness: number; sociability: number; dressingRoomInfluence: number }
const base: PersonalityModifiers = { highIntensityPreference: 0, lowIntensityPreference: 0, physicalTrainingPreference: 0, tacticalTrainingPreference: 0, funTrainingPreference: 0, restPreference: 0, playingTimeSensitivity: 0, resultsSensitivity: 0, trainingQualitySensitivity: 0, personalImprovementSensitivity: 0, demandRespect: 0, authoritySensitivity: 0, conflictProneness: 0, sociability: 0, dressingRoomInfluence: 0 }
const p = (values: Partial<PersonalityModifiers>): PersonalityModifiers => ({ ...base, ...values })
export const PERSONALITY_MODIFIERS: Record<BetaPersonality, PersonalityModifiers> = {
  Profesional: p({ highIntensityPreference: 1, physicalTrainingPreference: 1, tacticalTrainingPreference: 1, trainingQualitySensitivity: 2, authoritySensitivity: 1, conflictProneness: -2 }),
  'Trabajador / Currante': p({ highIntensityPreference: 1, physicalTrainingPreference: 2, funTrainingPreference: -1, restPreference: -1, personalImprovementSensitivity: 1, conflictProneness: -1 }),
  Ambicioso: p({ playingTimeSensitivity: 2, resultsSensitivity: 1, trainingQualitySensitivity: 1, personalImprovementSensitivity: 2, demandRespect: 1 }),
  Competitivo: p({ highIntensityPreference: 1, resultsSensitivity: 2, conflictProneness: 1 }),
  Fiestero: p({ highIntensityPreference: -2, lowIntensityPreference: 1, physicalTrainingPreference: -1, funTrainingPreference: 2, sociability: 2 }),
  Vago: p({ highIntensityPreference: -2, lowIntensityPreference: 2, physicalTrainingPreference: -2, funTrainingPreference: 1, authoritySensitivity: 1, conflictProneness: 1 }),
  Veterano: p({ highIntensityPreference: -1, tacticalTrainingPreference: 2, physicalTrainingPreference: -1, trainingQualitySensitivity: 1, dressingRoomInfluence: 2 }),
  Líder: p({ demandRespect: 2, authoritySensitivity: 1, conflictProneness: -1, dressingRoomInfluence: 2 }),
  Sociable: p({ funTrainingPreference: 2, sociability: 2, conflictProneness: -1, dressingRoomInfluence: 1 }),
  Individualista: p({ playingTimeSensitivity: 2, personalImprovementSensitivity: 2, funTrainingPreference: -1, sociability: -1 }),
  Caliente: p({ highIntensityPreference: 1, resultsSensitivity: 2, conflictProneness: 2, authoritySensitivity: 1 }),
  Pasota: p({ resultsSensitivity: -2, authoritySensitivity: -2, conflictProneness: -1, funTrainingPreference: 1 }),
}
export const BETA_PERSONALITIES = Object.keys(PERSONALITY_MODIFIERS) as BetaPersonality[]

export function getPersonalityWeight(personality: string, age: number) {
  if (personality === 'Veterano') {
    if (age < 30) return 0
    if (age === 30) return .35
    if (age <= 31) return .65
    if (age <= 34) return 1.25
    return 1.75
  }
  if (personality === 'Líder') return age < 23 ? .7 : age < 28 ? .9 : 1.15
  return 1
}

export function selectPersonalityForAge(age: number, seedValue: number): BetaPersonality {
  const weighted = BETA_PERSONALITIES.map((personality) => ({ personality, weight: getPersonalityWeight(personality, age) }))
  const total = weighted.reduce((sum, item) => sum + item.weight, 0)
  let cursor = ((seedValue >>> 0) / 4294967296) * total
  for (const item of weighted) {
    cursor -= item.weight
    if (cursor < 0) return item.personality
  }
  return weighted[weighted.length - 1].personality
}
export function getDressingRoomInfluence(player: Player, state: TrainingPlayerState) { const modifier = PERSONALITY_MODIFIERS[state.personality]; return Math.max(0, Math.min(100, 25 + modifier.dressingRoomInfluence * 15 + player.age * .5 + player.attributes.comunicacion * 1.5 + player.appearances)) }
export function getConflictRisk(player: Player, state: TrainingPlayerState, teamAuthority: number) { const modifiers = PERSONALITY_MODIFIERS[state.personality]; const authorityRisk = Math.max(0, 55 - Math.min(state.managerAuthority, teamAuthority)) * .8; return Math.max(0, Math.min(100, 4 + modifiers.conflictProneness * 7 + modifiers.demandRespect * 2 + authorityRisk + getDressingRoomInfluence(player, state) * .04)) }
