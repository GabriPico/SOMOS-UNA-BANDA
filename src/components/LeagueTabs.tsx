import './LeagueTabs.css'

type LeagueTab = 'results' | 'standings' | 'sanctions' | 'scorers'
type LeagueTabsProps = { activeTab: LeagueTab; onSelect: (tab: LeagueTab) => void }

export function LeagueTabs({ activeTab, onSelect }: LeagueTabsProps) {
  return (
    <nav className="league-tabs" aria-label="Secciones de la liga">
      <button className={activeTab === 'results' ? 'is-active' : undefined} type="button" aria-current={activeTab === 'results' ? 'page' : undefined} onClick={() => onSelect('results')}>Resultados</button>
      <button className={activeTab === 'standings' ? 'is-active' : undefined} type="button" aria-current={activeTab === 'standings' ? 'page' : undefined} onClick={() => onSelect('standings')}>Clasificación</button>
      <button className={activeTab === 'sanctions' ? 'is-active' : undefined} type="button" aria-current={activeTab === 'sanctions' ? 'page' : undefined} onClick={() => onSelect('sanctions')}>Sanciones</button>
      <button className={activeTab === 'scorers' ? 'is-active' : undefined} type="button" aria-current={activeTab === 'scorers' ? 'page' : undefined} onClick={() => onSelect('scorers')}>Goleadores</button>
    </nav>
  )
}
