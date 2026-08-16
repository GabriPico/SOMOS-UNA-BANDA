import './MatchdaySelector.css'

type MatchdaySelectorProps = {
  currentMatchday: number
  selectedMatchday: number
  totalMatchdays: number
  onSelect: (matchday: number) => void
}

export function MatchdaySelector({ currentMatchday, selectedMatchday, totalMatchdays, onSelect }: MatchdaySelectorProps) {
  return (
    <nav className="matchday-selector" aria-label="Seleccionar jornada">
      <span>Jornada</span>
      {Array.from({ length: totalMatchdays }, (_, index) => index + 1).map((matchday) => (
        <button
          className={matchday === selectedMatchday ? 'is-active' : undefined}
          type="button"
          key={matchday}
          disabled={matchday > currentMatchday}
          aria-current={matchday === selectedMatchday ? 'true' : undefined}
          onClick={() => onSelect(matchday)}
        >
          {matchday}
        </button>
      ))}
    </nav>
  )
}
