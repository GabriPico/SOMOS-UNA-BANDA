import type { Formation, GoalEvent, LeagueMatch, Player, PlayerAttribute, PlayerAttributes, PlayerPosition, RivalPlayer, TacticalPlan } from './models'
import type { StaffPerson } from './staff'
import type { TrainingGameState, TrainingPlayerState } from './trainingTypes'
import { getEffectiveMatchAttributes, getPlayerHappiness } from './trainingEngine'
import { getEffectiveAttributesForPosition } from './positionFamiliarity'
import { PERSONALITY_MODIFIERS } from './trainingPersonality'
import { POSITION_RATING_WEIGHTS, POSITION_TO_RATING_PROFILE, calculatePositionRating } from './playerRatings'
import { getPositionFamiliarity, getPositionPenalty } from './positionFamiliarity'
import { FORMATION_SLOTS, getAttackRouteWeights, tacticalSignature } from './matchTactics'
import { behavioralState, contextForRoute, duelScore } from './matchDuels'
import type { AttackRoute, MatchEvent, MatchMood, MatchPlayer, MatchPlayerStats, MatchState, MatchStatistics, MatchTeamSide, MatchTeamState } from './matchTypes'
import { getSubstitutionRules } from './substitutionRules'
import { getPhysicalIssueEffects } from './physicalIssues'
import type { TalkEmotions } from './preMatchTalkTypes'

const USER_TEAM_ID = 'fc-poblenou'
const clamp = (value: number, minimum = 0, maximum = 100) => Math.max(minimum, Math.min(maximum, value))
const blankStats = (): MatchStatistics => ({ possessionTicks: 0, shots: 0, shotsOnTarget: 0, corners: 0, fouls: 0, yellowCards: 0, redCards: 0 })
const blankPlayerStats = (): MatchPlayerStats => ({ duelsWon: 0, duelsLost: 0, aerialDuelsWon: 0, recoveries: 0, losses: 0, progressions: 0, chancesCreated: 0, shots: 0, saves: 0, errors: 0, tacticalActions: 0 })
const hash = (value: string, seed = 2166136261) => [...value].reduce((result, character) => Math.imul(result ^ character.charCodeAt(0), 16777619) >>> 0, seed >>> 0)
function random(state: MatchState, salt: string) { return hash(`${state.matchId}|${state.sequence}|${state.minute}|${tacticalSignature(state.home.tactics)}|${tacticalSignature(state.away.tactics)}|${salt}`, state.seed) / 4294967296 }
function pickWeighted<T extends string>(state: MatchState, salt: string, weights: Record<T, number>): T {
  const entries = Object.entries(weights) as [T, number][]; const total = entries.reduce((sum, [, weight]) => sum + Math.max(0, weight), 0); let value = random(state, salt) * total
  for (const [key, weight] of entries) { value -= Math.max(0, weight); if (value <= 0) return key }
  return entries[entries.length - 1][0]
}
function pushEvent(state: MatchState, event: Omit<MatchEvent, 'id'>) { const importance = event.importance ?? (['GOAL', 'CHANCE', 'SAVE', 'YELLOW', 'RED', 'INJURY', 'HALF_TIME', 'FULL_TIME'].includes(event.kind) ? 'HIGHLIGHT' : 'CONTEXT'); const created = { ...event, importance, id: `${state.matchId}-${state.sequence}-${event.kind}-${state.events.length}` }; state.events.push(created); return created }
const team = (state: MatchState, side: MatchTeamSide) => state[side]
const otherSide = (side: MatchTeamSide): MatchTeamSide => side === 'home' ? 'away' : 'home'
const sideForTeam = (state: MatchState, teamId: string): MatchTeamSide => state.home.teamId === teamId ? 'home' : 'away'
const activePlayers = (value: MatchTeamState) => Object.values(value.players).filter((player) => player.onPitch && !player.redCard)
function setMatchPlayerPosition(player: MatchPlayer, position: PlayerPosition) { player.position = position; const penalty = getPositionPenalty({ primaryPosition: player.naturalPositions[0], secondaryPositions: player.naturalPositions.slice(1) }, position); const relevant = new Set(Object.keys(POSITION_RATING_WEIGHTS[POSITION_TO_RATING_PROFILE[position]]) as PlayerAttribute[]); player.attributes = Object.fromEntries(Object.entries(player.baseMatchAttributes).map(([key, value]) => [key, relevant.has(key as PlayerAttribute) ? Math.max(1, value - penalty) : value])) as PlayerAttributes }
const byPositions = (value: MatchTeamState, positions: PlayerPosition[]) => activePlayers(value).filter((player) => positions.includes(player.position))
function choosePlayer(state: MatchState, value: MatchTeamState, positions: PlayerPosition[], salt: string) {
  const candidates = byPositions(value, positions); const pool = candidates.length ? candidates : activePlayers(value)
  return pool[Math.floor(random(state, salt) * pool.length) % pool.length]
}
function effectiveAttributes(player: Player, training: TrainingPlayerState, position: PlayerPosition) {
  const trained = { ...player, attributes: getEffectiveMatchAttributes(training) }
  return getEffectiveAttributesForPosition(trained, position)
}
function clubMatchPlayer(player: Player, training: TrainingPlayerState, position: PlayerPosition, onPitch: boolean): MatchPlayer {
  const happiness = getPlayerHappiness(training); const mood: MatchMood = happiness < 42 && training.personality === 'Caliente' ? 'FRUSTRATED' : happiness < 38 ? 'DISCONNECTED' : happiness > 78 ? 'MOTIVATED' : 'NEUTRAL'
  const baseMatchAttributes = getEffectiveMatchAttributes(training)
  return { id: player.id, teamId: USER_TEAM_ID, name: player.name, position, naturalPositions: [player.primaryPosition, ...player.secondaryPositions], attributes: effectiveAttributes(player, training, position), baseMatchAttributes, personality: training.personality, happiness, authority: training.managerAuthority, condition: training.fitness, fatigue: training.fatigue, minutesPlayed: 0, yellowCards: 0, redCard: false, injured: false, onPitch, performance: 50, actions: 0, mood, matchStats: blankPlayerStats(), fatigueNoticeLevel: 0, currentIssue: training.currentIssue ? { ...training.currentIssue } : undefined }
}
function varyAttributes(attributes: PlayerAttributes, seed: number): PlayerAttributes {
  return Object.fromEntries(Object.entries(attributes).map(([key, value], index) => [key, clamp(value + (hash(`${seed}:${key}:${index}`) % 5) - 2, 1, 20)])) as PlayerAttributes
}
function opponentPlayers(teamId: string, sources: RivalPlayer[], formation: Formation, seed: number): MatchPlayer[] {
  const teamSources = sources.filter((player) => player.teamId === teamId)
  const positions = [...FORMATION_SLOTS[formation], ...teamSources.slice(0, 5).map(player => player.primaryPosition)]
  return positions.map((position, index) => {
    const roleSource = teamSources.find((player) => player.primaryPosition === position) ?? teamSources[index % teamSources.length]
    const id = roleSource.id * 100 + index
    const baseMatchAttributes = varyAttributes(roleSource.attributes, seed + index)
    return { id, canonicalScorerId: roleSource.id, teamId, name: index < teamSources.length ? roleSource.name : `${roleSource.name.split(' ')[0]} ${index + 1}`, position, naturalPositions: [roleSource.primaryPosition, ...roleSource.secondaryPositions], attributes: baseMatchAttributes, baseMatchAttributes, personality: 'Competitivo', happiness: 62, authority: 64, condition: 78 + hash(`${teamId}:${index}:condition`, seed) % 15, fatigue: 10 + hash(`${teamId}:${index}:fatigue`, seed) % 18, minutesPlayed: 0, yellowCards: 0, redCard: false, injured: false, onPitch: index < 11, performance: 50, actions: 0, mood: 'NEUTRAL', matchStats: blankPlayerStats(), fatigueNoticeLevel: 0 }
  })
}
const opponentPlan = (formation: Formation): TacticalPlan => ({ formation, mentality: 'Equilibrada', passingStyle: formation === '4-4-2' || formation === '3-5-2' ? 'Directo' : 'Mixto', tempo: 'Medio', afterRecovery: 'Contraataque', pressingHeight: formation === '3-5-2' ? 'Baja' : 'Media', pressingIntensity: 'Media', afterLoss: 'Mixto', timeWasting: 'No', aggression: 'No' })
function familiarityFromTraining(training: TrainingGameState, plan: TacticalPlan) {
  const current = (key: keyof TacticalPlan) => training.familiarity.instructions[key]?.[String(plan[key])]?.current ?? 45
  const formations = Object.fromEntries(Object.entries(training.familiarity.formations).map(([key, value]) => [key, value.current]))
  const instructions = Object.fromEntries(Object.entries(training.familiarity.instructions).map(([key, values]) => [key, Object.fromEntries(Object.entries(values).map(([option, value]) => [option, value.current]))]))
  return { formation: training.familiarity.formations[plan.formation]?.current ?? 35, attack: (current('mentality') + current('passingStyle') + current('tempo')) / 3, transitionAttack: current('afterRecovery'), defense: (current('pressingHeight') + current('pressingIntensity')) / 2, transitionDefense: current('afterLoss'), setPieces: training.familiarity.setPieces.current, formations, instructions }
}
export type CreateMatchInput = { match: LeagueMatch; homeName: string; awayName: string; clubPlayers: Player[]; rivalPlayers: RivalPlayer[]; lineupIds: number[]; plan: TacticalPlan; training: TrainingGameState; opponentFormation: Formation; seed: number; cohesion: number; prematchEmotions?: Record<number, TalkEmotions> }
export function createMatchState(input: CreateMatchInput): MatchState {
  const clubIsHome = input.match.homeTeamId === USER_TEAM_ID
  const slots = FORMATION_SLOTS[input.plan.formation]
  const starters = input.lineupIds.slice(0, 11)
  const clubPlayerStates = Object.fromEntries(input.clubPlayers.map((player) => { const slot = starters.indexOf(player.id); const position = slot >= 0 ? slots[slot] : player.primaryPosition; return [player.id, clubMatchPlayer(player, input.training.players[player.id], position, slot >= 0)] }))
  for (const player of Object.values(clubPlayerStates)) {
    const emotions = input.prematchEmotions?.[player.id]
    if (!emotions) continue
    player.prematchEmotions = { ...emotions }
    if (emotions.nerves >= 2) player.mood = 'NERVOUS'
    else if (emotions.involvement <= -2) player.mood = 'DISCONNECTED'
    else if (emotions.confidence >= 2) player.mood = 'CONFIDENT'
    else if (emotions.motivation >= 2) player.mood = 'MOTIVATED'
  }
  const opponentId = clubIsHome ? input.match.awayTeamId : input.match.homeTeamId
  const opponent = opponentPlayers(opponentId, input.rivalPlayers, input.opponentFormation, input.seed)
  const clubTeam: MatchTeamState = { teamId: USER_TEAM_ID, name: clubIsHome ? input.homeName : input.awayName, lineup: { formation: input.plan.formation, starters, bench: input.clubPlayers.filter((p) => !starters.includes(p.id)).map((p) => p.id), slots }, tactics: { ...input.plan }, players: clubPlayerStates, familiarity: familiarityFromTraining(input.training, input.plan), cohesion: input.cohesion, routeSuccess: {}, routeAttempts: {} }
  const rivalPlan = opponentPlan(input.opponentFormation)
  const rivalFamiliarity = { formation: 62, attack: 61, transitionAttack: 58, defense: 61, transitionDefense: 58, setPieces: 55, formations: Object.fromEntries(Object.keys(FORMATION_SLOTS).map((key) => [key, key === input.opponentFormation ? 62 : 38])), instructions: {} }
  const rivalTeam: MatchTeamState = { teamId: opponentId, name: clubIsHome ? input.awayName : input.homeName, lineup: { formation: input.opponentFormation, starters: opponent.slice(0,11).map((p) => p.id), bench: opponent.slice(11).map(p => p.id), slots: FORMATION_SLOTS[input.opponentFormation] }, tactics: rivalPlan, players: Object.fromEntries(opponent.map((p) => [p.id, p])), familiarity: rivalFamiliarity, cohesion: 61, routeSuccess: {}, routeAttempts: {} }
  return { matchId: input.match.id, competitionType: input.match.competitionType ?? 'LEAGUE', seed: input.seed, sequence: 0, minute: 0, clockSeconds: 0, phase: 'PRE_MATCH', home: clubIsHome ? clubTeam : rivalTeam, away: clubIsHome ? rivalTeam : clubTeam, score: { home: 0, away: 0 }, statistics: { home: blankStats(), away: blankStats() }, events: [], goalEvents: [], substitutions: [], observations: [], interventionRequested: false, substitutionInterruptions: { home: 0, away: 0 }, committed: false, recentControl: [] }
}

function fatigueTick(value: MatchTeamState) {
  const plan = value.tactics
  const load = .42 + ({ Bajo: 0, Medio: .12, Alto: .28 } as const)[plan.tempo] + ({ Baja: 0, Media: .12, Alta: .3 } as const)[plan.pressingIntensity] + (plan.pressingHeight === 'Alta' ? .12 : 0) + (plan.afterLoss === 'Presión tras pérdida' ? .16 : 0)
  activePlayers(value).forEach((player) => { const resistance = player.attributes.resistencia; player.fatigue = clamp(player.fatigue + load * (1.18 - resistance * .018)); player.condition = clamp(player.condition - load * .18); player.minutesPlayed += 2 })
}
function controlScore(value: MatchTeamState) {
  const midfield = byPositions(value, ['MCD', 'MC', 'MP']).reduce((sum, p) => sum + p.attributes.pases * .45 + p.attributes.tecnica * .25 + p.attributes.mentalidad * .3, 0)
  const adherence = activePlayers(value).reduce((sum, p) => sum + (1 - behavioralState(p).disobedience), 0) / Math.max(1, activePlayers(value).length)
  return midfield + (value.tactics.passingStyle === 'En corto' ? 8 : value.tactics.passingStyle === 'Directo' ? -4 : 1) + (value.tactics.tempo === 'Bajo' ? 3 : 0) + value.familiarity.attack * .08 * adherence
}
function applyDiscipline(state: MatchState, side: MatchTeamSide, defender: MatchPlayer, pressure: number) {
  const defending = team(state, side); const stats = state.statistics[side]
  const personality = PERSONALITY_MODIFIERS[defender.personality as keyof typeof PERSONALITY_MODIFIERS]
  const aggression = defending.tactics.aggression === 'Sí' ? .11 : .055
  const foulChance = aggression + pressure * .012 + (personality?.conflictProneness ?? 0) * .007
  if (random(state, 'foul') >= foulChance) return false
  stats.fouls += 1
  if (random(state, 'card') < .2 + (defender.yellowCards ? .04 : 0)) {
    defender.yellowCards += 1; stats.yellowCards += 1
    if (defender.yellowCards >= 2) { defender.redCard = true; defender.onPitch = false; stats.redCards += 1; pushEvent(state, { minute: state.minute, kind: 'RED', teamId: defending.teamId, playerId: defender.id, text: `${state.minute}' Segunda amarilla y expulsión para ${defender.name}.` }); state.phase = 'PAUSED_FOR_DECISION'; state.pauseReason = 'RED_CARD' }
    else pushEvent(state, { minute: state.minute, kind: 'YELLOW', teamId: defending.teamId, playerId: defender.id, text: `${state.minute}' Amarilla para ${defender.name}.` })
  } else pushEvent(state, { minute: state.minute, kind: 'FOUL', teamId: defending.teamId, playerId: defender.id, text: `${state.minute}' ${defender.name} corta la progresión con una falta.` })
  return true
}
function simulateAttack(state: MatchState, attackingSide: MatchTeamSide) {
  const defendingSide = otherSide(attackingSide); const attacking = team(state, attackingSide); const defending = team(state, defendingSide)
  const difference = (attackingSide === 'home' ? state.score.home - state.score.away : state.score.away - state.score.home)
  const route = pickWeighted(state, 'route', getAttackRouteWeights(attacking, difference)); attacking.routeAttempts[route] = (attacking.routeAttempts[route] ?? 0) + 1
  const context = contextForRoute(attacking, defending, route)
  const attacker = choosePlayer(state, attacking, route === 'LEFT_WING' ? ['MI', 'EI', 'CAI'] : route === 'RIGHT_WING' ? ['MD', 'ED', 'CAD'] : route === 'DIRECT_TARGET' || route === 'SET_PIECE' ? ['DC', 'DFC'] : ['DC', 'ED', 'EI', 'MP', 'MC'], `attacker:${route}`)
  const defender = choosePlayer(state, defending, route === 'LEFT_WING' ? ['LD', 'CAD', 'DFC'] : route === 'RIGHT_WING' ? ['LI', 'CAI', 'DFC'] : ['DFC', 'MCD', 'MC'], `defender:${route}`)
  const taker = route === 'SET_PIECE' ? choosePlayer(state, attacking, ['MC', 'MP', 'MD', 'MI'], 'set-piece-taker') : undefined
  attacker.actions += 1; defender.actions += 1
  const setPieceDelivery = taker ? taker.attributes.balonParado * .14 + attacking.familiarity.setPieces * .025 : 0
  const attack = duelScore(attacker, context.kind, 'attack') * (context.kind === 'SPACE' ? context.space : 1) + context.attackingCoordination * .025 + setPieceDelivery - behavioralState(attacker).disobedience * 3
  const defense = duelScore(defender, context.kind, 'defense') + context.coverage * 2.3 + context.pressing
  if (applyDiscipline(state, defendingSide, defender, context.pressing) || state.phase === 'PAUSED_FOR_DECISION') return
  const won = random(state, 'duel') < clamp(.5 + (attack - defense) / 28, .08, .9)
  attacker.performance += won ? 1.5 : -.55; defender.performance += won ? -.85 : 1
  if (!won) {
    attacker.matchStats.duelsLost += 1; attacker.matchStats.losses += 1; defender.matchStats.duelsWon += 1; defender.matchStats.recoveries += 1
    if (context.kind === 'AERIAL') defender.matchStats.aerialDuelsWon += 1
    const stoppedText = context.kind === 'AERIAL' ? `${defender.name} gana el balón aéreo y evita que ${attacking.name} pueda salir.` : context.kind === 'SPACE' ? `${defender.name} corrige bien la carrera a la espalda.` : context.kind === 'BUILD_UP' ? `${defending.name} dificulta la salida y fuerza la pérdida de ${attacker.name}.` : `${defender.name} frena el intento de ${attacker.name}.`
    if (random(state, 'context-stopped') < .25) pushEvent(state, { minute: state.minute, kind: 'TACTICAL', teamId: defending.teamId, playerId: defender.id, route, text: `${state.minute}' ${stoppedText}` })
    if ((attacking.routeAttempts[route] ?? 0) >= 3 && attack + 3 < defense && random(state, 'mismatch-note') < .24) pushEvent(state, { minute: state.minute, kind: 'TACTICAL', teamId: defending.teamId, route, text: `${state.minute}' ${defender.name} está dominando ese duelo.` }); return
  }
  attacker.matchStats.duelsWon += 1; attacker.matchStats.progressions += 1; defender.matchStats.duelsLost += 1
  if (context.kind === 'AERIAL') attacker.matchStats.aerialDuelsWon += 1
  if (attacker.matchStats.duelsWon >= 4) attacker.mood = 'CONFIDENT'
  if (defender.matchStats.duelsLost >= 4 && defender.personality === 'Caliente') defender.mood = 'FRUSTRATED'
  attacking.routeSuccess[route] = (attacking.routeSuccess[route] ?? 0) + 1
  const progressText = context.kind === 'AERIAL' ? `${attacker.name} vuelve a imponerse por arriba y deja una segunda jugada.` : context.kind === 'SPACE' ? `${attacker.name} ataca el espacio y obliga a correr hacia atrás a la defensa.` : context.kind === 'BUILD_UP' ? `${attacking.name} supera la primera presión y progresa por dentro.` : `${attacker.name} supera a ${defender.name} y gana metros.`
  if (random(state, 'context-progress') < .29) pushEvent(state, { minute: state.minute, kind: 'TACTICAL', teamId: attacking.teamId, playerId: attacker.id, route, text: `${state.minute}' ${progressText}` })
  if ((attacking.routeAttempts[route] ?? 0) >= 3 && attack > defense + 2 && random(state, 'mismatch-success') < .24) pushEvent(state, { minute: state.minute, kind: 'TACTICAL', teamId: attacking.teamId, playerId: attacker.id, route, text: `${state.minute}' ${defender.name} vuelve a tener problemas para frenar a ${attacker.name}.` })
  if (random(state, 'corner') < .15) { state.statistics[attackingSide].corners += 1; pushEvent(state, { minute: state.minute, kind: 'CORNER', teamId: attacking.teamId, route, text: `${state.minute}' La defensa despeja a córner una llegada de ${attacking.name}.` }); return }
  const chance = clamp(.47 + (attack - defense) / 35 + (route === 'COUNTER' || route === 'IN_BEHIND' ? .11 : 0) + (route === 'SET_PIECE' ? .06 : 0), .18, .78)
  if (random(state, 'chance') > chance) return
  const finisher = route === 'SET_PIECE' ? attacker : choosePlayer(state, attacking, ['DC', 'ED', 'EI', 'MP', 'MD', 'MI'], 'finisher')
  const goalkeeper = choosePlayer(state, defending, ['POR'], 'goalkeeper')
  const stats = state.statistics[attackingSide]; stats.shots += 1; finisher.matchStats.shots += 1; attacker.matchStats.chancesCreated += attacker.id === finisher.id ? 0 : 1
  const quality = clamp(.18 + chance * .6 + random(state, 'quality') * .22, .12, .82)
  const finish = duelScore(finisher, 'FINISH', 'attack') + quality * 8
  const onTarget = random(state, 'target') < clamp(.28 + quality * .42 + (finish - 10) / 45, .14, .84)
  if (!onTarget) { pushEvent(state, { minute: state.minute, kind: 'CHANCE', teamId: attacking.teamId, playerId: finisher.id, route, importance: quality > .5 ? 'HIGHLIGHT' : 'CONTEXT', text: `${state.minute}' ${finisher.name} prueba el remate, pero se marcha fuera.` }); return }
  stats.shotsOnTarget += 1
  const save = duelScore(goalkeeper, 'FINISH', 'defense'); const goalChance = clamp(.035 + quality * .28 + (finish - save) / 36, .015, .5)
  if (random(state, 'goal') < goalChance) {
    const scoreBefore = { ...state.score }
    state.score[attackingSide] += 1; finisher.performance += 7; goalkeeper.performance -= 2; finisher.mood = 'CONFIDENT'; goalkeeper.mood = goalkeeper.personality === 'Caliente' ? 'FRUSTRATED' : goalkeeper.mood
    const event: GoalEvent = { id: `${state.matchId}-goal-${state.goalEvents.length + 1}`, matchId: state.matchId, teamId: attacking.teamId, scorerId: finisher.canonicalScorerId ?? finisher.id, minute: state.minute, isPenalty: false }; state.goalEvents.push(event)
    const matchEvent = pushEvent(state, { minute: state.minute, kind: 'GOAL', teamId: attacking.teamId, playerId: finisher.id, route, text: `${state.minute}' GOL — ${attacking.name}. Marca ${finisher.name}.` })
    if (!(state.processedGoalEventIds ?? []).includes(matchEvent.id)) { state.goalInterruption = { eventId: matchEvent.id, minute: state.minute, scoringTeamId: attacking.teamId, scorerId: finisher.id, scoreBefore, scoreAfter: { ...state.score }, presentation: 'CELEBRATION' }; state.phase = 'PAUSED_FOR_DECISION'; state.pauseReason = 'GOAL' }
  } else { goalkeeper.performance += quality > .42 ? 2 : 1; goalkeeper.matchStats.saves += 1; pushEvent(state, { minute: state.minute, kind: 'SAVE', teamId: defending.teamId, playerId: goalkeeper.id, route, importance: quality > .5 ? 'HIGHLIGHT' : 'CONTEXT', text: `${state.minute}' ${quality > .5 ? 'Gran parada' : 'Parada segura'} de ${goalkeeper.name}.` }) }
}
function maybeInjury(state: MatchState, side: MatchTeamSide) {
  const value = team(state, side); const candidates = activePlayers(value).filter((p) => !p.injured); if (!candidates.length) return
  const player = candidates[Math.floor(random(state, `injury-player:${side}`) * candidates.length)]
  const risk = (.00035 + Math.max(0, player.fatigue - 60) * .000035 + Math.max(0, 65 - player.condition) * .00002 + (value.tactics.pressingIntensity === 'Alta' ? .00025 : 0)) * (getPhysicalIssueEffects(player.currentIssue)?.injuryRiskMultiplier ?? 1)
  if (random(state, `injury:${side}`) < risk) { player.injured = true; pushEvent(state, { minute: state.minute, kind: 'INJURY', teamId: value.teamId, playerId: player.id, text: `${state.minute}' ${player.name} no puede continuar por molestias.` }); state.phase = 'PAUSED_FOR_DECISION'; state.pauseReason = 'INJURY' }
}
function assistantObservation(state: MatchState, assistant?: StaffPerson) {
  if (!assistant?.capabilities || state.minute < 18 || state.observations.some((o) => state.minute - o.minute < 14)) return
  const club = state.home.teamId === USER_TEAM_ID ? state.home : state.away; const opponent = state.home.teamId === USER_TEAM_ID ? state.away : state.home
  const attempts = Object.entries(opponent.routeAttempts).sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))[0]
  const accuracy = (assistant.capabilities.observation * .6 + assistant.capabilities.footballKnowledge * .4) / 100
  if (random(state, 'assistant-detect') > .25 + accuracy * .6) return
  const candidates: Array<{ topic: string; severity: number; text: string }> = []
  if (attempts && (attempts[1] ?? 0) >= 2) { const route = attempts[0] as AttackRoute; const labels: Record<AttackRoute, string> = { LEFT_WING: 'nuestra derecha', RIGHT_WING: 'nuestra izquierda', CENTRAL: 'el carril central', DIRECT_TARGET: 'el juego directo', IN_BEHIND: 'los balones a la espalda', COUNTER: 'las transiciones', SET_PIECE: 'el balón parado' }; candidates.push({ topic: `route-${route}`, severity: attempts[1] ?? 0, text: `Están insistiendo mediante ${labels[route]}. Vigilaría cómo estamos defendiendo esa zona.` }) }
  const suffering = activePlayers(club).sort((a, b) => b.matchStats.duelsLost - a.matchStats.duelsLost)[0]
  if (suffering?.matchStats.duelsLost >= 3) candidates.push({ topic: `duel-${suffering.id}`, severity: suffering.matchStats.duelsLost, text: `${suffering.name} está sufriendo bastante en sus duelos. Quizá necesite más ayuda.` })
  const aerial = activePlayers(club).sort((a, b) => b.matchStats.aerialDuelsWon - a.matchStats.aerialDuelsWon)[0]
  if (aerial?.matchStats.aerialDuelsWon >= 3) candidates.push({ topic: `aerial-${aerial.id}`, severity: aerial.matchStats.aerialDuelsWon, text: `${aerial.name} está ganando muchos balones por arriba. Seguir buscándolo tiene sentido.` })
  const tired = activePlayers(club).sort((a, b) => b.fatigue - a.fatigue)[0]
  if (tired?.fatigue >= 58) candidates.push({ topic: `fatigue-${tired.id}`, severity: Math.floor(tired.fatigue / 10), text: `${tired.name} empieza a llegar tarde. Parece que el ritmo le está pasando factura.` })
  if (club.familiarity.defense < 48 && club.tactics.pressingIntensity === 'Alta') candidates.push({ topic: 'press-coordination', severity: 6, text: 'Saltamos a presionar, pero las líneas no siempre acompañan. Nos están faltando distancias.' })
  const eligible = candidates.filter((candidate) => { const previous = state.observations.findLast((item) => item.topic === candidate.topic); return !previous || state.minute - previous.minute >= 30 || candidate.severity >= previous.severity + 2 }).sort((a, b) => b.severity - a.severity)[0]
  if (!eligible) return
  const wrong = random(state, 'assistant-error') > .72 + accuracy * .25
  const text = wrong ? 'No lo tengo del todo claro, pero quizá estamos corriendo demasiado con el balón.' : eligible.text
  state.observations.push({ minute: state.minute, text, confidence: accuracy, topic: wrong ? `misread-${state.sequence}` : eligible.topic, severity: eligible.severity })
  if (club.cohesion < 45 && !wrong) state.observations[state.observations.length - 1].text += ' Las ayudas están llegando tarde.'
}
function adjustOpponentLate(state: MatchState) {
  if (state.minute < 70) return
  const rivalSide: MatchTeamSide = state.home.teamId === USER_TEAM_ID ? 'away' : 'home'
  const rival = state[rivalSide]
  const difference = state.score[rivalSide] - state.score[otherSide(rivalSide)]
  rival.tactics.mentality = difference < 0 ? 'Ofensiva' : difference > 0 ? 'Cauta' : rival.tactics.mentality
  rival.tactics.timeWasting = difference > 0 ? 'Sí' : 'No'
}
function substituteInPlace(state: MatchState, teamId: string, playerOutId: number, playerInId: number) {
  const value = state[sideForTeam(state, teamId)]; const outgoing = value.players[playerOutId]; const incoming = value.players[playerInId]
  if (!outgoing?.onPitch || !incoming || incoming.onPitch || outgoing.redCard || incoming.redCard) return false
  setMatchPlayerPosition(incoming, outgoing.position); outgoing.onPitch = false; incoming.onPitch = true; value.lineup.starters = value.lineup.starters.map(id => id === playerOutId ? playerInId : id); value.lineup.bench = value.lineup.bench.filter(id => id !== playerInId).concat(playerOutId)
  state.substitutions.push({ teamId, minute: state.minute, playerOutId, playerInId }); pushEvent(state, { minute: state.minute, kind: 'SUBSTITUTION', teamId, playerId: playerInId, text: `${state.minute}' Cambio en ${value.name}: entra ${incoming.name} por ${outgoing.name}.` }); return true
}
function maybeOpenRivalSubstitutionWindow(state: MatchState) {
  const rivalSide: MatchTeamSide = state.home.teamId === USER_TEAM_ID ? 'away' : 'home'; const rival = state[rivalSide]; const used = state.substitutionInterruptions[rivalSide]
  const rules = getSubstitutionRules(state.competitionType)
  if ((rules.maxOwnStoppages !== null && used >= rules.maxOwnStoppages) || state.minute >= 88) return false
  const targets = [54 + 2 * (hash(`${state.matchId}:rival-window:0`, state.seed) % 4), 68 + 2 * (hash(`${state.matchId}:rival-window:1`, state.seed) % 4), 80 + 2 * (hash(`${state.matchId}:rival-window:2`, state.seed) % 3)]
  if (used >= targets.length) return false
  if (state.minute < targets[used]) return false
  const outgoing = activePlayers(rival).filter(player => player.position !== 'POR').sort((a,b) => b.fatigue-a.fatigue || a.id-b.id)[0]; const incoming = rival.lineup.bench.map(id => rival.players[id]).filter(player => player && !player.redCard).sort((a,b) => a.minutesPlayed-b.minutesPlayed || a.id-b.id)[0]
  if (!outgoing || !incoming || !substituteInPlace(state,rival.teamId,outgoing.id,incoming.id)) return false
  state.substitutionInterruptions[rivalSide] += 1
  if (!rules.canPiggybackOpponentStoppage) return false
  state.substitutionWindow = { source:rivalSide === 'home'?'HOME':'AWAY',sourceTeamId:rival.teamId,minute:state.minute,consumesOwnWindow:false }; state.phase='PAUSED_FOR_DECISION'; state.pauseReason='RIVAL_SUBSTITUTION'; return true
}
function step(state: MatchState, assistant?: StaffPerson) {
  state.sequence += 1; state.minute = Math.min(state.phase === 'FIRST_HALF' ? 45 : 90, state.minute + 2); state.clockSeconds = state.minute * 60
  fatigueTick(state.home); fatigueTick(state.away)
  adjustOpponentLate(state)
  const homeControl = controlScore(state.home) * 1.035; const awayControl = controlScore(state.away)
  const attackingSide: MatchTeamSide = random(state, 'possession') < homeControl / Math.max(1, homeControl + awayControl) ? 'home' : 'away'
  state.statistics[attackingSide].possessionTicks += 1
  state.recentControl.push(attackingSide); state.recentControl = state.recentControl.slice(-7)
  const volume = team(state, attackingSide).tactics.mentality === 'Ofensiva' ? .88 : team(state, attackingSide).tactics.timeWasting !== 'No' ? .58 : .78
  if (random(state, 'attack-volume') < volume) simulateAttack(state, attackingSide)
  if (state.pauseReason === 'GOAL') return
  maybeInjury(state, 'home'); if (state.phase !== 'PAUSED_FOR_DECISION') maybeInjury(state, 'away')
  assistantObservation(state, assistant)
  const clubValue = state.home.teamId === USER_TEAM_ID ? state.home : state.away
  for (const value of [clubValue]) for (const player of activePlayers(value)) {
    const level = player.fatigue >= 82 ? 3 : player.fatigue >= 68 ? 2 : player.fatigue >= 54 ? 1 : 0
    if (level > player.fatigueNoticeLevel) { player.fatigueNoticeLevel = level; if (level >= 2) pushEvent(state, { minute: state.minute, kind: 'TACTICAL', teamId: value.teamId, playerId: player.id, text: `${state.minute}' ${player.name} ${level === 2 ? 'ya muestra bastante cansancio' : 'está llegando muy justo físicamente'}.` }) }
  }
  if (state.phase === 'PAUSED_FOR_DECISION') return
  if (state.interventionRequested) { state.phase = 'PAUSED_FOR_DECISION'; state.pauseReason = 'INTERVENTION'; state.interventionRequested = false; return }
  if (maybeOpenRivalSubstitutionWindow(state)) return
  if (state.minute === 45 && state.phase === 'FIRST_HALF') { state.phase = 'HALF_TIME'; state.substitutionWindow={source:'HALF_TIME',minute:45,consumesOwnWindow:false}; pushEvent(state, { minute: 45, kind: 'HALF_TIME', text: `45' DESCANSO — ${state.home.name} ${state.score.home}-${state.score.away} ${state.away.name}.` }) }
  if (state.minute === 90 && state.phase === 'SECOND_HALF') { state.phase = 'FINISHED'; pushEvent(state, { minute: 90, kind: 'FULL_TIME', text: `90' FINAL — ${state.home.name} ${state.score.home}-${state.score.away} ${state.away.name}.` }) }
}
export function startMatch(current: MatchState) { const state = structuredClone(current); if (state.phase !== 'PRE_MATCH') return state; state.phase = 'FIRST_HALF'; pushEvent(state, { minute: 0, kind: 'KICK_OFF', text: `0' Empieza el partido.` }); return state }
export function advanceMatchStep(current: MatchState, assistant?: StaffPerson) { const state = structuredClone(current); if (state.phase === 'FIRST_HALF' || state.phase === 'SECOND_HALF') step(state, assistant); return state }
export function advanceMatch(current: MatchState, assistant?: StaffPerson) { let state = structuredClone(current); if (state.phase !== 'FIRST_HALF' && state.phase !== 'SECOND_HALF') return state; const end = state.phase === 'FIRST_HALF' ? 45 : 90; while (state.minute < end && (state.phase === 'FIRST_HALF' || state.phase === 'SECOND_HALF')) state = advanceMatchStep(state, assistant); return state }
export function acknowledgeGoalCelebration(current: MatchState) { const state = structuredClone(current); if (state.goalInterruption) state.goalInterruption.presentation = 'DECISION'; return state }
export function resumeMatch(current: MatchState) { const state = structuredClone(current); if (state.goalInterruption) { state.processedGoalEventIds = [...new Set([...(state.processedGoalEventIds ?? []), state.goalInterruption.eventId])]; state.goalInterruption = undefined } if (state.phase === 'HALF_TIME') state.phase = 'SECOND_HALF'; else if (state.phase === 'PAUSED_FOR_DECISION' && state.minute >= 90) { state.phase = 'FINISHED'; if (!state.events.some((event) => event.kind === 'FULL_TIME')) pushEvent(state, { minute: 90, kind: 'FULL_TIME', text: `90' FINAL — ${state.home.name} ${state.score.home}-${state.score.away} ${state.away.name}.` }) } else if (state.phase === 'PAUSED_FOR_DECISION') state.phase = state.minute < 45 ? 'FIRST_HALF' : 'SECOND_HALF'; state.pauseReason = undefined; state.substitutionWindow=undefined; return state }
export function requestIntervention(current: MatchState, clockSeconds = current.clockSeconds) { const state=structuredClone(current); state.clockSeconds=Math.round(clockSeconds); state.phase='PAUSED_FOR_DECISION'; state.pauseReason='INTERVENTION'; state.interventionRequested=false; return state }
export function updateMatchTactics(current: MatchState, teamId: string, plan: TacticalPlan) { const state = structuredClone(current); const value = state.home.teamId === teamId ? state.home : state.away; value.tactics = { ...plan }; value.lineup.formation = plan.formation; value.lineup.slots = [...FORMATION_SLOTS[plan.formation]]; value.familiarity.formation = value.familiarity.formations[plan.formation] ?? 35; const known = (key: keyof TacticalPlan) => value.familiarity.instructions[key]?.[String(plan[key])] ?? 45; value.familiarity.attack = (known('mentality') + known('passingStyle') + known('tempo')) / 3; value.familiarity.transitionAttack = known('afterRecovery'); value.familiarity.defense = (known('pressingHeight') + known('pressingIntensity')) / 2; value.familiarity.transitionDefense = known('afterLoss'); value.lineup.starters.filter((id) => value.players[id]?.onPitch).forEach((id, index) => setMatchPlayerPosition(value.players[id], value.lineup.slots[index] ?? value.players[id].position)); return state }
export function makeSubstitution(current: MatchState, teamId: string, playerOutId: number, playerInId: number) {
  const state = structuredClone(current); substituteInPlace(state,teamId,playerOutId,playerInId); return state
}
export const getPossession = (state: MatchState, side: MatchTeamSide) => { const total = state.statistics.home.possessionTicks + state.statistics.away.possessionTicks; return total ? Math.round(state.statistics[side].possessionTicks / total * 100) : 50 }
export const performanceLabel = (value: number) => value >= 59 ? 'Muy bien' : value >= 54 ? 'Bien' : value >= 47 ? 'Correcto' : value >= 42 ? 'Flojo' : 'Mal'
export const conditionLabel = (condition: number, fatigue: number) => fatigue >= 84 || condition < 42 ? 'Muy cansado' : fatigue >= 70 || condition < 55 ? 'Cansado' : fatigue >= 54 || condition < 68 ? 'Cansándose' : fatigue < 30 && condition >= 78 ? 'Fresco' : 'Bien'
export const moodLabel = (mood: MatchMood) => ({ NEUTRAL: '—', CONFIDENT: 'Con confianza', FRUSTRATED: 'Frustrado', NERVOUS: 'Nervioso', DISCONNECTED: 'Desconectado', MOTIVATED: 'Muy motivado' } as const)[mood]
export const getMatchPlayerTacticalRating = (player: MatchPlayer, position: PlayerPosition) => Math.min(100, calculatePositionRating({ attributes: (() => { const copy = structuredClone(player); setMatchPlayerPosition(copy, position); return copy.attributes })() }, position) + (getPositionFamiliarity({ primaryPosition: player.naturalPositions[0], secondaryPositions: player.naturalPositions.slice(1) }, position) === 'PREFERRED' ? 1 : 0))
export type MatchInterventionDraft = { plan: TacticalPlan; lineupIds: number[] }
export function validateMatchIntervention(state: MatchState, teamId: string, draft: MatchInterventionDraft) { const value = state[sideForTeam(state,teamId)]; const errors: string[] = []; if (draft.lineupIds.length !== 11 || new Set(draft.lineupIds).size !== 11) errors.push('El once debe contener exactamente 11 jugadores sin duplicados.'); const goalkeeperId = draft.lineupIds[0]; if (!value.players[goalkeeperId]?.naturalPositions.includes('POR')) errors.push('El puesto de portero debe ocuparlo un portero natural.'); const incoming = draft.lineupIds.filter(id => !value.lineup.starters.includes(id)); const outgoing = value.lineup.starters.filter(id => !draft.lineupIds.includes(id)); if (outgoing.some(id => value.players[id]?.redCard)) errors.push('Un jugador expulsado no puede ser sustituido.'); if (incoming.some(id => !value.players[id] || value.players[id].redCard || value.players[id].onPitch)) errors.push('Un jugador expulsado, en el campo o no convocado no puede entrar.'); const side=sideForTeam(state,teamId); const rules=getSubstitutionRules(state.competitionType); const existing=state.substitutionWindow?.sourceTeamId===teamId&&state.substitutionWindow.consumesOwnWindow; const opponentWindow=state.substitutionWindow?.sourceTeamId&&state.substitutionWindow.sourceTeamId!==teamId; const free=state.phase==='HALF_TIME'||existing||(rules.canPiggybackOpponentStoppage&&opponentWindow); if(incoming.length>0&&!free&&rules.maxOwnStoppages!==null&&state.substitutionInterruptions[side]>=rules.maxOwnStoppages) errors.push(`Ya se han utilizado las ${rules.maxOwnStoppages} interrupciones propias.`); return errors }
export function applyMatchIntervention(current: MatchState, teamId: string, draft: MatchInterventionDraft) { const errors = validateMatchIntervention(current, teamId, draft); if (errors.length) return { state: current, errors }; let state = updateMatchTactics(current, teamId, draft.plan); let value = state[sideForTeam(state,teamId)]; const oldStarters = [...value.lineup.starters]; const incoming = draft.lineupIds.filter(id => !oldStarters.includes(id)); const outgoing = oldStarters.filter(id => !draft.lineupIds.includes(id)); incoming.forEach((id,index) => { substituteInPlace(state,teamId,outgoing[index],id) }); value = state[sideForTeam(state,teamId)]; value.lineup.starters = [...draft.lineupIds]; value.lineup.slots.forEach((position, index) => setMatchPlayerPosition(value.players[draft.lineupIds[index]], position)); const side=sideForTeam(state,teamId); const rules=getSubstitutionRules(current.competitionType); const existing=current.substitutionWindow?.sourceTeamId===teamId&&current.substitutionWindow.consumesOwnWindow; const opponentWindow=current.substitutionWindow?.sourceTeamId&&current.substitutionWindow.sourceTeamId!==teamId; const free=current.phase==='HALF_TIME'||existing||(rules.canPiggybackOpponentStoppage&&opponentWindow); if(incoming.length>0&&!free){state.substitutionInterruptions[side]+=1;state.substitutionWindow={source:side==='home'?'HOME':'AWAY',sourceTeamId:teamId,minute:state.minute,consumesOwnWindow:true}} return { state, errors: [] as string[] } }
export function getMatchMoment(state: MatchState) { const clubSide: MatchTeamSide = state.home.teamId === USER_TEAM_ID ? 'home' : 'away'; const clubTicks = state.recentControl.filter((side) => side === clubSide).length; const share = clubTicks / Math.max(1, state.recentControl.length); return share >= .78 ? 'Estamos dominando' : share >= .58 ? 'Tenemos algo más de iniciativa' : share > .42 ? 'Partido igualado' : share > .22 ? 'El rival está apretando' : 'Estamos sufriendo' }
export function deriveOpponentLateTactics(current: MatchState) { const state = structuredClone(current); if (state.minute < 70) return state; const rivalSide: MatchTeamSide = state.home.teamId === USER_TEAM_ID ? 'away' : 'home'; const rival = state[rivalSide]; const difference = state.score[rivalSide] - state.score[otherSide(rivalSide)]; rival.tactics.mentality = difference < 0 ? 'Ofensiva' : difference > 0 ? 'Cauta' : rival.tactics.mentality; rival.tactics.timeWasting = difference > 0 ? 'Sí' : 'No'; return state }
export const MATCH_ATTRIBUTE_KEYS: PlayerAttribute[] = ['paradas','juegoPiesPortero','juegoAereoPortero','comunicacion','intensidad','mentalidad','rapidez','alcanceAereo','fuerza','resistencia','agilidad','tecnica','regate','pases','remate','balonParado','entradas','marcaje']
