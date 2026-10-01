import { CorkBoard, PinnedPaper } from '../components/CorkBoard'
import { MatchPaper, MatchDetailsPaper, OpponentInfoPaper, ScoutingPaper, FormPaper, PlayersToWatchPaper, WeaknessesPaper } from '../components/NextMatchPapers'
import { NextMatchSquadPaper } from '../components/NextMatchSquadPaper'
import { latestClubMatch } from '../domain/competitionPresentation'
import { goalEvents, leagueTeams, rivalPlayers, rivalTeamProfiles } from '../data/mockData'
import type { LeagueMatch } from '../domain/models'
import type { GameState } from '../domain/gameState'
import { calculateStandings } from '../domain/leagueStandings'
import { getNextMatch, getOpponentId, getOpponentStanding, getPlayersToWatch, getRecentMatches, getScoutedWeaknesses, getTeamName } from '../domain/nextMatch'
import { getNextMatchPaperDetails } from '../presentation/nextMatchPaperPresentation'
import './NextMatchScreen.css'
import './NextMatchBoard.css'

type NextMatchScreenProps = {
  matches: LeagueMatch[]; goalEvents: typeof goalEvents; matchReady: boolean; gameState: GameState
  onAnnounceSquad: (playerIds: number[]) => string[]; lineupReady: boolean; onBack: () => void
  onOpenTactics: () => void; onPlay: () => void; onOpenReport: (matchId: string) => void
}
const USER_TEAM_ID = 'fc-poblenou'

export function NextMatchScreen({ matches, goalEvents: liveGoalEvents, matchReady, gameState, onAnnounceSquad, lineupReady, onBack, onOpenTactics, onPlay, onOpenReport }: NextMatchScreenProps) {
  const nextMatch = getNextMatch(matches, USER_TEAM_ID)
  const lastMatch = latestClubMatch(matches)
  const opponentId = nextMatch ? getOpponentId(nextMatch, USER_TEAM_ID) : undefined
  const opponentName = opponentId ? getTeamName(leagueTeams, opponentId) ?? 'Rival por confirmar' : undefined
  const standings = nextMatch ? calculateStandings(leagueTeams, matches, nextMatch.matchday - 1) : []
  const standing = opponentId ? getOpponentStanding(standings, opponentId) : undefined
  const profile = rivalTeamProfiles.find(item => item.teamId === opponentId)
  const recentMatches = nextMatch && opponentId ? getRecentMatches(matches, opponentId, nextMatch.matchday) : []
  const watchedPlayers = nextMatch && opponentId ? getPlayersToWatch(rivalPlayers, liveGoalEvents, matches, opponentId, nextMatch.matchday) : []
  const weaknesses = profile ? getScoutedWeaknesses(rivalPlayers, profile) : []
  const details = nextMatch ? getNextMatchPaperDetails(nextMatch) : undefined
  const official = nextMatch && nextMatch.competitionType !== 'FRIENDLY'

  return <CorkBoard className={`next-match-screen next-match-board${official ? ' next-match-board--official' : ''}${!nextMatch ? ' next-match-board--empty' : ''}`} label="Tablón del próximo partido">
    <header className="next-board-heading">
      <button className="board-back-button" type="button" onClick={onBack}>← Panel del club</button>
      <PinnedPaper className="next-board-title" rotation={-0.4}><h2>Próximo partido</h2></PinnedPaper>
      {lastMatch && <button className="board-report-link" type="button" onClick={() => onOpenReport(lastMatch.id)}>Acta del último partido →</button>}
    </header>
    {nextMatch && details ? <>
      <div className="next-board-papers">
        <MatchPaper match={nextMatch} teams={leagueTeams} details={details} />
        <MatchDetailsPaper details={details} />
        <OpponentInfoPaper name={opponentName!} standing={standing} profile={profile} />
        {profile && <ScoutingPaper profile={profile} />}
        <FormPaper recentMatches={recentMatches} teams={leagueTeams} />
        <PlayersToWatchPaper watchedPlayers={watchedPlayers} />
        {weaknesses.length > 0 && <WeaknessesPaper weaknesses={weaknesses} />}
      </div>
      <footer className="next-board-actions">
        {official && <NextMatchSquadPaper key={nextMatch.id} gameState={gameState} match={nextMatch} onAnnounce={onAnnounceSquad} />}
        {!lineupReady && gameState.squadSelections[nextMatch.id]?.announced && <p className="squad-selection-error">Prepara un once válido con jugadores convocados.</p>}
        <button className="board-action" type="button" onClick={onOpenTactics}>IR A TÁCTICAS →</button>
        {matchReady && (nextMatch.competitionType === 'FRIENDLY' || gameState.squadSelections[nextMatch.id]?.announced) && <button className="board-action board-action--play" type="button" onClick={onPlay} disabled={!lineupReady}>JUGAR PARTIDO →</button>}
      </footer>
    </> : <PinnedPaper title="Calendario del club" className="next-board-empty-paper" ruled rotation={-0.6}><p>No hay ningún próximo partido programado.</p>{lastMatch && <button className="board-paper-link" type="button" onClick={() => onOpenReport(lastMatch.id)}>Ver acta del último partido →</button>}</PinnedPaper>}
  </CorkBoard>
}
