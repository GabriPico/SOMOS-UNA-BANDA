import type { PlayerAttribute, TrainingBlock, TrainingIntensity } from './models'

export const TRAINING_BALANCE = {
  provisionalGain: [0.12, 0.28] as const,
  completeGain: [0.04, 0.10] as const,
  individualResponse: [0.85, 1.15] as const,
  maxBonus: 2,
  minimumAttendance: 13,
  intensityProgress: { Baja: .75, Media: 1, Alta: 1.3 } satisfies Record<TrainingIntensity, number>,
  intensityTactical: { Baja: .9, Media: 1, Alta: 1.1 } satisfies Record<TrainingIntensity, number>,
  repetition: [1, .85, .7, .55],
  physicalByIntensity: { Baja: { fitness: 1.5, fatigue: 6 }, Media: { fitness: 2.5, fatigue: 10 }, Alta: { fitness: 4, fatigue: 16 } } satisfies Record<TrainingIntensity, { fitness: number; fatigue: number }>,
  qualityMultipliers: { Excelente: 1.18, Buena: 1.08, Correcta: 1, Floja: .82, Mala: .65, 'De mínimos': .1 },
  bonusDecay: .7,
  completeMaintenanceDecay: .85,
  consolidationScale: 35,
  tacticalDecay: 2,
  tacticalFloor: .45,
  baseInjuryRisk: .0015,
} as const

export const TRAINABLE_ATTRIBUTES: Partial<Record<TrainingBlock, PlayerAttribute[]>> = {
  'Físico': ['rapidez', 'fuerza', 'resistencia', 'agilidad'],
  'Ataque posicional': ['tecnica', 'regate', 'pases', 'remate'],
  'Transición ofensiva': ['resistencia', 'rapidez', 'intensidad', 'remate'],
  'Defensa posicional / Presión': ['comunicacion', 'entradas', 'marcaje', 'mentalidad'],
  'Transición defensiva': ['rapidez', 'entradas', 'intensidad', 'resistencia'],
  'Balón parado': ['comunicacion', 'balonParado', 'marcaje', 'mentalidad'],
}

export function provisionalDifficulty(value: number) { return value <= 8 ? 1.2 : value <= 12 ? 1 : value <= 15 ? .8 : value === 16 ? .6 : value === 17 ? .45 : value === 18 ? .3 : value === 19 ? .15 : 0 }
export function consolidationDifficulty(value: number) { return value <= 8 ? 1.25 : value <= 12 ? 1 : value <= 15 ? .7 : value === 16 ? .45 : value === 17 ? .3 : value === 18 ? .15 : value === 19 ? .05 : 0 }
export function ageFactor(age: number) { return age <= 20 ? 1.4 : age <= 23 ? 1.25 : age <= 27 ? 1.1 : age <= 30 ? 1 : age <= 33 ? .75 : .5 }
export function continuityFactor(weeks: number) { return [1, 1.08, 1.16, 1.24, 1.32][Math.min(4, Math.max(0, weeks - 1))] }
export const clamp100 = (value: number) => Math.max(0, Math.min(100, value))
export const clamp20 = (value: number) => Math.max(1, Math.min(20, value))
