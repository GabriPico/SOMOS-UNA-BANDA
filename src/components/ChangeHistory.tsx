import { PlayerSection } from './PlayerUi'

type ChangeHistoryItem = {
  id: string
  text: string
  direction: 'positive' | 'negative' | 'neutral'
  dateLabel?: string
}

const groups = [
  { direction: 'positive', label: 'Cambios positivos', symbol: '↑' },
  { direction: 'negative', label: 'Cambios negativos', symbol: '↓' },
  { direction: 'neutral', label: 'Otros cambios', symbol: '−' },
] as const

export function ChangeHistory({ changes, className = '', scrollable = false, compact = false }: { changes: readonly ChangeHistoryItem[]; className?: string; scrollable?: boolean; compact?: boolean }) {
  return <PlayerSection title="Cambios recientes" icon="history" className={`management-history ${className}`} scrollable={scrollable}>
    {compact ? <ul className="management-history-compact">{changes.slice(0, 4).map(change => <li key={change.id} className={`is-${change.direction}`}>
      <span className="management-history-marker" aria-hidden="true">{groups.find(group => group.direction === change.direction)?.symbol}</span>
      <div><p>{change.text}</p>{change.dateLabel && <small>{change.dateLabel}</small>}</div>
    </li>)}</ul> : groups.map((group) => {
      const items = changes.filter((change) => change.direction === group.direction)
      return items.length > 0 && <section key={group.direction} className={`management-history-group is-${group.direction}`}>
        <h4>{group.label}</h4>
        <ul>{items.map((change) => <li key={change.id}>
          <span className="management-history-marker" aria-hidden="true">{group.symbol}</span>
          <div><p>{change.text}</p>{change.dateLabel && <small>{change.dateLabel}</small>}</div>
        </li>)}</ul>
      </section>
    })}
    {changes.length === 0 && <p className="management-empty">Sin cambios recientes.</p>}
  </PlayerSection>
}
