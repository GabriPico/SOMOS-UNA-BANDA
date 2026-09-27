import { PageTitle } from '../components/ClubUi'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { TacticalPlan } from '../domain/models'
import { TacticalBoard, TacticalInstructions, TacticalSquadList, TacticalSummary, type TacticalPlayerView, type TacticalSelection } from '../components/TacticalWorkspace'
import { acknowledgeGoalCelebration, advanceMatchStep, applyMatchIntervention, conditionLabel, getMatchMoment, getMatchPlayerTacticalRating, getPossession, moodLabel, performanceLabel, requestIntervention, resumeMatch } from '../domain/matchEngine'
import { FORMATION_SLOTS } from '../domain/matchTactics'
import { familiarityLabel, matchPerformancePresentation, moodPresentation } from '../domain/tacticalPresentation'
import type { MatchState } from '../domain/matchTypes'
import type { StaffPerson } from '../domain/staff'
import './MatchScreen.css'
import './MatchIntervention.css'
import './RivalMatch.css'
import { moveLineupPlayer, type LineupSource } from '../domain/tacticalLineup'
import { getSubstitutionRules } from '../domain/substitutionRules'
import { getConditionAlert, getFatigueLabel } from '../domain/humanState'
import { GoalInterruption } from '../components/GoalInterruption'
import { StarRating } from '../components/StarRating'

const USER_TEAM_ID = 'fc-poblenou'
type Props = { match: MatchState; assistant?: StaffPerson; onChange: (state: MatchState) => void; onFinish: () => void }
type MatchSpeed = 'NORMAL' | 'FAST'
const STEP_DURATION: Record<MatchSpeed, number> = { NORMAL: 2000, FAST: 1100 }
const clock = (seconds: number) => `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${Math.floor(seconds % 60).toString().padStart(2, '0')}`

export function MatchScreen({ match, assistant, onChange, onFinish }: Props) {
  const club = match.home.teamId === USER_TEAM_ID ? match.home : match.away
  const [playing, setPlaying] = useState(match.phase === 'FIRST_HALF' || match.phase === 'SECOND_HALF')
  const [speed, setSpeed] = useState<MatchSpeed>('NORMAL')
  const [showIntervention, setShowIntervention] = useState(false)
  const [visualSeconds, setVisualSeconds] = useState(match.clockSeconds)
  const [useRivalWindow, setUseRivalWindow] = useState(false)
  const [showGoalTactics, setShowGoalTactics] = useState(false)
  const [normalTeamView,setNormalTeamView]=useState<'CLUB'|'RIVAL'>('CLUB')
  const [interventionTeamView,setInterventionTeamView]=useState<'CLUB'|'RIVAL'>('CLUB')
  const [draftPlan, setDraftPlan] = useState<TacticalPlan>(() => ({...club.tactics}))
  const [draftLineup, setDraftLineup] = useState<number[]>(() => [...club.lineup.starters])
  const [selection, setSelection] = useState<TacticalSelection>(null)
  const [draftErrors, setDraftErrors] = useState<string[]>([])
  const historyRef = useRef<HTMLDivElement>(null)
  const playbackBaseRef=useRef<number|undefined>(undefined)
  const canRun = match.phase === 'FIRST_HALF' || match.phase === 'SECOND_HALF'
  const canDecide = match.phase === 'HALF_TIME' || match.phase === 'PAUSED_FOR_DECISION' || showIntervention
  const wasDecidingRef = useRef(canDecide)
  const stats = (side: 'home' | 'away') => match.statistics[side]
  const clubPlayers = Object.values(club.players)
  const rival = match.home.teamId === USER_TEAM_ID ? match.away : match.home
  const rivalPlayers=Object.values(rival.players)
  const latestEvent = match.events.at(-1)
  const currentObservations = match.observations.slice(-3).reverse()
  const bestPlayers = useMemo(() => clubPlayers.filter((player) => player.minutesPlayed > 0).sort((a, b) => b.performance - a.performance).slice(0, 3), [clubPlayers])
  const weakPlayers = useMemo(() => clubPlayers.filter((player) => player.minutesPlayed > 0 && player.performance < 47).sort((a, b) => a.performance - b.performance).slice(0, 2), [clubPlayers])

  useEffect(() => {
    setVisualSeconds(match.clockSeconds)
    if (!canRun) setPlaying(false)
  }, [match.clockSeconds, match.phase, canRun])
  useEffect(() => { setShowGoalTactics(false) }, [match.goalInterruption?.eventId])

  useEffect(() => {
    if (canDecide && !wasDecidingRef.current) { setDraftPlan({...club.tactics}); setDraftLineup([...club.lineup.starters]); setSelection(null); setDraftErrors([]); setInterventionTeamView('CLUB') }
    wasDecidingRef.current = canDecide
  }, [canDecide, club.lineup.starters, club.tactics])

  useEffect(() => {
    if (!playing || !canRun || showIntervention) return
    const startedAt = performance.now(); const baseSeconds=Math.max(match.clockSeconds,playbackBaseRef.current??match.clockSeconds); playbackBaseRef.current=undefined; const targetSeconds=Math.min(match.phase==='FIRST_HALF'?45*60:90*60,(match.minute+2)*60); const segmentSeconds=Math.max(1,targetSeconds-baseSeconds); const duration = STEP_DURATION[speed]*segmentSeconds/120
    const timer = window.setInterval(() => {
      const elapsed = performance.now() - startedAt
      setVisualSeconds(baseSeconds + Math.min(segmentSeconds-1, elapsed / duration * segmentSeconds))
      if (elapsed >= duration) { window.clearInterval(timer); onChange(advanceMatchStep(match, assistant)) }
    }, 100)
    return () => window.clearInterval(timer)
  }, [assistant, canRun, match, onChange, playing, showIntervention, speed])

  useEffect(() => {
    const history = historyRef.current
    if (!history) return
    const nearBottom = history.scrollHeight - history.scrollTop - history.clientHeight < 90
    if (nearBottom) history.scrollTo({ top: history.scrollHeight, behavior: 'smooth' })
  }, [match.events.length])

  const openIntervention = () => { if (canRun) { onChange(requestIntervention(match,visualSeconds)); setPlaying(false) } else setShowIntervention(true) }
  const resume = () => { const next = match.phase === 'HALF_TIME' || match.phase === 'PAUSED_FOR_DECISION' ? resumeMatch(match) : match; setShowIntervention(false); setUseRivalWindow(false); setShowGoalTactics(false); setPlaying(true); onChange(next) }
  const togglePlayback=()=>{if(playing){onChange({...match,clockSeconds:Math.round(visualSeconds)});setPlaying(false)}else setPlaying(true)}
  const toggleSpeed=()=>{playbackBaseRef.current=visualSeconds;setSpeed(value=>value==='NORMAL'?'FAST':'NORMAL')}
  const cancelDraft = () => { setDraftPlan({...club.tactics}); setDraftLineup([...club.lineup.starters]); setSelection(null); setDraftErrors([]) }
  const confirmDraft = () => { const result=applyMatchIntervention(match,USER_TEAM_ID,{plan:draftPlan,lineupIds:draftLineup}); setDraftErrors(result.errors); if (!result.errors.length) { onChange(result.state); setSelection(null) } }
  const selectField = (slot:number) => { if(selection?.group==='reserve'){setDraftLineup(ids=>ids.map((id,index)=>index===slot?selection.playerId:id));setSelection(null);return} if(selection?.group==='field'&&selection.slot!==slot){setDraftLineup(ids=>{const next=[...ids];[next[selection.slot],next[slot]]=[next[slot],next[selection.slot]];return next});setSelection(null);return} setSelection(selection?.group==='field'&&selection.slot===slot?null:{group:'field',slot}) }
  const selectReserve = (id:number) => { if(selection?.group==='field'){setDraftLineup(ids=>ids.map((current,index)=>index===selection.slot?id:current));setSelection(null);return} setSelection(selection?.group==='reserve'&&selection.playerId===id?null:{group:'reserve',playerId:id}) }
  const slots = FORMATION_SLOTS[draftPlan.formation]
  const movePlayer=(source:LineupSource,target:LineupSource)=>{const candidates=clubPlayers.map(player=>({id:player.id,primaryPosition:player.naturalPositions[0],secondaryPositions:player.naturalPositions.slice(1)}));const result=moveLineupPlayer(draftLineup,source,target,slots,candidates);setDraftErrors(result.error?[result.error]:[]);if(!result.error)setDraftLineup(result.lineupIds)}
  const playerView = (id:number,slot?:number):TacticalPlayerView => { const player=club.players[id]; return {id,name:player.name,positions:player.naturalPositions.join('/'),rating:Math.round(slot===undefined?getMatchPlayerTacticalRating(player,player.naturalPositions[0]):getMatchPlayerTacticalRating(player,slots[slot])),secondary:slot===undefined&&player.minutesPlayed>0&&!player.onPitch?'Puede volver':undefined,fatigueLabel:getFatigueLabel(player.fatigue),conditionAlert:player.injured?'Tocado':getConditionAlert(player.condition)??undefined,unavailable:player.redCard,matchPerformance:player.minutesPlayed>0?matchPerformancePresentation(player.performance):undefined,incident:player.redCard?'RC':player.injured?'✚':player.yellowCards?'TA':undefined} }
  const draftPlayers=draftLineup.map((id,slot)=>playerView(id,slot)); const reservePlayers=clubPlayers.filter(player=>!draftLineup.includes(player.id)).map(player=>playerView(player.id))
  const incoming=draftLineup.filter(id=>!club.lineup.starters.includes(id)); const outgoing=club.lineup.starters.filter(id=>!draftLineup.includes(id))
  const known=(key:keyof TacticalPlan)=>club.familiarity.instructions[key]?.[String(draftPlan[key])]??45
  const draftFamiliarity=(club.familiarity.formations[draftPlan.formation]??35)*.2+((known('mentality')+known('passingStyle')+known('tempo'))/3+known('afterRecovery')+(known('pressingHeight')+known('pressingIntensity'))/2+known('afterLoss'))/4*.8
  const draftDirty=JSON.stringify(draftPlan)!==JSON.stringify(club.tactics)||draftLineup.some((id,index)=>id!==club.lineup.starters[index])
  const selectedId=selection?.group==='field'?draftLineup[selection.slot]:selection?.group==='reserve'?selection.playerId:undefined
  const selectedMatchPlayer=selectedId===undefined?undefined:club.players[selectedId]
  const selectedPosition=selection?.group==='field'?slots[selection.slot]:selectedMatchPlayer?.position
  const selectedRating=selectedMatchPlayer&&selectedPosition?getMatchPlayerTacticalRating(selectedMatchPlayer,selectedPosition):undefined
  const selectedNote=selectedMatchPlayer?matchPerformancePresentation(selectedMatchPlayer.performance):undefined
  const selectedPhysical=selectedMatchPlayer?conditionLabel(selectedMatchPlayer.condition,selectedMatchPlayer.fatigue):undefined
  const selectedMood=selectedMatchPlayer?moodPresentation(selectedMatchPlayer.mood,moodLabel(selectedMatchPlayer.mood)):undefined
  const selectedMetrics=selectedMatchPlayer&&selectedPosition?selectedPosition==='POR'?[['Paradas',selectedMatchPlayer.matchStats.saves],['Errores',selectedMatchPlayer.matchStats.errors],['Duelos aéreos',selectedMatchPlayer.matchStats.aerialDuelsWon],['Acciones tácticas',selectedMatchPlayer.matchStats.tacticalActions]]:['LD','LI','DFC','CAD','CAI'].includes(selectedPosition)?[['Duelos ganados',selectedMatchPlayer.matchStats.duelsWon],['Duelos aéreos',selectedMatchPlayer.matchStats.aerialDuelsWon],['Recuperaciones',selectedMatchPlayer.matchStats.recoveries],['Pérdidas',selectedMatchPlayer.matchStats.losses],['Errores',selectedMatchPlayer.matchStats.errors]]:['MCD','MC','MP'].includes(selectedPosition)?[['Recuperaciones',selectedMatchPlayer.matchStats.recoveries],['Progresiones',selectedMatchPlayer.matchStats.progressions],['Pérdidas',selectedMatchPlayer.matchStats.losses],['Ocasiones creadas',selectedMatchPlayer.matchStats.chancesCreated],['Duelos ganados',selectedMatchPlayer.matchStats.duelsWon]]:[['Tiros',selectedMatchPlayer.matchStats.shots],['Ocasiones creadas',selectedMatchPlayer.matchStats.chancesCreated],['Progresiones',selectedMatchPlayer.matchStats.progressions],['Duelos ganados',selectedMatchPlayer.matchStats.duelsWon],['Pérdidas',selectedMatchPlayer.matchStats.losses]]:[]
  const clubSide=match.home.teamId===USER_TEAM_ID?'home':'away'; const interruptionsUsed=match.substitutionInterruptions[clubSide]
  const substitutionRules=getSubstitutionRules(match.competitionType)
  const rivalWindow=match.pauseReason==='RIVAL_SUBSTITUTION'&&match.substitutionWindow?.sourceTeamId!==USER_TEAM_ID
  const goalPause=match.pauseReason==='GOAL'&&match.goalInterruption
  const ownWindowOpen=match.substitutionWindow?.sourceTeamId===USER_TEAM_ID&&match.substitutionWindow.consumesOwnWindow
  const freeWindow=match.phase==='HALF_TIME'||Boolean(rivalWindow)||Boolean(ownWindowOpen)
  const rivalPlayerView=(id:number):TacticalPlayerView=>{const player=rival.players[id];return{id,name:player.name,positions:player.position,status:player.redCard?'Roja':player.injured?'Lesionado':player.yellowCards?'Amarilla':undefined}}
  const rivalBoardPlayers=rival.lineup.starters.map(rivalPlayerView)
  const rivalChanges=match.substitutions.filter(change=>change.teamId===rival.teamId)

  return <section className={`match-screen${playing ? ' is-playing' : ' is-paused'}`}>
    <PageTitle title="Día de partido" subtitle={match.home.name + " · " + match.away.name} />
    <header className="match-scoreboard">
      <span>{match.home.name}</span><strong>{match.score.home} - {match.score.away}</strong><span>{match.away.name}</span>
      <div className="match-clock"><b>{match.phase === 'FINISHED' ? 'FINAL' : clock(visualSeconds)}</b><small>{playing ? 'En juego' : match.phase === 'HALF_TIME' ? 'Descanso' : match.phase === 'FINISHED' ? 'Partido terminado' : 'Pausado'}</small></div>
      {canRun && <div className="match-playback"><button type="button" className={!playing ? 'is-active' : ''} onClick={togglePlayback}>{playing ? 'PAUSAR' : 'REPRODUCIR'}</button><button type="button" onClick={toggleSpeed}>{speed === 'NORMAL' ? 'NORMAL' : 'RÁPIDA'}</button><button className="primary-action" type="button" onClick={openIntervention}>INTERVENIR</button></div>}
    </header>

    {goalPause&&!showGoalTactics&&<GoalInterruption interruption={goalPause} home={match.home} away={match.away} onCelebrationComplete={()=>onChange(acknowledgeGoalCelebration(match))} onKeep={resume} onMakeChanges={()=>setShowGoalTactics(true)}/>}

    {latestEvent && <section className={`current-match-event is-${latestEvent.importance?.toLowerCase() ?? 'context'}`}><time>{clock(latestEvent.minute * 60)}</time><p>{latestEvent.text.replace(/^\d+'\s*/, '')}</p></section>}

    {!canDecide && <div className="match-grid">
      <section className="match-card match-events"><header><h3>Así está transcurriendo</h3><span>{getMatchMoment(match)}</span></header><div ref={historyRef}>{match.events.map((event) => <p className={`event-${event.kind.toLowerCase()} is-${event.importance?.toLowerCase() ?? 'context'}`} key={event.id}>{event.text}</p>)}</div></section>
      <aside className="match-card match-statistics"><h3>Estadísticas</h3><table><thead><tr><th>{match.home.name}</th><th /><th>{match.away.name}</th></tr></thead><tbody>
        <tr><td>{getPossession(match, 'home')}%</td><th>Posesión</th><td>{getPossession(match, 'away')}%</td></tr><tr><td>{stats('home').shots}</td><th>Tiros</th><td>{stats('away').shots}</td></tr><tr><td>{stats('home').shotsOnTarget}</td><th>A puerta</th><td>{stats('away').shotsOnTarget}</td></tr><tr><td>{stats('home').corners}</td><th>Córners</th><td>{stats('away').corners}</td></tr><tr><td>{stats('home').fouls}</td><th>Faltas</th><td>{stats('away').fouls}</td></tr><tr><td>{stats('home').yellowCards}/{stats('home').redCards}</td><th>Tarjetas</th><td>{stats('away').yellowCards}/{stats('away').redCards}</td></tr></tbody></table></aside>

      <section className="match-card match-team"><header><div className="match-team-tabs"><button className={normalTeamView==='CLUB'?'is-active':''} type="button" onClick={()=>setNormalTeamView('CLUB')}>MI EQUIPO</button><button className={normalTeamView==='RIVAL'?'is-active':''} type="button" onClick={()=>setNormalTeamView('RIVAL')}>RIVAL</button></div><span>{normalTeamView==='CLUB'?club.tactics.formation:rival.tactics.formation}</span></header>{normalTeamView==='CLUB'?<div className="match-player-list">{clubPlayers.filter((player) => player.onPitch).map((player) => { const physical = conditionLabel(player.condition, player.fatigue); return <article className={player.injured || player.redCard ? 'has-alert' : ''} key={player.id}><b>{player.position}</b><div><strong>{player.name}</strong><small>{moodLabel(player.mood)}</small></div><span className={`performance performance-${performanceLabel(player.performance).toLowerCase().replace(' ', '-')}`}>{performanceLabel(player.performance)}</span><div className="physical-state"><span>{physical}</span><i><em style={{ width: `${Math.max(4, 100 - player.fatigue)}%` }} /></i></div><mark>{player.injured ? 'Molestias' : player.redCard ? 'Roja' : player.yellowCards ? 'Amarilla' : '—'}</mark></article> })}</div>:<><div className="rival-compact-lineup">{rival.lineup.starters.map(id=>{const player=rival.players[id];return <article className={player.redCard||player.injured?'has-alert':''} key={id}><b>{player.position}</b><strong>{player.name}</strong><mark>{player.redCard?'Roja':player.injured?'Lesionado':player.yellowCards?'Amarilla':'—'}</mark></article>})}</div><small className="rival-changes-summary">{rivalChanges.length?rivalChanges.map(change=>`${change.minute}' ${rival.players[change.playerOutId].name} → ${rival.players[change.playerInId].name}`).join(' · '):'Sin sustituciones'}</small></>}</section>

      <aside className="match-card assistant-panel"><h3>{assistant?.name ?? 'Segundo entrenador'}</h3>{assistant ? currentObservations.length ? currentObservations.map((note) => <blockquote key={`${note.minute}-${note.topic}`}><small>{note.minute}'</small>{note.text}</blockquote>) : <p>Todavía no tiene ninguna observación clara.</p> : <p>Sin observaciones del segundo entrenador.</p>}</aside>
    </div>}

    {rivalWindow&&!useRivalWindow&&<section className="match-card rival-window"><div><strong>{match.substitutionWindow?.sourceTeamId===match.home.teamId?match.home.name:match.away.name} va a realizar cambios.</strong><p>Puedes aprovechar esta interrupción sin gastar una de las tuyas.</p></div><div><button type="button" onClick={()=>setUseRivalWindow(true)}>HACER CAMBIOS</button><button className="primary-action" type="button" onClick={resume}>CONTINUAR</button></div></section>}
    {canDecide&&(!rivalWindow||useRivalWindow)&&(!goalPause||showGoalTactics) && match.phase !== 'FINISHED' && <section className="match-card intervention-panel"><header><div><h3>{match.phase === 'HALF_TIME' ? 'Descanso' : goalPause?'Cambios después del gol':rivalWindow?'Interrupción del rival':'Intervención táctica'}</h3><TacticalSummary plan={interventionTeamView==='CLUB'?draftPlan:rival.tactics} familiarity={interventionTeamView==='CLUB'?draftFamiliarity:undefined}/></div><span className="match-minute-marker">{clock(visualSeconds)}{interventionTeamView==='CLUB'&&` · familiaridad ${familiarityLabel(draftFamiliarity)}`}</span></header>
      <nav className="intervention-team-tabs"><button type="button" className={interventionTeamView==='CLUB'?'is-active':''} onClick={()=>setInterventionTeamView('CLUB')}>MI EQUIPO</button><button type="button" className={interventionTeamView==='RIVAL'?'is-active':''} onClick={()=>{setInterventionTeamView('RIVAL');setSelection(null)}}>RIVAL</button></nav>
      {interventionTeamView==='CLUB'?<div className="tactical-workspace"><TacticalBoard formation={draftPlan.formation} players={draftPlayers} selection={selection} onSelect={selectField} onMove={movePlayer}/><TacticalSquadList players={reservePlayers} selection={selection} onSelect={selectReserve} onMove={movePlayer}/></div>:<div className="rival-tactical-view"><TacticalBoard formation={rival.tactics.formation} players={rivalBoardPlayers} selection={null}/><aside><h3>Información observable</h3><p>Formación actual: <strong>{rival.tactics.formation}</strong></p><p>Tarjetas: {rivalPlayers.reduce((sum,player)=>sum+player.yellowCards,0)} amarillas · {rivalPlayers.filter(player=>player.redCard).length} rojas</p><p>Lesiones observables: {rivalPlayers.filter(player=>player.injured).length}</p><h4>Once actual</h4><ul>{rival.lineup.starters.map(id=>{const player=rival.players[id];return <li key={id}><b>{player.position}</b> · {player.name}{player.redCard?' · Roja':player.injured?' · Lesionado':player.yellowCards?' · Amarilla':''}</li>})}</ul><h4>Sustituciones</h4>{rivalChanges.length?rivalChanges.map(change=><p key={`${change.minute}-${change.playerInId}`}>{change.minute}' Sale {rival.players[change.playerOutId].name} · entra {rival.players[change.playerInId].name}</p>):<p>Sin cambios.</p>}</aside></div>}
      {interventionTeamView==='CLUB'&&<>
      <p className="intervention-hint">{selection?'Elige el segundo jugador para preparar el cambio.':'Selecciona jugadores en el campo o el banquillo. Nada se aplica hasta confirmar.'}</p>
      {selectedMatchPlayer&&<section className="match-selected-player"><div><strong>{selectedMatchPlayer.name}</strong><span>{selectedPosition} · Calidad en el puesto {selectedRating !== undefined && <StarRating value={selectedRating} />}</span><span>Rendimiento {selectedNote?.score} · {selectedNote?.label} · Condición {selectedPhysical} · Ánimo {selectedMood?.label}</span><span>{selectedMatchPlayer.redCard?'Tarjeta roja':selectedMatchPlayer.injured?'Molestias':selectedMatchPlayer.yellowCards?'Tarjeta amarilla':'Sin incidencias'}</span></div><dl>{selectedMetrics.map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></section>}
      {(incoming.length>0||outgoing.length>0)&&<div className="pending-changes"><strong>Cambios pendientes</strong>{incoming.map((id,index)=>{const playerIn=club.players[id];const playerOut=club.players[outgoing[index]];const position=playerOut?.position;const inNote=playerIn.minutesPlayed>0?matchPerformancePresentation(playerIn.performance).score:undefined;return <section className="change-comparison" key={id}><article><span>SALE</span><strong>{playerOut?.name}</strong><small>{position} · {playerOut?matchPerformancePresentation(playerOut.performance).score:'—'} · {playerOut?conditionLabel(playerOut.condition,playerOut.fatigue):'—'} · {playerOut?moodPresentation(playerOut.mood,moodLabel(playerOut.mood)).icon:''}</small></article><article><span>ENTRA</span><strong>{playerIn.name}</strong><small>{playerIn.naturalPositions.join('/')} · {position?<StarRating value={getMatchPlayerTacticalRating(playerIn,position)} />:'—'} en {position} · {conditionLabel(playerIn.condition,playerIn.fatigue)} · {moodPresentation(playerIn.mood,moodLabel(playerIn.mood)).icon}{inNote?` · anteriormente ${inNote}`:''}</small></article></section>})}</div>}
      <TacticalInstructions plan={draftPlan} onChange={setDraftPlan}/>
      {draftErrors.map(error=><p className="intervention-error" key={error}>{error}</p>)}
      </>}
      <footer><small>{interventionTeamView==='RIVAL'?'Vista rival · solo información observable':substitutionRules.maxOwnStoppages===null?'Cambios libres · reentrada permitida':freeWindow?(match.phase==='HALF_TIME'?'Ventana de cambios libre · descanso':rivalWindow?'Aprovechando la interrupción rival · coste 0':'Interrupción propia ya abierta · puedes completar los cambios'):(incoming.length?`Esta sustitución utilizará tu ${interruptionsUsed+1}.ª interrupción`:`Interrupciones: ${interruptionsUsed}/${substitutionRules.maxOwnStoppages} usadas · los cambios tácticos no consumen` )}</small><div>{interventionTeamView==='CLUB'&&<><button type="button" onClick={cancelDraft}>CANCELAR</button><button type="button" className="primary-action" disabled={!draftDirty} onClick={confirmDraft}>CONFIRMAR CAMBIOS</button></>}<button type="button" disabled={draftDirty} onClick={resume}>REANUDAR PARTIDO</button></div></footer>
    </section>}

    {match.phase === 'FINISHED' && <section className="match-card final-summary"><header><div><span>{match.competitionType === 'FRIENDLY' ? 'AMISTOSO · FINAL' : 'FINAL'}</span><h2>{match.home.name} {match.score.home}–{match.score.away} {match.away.name}</h2></div><button className="primary-action" type="button" onClick={onFinish}>VER ACTA</button></header><div><article><h3>Destacados</h3>{bestPlayers.map((player) => <p key={player.id}><strong>{player.name}</strong> · {matchPerformancePresentation(player.performance).score} · {performanceLabel(player.performance)}</p>)}</article><article><h3>Partido difícil</h3>{weakPlayers.length ? weakPlayers.map((player) => <p key={player.id}><strong>{player.name}</strong> · {matchPerformancePresentation(player.performance).score} · {performanceLabel(player.performance)}</p>) : <p>Nadie quedó especialmente señalado.</p>}</article><article><h3>Incidencias</h3><p>{match.goalEvents.length} goles · {stats('home').yellowCards + stats('away').yellowCards} amarillas · {clubPlayers.filter((player) => player.injured).length} molestias</p></article></div></section>}
  </section>
}
