import type { Formation, TacticalPlan } from '../domain/models'
import { FORMATION_SLOTS } from '../domain/matchTactics'
import { familiarityLabel } from '../domain/tacticalPresentation'
import './TacticalWorkspace.css'
import './TacticalMatchIndicators.css'
import { StarRating } from './StarRating'

type Point = { x: number; y: number }
const POINTS: Record<Formation, Point[]> = {
  '4-4-2': [{x:50,y:91},{x:84,y:73},{x:61,y:79},{x:39,y:79},{x:16,y:73},{x:61,y:49},{x:39,y:49},{x:84,y:43},{x:38,y:17},{x:16,y:43},{x:62,y:17}],
  '4-3-3': [{x:50,y:91},{x:84,y:73},{x:61,y:79},{x:39,y:79},{x:16,y:73},{x:50,y:53},{x:30,y:47},{x:82,y:19},{x:70,y:47},{x:18,y:19},{x:50,y:15}],
  '4-2-3-1': [{x:50,y:91},{x:84,y:73},{x:61,y:79},{x:39,y:79},{x:16,y:73},{x:63,y:56},{x:37,y:56},{x:82,y:34},{x:50,y:36},{x:18,y:34},{x:50,y:14}],
  '3-5-2': [{x:50,y:91},{x:86,y:48},{x:70,y:75},{x:50,y:79},{x:30,y:75},{x:67,y:49},{x:50,y:53},{x:33,y:49},{x:62,y:17},{x:14,y:48},{x:38,y:17}],
  '5-4-1': [{x:50,y:91},{x:88,y:72},{x:69,y:78},{x:50,y:81},{x:12,y:72},{x:31,y:78},{x:39,y:49},{x:84,y:43},{x:61,y:49},{x:16,y:43},{x:50,y:16}],
}

export type TacticalPlayerView = { id: number; name: string; positions: string; rating?: number; secondary?: string; status?: string; fatigueLabel?: string; conditionAlert?: string; unavailable?: boolean; matchPerformance?: { score: string; label: string }; condition?: { level: number; label: string }; mood?: { icon: string; label: string }; incident?: string }
export type TacticalSelection = { group: 'field'; slot: number } | { group: 'reserve'; playerId: number } | null

export function TacticalBoard({ formation, players, selection, onSelect, onMove }: { formation: Formation; players: TacticalPlayerView[]; selection: TacticalSelection; onSelect?: (slot: number) => void; onMove?: (source: Exclude<TacticalSelection, null>, target: Exclude<TacticalSelection, null>) => void }) {
  return <div className="tactical-pitch" aria-label={`Once en formación ${formation}`}><div className="tactical-halfway"/><div className="tactical-circle"/><div className="tactical-box top"/><div className="tactical-box bottom"/>{players.map((player, slot) => {
    const point = POINTS[formation][slot]; const position = FORMATION_SLOTS[formation][slot]
    return <button type="button" draggable={Boolean(onMove)} disabled={!onSelect} key={`${slot}-${player.id}`} className={`tactical-token${selection?.group === 'field' && selection.slot === slot ? ' is-selected' : ''}`} style={{left:`${point.x}%`,top:`${point.y}%`}} onDragStart={(event)=>event.dataTransfer.setData('application/x-tactical-player',JSON.stringify({group:'field',slot}))} onDragOver={(event)=>{if(onMove)event.preventDefault()}} onDrop={(event)=>{event.preventDefault();const raw=event.dataTransfer.getData('application/x-tactical-player');if(raw)onMove?.(JSON.parse(raw),{group:'field',slot})}} onClick={() => onSelect?.(slot)} aria-pressed={selection?.group === 'field' && selection.slot === slot}>
      <span>{position}</span><strong>{player.name.split(' ')[0]} {player.rating !== undefined && <b><StarRating value={player.rating} /></b>}</strong>{player.matchPerformance&&<em className={`match-note note-${player.matchPerformance.label.toLowerCase().replace(' ','-')}`} title={`Rendimiento: ${player.matchPerformance.label}`}>{player.matchPerformance.score}</em>}<small>{player.positions}{player.status ? ` · ${player.status}` : ''}</small>{player.fatigueLabel&&<small className="fatigue-label">{player.fatigueLabel}</small>}{player.conditionAlert&&<small className="condition-alert">{player.conditionAlert}</small>}{player.incident&&<mark className="tactical-incident" title={player.incident}>{player.incident}</mark>}
    </button>
  })}</div>
}

export function TacticalSquadList({ players, selection, onSelect, onMove, title = 'Banquillo' }: { players: TacticalPlayerView[]; selection: TacticalSelection; onSelect: (id: number) => void; onMove?: (source: Exclude<TacticalSelection, null>, target: Exclude<TacticalSelection, null>) => void; title?: string }) {
  return <aside className="tactical-squad"><h3>{title}</h3><div>{players.map(player => <button type="button" draggable={Boolean(onMove)&&!player.unavailable} disabled={player.unavailable} className={selection?.group === 'reserve' && selection.playerId === player.id ? 'is-selected' : ''} key={player.id} onDragStart={(event)=>event.dataTransfer.setData('application/x-tactical-player',JSON.stringify({group:'reserve',playerId:player.id}))} onDragOver={(event)=>{if(onMove)event.preventDefault()}} onDrop={(event)=>{event.preventDefault();const raw=event.dataTransfer.getData('application/x-tactical-player');if(raw)onMove?.(JSON.parse(raw),{group:'reserve',playerId:player.id})}} onClick={() => onSelect(player.id)}><span><strong>{player.name}</strong><small>{player.positions}{player.secondary ? ` · ${player.secondary}` : ''}</small><small className="bench-fatigue">{player.fatigueLabel}</small>{player.conditionAlert&&<small className="bench-condition">{player.conditionAlert}</small>}</span>{player.rating!==undefined&&<b><StarRating value={player.rating}/></b>}{player.incident&&<mark>{player.incident}</mark>}{player.status && <mark>{player.status}</mark>}</button>)}</div></aside>
}

const fields: Array<{ key: keyof TacticalPlan; label: string; options: string[] }> = [
  {key:'formation',label:'Formación',options:['4-4-2','4-3-3','4-2-3-1','3-5-2','5-4-1']},{key:'mentality',label:'Mentalidad',options:['Ofensiva','Equilibrada','Cauta']},{key:'passingStyle',label:'Pase',options:['En corto','Mixto','Directo']},{key:'tempo',label:'Ritmo',options:['Alto','Medio','Bajo']},{key:'afterRecovery',label:'Tras recuperar',options:['Contraataque','Equilibrada','Mantener posición']},{key:'pressingHeight',label:'Altura',options:['Alta','Media','Baja']},{key:'pressingIntensity',label:'Presión',options:['Alta','Media','Baja']},{key:'afterLoss',label:'Tras pérdida',options:['Presión tras pérdida','Mixto','Repliegue']},{key:'timeWasting',label:'Perder tiempo',options:['Sí','No']},{key:'aggression',label:'Ser agresivos',options:['Sí','No']},
]
export function TacticalInstructions({ plan, onChange }: { plan: TacticalPlan; onChange: (plan: TacticalPlan) => void }) { return <section className="tactical-instructions"><h3>Instrucciones</h3><div>{fields.map(field => <label key={field.key}>{field.label}<select value={String(plan[field.key])} onChange={event => onChange({...plan,[field.key]:event.target.value})}>{field.options.map(option => <option key={option}>{option}</option>)}</select></label>)}</div></section> }

export function TacticalSummary({ plan, familiarity }: { plan: TacticalPlan; familiarity?: number }) { return <div className="tactical-summary"><strong>{plan.formation} · {plan.mentality}</strong><span>{plan.passingStyle} · ritmo {plan.tempo.toLowerCase()} · presión {plan.pressingIntensity.toLowerCase()}</span>{familiarity !== undefined && <small>Familiaridad {familiarityLabel(familiarity)}</small>}</div> }
