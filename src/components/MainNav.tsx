import type { ScreenId } from '../domain/models'

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
          className={item.id === activeScreen ? 'is-active' : ''}
          key={item.id}
          type="button"
          onClick={() => onNavigate(item.id)}
        >
          {item.label}
        </button>
      ))}
    </nav>
  )
}
