import type { LeagueMatch } from '../domain/models'
import { competitionSeason } from '../domain/competitionPresentation'
import '../styles/competition.css'

export function CompetitionHeader({ matches, onBack }: { matches: LeagueMatch[]; onBack: () => void }) {
  return <header className="competition-heading">
    <div className="competition-heading-top"><div><span className="competition-eyebrow">FÚTBOL TERRITORIAL</span><h2>La competición</h2></div><button type="button" onClick={onBack}>← Panel del club</button></div>
    <dl className="competition-context"><div><dt>Temporada</dt><dd>{competitionSeason(matches)}</dd></div><div><dt>Modalidad</dt><dd>Fútbol 11</dd></div><div><dt>Competición</dt><dd>4a Catalana</dd></div><div><dt>Liga</dt><dd>12 equipos · 22 jornadas</dd></div></dl>
  </header>
}
