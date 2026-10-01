import type { CompetitionTab } from '../domain/competitionPortal'

const COMPETITION_TABS: { id: CompetitionTab; label: string }[] = [
  { id: 'results', label: 'Resultados' }, { id: 'standings', label: 'Clasificación' }, { id: 'calendar', label: 'Calendario' },
  { id: 'sanctions', label: 'Sanciones' }, { id: 'scorers', label: 'Goleadores' }, { id: 'kits', label: 'Equipaciones' },
]
export function LeagueTabs({ activeTab, onSelect }: { activeTab: CompetitionTab; onSelect: (tab: CompetitionTab) => void }) {
  return <nav className="federation-tabs" aria-label="Secciones de Competición">{COMPETITION_TABS.map(tab => <button key={tab.id} type="button" aria-current={activeTab === tab.id ? 'page' : undefined} onClick={() => onSelect(tab.id)}>{tab.label}</button>)}</nav>
}
