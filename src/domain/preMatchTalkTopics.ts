import type { PrematchTalkContext, PrematchTalkState, TalkDuration, TalkInstruction, TalkIntent, TalkTrainingConnection } from './preMatchTalkTypes'
import { PREMATCH_TALK_BALANCE as balance } from './preMatchTalkBalance'

export type PrematchTopicId = 'structure' | 'pressing' | 'transition-attack' | 'transition-defense' | 'tempo' | 'direct-play' | 'possession' | 'wings' | 'set-pieces' | 'intensity' | 'confidence' | 'demand' | 'concentration' | 'rival' | 'rival-player' | 'training' | 'rally'
export type PrematchTopic = { id: PrematchTopicId; relevance: number; duration: TalkDuration; intent: TalkIntent; connection?: TalkTrainingConnection }
export type PrematchTopicStatus = 'UNAVAILABLE' | 'LOW_RELEVANCE' | 'AVAILABLE' | 'RELEVANT' | 'MENTIONED'
const mean = (values: number[]) => values.reduce((sum, value) => sum + value, 0) / Math.max(1, values.length)

export const hasUsefulPrematchScouting = (context: PrematchTalkContext) => Boolean(context.assistant && context.rival.analysisReason && context.rival.knowledge === 'OBSERVED' && context.rival.facts.some((fact) => fact.id !== 'results'))

/** Topics are derived views of the snapshot and the beat log, never another saved state. */
export function getPrematchTopics(context: PrematchTalkContext): PrematchTopic[] {
  const connection = (key: TalkInstruction) => context.tacticalConnections.find((item) => item.instruction === key)
  const relevance = (item: TalkTrainingConnection | undefined, base: number) => item?.changed ? 90 : item?.days.length ? 80 : item && item.familiarity < balance.lowFamiliarity ? 65 : base
  const topic = (id: PrematchTopicId, score: number, intent: TalkIntent, duration: TalkDuration = 'MEDIUM', item?: TalkTrainingConnection): PrematchTopic => ({ id, relevance: score, intent, duration, connection: item })
  const formationChanged = Boolean(context.previousPlan && context.previousPlan.formation !== context.plan.formation)
  const setPieces = context.tacticalConnections.find((item) => item.block === 'Balón parado')
  const practiced = context.tacticalConnections.filter((item) => item.days.length)
  const ownConfidence = mean(context.participants.map((player) => player.confidence))
  const ownHappiness = mean(context.participants.map((player) => player.happiness))
  const scouting = hasUsefulPrematchScouting(context)
  return [
    topic('structure', formationChanged || !context.playedMatches || context.formationFamiliarity < balance.lowFamiliarity ? 95 : 55, 'SIMPLIFY', formationChanged ? 'LONG' : 'MEDIUM'),
    topic('transition-attack', relevance(connection('afterRecovery'), 35), 'FOCUS', 'MEDIUM', connection('afterRecovery')),
    topic('transition-defense', relevance(connection('afterLoss'), 30), 'FOCUS', 'MEDIUM', connection('afterLoss')),
    topic('pressing', relevance(connection('pressingHeight'), context.plan.pressingHeight === 'Alta' ? 60 : 20), 'FOCUS', 'MEDIUM', connection('pressingHeight')),
    topic('tempo', relevance(connection('tempo'), context.plan.tempo === 'Medio' ? 15 : 40), 'FOCUS', 'SHORT', connection('tempo')),
    topic('direct-play', context.plan.passingStyle === 'Directo' ? relevance(connection('passingStyle'), 70) : 0, 'FOCUS', 'MEDIUM', connection('passingStyle')),
    topic('possession', context.plan.passingStyle === 'En corto' ? relevance(connection('passingStyle'), 70) : 0, 'FOCUS', 'MEDIUM', connection('passingStyle')),
    topic('wings', context.plan.formation === '4-3-3' || context.plan.formation === '3-5-2' ? 40 : 15, 'FOCUS'),
    topic('set-pieces', setPieces?.days.length ? 75 : 10, 'FOCUS', 'MEDIUM', setPieces),
    topic('intensity', context.primarySituation === 'FIRST_FRIENDLY' ? 75 : context.physicalLoadRelevant ? 20 : 50, 'DEMAND'),
    topic('confidence', ownConfidence < 55 || ownHappiness < 45 ? 85 : 35, 'TRUST', 'SHORT'),
    topic('demand', context.importance >= 2 || context.primarySituation === 'FIRST_FRIENDLY' ? 50 : 30, 'PROVOKE', 'MEDIUM'),
    topic('concentration', context.formationFamiliarity < balance.lowFamiliarity ? 55 : 35, 'FOCUS', 'SHORT'),
    topic('rival', scouting ? 100 : 0, 'FOCUS', 'MEDIUM'),
    topic('rival-player', scouting && context.rival.facts.some((fact) => fact.id.startsWith('player:')) ? 75 : 0, 'FOCUS'),
    topic('training', practiced.length >= 3 ? 40 : 10, 'TRUST', 'MEDIUM'),
    topic('rally', context.importance >= 2 ? 60 : 20, 'DEMAND', 'LONG'),
  ]
}

export const topicMention = (id: PrematchTopicId) => `topic:${id}`
/** A brief plan uses existing relevance and verified training, without a topic menu. */
export function getPrematchPlanTopics(context: PrematchTalkContext, trainedOnly = false) {
  const tacticalIds: PrematchTopicId[] = ['structure', 'pressing', 'transition-attack', 'transition-defense', 'tempo', 'direct-play', 'possession', 'wings', 'set-pieces']
  return getPrematchTopics(context).filter((topic) => tacticalIds.includes(topic.id) && topic.relevance >= 30
    && (!trainedOnly || (topic.id === 'structure' ? context.formationTrainingDays.length > 0 : Boolean(topic.connection?.days.length))))
    .sort((a, b) => b.relevance - a.relevance).slice(0, 2)
}
export function getPrematchTopicStatus(talk: PrematchTalkState, id: PrematchTopicId): PrematchTopicStatus {
  const topic = getPrematchTopics(talk.context).find((item) => item.id === id)
  if (talk.beats.some((beat) => beat.mentions?.includes(topicMention(id)))) return 'MENTIONED'
  if (!topic || topic.relevance === 0) return 'UNAVAILABLE'
  return topic.relevance >= 60 ? 'RELEVANT' : topic.relevance >= 30 ? 'AVAILABLE' : 'LOW_RELEVANCE'
}
export function getAvailablePrematchTopics(talk: PrematchTalkState) {
  const limit = talk.context.importance >= 2 ? 4 : talk.context.playedMatches === 0 ? 3 : 2
  return getPrematchTopics(talk.context)
    .filter((topic) => ['RELEVANT', 'AVAILABLE'].includes(getPrematchTopicStatus(talk, topic.id)))
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, limit)
}

export type AssistantTalkContribution = 'SCOUTING' | 'FIRST_DAY' | 'TIRED' | 'UNEASY' | 'TRAINING' | 'UNKNOWN_RIVAL' | 'NONE'
export function getAssistantTalkContribution(context: PrematchTalkContext): AssistantTalkContribution {
  if (!context.assistant) return 'NONE'
  if (hasUsefulPrematchScouting(context)) return 'SCOUTING'
  if (!context.playedMatches) return 'FIRST_DAY'
  if (context.physicalLoadRelevant) return 'TIRED'
  if (mean(context.participants.map((player) => player.happiness)) < 45 || context.cohesion < 35) return 'UNEASY'
  if (context.seed % 3 === 0 && context.tacticalConnections.some((item) => item.days.length)) return 'TRAINING'
  if (context.seed % 3 === 1 && context.rival.knowledge === 'LIMITED') return 'UNKNOWN_RIVAL'
  return 'NONE'
}
