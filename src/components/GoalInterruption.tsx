import { useEffect } from 'react'
import { getGoalInterruptionContext } from '../domain/matchGoalInterruption'
import type { GoalInterruption as GoalInterruptionState, MatchTeamState } from '../domain/matchTypes'
import './GoalInterruption.css'

const USER_TEAM_ID = 'fc-poblenou'

export function GoalInterruption({ interruption, home, away, onCelebrationComplete, onKeep, onMakeChanges }: { interruption: GoalInterruptionState; home: MatchTeamState; away: MatchTeamState; onCelebrationComplete: () => void; onKeep: () => void; onMakeChanges: () => void }) {
  const scoringTeam = interruption.scoringTeamId === home.teamId ? home : away
  const scorer = scoringTeam.players[interruption.scorerId]
  const userGoal = interruption.scoringTeamId === USER_TEAM_ID
  const celebrating = interruption.presentation === 'CELEBRATION'
  useEffect(() => { if (!celebrating) return; const timer = window.setTimeout(onCelebrationComplete, 1600); return () => window.clearTimeout(timer) }, [celebrating, onCelebrationComplete])
  return <section className={`goal-interruption ${userGoal ? 'is-favourable' : 'is-rival'} ${celebrating ? 'is-celebrating' : 'is-decision'}`} role="alertdialog" aria-live="assertive" aria-label={userGoal ? 'Gol de nuestro equipo' : `Gol de ${scoringTeam.name}`}>
    <div className="goal-interruption-card">
      <strong className="goal-call">{userGoal ? '¡GOOOOOOL!' : `GOL DEL ${scoringTeam.name.toUpperCase()}`}</strong>
      {!celebrating && <><span className="goal-minute">{interruption.minute}'</span><h2>{home.name} {interruption.scoreAfter.home}–{interruption.scoreAfter.away} {away.name}</h2><p className="goal-scorer">{scorer?.name ?? 'Gol'}</p><p className="goal-context">{getGoalInterruptionContext(interruption, home.teamId, USER_TEAM_ID)}</p><p>¿Quieres hacer algún cambio?</p><div className="goal-actions"><button className="primary-action" type="button" onClick={onKeep}>MANTENER TODO</button><button type="button" onClick={onMakeChanges}>HACER CAMBIOS</button></div></>}
    </div>
  </section>
}
