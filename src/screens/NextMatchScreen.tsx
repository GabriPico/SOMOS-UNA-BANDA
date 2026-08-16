import { NextMatchSummary } from '../components/NextMatchSummary'
import { goalEvents, leagueMatches, leagueTeams, rivalPlayers, rivalTeamProfiles } from '../data/mockData'
import { calculateStandings } from '../domain/leagueStandings'
import {
  getNextMatch, getOpponentId, getOpponentStanding, getPlayersToWatch,
  getRecentMatches, getScoutedWeaknesses, getTeamName, summarizeRecentForm,
} from '../domain/nextMatch'
import './NextMatchScreen.css'

type NextMatchScreenProps = { onBack: () => void; onOpenTactics: () => void }
const USER_TEAM_ID = 'fc-poblenou'
const outcomeLabels = { G: 'V', E: 'E', P: 'D' } as const

export function NextMatchScreen({ onBack, onOpenTactics }: NextMatchScreenProps) {
  const nextMatch = getNextMatch(leagueMatches, USER_TEAM_ID)
  if (!nextMatch) return (
    <section className="next-match-screen">
      <button className="screen-back-button" type="button" onClick={onBack}>← Panel del club</button>
      <div className="next-match-block"><p>No hay ningún próximo partido programado.</p></div>
    </section>
  )

  const opponentId = getOpponentId(nextMatch, USER_TEAM_ID)
  const opponentName = getTeamName(leagueTeams, opponentId) ?? 'Rival por confirmar'
  const standings = calculateStandings(leagueTeams, leagueMatches, nextMatch.matchday - 1)
  const standing = getOpponentStanding(standings, opponentId)
  const profile = rivalTeamProfiles.find((item) => item.teamId === opponentId)
  const recentMatches = getRecentMatches(leagueMatches, opponentId, nextMatch.matchday)
  const watchedPlayers = getPlayersToWatch(rivalPlayers, goalEvents, leagueMatches, opponentId, nextMatch.matchday)
  const weaknesses = profile ? getScoutedWeaknesses(rivalPlayers, profile) : []

  return (
    <section className="next-match-screen">
      <header className="next-match-header">
        <button className="screen-back-button" type="button" onClick={onBack}>← Panel del club</button>
        <NextMatchSummary match={nextMatch} teams={leagueTeams} userTeamId={USER_TEAM_ID} />
      </header>

      <section className="next-match-block opponent-status">
        <h3>{opponentName}</h3>
        {standing && <>
          <p className="opponent-position"><strong>{standing.position}.º · {standing.points} {standing.points === 1 ? 'punto' : 'puntos'}</strong></p>
          <p>PJ {standing.played} · G {standing.won} · E {standing.drawn} · P {standing.lost} · GF {standing.goalsFor} · GC {standing.goalsAgainst}</p>
        </>}
        {profile && <p className="previous-season">Temporada pasada: {profile.previousSeasonPosition}.º</p>}
      </section>

      {profile && <section className="next-match-block scouting-style">
        <h3>CÓMO JUEGAN</h3>
        <p><strong>Formación habitual: {profile.preferredFormation}</strong></p>
        <div><h4>Con balón</h4><p>{profile.scouting.withBall}</p></div>
        <div><h4>Sin balón</h4><p>{profile.scouting.withoutBall}</p></div>
        {profile.scouting.observedPattern && <div><h4>Lo que hemos observado</h4><p>{profile.scouting.observedPattern}</p></div>}
      </section>}

      <section className="next-match-block">
        <h3>DINÁMICA</h3>
        {recentMatches.length > 0 && <>
          <p className="form-sequence">{recentMatches.map(({ outcome }) => outcomeLabels[outcome]).join(' · ')}</p>
          <ul className="recent-results">{recentMatches.map(({ match }) => (
            <li key={match.id}><span>{getTeamName(leagueTeams, match.homeTeamId)}</span><strong>{match.homeGoals}–{match.awayGoals}</strong><span>{getTeamName(leagueTeams, match.awayTeamId)}</span></li>
          ))}</ul>
        </>}
        <p>{summarizeRecentForm(recentMatches)}</p>
      </section>

      <section className="next-match-block">
        <h3>JUGADORES A VIGILAR</h3>
        <div className="scouting-list">{watchedPlayers.map(({ player, description }) => (
          <article key={player.id}><h4>{player.name} · {player.primaryPosition}</h4><p>{description}</p></article>
        ))}</div>
      </section>

      {weaknesses.length > 0 && <section className="next-match-block">
        <h3>PUNTOS DÉBILES</h3>
        <div className="scouting-list">{weaknesses.map((weakness, index) => (
          <article key={`${weakness.title}-${index}`}><h4>{weakness.title}</h4><p>{weakness.detail}</p></article>
        ))}</div>
      </section>}

      <footer className="next-match-actions">
        <button className="screen-back-button" type="button" onClick={onBack}>← Panel del club</button>
        <button className="primary-action" type="button" onClick={onOpenTactics}>IR A TÁCTICAS</button>
      </footer>
    </section>
  )
}
