import type { ReactNode } from 'react'
import type { ScreenId, LeagueMatch, LeagueTeam } from '../domain/models'
import { getOpponentId, getTeamName } from '../domain/nextMatch'
import { clubStatus } from '../data/mockData'
import { MainNav } from './MainNav'
import { ManagementIcon } from './ManagementIcon'
import { ClubCrest } from './ClubCrest'

type AppShellProps = {
  activeScreen: ScreenId; navItems: { id: ScreenId; label: string }[]
  onNavigate: (screen: ScreenId) => void; children: ReactNode
  dateLabel: string; matchday: number; onContinue: () => void; continueLabel: string
  nextMatch?: LeagueMatch; teams?: LeagueTeam[]
  contentView?: 'player-profile'
}

export function AppShell({ activeScreen, navItems, onNavigate, children, dateLabel, matchday, onContinue, continueLabel, nextMatch, teams = [], contentView }: AppShellProps) {
  const usesClubMaterials = activeScreen === 'tactics' || activeScreen === 'squad' || activeScreen === 'inbox' || activeScreen === 'dressing-room' || contentView === 'player-profile'
  const opponent = nextMatch ? getTeamName(teams, getOpponentId(nextMatch, 'fc-poblenou')) : undefined
  return <div className={`app-shell management-theme${usesClubMaterials ? ' club-material-theme' : ''}`}>
    <header className="topbar">
      <div className="club-brand"><ClubCrest /><h1>{clubStatus.name}</h1></div>
      <div className="header-calendar"><strong>{dateLabel}</strong><span>{clubStatus.league} · {matchday === 0 ? 'Pretemporada' : `Jornada ${matchday}`}</span></div>
      {nextMatch && <button type="button" className="header-next-match" onClick={() => onNavigate('next-match')}><ManagementIcon name="calendar" /><span><small>Próximo partido</small><strong>{opponent ?? 'Rival por confirmar'} <em>({nextMatch.homeTeamId === 'fc-poblenou' ? 'C' : 'F'})</em></strong></span></button>}
      <button className="global-continue" type="button" onClick={onContinue} title={continueLabel}>CONTINUAR <ManagementIcon name="arrow" /></button>
    </header>
    <aside className="sidebar"><MainNav activeScreen={activeScreen} items={navItems} onNavigate={onNavigate} /></aside>
    <main className={`content content--${contentView ?? activeScreen}`}>{children}</main>
  </div>
}
