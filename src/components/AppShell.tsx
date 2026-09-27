import type { ReactNode } from 'react'
import type { ScreenId, LeagueMatch, LeagueTeam } from '../domain/models'
import { getOpponentId, getTeamName } from '../domain/nextMatch'
import { clubStatus } from '../data/mockData'
import { ManagementIcon } from './ManagementIcon'
import { ClubCrest } from './ClubCrest'
import { ClubEnvironment } from './ClubEnvironment'
import { getClubLocation } from '../data/clubEnvironments'
import type { EnvironmentMode } from '../presentation/environment'

type AppShellProps = {
  activeScreen: ScreenId
  onNavigate: (screen: ScreenId) => void; children: ReactNode
  dateLabel: string; matchday: number; onContinue: () => void; continueLabel: string
  nextMatch?: LeagueMatch; teams?: LeagueTeam[]
  contentView?: 'player-profile'
  phone?: ReactNode
  environmentMode: EnvironmentMode
}

export function AppShell({ activeScreen, onNavigate, children, dateLabel, matchday, onContinue, continueLabel, nextMatch, teams = [], contentView, phone, environmentMode }: AppShellProps) {
  const opponent = nextMatch ? getTeamName(teams, getOpponentId(nextMatch, 'fc-poblenou')) : undefined
  return <div className={'app-shell management-theme club-material-theme' + (activeScreen === 'club-panel' ? ' is-club-panel' : '')} data-environment={environmentMode}>
    <header className="topbar">
      <div className="club-brand"><button type="button" className="club-home-button" aria-label="Volver al Panel del club" title="Panel del club" onClick={() => onNavigate('club-panel')}><ClubCrest /></button><h1>{clubStatus.name}</h1></div>
      <div className="header-calendar">{activeScreen === 'club-panel' && <ManagementIcon name="calendar" />}<strong>{dateLabel}</strong><span>{clubStatus.league} · {matchday === 0 ? 'Pretemporada' : `Jornada ${matchday}`}</span></div>
      {nextMatch && <button type="button" className="header-next-match" onClick={() => onNavigate('next-match')}><ManagementIcon name="calendar" /><span><small>Próximo partido</small><strong>{opponent ?? 'Rival por confirmar'} <em>({nextMatch.homeTeamId === 'fc-poblenou' ? 'C' : 'F'})</em></strong></span></button>}
      <button className="global-continue" type="button" onClick={onContinue} title={continueLabel}>CONTINUAR <ManagementIcon name="arrow" /></button>
    </header>
    <main className={`content content--${contentView ?? activeScreen}`}>{activeScreen !== 'tactics' && activeScreen !== 'club-panel' && <ClubEnvironment location={getClubLocation(contentView ?? activeScreen)} mode={environmentMode} />}{children}</main>
    {phone}
  </div>
}
