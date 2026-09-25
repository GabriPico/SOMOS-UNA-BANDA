import './MatchdaySelector.css'

type MatchdaySelectorProps = {
  currentMatchday: number
  selectedMatchday: number
  totalMatchdays: number
  onSelect: (matchday: number) => void
  allowFuture?: boolean
}

export function MatchdaySelector({ currentMatchday, selectedMatchday, totalMatchdays, onSelect, allowFuture = false }: MatchdaySelectorProps) {
  return (
    <nav className="matchday-selector" aria-label="Seleccionar jornada">
      <span>Jornada</span>
      {Array.from({ length: totalMatchdays }, (_, index) => index + 1).map((matchday) => (
        <button
          className={matchday === selectedMatchday ? 'is-active' : undefined}
          type="button"
          key={matchday}
          disabled={!allowFuture && matchday > Math.max(1, currentMatchday)}
          aria-label={`Jornada ${matchday}`}
          aria-current={matchday === selectedMatchday ? 'true' : undefined}
          onClick={() => onSelect(matchday)}
        >
          {matchday}
        </button>
      ))}
    </nav>
  )
}
