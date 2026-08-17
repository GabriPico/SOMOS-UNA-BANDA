import { createNewGameState } from '../src/data/gameState'
import { initialTacticalPlan, leagueTeams, players, rivalPlayers, rivalTeamProfiles, tactics } from '../src/data/mockData'
import { createInitialTrainingState } from '../src/domain/trainingEngine'
import { advanceMatch, advanceMatchStep, applyMatchIntervention, createMatchState, requestIntervention, resumeMatch, startMatch } from '../src/domain/matchEngine'
import { behavioralState, contextForRoute, duelScore } from '../src/domain/matchDuels'
import { getNextMatch } from '../src/domain/nextMatch'
import { applyPostMatch } from '../src/domain/postMatch'
import { calculateStandings } from '../src/domain/leagueStandings'
import type { MatchPlayer } from '../src/domain/matchTypes'
import { getAttackRouteWeights } from '../src/domain/matchTactics'
import { advanceGame } from '../src/domain/gameTime'

const assert = (condition: unknown, message: string) => { if (!condition) throw new Error(message) }
const finish = (initial: typeof first) => { let state = initial; while (state.phase !== 'FINISHED') state = state.phase === 'FIRST_HALF' || state.phase === 'SECOND_HALF' ? advanceMatch(state) : advanceMatch(resumeMatch(state)); return state }
const game = createNewGameState(84731)
const firstCheckpoint=advanceGame(game,[]); assert(firstCheckpoint.checkpoint?.type==='TRAINING'&&firstCheckpoint.checkpoint.relatedId==='tuesday','CONTINUAR no encuentra el primer entrenamiento')
const afterTuesday={...firstCheckpoint.state,temporal:{...firstCheckpoint.state.temporal,activeCheckpoint:undefined}}; const secondCheckpoint=advanceGame(afterTuesday,['tuesday']); assert(secondCheckpoint.checkpoint?.type==='TRAINING'&&secondCheckpoint.checkpoint.relatedId==='thursday','CONTINUAR no salta del entrenamiento completado al siguiente checkpoint')
const training = createInitialTrainingState(players)
const match = getNextMatch(game.temporal.calendar, 'fc-poblenou')!
const opponentId = match.homeTeamId === 'fc-poblenou' ? match.awayTeamId : match.homeTeamId
const input = { match, homeName: leagueTeams.find((team) => team.id === match.homeTeamId)!.name, awayName: leagueTeams.find((team) => team.id === match.awayTeamId)!.name, clubPlayers: players, rivalPlayers, lineupIds: tactics.startingEleven, plan: initialTacticalPlan, training, opponentFormation: rivalTeamProfiles.find((profile) => profile.teamId === opponentId)!.preferredFormation, seed: 95830, cohesion: 58 }
const first = startMatch(createMatchState(input)); const second = startMatch(createMatchState(input))
const intervention = advanceMatch(requestIntervention(first))
assert(intervention.phase === 'PAUSED_FOR_DECISION' && intervention.minute === 0, 'La intervención no conservó el instante actual')
assert(requestIntervention({...first,minute:36,clockSeconds:2160},2262).clockSeconds===2262,'El cronómetro no conserva los segundos al intervenir')
const one = finish(first); const two = finish(second)
assert(JSON.stringify(one) === JSON.stringify(two), 'La misma semilla no produjo el mismo partido')
const inspected = finish(resumeMatch(requestIntervention(first, 42)))
assert(inspected.score.home === one.score.home && inspected.score.away === one.score.away && inspected.events.length === one.events.length, 'Intervenir sin cambios altera el partido')
let incremental = first; while (incremental.phase !== 'FINISHED') incremental = incremental.phase === 'FIRST_HALF' || incremental.phase === 'SECOND_HALF' ? advanceMatchStep(incremental) : resumeMatch(incremental)
assert(JSON.stringify(one) === JSON.stringify(incremental), 'El avance incremental cambia la simulación')
assert(one.events.some((event) => event.kind === 'HALF_TIME') && one.events.at(-1)?.kind === 'FULL_TIME', 'Faltan cortes obligatorios')
const applied = applyPostMatch(game, training, one, players, rivalPlayers)
assert(applied.gameState.temporal.calendar.find((item) => item.id === match.id)?.status === 'played', 'El resultado no actualizÃ³ el calendario')
assert(calculateStandings(leagueTeams, applied.gameState.temporal.calendar, match.matchday).every((row) => row.played === match.matchday), 'La clasificaciÃ³n no incorporÃ³ la jornada')
assert(applied.trainingState.week === training.week + 1, 'No se preparÃ³ la semana siguiente')
const base = one.home.players[one.home.lineup.starters[1]]
const fast = { ...base, attributes: { ...base.attributes, rapidez: 18 } } as MatchPlayer
const slow = { ...base, attributes: { ...base.attributes, rapidez: 5 } } as MatchPlayer
assert(duelScore(fast, 'SPACE', 'attack') > duelScore(slow, 'SPACE', 'attack') + 5, 'Rapidez no altera suficientemente la carrera al espacio')
const low = structuredClone(one.away); low.tactics.pressingHeight = 'Baja'
const high = structuredClone(one.away); high.tactics.pressingHeight = 'Alta'
assert(contextForRoute(one.home, low, 'IN_BEHIND').space < contextForRoute(one.home, high, 'IN_BEHIND').space, 'El bloque bajo no protege el espacio')
const professional = { ...base, personality: 'Profesional', happiness: 30 } as MatchPlayer
const temperamental = { ...base, personality: 'Caliente', happiness: 30 } as MatchPlayer
assert(behavioralState(professional).concentrationError < behavioralState(temperamental).concentrationError, 'La personalidad no modula el descontento')
const obedient = { ...base, authority: 85 } as MatchPlayer; const rebellious = { ...base, authority: 25 } as MatchPlayer
assert(behavioralState(obedient).disobedience < behavioralState(rebellious).disobedience, 'La autoridad no cambia la adherencia')
const greatKeeper = { ...base, position: 'POR', attributes: { ...base.attributes, paradas: 18 } } as MatchPlayer
const weakKeeper = { ...greatKeeper, attributes: { ...greatKeeper.attributes, paradas: 5 } } as MatchPlayer
assert(duelScore(greatKeeper, 'FINISH', 'defense') > duelScore(weakKeeper, 'FINISH', 'defense') + 9, 'Paradas no tiene peso dominante')
const directTeam = structuredClone(one.home); directTeam.tactics.passingStyle = 'Directo'
const shortTeam = structuredClone(one.home); shortTeam.tactics.passingStyle = 'En corto'
assert(getAttackRouteWeights(directTeam, 0).DIRECT_TARGET > getAttackRouteWeights(shortTeam, 0).DIRECT_TARGET, 'El juego directo no altera las rutas')
const clubOf=(state:typeof first)=>state.home.teamId==='fc-poblenou'?state.home:state.away
const clubSideOf=(state:typeof first)=>state.home.teamId==='fc-poblenou'?'home' as const:'away' as const
const runUntil=(initial:typeof first,predicate:(state:typeof first)=>boolean)=>{let state=initial;let guard=0;while(!predicate(state)&&guard++<100)state=state.phase==='FIRST_HALF'||state.phase==='SECOND_HALF'?advanceMatchStep(state):resumeMatch(state);return state}
const swapDraft=(state:typeof first,count:number)=>{const club=clubOf(state);return {plan:{...club.tactics},lineupIds:club.lineup.starters.map((id,index)=>index>0&&index<=count?club.lineup.bench[index-1]:id)}}
let windows=runUntil(first,state=>state.minute>=60); windows=requestIntervention(windows)
let result=applyMatchIntervention(windows,'fc-poblenou',swapDraft(windows,4)); assert(!result.errors.length&&result.state.substitutionInterruptions[clubSideOf(result.state)]===1,'Caso A: cuatro cambios no consumen una sola interrupción')
windows=requestIntervention(resumeMatch(result.state)); result=applyMatchIntervention(windows,'fc-poblenou',swapDraft(windows,1)); assert(!result.errors.length&&result.state.substitutionInterruptions[clubSideOf(result.state)]===2,'Caso B: la segunda ventana no se registra')
windows=requestIntervention(resumeMatch(result.state)); result=applyMatchIntervention(windows,'fc-poblenou',swapDraft(windows,3)); assert(!result.errors.length&&result.state.substitutionInterruptions[clubSideOf(result.state)]===3,'Caso C: la tercera ventana no se registra')
windows=requestIntervention(resumeMatch(result.state)); const denied=applyMatchIntervention(windows,'fc-poblenou',swapDraft(windows,1)); assert(denied.errors.length>0,'Caso D: se permite una cuarta interrupción propia')
const rivalOpportunity=runUntil(first,state=>state.pauseReason==='RIVAL_SUBSTITUTION'); const beforeFree=rivalOpportunity.substitutionInterruptions[clubSideOf(rivalOpportunity)]; const freeResult=applyMatchIntervention(rivalOpportunity,'fc-poblenou',swapDraft(rivalOpportunity,1)); assert(!freeResult.errors.length&&freeResult.state.substitutionInterruptions[clubSideOf(freeResult.state)]===beforeFree,'Caso E: aprovechar la ventana rival consume una propia')
let reentry=requestIntervention(runUntil(first,state=>state.minute>=60)); const original=clubOf(reentry).lineup.starters[1]; const firstExit=applyMatchIntervention(reentry,'fc-poblenou',swapDraft(reentry,1)).state; reentry=requestIntervention(resumeMatch(firstExit)); const reentryClub=clubOf(reentry); const reentryDraft={plan:{...reentryClub.tactics},lineupIds:reentryClub.lineup.starters.map((id,index)=>index===2?original:id)}; const returned=applyMatchIntervention(reentry,'fc-poblenou',reentryDraft); assert(!returned.errors.length&&clubOf(returned.state).players[original].onPitch,'Caso F: un jugador sustituido no puede volver')
const breakState=runUntil(first,state=>state.phase==='HALF_TIME'); const breakResult=applyMatchIntervention(breakState,'fc-poblenou',swapDraft(breakState,6)); assert(!breakResult.errors.length&&breakResult.state.substitutionInterruptions[clubSideOf(breakResult.state)]===0,'Caso G: seis cambios al descanso consumen interrupción')
const scorelines = new Set<string>(); let maximumGoals = 0; let minimumGoals = 99; let totalEvents = 0; let totalShots = 0; let totalFouls = 0; let totalCorners = 0; let zeroZeroEvents = 0
for (let seed = 1; seed <= 24; seed += 1) { const result = finish(startMatch(createMatchState({ ...input, seed: 90000 + seed * 101 }))); const goals = result.score.home + result.score.away; scorelines.add(`${result.score.home}-${result.score.away}`); maximumGoals = Math.max(maximumGoals, goals); minimumGoals = Math.min(minimumGoals, goals); totalEvents += result.events.length; totalShots += result.statistics.home.shots + result.statistics.away.shots; totalFouls += result.statistics.home.fouls + result.statistics.away.fouls; totalCorners += result.statistics.home.corners + result.statistics.away.corners; if (goals === 0) zeroZeroEvents = Math.max(zeroZeroEvents, result.events.length) }
assert(scorelines.size >= 4 && minimumGoals === 0 && maximumGoals >= 3, 'La muestra de semillas no ofrece variedad suficiente')
assert(totalEvents / 24 >= 22 && zeroZeroEvents >= 18, 'La narración sigue siendo demasiado escasa')
assert(totalShots / 24 >= 6 && totalFouls / 24 >= 2 && totalCorners / 24 >= 1, 'Las estadísticas siguen siendo sistemáticamente demasiado bajas')
const intensePlan = { ...initialTacticalPlan, tempo: 'Alto' as const, pressingHeight: 'Alta' as const, pressingIntensity: 'Alta' as const, afterLoss: 'Presión tras pérdida' as const }
const calmPlan = { ...initialTacticalPlan, tempo: 'Bajo' as const, pressingHeight: 'Baja' as const, pressingIntensity: 'Baja' as const, afterLoss: 'Repliegue' as const }
const toBreak = (initial: typeof first) => { let state = initial; while (state.minute < 45) state = state.phase === 'FIRST_HALF' ? advanceMatch(state) : advanceMatch(resumeMatch(state)); return state }
const intense = toBreak(startMatch(createMatchState({ ...input, plan: intensePlan }))); const calm = toBreak(startMatch(createMatchState({ ...input, plan: calmPlan })))
const clubFatigue = (state: typeof first) => { const club = state.home.teamId === 'fc-poblenou' ? state.home : state.away; const values = Object.values(club.players).filter((player) => player.minutesPlayed > 0).map((player) => player.fatigue); return values.reduce((sum, value) => sum + value, 0) / values.length }
assert(clubFatigue(intense) > clubFatigue(calm) + 4, 'La presión y el ritmo altos no generan suficiente desgaste')
const assistant = game.staff.members.find((member) => member.role === 'SEGUNDO_ENTRENADOR')
const assisted = assistant ? (() => { let state = first; while (state.phase !== 'FINISHED') state = state.phase === 'FIRST_HALF' || state.phase === 'SECOND_HALF' ? advanceMatch(state, assistant) : advanceMatch(resumeMatch(state), assistant); return state })() : undefined
if (assisted) assert(assisted.observations.length >= 1 && assisted.observations.length <= 6, 'La frecuencia del segundo entrenador no es útil')
console.log(JSON.stringify({ score: one.score, goals: one.goalEvents.length, events: one.events.length, averages: { events: totalEvents / 24, shots: totalShots / 24, fouls: totalFouls / 24, corners: totalCorners / 24 }, scorelines: [...scorelines], assistantObservations: assisted?.observations.length ?? 0, checks: 'ok' }))
