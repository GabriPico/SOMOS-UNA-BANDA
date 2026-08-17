import type { ReactNode } from 'react'
import type { ScreenId } from '../domain/models'
import { MainNav } from './MainNav'

type NavItem = {
  id: ScreenId
  label: string
}

type AppShellProps = {
  activeScreen: ScreenId
  navItems: NavItem[]
  onNavigate: (screen: ScreenId) => void
  children: ReactNode
  dateLabel: string
  matchday: number
}

export function AppShell({
  activeScreen,
  navItems,
  onNavigate,
  children,
  dateLabel,
  matchday,
}: AppShellProps) {
  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p>Somos una banda</p>
          <h1>FC Poblenou</h1>
          <small>{matchday === 0 ? 'Pretemporada' : `Jornada ${matchday}`} · {dateLabel}</small>
        </div>
      </header>
      <aside className="sidebar">
        <MainNav
          activeScreen={activeScreen}
          items={navItems}
          onNavigate={onNavigate}
        />
      </aside>
      <main className="content">{children}</main>
    </div>
  )
}
