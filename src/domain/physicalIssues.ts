import type { PlayerAttribute, PlayerAttributes, TrainingIntensity } from './models'
import type { BetaPersonality, CurrentPhysicalIssue, PhysicalIssueType, TrainingPlayerState } from './trainingTypes'
import { clamp20 } from './trainingBalance'

export type PhysicalIssueEffects = {
  generalPenalty: number
  physicalPenalty: number
  mentalPenalty: number
  perceivedFatigue: number
  recoveryMultiplier: number
  injuryRiskMultiplier: number
  recommendationPenalty: number
  worsensWithLoad: boolean
}

type PhysicalIssueDefinition = PhysicalIssueEffects & { label: string; minimumDays: number; maximumDays: number }

export const PHYSICAL_ISSUE_DEFINITIONS: Record<PhysicalIssueType, PhysicalIssueDefinition> = {
  MUSCLE_DISCOMFORT: { label: 'Molestias musculares', minimumDays: 3, maximumDays: 5, generalPenalty: .2, physicalPenalty: 1.1, mentalPenalty: 0, perceivedFatigue: 1.5, recoveryMultiplier: .8, injuryRiskMultiplier: 1.8, recommendationPenalty: 5, worsensWithLoad: true },
  POOR_SLEEP: { label: 'Ha dormido poco', minimumDays: 1, maximumDays: 1, generalPenalty: .25, physicalPenalty: .2, mentalPenalty: 1, perceivedFatigue: 4, recoveryMultiplier: .65, injuryRiskMultiplier: 1.05, recommendationPenalty: 2.5, worsensWithLoad: false },
  HANGOVER: { label: 'Resaca', minimumDays: 1, maximumDays: 1, generalPenalty: .6, physicalPenalty: .8, mentalPenalty: 1.2, perceivedFatigue: 5, recoveryMultiplier: .55, injuryRiskMultiplier: 1.25, recommendationPenalty: 4.5, worsensWithLoad: false },
  SORENESS: { label: 'Agujetas', minimumDays: 1, maximumDays: 2, generalPenalty: .1, physicalPenalty: .7, mentalPenalty: 0, perceivedFatigue: 3, recoveryMultiplier: .85, injuryRiskMultiplier: 1.15, recommendationPenalty: 2, worsensWithLoad: true },
  MINOR_KNOCK: { label: 'Golpe leve', minimumDays: 2, maximumDays: 4, generalPenalty: .3, physicalPenalty: .5, mentalPenalty: .2, perceivedFatigue: 1, recoveryMultiplier: .85, injuryRiskMultiplier: 1.3, recommendationPenalty: 3.5, worsensWithLoad: true },
  MILD_ILLNESS: { label: 'Algo enfermo', minimumDays: 1, maximumDays: 3, generalPenalty: .8, physicalPenalty: .5, mentalPenalty: .6, perceivedFatigue: 4, recoveryMultiplier: .65, injuryRiskMultiplier: 1.2, recommendationPenalty: 5, worsensWithLoad: false },
}

const PHYSICAL_ATTRIBUTES = new Set<PlayerAttribute>(['rapidez', 'fuerza', 'resistencia', 'agilidad'])
const MENTAL_ATTRIBUTES = new Set<PlayerAttribute>(['comunicacion', 'intensidad', 'mentalidad'])
const hash = (value: string, seed: number) => [...value].reduce((result, character) => Math.imul(result ^ character.charCodeAt(0), 16777619) >>> 0, seed >>> 0)
const issuePool: PhysicalIssueType[] = ['POOR_SLEEP', 'SORENESS', 'MUSCLE_DISCOMFORT', 'MINOR_KNOCK', 'MILD_ILLNESS', 'POOR_SLEEP', 'SORENESS', 'HANGOVER']

export const getPhysicalIssueLabel = (issue?: CurrentPhysicalIssue) => issue ? PHYSICAL_ISSUE_DEFINITIONS[issue.type].label : undefined
export const getPhysicalIssueEffects = (issue?: CurrentPhysicalIssue): PhysicalIssueEffects | undefined => issue ? PHYSICAL_ISSUE_DEFINITIONS[issue.type] : undefined

export function applyPhysicalIssueToAttributes(attributes: PlayerAttributes, issue?: CurrentPhysicalIssue): PlayerAttributes {
  const effects = getPhysicalIssueEffects(issue)
  if (!effects) return { ...attributes }
  return Object.fromEntries(Object.entries(attributes).map(([rawAttribute, value]) => {
    const attribute = rawAttribute as PlayerAttribute
    const penalty = effects.generalPenalty + (PHYSICAL_ATTRIBUTES.has(attribute) ? effects.physicalPenalty : 0) + (MENTAL_ATTRIBUTES.has(attribute) ? effects.mentalPenalty : 0)
    return [attribute, clamp20(value - penalty)]
  })) as PlayerAttributes
}

function personalityIssueWeight(personality: BetaPersonality, type: PhysicalIssueType) {
  if ((type === 'HANGOVER' || type === 'POOR_SLEEP') && personality === 'Fiestero') return 3
  if ((type === 'HANGOVER' || type === 'POOR_SLEEP') && personality === 'Profesional') return .25
  return 1
}

export function generateInitialPhysicalIssues(players: Record<number, TrainingPlayerState>, seed: number, startedAt: string) {
  const result = structuredClone(players)
  const roll = hash('initial-physical-issues', seed) % 100
  const issueCount = roll < 40 ? 0 : roll < 90 ? 1 : 2
  const available = Object.values(result)
  for (let index = 0; index < issueCount && available.length; index += 1) {
    const playerIndex = hash(`initial-issue-player:${index}`, seed) % available.length
    const player = available.splice(playerIndex, 1)[0]
    const weightedPool = issuePool.flatMap((type) => Array(Math.max(1, Math.round(personalityIssueWeight(player.personality, type) * 4))).fill(type) as PhysicalIssueType[])
    const type = weightedPool[hash(`initial-issue-type:${player.playerId}:${index}`, seed) % weightedPool.length]
    const definition = PHYSICAL_ISSUE_DEFINITIONS[type]
    const duration = definition.minimumDays + hash(`initial-issue-duration:${player.playerId}:${type}`, seed) % (definition.maximumDays - definition.minimumDays + 1)
    player.currentIssue = { type, remainingDays: duration, startedAt }
  }
  return result
}

export function advancePhysicalIssues(players: Record<number, TrainingPlayerState>, from: string, until: string) {
  const fromDay = Date.parse(`${from.slice(0, 10)}T12:00:00Z`)
  const untilDay = Date.parse(`${until.slice(0, 10)}T12:00:00Z`)
  const elapsedDays = Math.max(0, Math.floor((untilDay - fromDay) / 86_400_000))
  if (!elapsedDays) return players
  return Object.fromEntries(Object.entries(players).map(([id, player]) => {
    if (!player.currentIssue) return [id, player]
    const remainingDays = player.currentIssue.remainingDays - elapsedDays
    return [id, { ...player, currentIssue: remainingDays > 0 ? { ...player.currentIssue, remainingDays } : undefined }]
  }))
}

export function applyTrainingLoadToIssue(issue: CurrentPhysicalIssue | undefined, intensity: TrainingIntensity, hasPhysical: boolean) {
  if (!issue || !PHYSICAL_ISSUE_DEFINITIONS[issue.type].worsensWithLoad || intensity !== 'Alta' || !hasPhysical) return issue
  return { ...issue, remainingDays: issue.remainingDays + 1 }
}

export function applyMatchLoadToIssue(issue: CurrentPhysicalIssue | undefined, minutesPlayed: number) {
  if (!issue || !PHYSICAL_ISSUE_DEFINITIONS[issue.type].worsensWithLoad || minutesPlayed < 45) return issue
  return { ...issue, remainingDays: issue.remainingDays + 1 }
}
