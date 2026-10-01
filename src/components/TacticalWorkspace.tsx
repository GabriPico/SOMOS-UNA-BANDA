import { useId, useState, type ReactNode } from 'react'
import type { Formation, TacticalPlan } from '../domain/models'
import { FORMATION_SLOTS } from '../domain/matchTactics'
import { familiarityLabel } from '../domain/tacticalPresentation'
import './TacticalWorkspace.css'
import './TacticalMatchIndicators.css'
import { StarRating } from './StarRating'
import { PlayerPortrait } from './PlayerPortrait'
import { TacticalPlayerCard, type TacticalCardPlayer } from './TacticalPlayerCard'
import type { TacticalCardIndicators } from '../presentation/tacticalPlayerPresentation'
import { ManagementIcon, type ManagementIconName } from './ManagementIcon'
import { StatusBar, StatusText } from './PlayerUi'

type Point = { x: number; y: number }
const POINTS: Record<Formation, Point[]> = {
  '4-4-2': [{x:50,y:91},{x:84,y:73},{x:61,y:79},{x:39,y:79},{x:16,y:73},{x:61,y:49},{x:39,y:49},{x:84,y:43},{x:38,y:17},{x:16,y:43},{x:62,y:17}],
  '4-3-3': [{x:50,y:91},{x:84,y:73},{x:61,y:79},{x:39,y:79},{x:16,y:73},{x:50,y:53},{x:30,y:47},{x:82,y:19},{x:70,y:47},{x:18,y:19},{x:50,y:15}],
  '4-2-3-1': [{x:50,y:91},{x:84,y:73},{x:61,y:79},{x:39,y:79},{x:16,y:73},{x:63,y:56},{x:37,y:56},{x:82,y:34},{x:50,y:36},{x:18,y:34},{x:50,y:14}],
  '3-5-2': [{x:50,y:91},{x:86,y:48},{x:70,y:75},{x:50,y:79},{x:30,y:75},{x:67,y:49},{x:50,y:53},{x:33,y:49},{x:62,y:17},{x:14,y:48},{x:38,y:17}],
  '5-4-1': [{x:50,y:91},{x:88,y:72},{x:69,y:78},{x:50,y:81},{x:12,y:72},{x:31,y:78},{x:39,y:49},{x:84,y:43},{x:61,y:49},{x:16,y:43},{x:50,y:16}],
}

// Card centres are measured inside the board's vertical pitch. Outer lanes
// retain room for the complete magnetic card at narrow widths.
const BOARD_POINTS: Record<Formation, Point[]> = {
  '4-4-2': [{x:50,y:89},{x:84,y:71},{x:61,y:71},{x:39,y:71},{x:16,y:71},{x:61,y:47},{x:39,y:47},{x:84,y:47},{x:39,y:17},{x:16,y:47},{x:61,y:17}],
  '4-3-3': [{x:50,y:89},{x:84,y:71},{x:61,y:71},{x:39,y:71},{x:16,y:71},{x:50,y:51},{x:29,y:46},{x:82,y:18},{x:71,y:46},{x:18,y:18},{x:50,y:16}],
  '4-2-3-1': [{x:50,y:89},{x:84,y:73},{x:61,y:73},{x:39,y:73},{x:16,y:73},{x:63,y:56},{x:37,y:56},{x:82,y:36},{x:50,y:36},{x:18,y:36},{x:50,y:15}],
  '3-5-2': [{x:50,y:89},{x:90,y:48},{x:70,y:72},{x:50,y:74},{x:30,y:72},{x:70,y:49},{x:50,y:51},{x:30,y:49},{x:62,y:17},{x:10,y:48},{x:38,y:17}],
  '5-4-1': [{x:50,y:89},{x:88,y:72},{x:69,y:72},{x:50,y:73},{x:12,y:72},{x:31,y:72},{x:39,y:48},{x:84,y:44},{x:61,y:48},{x:16,y:44},{x:50,y:17}],
}

export type TacticalPlayerView = TacticalCardPlayer & { id: number; name: string; shirtNumber?: number; positions: string; rating?: number; secondary?: string; status?: string; fatigueLabel?: string; conditionLabel?: string; conditionAlert?: string; unavailable?: boolean; matchPerformance?: { score: string; label: string }; condition?: { level: number; label: string }; mood?: { icon: string; label: string }; incident?: string; cardIndicators?: TacticalCardIndicators; generalRating?: number }
export type TacticalSelection = { group: 'field'; slot: number } | { group: 'reserve'; playerId: number } | null

export function TacticalBoard({ formation, players, selection, onSelect, onMove, variant = 'standard', onDeselect, onOpenPlayer, highlightSlots }: { formation: Formation; players: (TacticalPlayerView | undefined)[]; selection: TacticalSelection; onSelect?: (slot: number) => void; onMove?: (source: Exclude<TacticalSelection, null>, target: Exclude<TacticalSelection, null>) => void; variant?: 'standard' | 'cards'; onDeselect?: () => void; onOpenPlayer?: (id: number) => void; highlightSlots?: number[] }) {
  if (variant === 'cards') return <div className="tactical-pitch tactical-pitch--cards club-chalkboard" onClick={event => { if (!(event.target as HTMLElement).closest('[data-lineup-source]')) onDeselect?.() }} aria-label={`Once en formación ${formation}`}>
    <div className="tactical-halfway" /><div className="tactical-circle" /><div className="tactical-box top" /><div className="tactical-box bottom" /><div className="tactical-goal top" /><div className="tactical-goal bottom" />
    {FORMATION_SLOTS[formation].map((position, slot) => {
      const player = players[slot]
      const point = BOARD_POINTS[formation][slot]
      const style = { left: `${point.x}%`, top: `${point.y}%` }
      return player ? <TacticalPlayerCard key={player.id} player={player} position={position} source={{ group: 'field', slot }} style={style} proposalAffected={highlightSlots?.includes(slot)}
        selected={selection?.group === 'field' && selection.slot === slot} onSelect={onSelect ? () => onSelect(slot) : undefined} onOpenPlayer={onOpenPlayer} />
        : <button type="button" key={`empty-${slot}`} className={`tactical-empty-slot${highlightSlots?.includes(slot) ? ' is-proposal-affected' : ''}`} data-lineup-source={JSON.stringify({ group: 'field', slot })} style={style} onClick={() => onSelect?.(slot)} aria-label={`Seleccionar puesto vacío ${position}`}>{position}<small>Sin jugador</small></button>
    })}
  </div>
  return <div className="tactical-pitch" aria-label={`Once en formación ${formation}`}><div className="tactical-halfway"/><div className="tactical-circle"/><div className="tactical-box top"/><div className="tactical-box bottom"/>{players.map((player, slot) => {
    if (!player) return null
    const point = POINTS[formation][slot]; const position = FORMATION_SLOTS[formation][slot]
    return <button type="button" draggable={Boolean(onMove)} disabled={!onSelect} key={`${slot}-${player.id}`} className={`tactical-token${selection?.group === 'field' && selection.slot === slot ? ' is-selected' : ''}`} style={{left:`${point.x}%`,top:`${point.y}%`}} onDragStart={(event)=>event.dataTransfer.setData('application/x-tactical-player',JSON.stringify({group:'field',slot}))} onDragOver={(event)=>{if(onMove)event.preventDefault()}} onDrop={(event)=>{event.preventDefault();const raw=event.dataTransfer.getData('application/x-tactical-player');if(raw)onMove?.(JSON.parse(raw),{group:'field',slot})}} onClick={() => onSelect?.(slot)} aria-pressed={selection?.group === 'field' && selection.slot === slot}>
      <PlayerPortrait player={player} /><span>{player.shirtNumber !== undefined && `${player.shirtNumber} · `}{position}</span><strong>{player.name.split(' ')[0]} {player.rating !== undefined && <b><StarRating value={player.rating} /></b>}</strong>{player.matchPerformance&&<em className={`match-note note-${player.matchPerformance.label.toLowerCase().replace(' ','-')}`} title={`Rendimiento: ${player.matchPerformance.label}`}>{player.matchPerformance.score}</em>}<small>{player.positions}{player.status ? ` · ${player.status}` : ''}</small>{player.conditionLabel&&<small className={player.conditionAlert ? "condition-alert" : "condition-label"}>{player.conditionLabel}</small>}{player.fatigueLabel&&<small className="fatigue-label">{player.fatigueLabel}</small>}{player.incident&&<mark className="tactical-incident" title={player.incident}>{player.incident}</mark>}
    </button>
  })}</div>
}

export function TacticalSquadList({ players, selection, onSelect, onMove, title = 'Banquillo' }: { players: TacticalPlayerView[]; selection: TacticalSelection; onSelect: (id: number) => void; onMove?: (source: Exclude<TacticalSelection, null>, target: Exclude<TacticalSelection, null>) => void; title?: string }) {
  return <aside className="tactical-squad"><h3>{title}</h3><div>{players.map(player => <button type="button" draggable={Boolean(onMove)&&!player.unavailable} disabled={player.unavailable} className={selection?.group === 'reserve' && selection.playerId === player.id ? 'is-selected' : ''} key={player.id} onDragStart={(event)=>event.dataTransfer.setData('application/x-tactical-player',JSON.stringify({group:'reserve',playerId:player.id}))} onDragOver={(event)=>{if(onMove)event.preventDefault()}} onDrop={(event)=>{event.preventDefault();const raw=event.dataTransfer.getData('application/x-tactical-player');if(raw)onMove?.(JSON.parse(raw),{group:'reserve',playerId:player.id})}} onClick={() => onSelect(player.id)}><PlayerPortrait player={player} /><span><strong>{player.name}</strong><small>{player.positions}{player.secondary ? ` · ${player.secondary}` : ''}</small>{player.conditionLabel&&<small className={player.conditionAlert ? "bench-condition" : "bench-condition-normal"}>{player.conditionLabel}</small>}<small className="bench-fatigue">{player.fatigueLabel}</small></span>{player.rating!==undefined&&<b><StarRating value={player.rating}/></b>}{player.incident&&<mark>{player.incident}</mark>}{player.status && <mark>{player.status}</mark>}</button>)}</div></aside>
}

export function LineupList({ formation, starters, bench, candidates, selection, announced, onSelectField, onSelectReserve, onOpenPlayer }: {
  formation: Formation; starters: (TacticalPlayerView | undefined)[]; bench: TacticalPlayerView[]; candidates: TacticalPlayerView[]
  selection: TacticalSelection; announced: boolean; onSelectField: (slot: number) => void; onSelectReserve: (id: number) => void; onOpenPlayer?: (id: number) => void
}) {
  const reserveRow = (player: TacticalPlayerView, index: number, candidate = false) => <TacticalPlayerCard variant="row" key={player.id} player={player} rowLabel={candidate ? '+' : `S${index + 1}`}
    source={{ group: 'reserve', playerId: player.id }} selected={selection?.group === 'reserve' && selection.playerId === player.id}
    onSelect={() => onSelectReserve(player.id)} onOpenPlayer={onOpenPlayer} />
  return <aside className="tactics-lineup-panel" aria-label="Alineación"><h3>Alineación</h3><div className="lineup-table-heading" aria-hidden="true"><span>POS</span><span>JUGADOR</span><span>CALIDAD</span><span>COND.</span><span>STAMINA</span><span /></div><div className="lineup-list-scroll">
    <section className="lineup-starters" aria-label="Titulares"><h4>Titulares <span>{starters.filter(Boolean).length}</span></h4>
      {FORMATION_SLOTS[formation].map((position, slot) => starters[slot] ? <TacticalPlayerCard key={slot} variant="row" player={starters[slot]!} position={position} rowLabel={position} source={{ group: 'field', slot }}
        selected={selection?.group === 'field' && selection.slot === slot} onSelect={() => onSelectField(slot)} onOpenPlayer={onOpenPlayer} />
        : <button key={slot} className="lineup-empty-slot" data-lineup-source={JSON.stringify({ group: 'field', slot })} type="button" onClick={() => onSelectField(slot)}>{position} · Sin jugador</button>)}
    </section>
    <section className="lineup-bench" aria-label="Suplentes"><h4>Suplentes <span>{bench.length || ''}</span></h4>
      {bench.length ? bench.map((player, index) => reserveRow(player, index)) : <p className="lineup-empty-note">{announced ? 'Sin suplentes convocados.' : 'Convocatoria pendiente.'}</p>}
    </section>
    {candidates.length > 0 && <details className="tactics-candidates"><summary>+ VER RESTO DE LA PLANTILLA <span>{candidates.length}</span></summary><p className="lineup-empty-note">{announced ? 'No convocados · solo consulta para este partido.' : 'Selecciona un candidato para preparar el once.'}</p>
      {candidates.map((player, index) => reserveRow(player, index, true))}
    </details>}
  </div></aside>
}

const fields: Array<{ key: keyof TacticalPlan; label: string; options: string[] }> = [
  {key:'formation',label:'Formación',options:['4-4-2','4-3-3','4-2-3-1','3-5-2','5-4-1']},{key:'mentality',label:'Mentalidad',options:['Ofensiva','Equilibrada','Cauta']},{key:'passingStyle',label:'Pase',options:['En corto','Mixto','Directo']},{key:'tempo',label:'Ritmo',options:['Alto','Medio','Bajo']},{key:'afterRecovery',label:'Tras recuperar',options:['Contraataque','Equilibrada','Mantener posición']},{key:'pressingHeight',label:'Altura',options:['Alta','Media','Baja']},{key:'pressingIntensity',label:'Presión',options:['Alta','Media','Baja']},{key:'afterLoss',label:'Tras pérdida',options:['Presión tras pérdida','Mixto','Repliegue']},{key:'timeWasting',label:'Perder tiempo',options:['Sí','No']},{key:'aggression',label:'Ser agresivos',options:['Sí','No']},
]
const instructionGroups: { title: string; icon: ManagementIconName; keys: (keyof TacticalPlan)[] }[] = [
  { title: 'Ajustes generales', icon: 'settings', keys: ['formation', 'mentality'] },
  { title: 'Con balón', icon: 'ball', keys: ['passingStyle', 'tempo'] },
  { title: 'En transición', icon: 'transition', keys: ['afterRecovery', 'afterLoss'] },
  { title: 'Sin balón', icon: 'authority', keys: ['pressingHeight', 'pressingIntensity', 'timeWasting', 'aggression'] },
]
export function TacticalInstructions({ plan, onChange, grouped = false, familiarity, assistant }: { plan: TacticalPlan; onChange: (plan: TacticalPlan) => void; grouped?: boolean; familiarity?: number; assistant?: ReactNode }) {
  const [openGroup, setOpenGroup] = useState<string | null>(null)
  const groupId = useId()
  const control = (field: typeof fields[number]) => <label key={field.key}>{field.label}<select data-instruction={field.key} value={String(plan[field.key])} onChange={event => onChange({ ...plan, [field.key]: event.target.value })}>{field.options.map(option => <option key={option}>{option}</option>)}</select></label>
  if (grouped) return <aside className="tactical-instructions-panel" aria-label="Instrucciones tácticas"><h3>Configuración táctica</h3><div className="tactical-instruction-groups">{instructionGroups.map((group, index) => <section className={`tactical-instruction-card${index === 0 ? ' tactical-general-settings' : ''}`} key={group.title}>
    <h4><ManagementIcon name={group.icon} />{group.title}</h4>
    {index > 0 && <dl className="tactical-instruction-summary" hidden={openGroup === group.title}>{group.keys.map(key => <div key={key}><dt>{fields.find(field => field.key === key)!.label}</dt><dd>{String(plan[key])}</dd></div>)}</dl>}
    <div className="tactical-instruction-controls" id={`${groupId}-${index}`} hidden={index > 0 && openGroup !== group.title}>{group.keys.map(key => control(fields.find(field => field.key === key)!))}</div>
    {index === 0 && familiarity !== undefined && <section className="tactical-familiarity" aria-label="Familiaridad táctica"><div><h4>Familiaridad táctica</h4><strong><StatusText>{familiarityLabel(familiarity)}</StatusText></strong></div><StatusBar label="Familiaridad táctica" value={familiarityLabel(familiarity)} level={familiarity} /></section>}
    {index > 0 && <button className="instruction-edit-toggle" type="button" aria-expanded={openGroup === group.title} aria-controls={`${groupId}-${index}`} onClick={() => setOpenGroup(openGroup === group.title ? null : group.title)}>{openGroup === group.title ? 'LISTO' : 'CAMBIAR'}</button>}
  </section>)}</div>{assistant}</aside>
  return <section className="tactical-instructions"><h3>Instrucciones</h3><div>{fields.map(control)}</div></section>
}

export function TacticalSummary({ plan, familiarity }: { plan: TacticalPlan; familiarity?: number }) { return <div className="tactical-summary"><strong>{plan.formation} · {plan.mentality}</strong><span>{plan.passingStyle} · ritmo {plan.tempo.toLowerCase()} · presión {plan.pressingIntensity.toLowerCase()}</span>{familiarity !== undefined && <small>Familiaridad {familiarityLabel(familiarity)}</small>}</div> }
