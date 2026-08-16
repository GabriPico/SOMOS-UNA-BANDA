import './ClubPanelScreen.css'
import { NextMatchSummary } from '../components/NextMatchSummary'
import { initialDressingRoomState } from '../data/dressingRoomData'
import { initialInboxMessages } from '../data/inboxData'
import { leagueMatches, leagueSanctions, leagueSeason, leagueTeams, players } from '../data/mockData'
import { getAuthorityLabel, getCohesionLabel, getMoodLabel } from '../domain/humanState'
import { countMessagesRequiringResponse, countNewMessages, EXPECTATION_ASSESSMENT_LABELS } from '../domain/inbox'
import { calculateStandings, getStandingsAroundTeam } from '../domain/leagueStandings'
import { getSanctionsForMatchday } from '../domain/leagueSanctions'
import type { TacticalPlan } from '../domain/models'
import type { ClubExpectationsState } from '../domain/inbox'
import { getNextMatch } from '../domain/nextMatch'
import { getPlayerHappiness, getTeamAuthority, getTeamHappiness } from '../domain/trainingEngine'
import type { TrainingGameState } from '../domain/trainingTypes'

type Props = { tacticalPlan: TacticalPlan; trainingState: TrainingGameState; expectations: ClubExpectationsState; onOpenStaff: () => void; onOpenTeam: () => void; onOpenTactics: () => void; onOpenTraining: () => void; onOpenLeague: () => void; onOpenNextMatch: () => void; onOpenDressingRoom: () => void; onOpenInbox: () => void }

export function ClubPanelScreen({ tacticalPlan, trainingState, expectations, onOpenStaff, onOpenTeam, onOpenTactics, onOpenTraining, onOpenLeague, onOpenNextMatch, onOpenDressingRoom, onOpenInbox }: Props) {
  const nextMatch = getNextMatch(leagueMatches, 'fc-poblenou')
  const standings = calculateStandings(leagueTeams, leagueMatches, leagueSeason.currentMatchday)
  const userStanding = standings.find((row) => row.teamId === 'fc-poblenou')
  const nearbyStandings = getStandingsAroundTeam(standings, 'fc-poblenou')
  const teamNames = new Map(leagueTeams.map((team) => [team.id, team.name]))
  const suspendedPlayers = getSanctionsForMatchday(leagueSanctions, leagueSeason.currentMatchday + 1).filter((sanction) => sanction.teamId === 'fc-poblenou').length
  const unhappyPlayers = Object.values(trainingState.players).filter((player) => getPlayerHappiness(player) < 58).length
  const newMessages = countNewMessages(initialInboxMessages)
  const messagesRequiringResponse = countMessagesRequiringResponse(initialInboxMessages)
  const latestMessage = initialInboxMessages.at(-1)
  const leagueExpectation = expectations.expectations.find((expectation) => expectation.type === 'league')

  return <main className="club-panel-screen">
    <button className="dashboard-card dashboard-card-action" type="button" onClick={onOpenNextMatch} disabled={!nextMatch}>
      {nextMatch ? <NextMatchSummary match={nextMatch} teams={leagueTeams} userTeamId="fc-poblenou" /> : <h2>No hay próximo partido programado</h2>}
    </button>

    <section className="dashboard-card league-summary-card" role="link" tabIndex={0} onClick={onOpenLeague} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onOpenLeague() } }}>
      <h2>La liga</h2>
      {userStanding && <p className="league-position-summary"><strong>{userStanding.position}º · {userStanding.points} pts</strong></p>}
      <table className="mini-standings" aria-label="Clasificación alrededor del FC Poblenou"><thead><tr><th scope="col">P</th><th scope="col">Equipo</th><th scope="col">Pts</th></tr></thead><tbody>{nearbyStandings.map((row) => <tr key={row.teamId} className={row.teamId === 'fc-poblenou' ? 'is-user-team' : undefined}><td>{row.position}</td><th scope="row">{teamNames.get(row.teamId)}</th><td>{row.points}</td></tr>)}</tbody></table>
    </section>

    <button className="dashboard-card dashboard-card-action" type="button" onClick={onOpenStaff}><h2>Staff</h2><p className="card-description">Consulta quién te ayuda, su disponibilidad y el pequeño presupuesto del cuerpo técnico.</p></button>

    <button className="dashboard-card dashboard-card-action" type="button" onClick={onOpenTeam}><h2>Equipo</h2><p className="card-main-value"><strong>{players.length} jugadores</strong></p><dl className="card-facts"><div><dt>Sancionados</dt><dd>{suspendedPlayers}</dd></div></dl></button>

    <button className="dashboard-card dashboard-card-action" type="button" onClick={onOpenTactics}><h2>Táctica</h2><p className="card-main-value"><strong>{tacticalPlan.formation} · {tacticalPlan.mentality}</strong></p><p className="card-lines">Pase {tacticalPlan.passingStyle.toLowerCase()}<br />Ritmo {tacticalPlan.tempo.toLowerCase()}<br />Presión {tacticalPlan.pressingHeight.toLowerCase()}</p></button>

    <button className="dashboard-card dashboard-card-action" type="button" onClick={onOpenTraining}><h2>Preparación de entrenamiento</h2>{trainingState.sessions.length > 0 ? <><p className="card-main-value"><strong>Semana {trainingState.week}</strong></p><p className="card-lines">{trainingState.sessions.map((session) => `${session.day}: ${session.blocks[0]} + ${session.blocks[1]} · ${session.intensity}`).join('\n')}</p></> : <p className="card-main-value"><strong>Entrenamiento sin preparar</strong></p>}</button>

    <button className="dashboard-card dashboard-card-action" type="button" onClick={onOpenDressingRoom}><h2>Estado del vestuario</h2><dl className="card-facts"><div><dt>Ánimo</dt><dd>{getMoodLabel(getTeamHappiness(trainingState))}</dd></div><div><dt>Cohesión</dt><dd>{getCohesionLabel(initialDressingRoomState.cohesion)}</dd></div><div><dt>Autoridad</dt><dd>{getAuthorityLabel(getTeamAuthority(trainingState))}</dd></div>{leagueExpectation && <div><dt>Expectativas</dt><dd>{EXPECTATION_ASSESSMENT_LABELS[leagueExpectation.assessment]}</dd></div>}</dl>{unhappyPlayers > 0 && <p className="card-warning">{unhappyPlayers} {unhappyPlayers === 1 ? 'jugador descontento' : 'jugadores descontentos'}</p>}</button>

    <button className="dashboard-card dashboard-card-action" type="button" onClick={onOpenInbox}><h2>Buzón</h2><p className="card-main-value"><strong>{newMessages} {newMessages === 1 ? 'mensaje nuevo' : 'mensajes nuevos'}</strong></p>{messagesRequiringResponse > 0 && <p className="card-warning">{messagesRequiringResponse} {messagesRequiringResponse === 1 ? 'requiere respuesta' : 'requieren respuesta'}</p>}{latestMessage && <p className="message-preview"><span>Último mensaje</span><br /><strong>{latestMessage.senderName}</strong><br />{latestMessage.subject}</p>}</button>

    <section className="dashboard-card"><button type="button">CONTINUAR</button></section>
  </main>
}
