import type { TacticalPlan, LeagueMatch } from '../domain/models'
import type { GameState } from '../domain/gameState'
import type { StaffPerson } from '../domain/staff'
import type { TrainingGameState } from '../domain/trainingTypes'
import { TacticsScreen } from './TacticsScreen'
import './PreMatchScreen.css'

type Props = { match: LeagueMatch; gameState: GameState; lineupIds: number[]; tacticalPlan: TacticalPlan; trainingState: TrainingGameState; staffMembers: StaffPerson[]; errors: string[]; onLineupChange: (ids:number[])=>void; onPlanChange:(plan:TacticalPlan)=>void; onPlay:()=>void; onBack:()=>void }
export function PreMatchScreen({ match, gameState, lineupIds, tacticalPlan, trainingState, staffMembers, errors, onLineupChange, onPlanChange, onPlay, onBack }: Props) {
  const calledUp = gameState.squadSelections[match.id]?.playerIds ?? []
  return <section className="pre-match-screen">
    <header className="pre-match-heading"><button className="screen-back-button" type="button" onClick={onBack}>← Previa</button><div><span>PREPARTIDO · VESTUARIO</span><h2>Preparar el partido</h2><p>{match.competitionType === 'FRIENDLY' ? 'Amistoso' : `Jornada ${match.matchday}`} · {match.date} · {match.time}</p></div></header>
    <TacticsScreen onBack={onBack} tacticalPlan={tacticalPlan} onTacticalPlanChange={onPlanChange} lineupIds={lineupIds} onLineupChange={onLineupChange} trainingState={trainingState} staffMembers={staffMembers} seed={gameState.temporal.seed} preseason={match.competitionType === 'FRIENDLY'} selectablePlayerIds={calledUp}/>
    {errors.map((error)=><p className="pre-match-error" key={error}>{error}</p>)}
    <footer><p>{lineupIds.length}/11 titulares · {calledUp.length-lineupIds.length} en el banquillo</p><button className="primary-action" type="button" onClick={onPlay}>JUGAR PARTIDO</button></footer>
  </section>
}
