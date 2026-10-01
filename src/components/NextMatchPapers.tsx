import type { LeagueMatch, LeagueTeam, RivalTeamProfile, StandingRow } from '../domain/models'
import type { RecentMatch, ScoutedPlayer, ScoutedWeakness } from '../domain/nextMatch'
import { getTeamName, summarizeRecentForm } from '../domain/nextMatch'
import type { NextMatchPaperDetails } from '../presentation/nextMatchPaperPresentation'
import { PinnedPaper } from './CorkBoard'
import { TeamBadge } from './TeamBadge'

export function MatchPaper({ match, teams, details }: { match: LeagueMatch; teams: LeagueTeam[]; details: NextMatchPaperDetails }) {
  const home = getTeamName(teams, match.homeTeamId) ?? match.homeTeamId
  const away = getTeamName(teams, match.awayTeamId) ?? match.awayTeamId
  return <PinnedPaper className="match-paper" rotation={-0.7} ruled>
    <div className="match-paper-versus">
      <div><TeamBadge teamId={match.homeTeamId} name={home} large /><h3>{home}</h3></div>
      <span className="match-paper-vs" aria-label="contra">vs</span>
      <div><TeamBadge teamId={match.awayTeamId} name={away} large /><h3>{away}</h3></div>
    </div>
    <div className="match-paper-schedule"><p className="match-paper-date">{details.longDate}</p><strong>{details.time}</strong><p>{details.venue}</p><p className="match-paper-competition">{details.context}</p></div>
  </PinnedPaper>
}

export function MatchDetailsPaper({ details }: { details: NextMatchPaperDetails }) {
  return <PinnedPaper title="Datos del partido" className="match-details-paper" color="red" rotation={0.7}>
    <dl className="match-paper-facts"><div><dt>Competición</dt><dd>{details.competition}</dd></div><div><dt>Fecha y hora</dt><dd>{details.date} · {details.time}</dd></div><div><dt>Campo</dt><dd>{details.venue}</dd></div><div><dt>Temporada</dt><dd>{details.season}</dd></div></dl>
  </PinnedPaper>
}

export function OpponentInfoPaper({ name, standing, profile }: { name: string; standing?: StandingRow; profile?: RivalTeamProfile }) {
  return <PinnedPaper title={name} className="opponent-info-paper" color="green" rotation={-0.4}>
    {standing && <><p className="opponent-standing">{standing.position}.º <span>· {standing.points} pts</span></p><p>PJ {standing.played} · {standing.won}V · {standing.drawn}E · {standing.lost}D</p></>}
    {profile && <p className="opponent-previous">Temporada pasada: {profile.previousSeasonPosition}.º</p>}
  </PinnedPaper>
}

export function ScoutingPaper({ profile }: { profile: RivalTeamProfile }) {
  return <PinnedPaper title="Cómo juegan" className="scouting-paper" fastening="tape" rotation={-0.5}>
    <p className="scouting-formation">Formación habitual: <strong>{profile.preferredFormation}</strong></p>
    <div className="paper-scroll" tabIndex={0} role="region" aria-label="Notas sobre cómo juega el rival">
      <h4>Con balón</h4><p>{profile.scouting.withBall}</p>
      <h4>Sin balón</h4><p>{profile.scouting.withoutBall}</p>
      {profile.scouting.observedPattern && <><h4>Tendencia</h4><p>{profile.scouting.observedPattern}</p></>}
    </div>
  </PinnedPaper>
}

const outcomeLabels = { G: 'V', E: 'E', P: 'D' } as const
export function FormPaper({ recentMatches, teams }: { recentMatches: RecentMatch[]; teams: LeagueTeam[] }) {
  return <PinnedPaper title="Dinámica" className="form-paper" color="yellow" rotation={1.0}>
    <div className="paper-scroll" tabIndex={0} role="region" aria-label="Dinámica del rival">
      {recentMatches.length > 0 && <><p className="paper-form-sequence">{recentMatches.map(({ match, outcome }) => <span key={match.id} className={`paper-form-mark paper-form-mark--${outcome}`} aria-label={outcome === 'G' ? 'Victoria' : outcome === 'E' ? 'Empate' : 'Derrota'}>{outcomeLabels[outcome]}</span>)}</p>
        <ul className="paper-recent-results">{recentMatches.map(({ match }) => <li key={match.id}><span>{getTeamName(teams, match.homeTeamId)}</span><strong>{match.homeGoals}–{match.awayGoals}</strong><span>{getTeamName(teams, match.awayTeamId)}</span></li>)}</ul></>}
      <p>{summarizeRecentForm(recentMatches)}</p>
    </div>
  </PinnedPaper>
}

export function PlayersToWatchPaper({ watchedPlayers }: { watchedPlayers: ScoutedPlayer[] }) {
  return <PinnedPaper title="Jugadores a vigilar" className="watch-paper" color="red" rotation={0.4}>
    <div className="paper-scroll" tabIndex={0} role="region" aria-label="Jugadores del rival a vigilar">{watchedPlayers.map(({ player, description }) => <article key={player.id}><h4>{player.name} · {player.primaryPosition}</h4><p>{description}</p></article>)}</div>
  </PinnedPaper>
}

export function WeaknessesPaper({ weaknesses }: { weaknesses: ScoutedWeakness[] }) {
  return <PinnedPaper title="Podemos explotar" className="weaknesses-paper" fastening="tape" rotation={-0.8}>
    <div className="paper-scroll" tabIndex={0} role="region" aria-label="Debilidades observadas del rival">{weaknesses.map((weakness, index) => <article key={`${weakness.title}-${index}`}><h4>{weakness.title}</h4><p>{weakness.detail}</p></article>)}</div>
  </PinnedPaper>
}
