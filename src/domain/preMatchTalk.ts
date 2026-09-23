import type { GameState } from './gameState'
import type { LeagueMatch } from './models'
import { validatePreMatchPreparation } from './preMatch'
import { buildPrematchTalkContext, talkHash, type PrematchTalkSources } from './preMatchTalkContext'
import { PREMATCH_TALK_BALANCE as balance, TALK_INTENTS, TALK_PERSONALITIES } from './preMatchTalkBalance'
import type { PrematchTalkContext, PrematchTalkState, TalkBeat, TalkEmotions, TalkParticipant } from './preMatchTalkTypes'

export const prematchSceneId = (matchId: string) => `prematch-talk-${matchId}`
export const talkDuration = (talk: PrematchTalkState) => talk.beats.reduce((sum, beat) => sum + (beat.speaker === 'OBSERVATION' ? 0 : balance.duration[beat.duration]), 0)
export const mentionedInTalk = (talk: PrematchTalkState, id: string) => talk.beats.some((beat) => beat.mentions?.includes(id))
export const getPrematchClosing = (context: PrematchTalkContext) => context.match.competitionType === 'FRIENDLY' ? 'EXIT'
  : context.importance >= 2 || context.situations.some((situation) => ['DIRECT_RIVAL', 'DERBY', 'BAD_RUN', 'REACTION', 'PRESIDENT', 'PROMOTION', 'PLAYOFF_RACE', 'DECISIVE', 'PLAYOFF_SEMIFINAL', 'PLAYOFF_FINAL'].includes(situation)) ? 'RALLY' : 'RITUAL'

export function beginPrematchTalk(game: GameState, match: LeagueMatch, sources: PrematchTalkSources): GameState {
  if (game.activeMatch || match.status !== 'scheduled' || game.temporal.activeCheckpoint?.type !== 'PRE_MATCH' || game.temporal.activeCheckpoint.relatedId !== match.id || validatePreMatchPreparation(game, match.id, sources.players, sources.sanctions).length) return game
  const preparation = game.preMatchPreparations[match.id]
  if (preparation.talk) return game
  return { ...game, preMatchPreparations: { ...game.preMatchPreparations, [match.id]: { ...preparation, talk: { context: buildPrematchTalkContext(game, match, sources), beats: [], completed: false } } } }
}

export function recordPrematchTalkBeat(game: GameState, matchId: string, beat: TalkBeat): GameState {
  const preparation = game.preMatchPreparations[matchId]
  const talk = preparation?.talk
  if (!talk || talk.completed || game.activeMatch || talk.beats.some((item) => item.id === beat.id)) return game
  return { ...game, preMatchPreparations: { ...game.preMatchPreparations, [matchId]: { ...preparation, talk: { ...talk, beats: [...talk.beats, structuredClone(beat)] } } } }
}

export function completePrematchTalk(game: GameState, matchId: string): GameState {
  const preparation = game.preMatchPreparations[matchId]
  if (!preparation?.talk || preparation.talk.completed || !mentionedInTalk(preparation.talk, 'closing') || validatePreMatchPreparation(game, matchId).length) return game
  if (preparation.talk.context.version === 3 && getPrematchClosing(preparation.talk.context) !== 'EXIT' && !mentionedInTalk(preparation.talk, 'chant')) return game
  return { ...game, preMatchPreparations: { ...game.preMatchPreparations, [matchId]: { ...preparation, talk: { ...preparation.talk, completed: true } } } }
}

function attentionTolerance(talk: PrematchTalkState, player: TalkParticipant) {
  const engagement = (player.authority + talk.context.authority + player.happiness + player.relationship + talk.context.cohesion) / 5
  return balance.attentionBase + engagement * balance.attentionHumanWeight + talk.context.importance * balance.attentionImportanceWeight + TALK_PERSONALITIES[player.personality].patience + talkHash(String(player.id), talk.context.seed) % 3
}
export const inattentivePlayers = (talk: PrematchTalkState) => talk.context.participants.filter((player) => talkDuration(talk) > attentionTolerance(talk, player))
export type TalkAttentionSignal = 'DISTRACTED' | 'IMPATIENT' | 'ENGAGED'
export function getTalkAttentionSignal(talk: PrematchTalkState): TalkAttentionSignal | undefined {
  if (talkDuration(talk) < balance.minimumAttentionDuration) return undefined
  const count = inattentivePlayers(talk).length
  const signal = count > talk.context.participants.length / 3 ? 'IMPATIENT' : count > 0 ? 'DISTRACTED' : talkHash('attention', talk.context.seed) % 3 === 0 ? 'ENGAGED' : undefined
  return signal && !mentionedInTalk(talk, `attention:${signal}`) ? signal : undefined
}
export function attentionNarration(talk: PrematchTalkState): string {
  const disconnected = inattentivePlayers(talk)
  if (disconnected.length > talk.context.participants.length / 3) return 'Algunos empiezan a moverse impacientes. La charla se está alargando y ya no todas las miradas siguen contigo.'
  if (disconnected.length) return `Mientras continúas explicándolo, ves a ${disconnected[0].name} mirando más sus botas que a ti.`
  return 'Esta vez tienes a todo el vestuario pendiente. Sigues hablando y las miradas siguen contigo.'
}
export function shouldNarrateAttention(talk: PrematchTalkState) {
  return getTalkAttentionSignal(talk) !== undefined
}

export function getPrematchTalkEmotions(talk: PrematchTalkState): Record<number, TalkEmotions> {
  return Object.fromEntries(talk.context.participants.map((player) => {
    const emotions: TalkEmotions = { motivation: 0, confidence: 0, concentration: 0, nerves: 0, tension: 0, involvement: 0 }
    const personality = TALK_PERSONALITIES[player.personality]
    let elapsed = 0
    const tolerance = attentionTolerance(talk, player)
    for (const beat of talk.beats) {
      if (beat.speaker === 'OBSERVATION') continue
      elapsed += balance.duration[beat.duration]
      if (!beat.intent) continue
      const credibility = (player.authority + talk.context.authority + player.relationship) / 300
      // Reassurance can sound empty when trust in the coach is low.
      const reception = (elapsed > tolerance ? .35 : 1) * (beat.intent === 'TRUST' ? Math.max(balance.trustMinimumReception, credibility) : 1)
      for (const [key, value] of Object.entries(TALK_INTENTS[beat.intent])) emotions[key as keyof TalkEmotions] += value * reception
      if (beat.delivery === 'RAMBLING') emotions.concentration -= reception
      if (beat.delivery === 'CONNECTED') emotions.involvement += balance.assistantConnectionEffect * reception
      if (beat.intent === 'DEMAND' || beat.intent === 'PROVOKE') {
        const pressure = talk.context.importance === 0 ? 1.3 : talk.context.importance >= 2 ? .8 : 1
        emotions.motivation += (personality.demand + (credibility - .5) * balance.aggressiveCredibilityWeight) * reception
        emotions.nerves += Math.max(0, 60 - player.confidence) / 30 * personality.pressure * pressure
        emotions.tension += Math.max(0, 50 - player.relationship) / 35 + (1 - credibility) * pressure
        emotions.involvement += (credibility - .5) * reception
        if (player.happiness < 45) emotions.involvement -= (1 - credibility) * 1.5
      } else if (beat.intent === 'CALM' || beat.intent === 'SIMPLIFY') {
        // Taking pressure off can also feel too mild to players eager to compete.
        emotions.motivation -= Math.max(0, personality.demand) * (talk.context.importance === 0 ? .5 : .2)
      }
    }
    const excess = Math.max(0, elapsed - tolerance)
    emotions.concentration -= Math.min(3, excess * .3)
    emotions.involvement -= Math.min(2, excess * .2)
    return [player.id, Object.fromEntries(Object.entries(emotions).map(([key, value]) => [key, Math.max(-balance.maxEmotion, Math.min(balance.maxEmotion, value))])) as TalkEmotions]
  }))
}

/** The closing reads the marginal effect of the chosen rally, including lost attention.
 * No second emotional simulation, random success roll or saved group score. */
export function getRallyReception(talk: PrematchTalkState) {
  const index = talk.beats.findIndex((beat) => beat.mentions?.includes('rally'))
  if (index < 0) return undefined
  const before = getPrematchTalkEmotions({ ...talk, beats: talk.beats.slice(0, index) })
  const after = getPrematchTalkEmotions({ ...talk, beats: talk.beats.slice(0, index + 1) })
  const players = talk.context.participants.map((player) => {
    const delta = Object.fromEntries(Object.keys(after[player.id]).map((key) => [key, after[player.id][key as keyof TalkEmotions] - before[player.id][key as keyof TalkEmotions]])) as TalkEmotions
    const weights = balance.rallyReception
    const score = delta.motivation * weights.motivation + delta.confidence * weights.confidence + delta.concentration * weights.concentration + delta.involvement * weights.involvement
      - delta.nerves * (100 - player.confidence) / 100 * weights.nerves - delta.tension * weights.tension
    return { player, delta, score }
  })
  const score = players.reduce((sum, item) => sum + item.score, 0) / Math.max(1, players.length)
  const mood = score >= balance.rallyEnergized ? 'ENERGIZED' : score <= balance.rallyRejected ? 'REJECTED' : score <= balance.rallyFlat ? 'FLAT' : 'MIXED'
  return { mood, players } as const
}
