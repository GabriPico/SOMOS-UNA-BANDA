import type { GameState } from './gameState'
import type { InboxMessage } from './inbox'
import type { LeagueMatch, LeagueSanction, Player } from './models'
import { getSanctionsForMatchday } from './leagueSanctions'
import { calculateGeneralRating } from './playerRatings'
import { PERSONALITY_MODIFIERS } from './trainingPersonality'

export type PlayerSelectionStatus = 'CALLED_UP' | 'TECHNICAL_OMISSION' | 'INJURED' | 'SUSPENDED' | 'UNAVAILABLE' | 'NOT_REGISTERED'
export type PlayerMatchSelectionRecord = { matchId: string; playerId: number; status: PlayerSelectionStatus; recordedAt: string }
export type SquadReaction = { playerId: number; happinessDelta: number; authorityDelta: number; omissionStreak: number; significance: 'NONE' | 'MINOR' | 'RELEVANT'; text?: string }
export type MatchSquadSelection = { matchId: string; announced: boolean; playerIds: number[]; announcedAt: string; records: PlayerMatchSelectionRecord[]; reactions: SquadReaction[] }
export type PlayerEligibility = { playerId: number; eligible: boolean; status?: Exclude<PlayerSelectionStatus, 'CALLED_UP' | 'TECHNICAL_OMISSION'>; reason?: string }

export const OFFICIAL_SQUAD_MAX = 18
export const OFFICIAL_SQUAD_MIN = 11
const clamp = (value: number) => Math.max(0, Math.min(100, value))

export function getPlayerEligibility(state: GameState, match: LeagueMatch, player: Player, sanctions: LeagueSanction[], unavailablePlayerIds: number[] = []): PlayerEligibility {
  if (match.competitionType === 'FRIENDLY') return { playerId: player.id, eligible: true }
  if (player.clubStatus === 'TRIAL') return { playerId: player.id, eligible: false, status: 'NOT_REGISTERED', reason: 'No inscrito para competición oficial' }
  if (state.injuredPlayerIds.includes(player.id)) return { playerId: player.id, eligible: false, status: 'INJURED', reason: 'Lesionado' }
  if (getSanctionsForMatchday(sanctions, match.matchday).some((item) => item.playerId === player.id && item.teamId === 'fc-poblenou')) return { playerId: player.id, eligible: false, status: 'SUSPENDED', reason: 'Sancionado' }
  if (unavailablePlayerIds.includes(player.id)) return { playerId: player.id, eligible: false, status: 'UNAVAILABLE', reason: 'No disponible' }
  return { playerId: player.id, eligible: true }
}

export function validateOfficialSquad(state: GameState, match: LeagueMatch, playerIds: number[], players: Player[], sanctions: LeagueSanction[]) {
  if (match.competitionType === 'FRIENDLY') return []
  const errors: string[] = []
  if (new Set(playerIds).size !== playerIds.length) errors.push('La convocatoria contiene jugadores duplicados.')
  if (playerIds.length < OFFICIAL_SQUAD_MIN) errors.push(`Necesitas al menos ${OFFICIAL_SQUAD_MIN} jugadores para disputar el partido.`)
  if (playerIds.length > OFFICIAL_SQUAD_MAX) errors.push(`No puedes convocar a más de ${OFFICIAL_SQUAD_MAX} jugadores.`)
  const invalid = playerIds.filter((id) => { const player = players.find((item) => item.id === id); return !player || !getPlayerEligibility(state, match, player, sanctions).eligible })
  if (invalid.length) errors.push('La lista incluye jugadores que no están disponibles para Liga.')
  return errors
}

export function getPlayerSelectionSummary(history: PlayerMatchSelectionRecord[], playerId: number) {
  const records = history.filter((record) => record.playerId === playerId)
  let calledUpStreak = 0
  let technicalOmissionStreak = 0
  for (let index = records.length - 1; index >= 0; index -= 1) {
    if (records[index].status === 'CALLED_UP' && technicalOmissionStreak === 0) calledUpStreak += 1
    else if (records[index].status === 'TECHNICAL_OMISSION' && calledUpStreak === 0) technicalOmissionStreak += 1
    else break
  }
  return { totalCallUps: records.filter((record) => record.status === 'CALLED_UP').length, calledUpStreak, technicalOmissionStreak, lastRecord: records.at(-1) }
}

function previousTechnicalOmissions(history: PlayerMatchSelectionRecord[], playerId: number) {
  let streak = 0
  for (let index = history.length - 1; index >= 0; index -= 1) {
    const record = history[index]
    if (record.playerId !== playerId) continue
    if (record.status !== 'TECHNICAL_OMISSION') break
    streak += 1
  }
  return streak
}

function omissionReaction(state: GameState, player: Player, match: LeagueMatch) {
  const human = state.training.players[player.id]
  const history = state.squadSelectionHistory
  const omissionStreak = previousTechnicalOmissions(history, player.id) + 1
  const appearances = state.playerSeasonStats[player.id]?.appearances ?? 0
  const expectedUse = Math.min(1, appearances / Math.max(1, match.matchday - 1))
  const ratingExpectation = Math.max(0, (calculateGeneralRating(player) - 52) / 35)
  const personality = human ? PERSONALITY_MODIFIERS[human.personality] : undefined
  const sensitivity = 1 + (personality?.playingTimeSensitivity ?? 0) * .18
  const authorityBuffer = human ? (human.authorityWithCoach - 50) / 100 : 0
  const unhappinessPressure = human ? Math.max(0, 60 - human.happiness.playingTime) / 35 : 0
  const raw = (.15 + expectedUse * 1.25 + ratingExpectation * .8 + Math.max(0, omissionStreak - 1) * .65 + unhappinessPressure - authorityBuffer) * sensitivity
  const happinessDelta = -Math.round(raw * 10) / 10
  const authorityDelta = raw >= 2 ? -.5 : raw >= 1 ? -.2 : 0
  const significance = raw >= 2.2 || omissionStreak >= 3 ? 'RELEVANT' : raw >= .9 ? 'MINOR' : 'NONE'
  const text = significance === 'RELEVANT' ? (omissionStreak >= 3 ? `${player.name} vuelve a quedarse fuera. Es la ${omissionStreak}.ª convocatoria consecutiva que se pierde por decisión técnica.` : `${player.name} se queda fuera pese a venir teniendo un papel importante.`) : undefined
  return { playerId: player.id, happinessDelta, authorityDelta, omissionStreak, significance, text } satisfies SquadReaction
}

export function resolveSquadAnnouncement(current: GameState, match: LeagueMatch, playerIds: number[], players: Player[], sanctions: LeagueSanction[], announcedAt: string) {
  if (current.squadSelections[match.id]?.announced) return { state: current, errors: [] as string[] }
  const errors = validateOfficialSquad(current, match, playerIds, players, sanctions)
  if (errors.length) return { state: current, errors }
  const state = structuredClone(current)
  const selected = new Set(playerIds)
  const records = players.map((player): PlayerMatchSelectionRecord => {
    const eligibility = getPlayerEligibility(state, match, player, sanctions)
    return { matchId: match.id, playerId: player.id, status: eligibility.eligible ? (selected.has(player.id) ? 'CALLED_UP' : 'TECHNICAL_OMISSION') : eligibility.status!, recordedAt: announcedAt }
  })
  const reactions = records.filter((record) => record.status === 'TECHNICAL_OMISSION').map((record) => omissionReaction(state, players.find((player) => player.id === record.playerId)!, match))
  reactions.forEach((reaction) => { const human = state.training.players[reaction.playerId]; if (!human) return; human.happiness.playingTime = clamp(human.happiness.playingTime + reaction.happinessDelta); human.authorityWithCoach = clamp(human.authorityWithCoach + reaction.authorityDelta) })
  state.squadSelectionHistory.push(...records)
  state.squadSelections[match.id] = { matchId: match.id, announced: true, playerIds: [...playerIds], announcedAt, records, reactions }
  const relevant = reactions.find((reaction) => reaction.significance === 'RELEVANT' && reaction.text)
  if (relevant) {
    const message: InboxMessage = { id: `selection-reaction-${match.id}-${relevant.playerId}`, senderType: 'staff', senderName: 'Manolo Escudero', subject: players.find((player) => player.id === relevant.playerId)?.name ?? 'Convocatoria', body: `${relevant.text} Me ha preguntado si hay algún problema con él.`, matchday: match.matchday, status: 'new', attention: 'IMPORTANT', createdAt: announcedAt }
    if (!state.inboxMessages.some((item) => item.id === message.id)) state.inboxMessages.push(message)
  }
  return { state, errors: [] as string[] }
}
