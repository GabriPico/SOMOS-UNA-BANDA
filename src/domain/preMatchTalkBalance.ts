import type { TalkDuration, TalkEmotions, TalkIntent } from './preMatchTalkTypes'
import type { BetaPersonality } from './trainingTypes'

export const PREMATCH_TALK_BALANCE = {
  duration: { SHORT: 1, MEDIUM: 2, LONG: 5 } satisfies Record<TalkDuration, number>,
  maxEmotion: 4,
  lowFamiliarity: 45,
  highFamiliarity: 70,
  habitualMinimumMatches: 3,
  habitualShare: .6,
  attentionBase: 7,
  attentionHumanWeight: .12,
  attentionImportanceWeight: 2,
  minimumAttentionDuration: 8,
  assistantClearPlan: 50,
  assistantConnected: 75,
  assistantConnectionEffect: .5,
  aggressiveCredibilityWeight: 2,
  trustMinimumReception: .2,
  rallyEnergized: 1.1,
  rallyRejected: -.45,
  rallyFlat: .75,
  rallyReception: { motivation: .6, confidence: .6, concentration: .7, involvement: 1, nerves: .65, tension: .45 },
  // At most small changes to individual action probabilities, never attributes.
  concentrationPerPoint: .0015,
  effortPerPoint: .001,
  adherencePerPoint: .001,
  decayMinutes: 30,
} as const

export const TALK_INTENTS: Record<TalkIntent, Partial<TalkEmotions>> = {
  SIMPLIFY: { concentration: 1, nerves: -1 },
  TRUST: { confidence: 1.5, involvement: 1, nerves: -.5 },
  DEMAND: { motivation: 1, tension: 1, nerves: .5 },
  FOCUS: { concentration: 1.5, involvement: .5 },
  PROVOKE: { motivation: 1.5, tension: 1.5, nerves: 1 },
  CALM: { nerves: -1.5, tension: -1, confidence: .5 },
}

export const TALK_PERSONALITIES: Record<BetaPersonality, { patience: number; demand: number; pressure: number }> = {
  Profesional: { patience: 3, demand: .8, pressure: .6 },
  'Trabajador / Currante': { patience: 2, demand: .6, pressure: .8 },
  Ambicioso: { patience: 0, demand: 1, pressure: 1 },
  Competitivo: { patience: 0, demand: 1.2, pressure: .7 },
  Fiestero: { patience: -2, demand: -.4, pressure: 1 },
  Vago: { patience: -3, demand: -.7, pressure: .8 },
  Veterano: { patience: 1, demand: 1, pressure: .5 },
  Líder: { patience: 3, demand: 1, pressure: .7 },
  Sociable: { patience: 1, demand: .1, pressure: 1 },
  Individualista: { patience: -1, demand: -.3, pressure: 1.1 },
  Caliente: { patience: -2, demand: .5, pressure: 1.5 },
  Pasota: { patience: -3, demand: -.5, pressure: .6 },
}
