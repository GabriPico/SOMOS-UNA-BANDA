import type { GameState } from './gameState'
import type { LeagueMatch, LeagueSanction, LeagueTeam, Player, RivalTeamProfile, TacticalPlan, TrainingBlock } from './models'
import { calculateStandings } from './leagueStandings'
import { getOpponentId } from './nextMatch'
import { resolveStaffAvailability } from './gameTime'
import { getPlayerHappiness } from './trainingEngine'
import { getPlayerEligibility } from './squadSelection'
import type { DressingRoomPlayerProfile } from './humanState'
import { PREMATCH_TALK_BALANCE as balance } from './preMatchTalkBalance'
import type { PrematchTalkContext, TalkInstruction, TalkSituation, TalkTrainingConnection } from './preMatchTalkTypes'

const CLUB = 'fc-poblenou'
export type PrematchTalkSources = { teams: LeagueTeam[]; profiles: RivalTeamProfile[]; players: Player[]; sanctions?: LeagueSanction[]; dressingRoomPlayers?: DressingRoomPlayerProfile[] }
export const talkHash = (text: string, seed: number) => [...text].reduce((result, char) => Math.imul(result ^ char.charCodeAt(0), 16777619) >>> 0, seed >>> 0)
const participates = (match: LeagueMatch, teamId = CLUB) => match.homeTeamId === teamId || match.awayTeamId === teamId
const at = (match: LeagueMatch) => `${match.date}T${match.time}`
const instructionBlocks: Record<TalkInstruction, TrainingBlock> = {
  mentality: 'Ataque posicional', passingStyle: 'Ataque posicional', tempo: 'Ataque posicional',
  afterRecovery: 'Transición ofensiva', pressingHeight: 'Defensa posicional / Presión', pressingIntensity: 'Defensa posicional / Presión', afterLoss: 'Transición defensiva',
}

export function buildPrematchTalkContext(game: GameState, match: LeagueMatch, sources: PrematchTalkSources): PrematchTalkContext {
  const preparation = game.preMatchPreparations[match.id]
  if (!preparation) throw new Error('La charla necesita una preparación de partido.')
  const plan = preparation.tacticalPlan
  const previousMatches = game.temporal.calendar.filter((item) => item.status === 'played' && at(item) < at(match)).sort((a, b) => at(a).localeCompare(at(b)) || a.id.localeCompare(b.id))
  const played = previousMatches.filter((item) => participates(item))
  const official = played.filter((item) => item.competitionType !== 'FRIENDLY')
  const friendly = match.competitionType === 'FRIENDLY'
  const recentResults = (friendly ? played : official).slice(-5).map((item) => {
    const difference = (item.homeGoals - item.awayGoals) * (item.homeTeamId === CLUB ? 1 : -1)
    return difference > 0 ? 'G' as const : difference < 0 ? 'P' as const : 'E' as const
  })
  const standings = calculateStandings(sources.teams, previousMatches.filter((item) => !item.playoffRound), Number.MAX_SAFE_INTEGER)
  const own = standings.find((row) => row.teamId === CLUB)
  const rivalId = getOpponentId(match, CLUB)
  const rivalStanding = standings.find((row) => row.teamId === rivalId)
  const profile = sources.profiles.find((item) => item.teamId === rivalId)
  const situations: TalkSituation[] = []
  const expectation = game.expectations.expectations.find((item) => item.type === 'league' && ['below', 'far-below'].includes(item.assessment))
  const incident = [...game.narrativeFacts].reverse().find((fact) =>
    ['coachShutVeteranDown', 'coachStrictlyStoppedJoke', 'coachIgnoredJoke', 'veteranQuestionedTraining', 'trainingPromiseBroken'].includes(fact.id)
    && fact.occurredAt <= `${at(match)}:00` && fact.occurredAt > (played.length ? `${at(played.at(-1)!)}:00` : game.temporal.startedAt))
  const remaining = game.temporal.calendar.filter((item) => participates(item) && item.competitionType !== 'FRIENDLY' && !item.playoffRound && item.status === 'scheduled' && at(item) >= at(match)).length
  const directRival = Boolean(own && rivalStanding && own.played >= 3 && rivalStanding.played >= 3 && Math.abs(own.points - rivalStanding.points) <= 3 && Math.abs(own.position - rivalStanding.position) <= 2)
  const promotion = Boolean(own && own.played >= 6 && own.position <= 3 && standings[0].points - own.points <= 6)
  const playoff = Boolean(own && own.played >= 6 && own.position >= 3 && own.position <= 7 && Math.abs((standings[4]?.points ?? 0) - own.points) <= 6)
  // Only call it decisive near an actual qualification boundary on the final league date.
  const decisive = remaining === 1 && Boolean(own && own.played >= 6 && (
    (own.position <= 2 && Math.abs(standings[0].points - (standings[1]?.points ?? 0)) <= 3)
    || (own.position >= 4 && own.position <= 6 && Math.abs((standings[4]?.points ?? 0) - (standings[5]?.points ?? 0)) <= 3)))
  if (match.playoffRound) situations.push(match.playoffRound === 'FINAL' ? 'PLAYOFF_FINAL' : 'PLAYOFF_SEMIFINAL')
  if (decisive && !friendly) situations.push('DECISIVE')
  if (match.derby && !friendly) situations.push('DERBY')
  if (friendly) situations.push(played.length === 0 ? 'FIRST_FRIENDLY' : 'FRIENDLY')
  else if (!official.length) situations.push('LEAGUE_DEBUT')
  if (recentResults.length >= 3 && recentResults.slice(-3).every((result) => result === 'P')) situations.push('REACTION')
  if (recentResults.filter((result) => result === 'P').length >= 3) situations.push('BAD_RUN')
  if (!friendly && directRival) situations.push('DIRECT_RIVAL')
  if (recentResults.length >= 3 && recentResults.filter((result) => result === 'G').length >= 3) situations.push('GOOD_RUN')
  if (incident) situations.push('INCIDENT')
  if (!friendly && expectation) situations.push('PRESIDENT')
  if (!friendly && promotion) situations.push('PROMOTION')
  if (!friendly && playoff) situations.push('PLAYOFF_RACE')
  if (own && rivalStanding && own.played >= 4 && rivalStanding.played >= 4) {
    if (rivalStanding.points / rivalStanding.played - own.points / own.played >= .8) situations.push('STRONG_RIVAL')
    if (own.points / own.played - rivalStanding.points / rivalStanding.played >= .8) situations.push('WEAK_RIVAL')
  }
  if (!situations.length) situations.push('LEAGUE')

  const previousPlan = game.preMatchPreparations[played.at(-1)?.id ?? '']?.tacticalPlan
  const plans = played.slice(-8).flatMap((item) => game.preMatchPreparations[item.id] ? [game.preMatchPreparations[item.id].tacticalPlan] : [])
  const uses = plans.filter((item) => item.formation === plan.formation).length
  const formationFamiliarity = game.training.familiarity.formations[plan.formation]?.current ?? 0
  const habitualFormation = plans.length >= balance.habitualMinimumMatches
    ? Object.entries(game.training.familiarity.formations).map(([formation, memory]) => ({ formation: formation as TacticalPlan['formation'], count: plans.filter((item) => item.formation === formation).length, familiarity: memory.current }))
      .filter((item) => item.count >= balance.habitualMinimumMatches && item.count / plans.length >= balance.habitualShare && item.familiarity >= balance.lowFamiliarity)
      .sort((a, b) => b.count - a.count || b.familiarity - a.familiarity)[0]?.formation
    : undefined
  const formationUse = !played.length ? 'FIRST' : habitualFormation === plan.formation ? 'HABITUAL' : !uses ? 'NEW' : previousPlan?.formation === plan.formation ? 'RECENT' : 'LITTLE_USED'
  // Sessions are the current week's immutable results. Pending plans never count.
  const sessions = game.training.sessions.filter((session) => session.status === 'completed' && session.result)
  const useful = sessions.filter((session) => session.result!.qualityLabel !== 'De mínimos')
  const formationTrainingDays = useful.filter((session) => session.result!.tacticalPlan.formation === plan.formation && session.blocks.some((block) => block === 'Táctica' || block === 'Completo')).map((session) => session.day)
  const tacticalConnections: TalkTrainingConnection[] = (Object.entries(instructionBlocks) as [TalkInstruction, TrainingBlock][]).map(([instruction, block]) => {
    const habitualValue = Object.keys(game.training.familiarity.instructions[instruction] ?? {}).find((value) => {
      const count = plans.filter((item) => item[instruction] === value).length
      return count >= balance.habitualMinimumMatches && count / plans.length >= balance.habitualShare && (game.training.familiarity.instructions[instruction][value]?.current ?? 0) >= balance.lowFamiliarity
    })
    return {
      instruction, block, habitualValue, familiarity: game.training.familiarity.instructions[instruction]?.[plan[instruction]]?.current ?? 0,
      changed: Boolean(previousPlan && previousPlan[instruction] !== plan[instruction]) || Boolean(habitualValue && habitualValue !== plan[instruction]),
      days: useful.filter((session) => session.result!.tacticalPlan[instruction] === plan[instruction] && session.blocks.some((item) => [block, 'Táctica', 'Completo'].includes(item))).map((session) => session.day),
    }
  })
  const setPieceDays = useful.filter((session) => session.blocks.includes('Balón parado')).map((session) => session.day)
  if (setPieceDays.length) tacticalConnections.push({ block: 'Balón parado', familiarity: game.training.familiarity.setPieces.current, changed: false, days: setPieceDays })

  const availability = game.temporal.activeCheckpoint?.relatedId === match.id && game.temporal.activeCheckpoint.availableStaffIds
    ? game.temporal.activeCheckpoint
    : resolveStaffAvailability(game.staff.members, match.id, `${at(match)}:00`, game.temporal.seed)
  const second = game.staff.members.find((member) => member.role === 'SEGUNDO_ENTRENADOR' && availability.availableStaffIds?.includes(member.id))
  // A generic team profile is not proof that this assistant scouted today's opponent.
  const knowledge = profile?.scouting.knowledge ?? 'LIMITED'
  const previousMeetings = played.filter((item) => participates(item, rivalId)).length
  const important = Boolean(match.playoffRound || match.derby || decisive || directRival || situations.includes('STRONG_RIVAL'))
  const analysisReason: PrematchTalkContext['rival']['analysisReason'] = friendly || situations.includes('WEAK_RIVAL') || knowledge !== 'OBSERVED' || !second ? undefined
    : profile?.scouting.preparedForMatchId === match.id ? 'PREPARED'
    : profile?.scouting.knownByStaffIds?.includes(second.id) ? 'PERSONAL_KNOWLEDGE'
    : previousMeetings > 0 ? 'PREVIOUS_MEETING'
    : important ? 'IMPORTANT' : undefined
  const knownWeakness = analysisReason ? profile?.collectiveWeaknesses?.[profile.scouting.response?.weaknessIndex ?? 0] : undefined
  const facts: PrematchTalkContext['rival']['facts'] = []
  if (knownWeakness) facts.push({ id: 'weakness', text: knownWeakness })
  if (analysisReason && profile) {
    if (profile.scouting.observedPattern) facts.push({ id: 'pattern', text: profile.scouting.observedPattern })
    facts.push({ id: 'formation', text: `La referencia que tenemos es un ${profile.preferredFormation}.` })
    if (profile.scouting.withBall) facts.push({ id: 'style', text: profile.scouting.withBall })
  }
  // Results are public; never derive scouting from hidden player attributes.
  const rivalRecent = previousMatches.filter((item) => participates(item, rivalId)).slice(-3)
  if (rivalRecent.length >= 2 && !facts.length) facts.push({ id: 'results', text: `Han ganado ${rivalRecent.filter((item) => (item.homeGoals - item.awayGoals) * (item.homeTeamId === rivalId ? 1 : -1) > 0).length} de sus últimos ${rivalRecent.length} partidos. Eso sí lo sabemos.` })
  const reliability = second?.capabilities ? (second.capabilities.observation + second.capabilities.footballKnowledge) / 2 * (knowledge === 'OBSERVED' ? .85 : .35) : 20
  const analytical = second?.assistantProfile === 'JOVEN_CON_IDEAS' || second?.assistantProfile === 'METODICO'
  const pragmatic = second?.assistantProfile === 'VETERANO_PRACTICO' || second?.assistantArchetype === 'CLUB_VETERAN'
  const chosenFacts = facts.slice(0, reliability >= 50 ? 2 : 1)
  const calledUp = game.squadSelections[match.id]?.playerIds ?? preparation.lineupIds
  const unavailable = game.squadSelections[match.id]?.records.filter((record) => record.status === 'UNAVAILABLE').map((record) => record.playerId) ?? []
  const participants = sources.players.filter((player) => calledUp.includes(player.id) && getPlayerEligibility(game, match, player, sources.sanctions ?? [], unavailable).eligible).flatMap((player) => {
    const human = game.training.players[player.id]
    if (!human) return []
    const recentRatings = (game.playerSeasonStats[player.id]?.ratings ?? []).slice(-3)
    const confidence = recentRatings.length ? Math.max(0, Math.min(100, recentRatings.reduce((sum, item) => sum + item.rating, 0) / recentRatings.length * 10 - 15)) : getPlayerHappiness(human)
    return [{ id: player.id, name: player.name, personality: human.personality, authority: human.managerAuthority, happiness: getPlayerHappiness(human), relationship: human.managerRelationship, confidence }]
  })
  const captain = ['Capitán', 'Segundo capitán'].map((role) => participants.find((player) => sources.dressingRoomPlayers?.some((profile) => profile.playerId === player.id && profile.socialRole === role))).find(Boolean)
  const leader = captain ?? participants.find((player) => game.training.players[player.id].lockerRoomInfluence === 'LEADER')
    ?? participants.find((player) => player.personality === 'Líder')
    ?? participants.find((player) => game.training.players[player.id].lockerRoomInfluence === 'HIGH')
  const planClarity = second?.capabilities ? (second.capabilities.footballKnowledge + second.capabilities.organization) / 2 : 0
  const planDelivery = planClarity < balance.assistantClearPlan ? 'RAMBLING' : (second?.groupRelationship ?? 0) >= balance.assistantConnected ? 'CONNECTED' : 'CLEAR'
  return structuredClone({
    version: 3, teamName: sources.teams.find((team) => team.id === CLUB)?.name ?? CLUB,
    huddleLeader: leader ? { id: leader.id, name: leader.name } : undefined,
    matchId: match.id, seed: talkHash(match.id, game.temporal.seed), match, situations, primarySituation: situations[0],
    importance: match.playoffRound || decisive ? 3 : !friendly && (match.derby || directRival || promotion || playoff || expectation || situations.includes('BAD_RUN')) ? 2 : friendly ? 0 : 1,
    playedMatches: played.length, recentResults, standings, objective: game.seasonObjective, expectation: expectation?.objective, incidentId: incident?.id,
    rival: { id: rivalId, name: sources.teams.find((item) => item.id === rivalId)?.name ?? rivalId, knowledge, previousMeetings, analysisReason, facts: chosenFacts, response: chosenFacts.some((item) => item.id === 'weakness') ? profile?.scouting.response : undefined },
    assistant: second ? { id: second.id, name: second.name, profile: second.assistantProfile, voice: pragmatic ? 'PRAGMATIC' : analytical ? 'ANALYTICAL' : second.personality === 'TRANQUILO' ? 'CAUTIOUS' : 'DIRECT', reliability, planDelivery } : undefined,
    coachId: game.staff.members.find((member) => member.role === 'PRIMER_ENTRENADOR')?.id ?? 'coach',
    plan, previousPlan, habitualFormation, formationUse, formationFamiliarity, formationTrainingDays, tacticalConnections,
    physicalLoadRelevant: sessions.some((session) => session.blocks.includes('Físico')) && participants.some((player) => game.training.players[player.id].fatigue >= 55),
    authority: game.manager.generalAuthority, cohesion: game.team.cohesion, participants,
  })
}
