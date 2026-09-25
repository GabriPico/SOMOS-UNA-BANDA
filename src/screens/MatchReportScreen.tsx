import { useEffect } from 'react'
import type { LeagueMatch } from '../domain/models'
import type { MatchReport, ReportIncident, ReportPlayer, ReportTeam } from '../domain/matchReport'
import { leagueTeams } from '../data/mockData'
import { MatchFixtureHeader } from '../components/MatchFixtureHeader'
import { TeamBadge } from '../components/TeamBadge'
import '../styles/competition.css'

type Props = { match: LeagueMatch; report: MatchReport; onBack: () => void; onContinue?: () => void }
const incidentLabels: Record<ReportIncident['kind'], string> = { GOAL: 'Gol', PENALTY: 'Gol de penalti', YELLOW: 'Tarjeta amarilla', RED: 'Expulsión', IN: 'Entra al campo', OUT: 'Sale del campo' }
const incidentSymbols: Record<ReportIncident['kind'], string> = { GOAL: '⚽', PENALTY: '⚽ P', YELLOW: '▮', RED: '▮', IN: '←', OUT: '→' }

function Incident({ incident }: { incident: ReportIncident }) {
  return <span className={`report-incident report-incident--${incident.kind.toLowerCase()}`} title={`${incident.minute}′ · ${incidentLabels[incident.kind]}`} aria-label={`${incident.minute} minutos: ${incidentLabels[incident.kind]}`}><small>{incident.minute}′</small><b aria-hidden="true">{incidentSymbols[incident.kind]}</b></span>
}

function PlayerList({ title, players, empty }: { title: string; players: ReportPlayer[]; empty: string }) {
  return <section className="competition-panel"><h3>{title}</h3>{players.length ? <ul className="report-player-list">{players.map(player => <li key={player.id}>
    <span className={`report-shirt${player.position === 'POR' ? ' is-goalkeeper' : ''}`} title={player.shirtNumber ? `Dorsal ${player.shirtNumber}` : 'Dorsal no registrado'}>{player.shirtNumber ?? '–'}</span>
    <span className="report-player-name"><strong>{player.name}</strong><small>{player.position} · {player.minutes} min</small></span>
    <span className="report-player-incidents">{player.incidents.map((incident, index) => <Incident incident={incident} key={index} />)}</span>
  </li>)}</ul> : <p className="competition-empty">{empty}</p>}</section>
}

function TeamReport({ team, report }: { team: ReportTeam; report: MatchReport }) {
  const name = leagueTeams.find(item => item.id === team.teamId)?.name ?? team.teamId
  const substitutions = report.substitutions.filter(sub => sub.teamId === team.teamId)
  return <div className="report-team-column"><h3 className="report-team-title"><TeamBadge teamId={team.teamId} name={name} />{name}{team.formation && <small>{team.formation}</small>}</h3>
    <PlayerList title="Alineación inicial" players={team.players.filter(player => player.started)} empty="No hay datos de la alineación." />
    <PlayerList title="Suplentes" players={team.players.filter(player => !player.started)} empty={report.complete ? 'Sin suplentes.' : 'No hay datos del banquillo.'} />
    <section className="competition-panel"><h3>Equipo técnico</h3><p className={team.coach ? 'report-coach' : 'competition-empty'}>{team.coach ? <><small>Entrenador</small><strong>{team.coach}</strong></> : 'No consta en el acta.'}</p></section>
    <section className="competition-panel"><h3>Sustituciones</h3>{substitutions.length ? <ol className="report-substitutions">{substitutions.map((sub, index) => <li key={index}><strong>{sub.minute}′</strong><div><span><b className="report-in">←</b>{sub.playerIn}</span><span><b className="report-out">→</b>{sub.playerOut}</span></div></li>)}</ol> : <p className="competition-empty">{report.complete ? 'Sin sustituciones.' : 'No hay datos de sustituciones.'}</p>}</section>
  </div>
}

export function MatchReportScreen({ match, report, onBack, onContinue }: Props) {
  useEffect(() => { window.scrollTo(0, 0) }, [match.id])
  const played = match.status === 'played'
  return <section className="competition-screen match-report-screen">
    <div className="competition-toolbar"><button type="button" className="competition-back" onClick={onBack}>← Volver a resultados</button>{onContinue && <button type="button" className="competition-primary" onClick={onContinue}>Continuar →</button>}</div>
    <MatchFixtureHeader match={match} teams={leagueTeams} title={played ? 'Acta del partido' : 'Ficha del partido'} />
    <p className="competition-breadcrumb">COMPETICIÓN <span>/</span> {match.competitionType === 'FRIENDLY' ? 'AMISTOSOS' : `4a CATALANA / JORNADA ${match.matchday}`} <span>/</span> {played ? 'ACTA' : 'PREVIA'}</p>
    {!played ? <p className="competition-empty competition-panel">El partido está pendiente. El acta estará disponible cuando finalice.</p> : <>
      {!report.complete && <p className="competition-notice">Este resultado conserva el marcador y los goles. No se registró un acta detallada del encuentro.</p>}
      <section className="competition-panel"><h3>Goles <span>Minuto / Dorsal</span></h3>{report.goals.length ? <ol className="report-goals">{report.goals.map(goal => {
        const teamName = leagueTeams.find(team => team.id === goal.teamId)?.name ?? goal.teamId
        return <li key={goal.id}><strong className="report-running-score">{goal.homeGoals} – {goal.awayGoals}</strong><TeamBadge teamId={goal.teamId} name={teamName} /><div><strong>{goal.playerName}</strong><small>{goal.isPenalty ? 'Gol de penalti' : 'Gol'} · {teamName}</small></div><time>{goal.minute}′</time><span className="report-goal-number">{goal.shirtNumber ?? '–'}</span></li>
      })}</ol> : <p className="competition-empty">{match.homeGoals + match.awayGoals === 0 ? 'Sin goles. El marcador no se movió.' : 'No hay autores de gol registrados.'}</p>}</section>
      {report.statistics && <section className="competition-panel"><h3>Estadísticas del partido</h3><div className="report-stats">{([['shots', 'Tiros'], ['shotsOnTarget', 'A puerta'], ['corners', 'Córners'], ['fouls', 'Faltas'], ['yellowCards', 'Amarillas'], ['redCards', 'Expulsiones']] as const).map(([key, label]) => <div key={key}><strong>{report.statistics!.home[key]}</strong><span>{label}</span><strong>{report.statistics!.away[key]}</strong></div>)}</div></section>}
      <div className="report-legend" aria-label="Leyenda del acta">{(['GOAL', 'YELLOW', 'RED', 'IN', 'OUT'] as const).map(kind => <span key={kind}><b className={`report-incident--${kind.toLowerCase()}`}>{incidentSymbols[kind]}</b>{incidentLabels[kind]}</span>)}</div>
      <div className="report-team-grid"><TeamReport team={report.home} report={report} /><TeamReport team={report.away} report={report} /></div>
      <section className="competition-panel"><h3>Árbitro</h3><p className="competition-empty">No consta una designación arbitral.</p></section>
    </>}
    {onContinue && <footer className="competition-toolbar"><span>Acta guardada en Resultados.</span><button className="competition-primary" type="button" onClick={onContinue}>Continuar →</button></footer>}
  </section>
}
