import type { ScreenId } from '../domain/models'
import { ManagementIcon, type ManagementIconName } from './ManagementIcon'

const icons: Partial<Record<ScreenId, ManagementIconName>> = { 'club-panel': 'home', squad: 'group', tactics: 'tactics', training: 'training', 'dressing-room': 'players', 'next-match': 'calendar', standings: 'trophy', staff: 'staff' }

function navDestination(screen: ScreenId): ScreenId {
  if (['league-results', 'league-scorers', 'league-sanctions'].includes(screen)) return 'standings'
  if (['pre-match', 'friendly-call-up', 'match', 'post-match'].includes(screen)) return 'next-match'
  return screen
}

type NavItem = {
  id: ScreenId
  label: string
}

type MainNavProps = {
  items: NavItem[]
  activeScreen: ScreenId
  onNavigate: (screen: ScreenId) => void
}

export function MainNav({ items, activeScreen, onNavigate }: MainNavProps) {
  return (
    <nav className="main-nav" aria-label="Navegación principal">
      {items.map((item) => (
        <button
          className={item.id === navDestination(activeScreen) ? 'is-active' : ''}
          aria-current={item.id === navDestination(activeScreen) ? 'page' : undefined}
          key={item.id}
          type="button"
          onClick={() => onNavigate(item.id)}
        >
          <ManagementIcon name={icons[item.id] ?? 'group'} /><span>{item.label}</span>
        </button>
      ))}
    </nav>
  )
}
