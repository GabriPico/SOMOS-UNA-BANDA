import type { LeagueMatch } from '../domain/models'
import { competitionSeason } from '../domain/competitionPresentation'
import { PageTitle } from './ClubUi'
import '../styles/competition.css'
export function CompetitionHeader({ matches, onBack, title = 'Clasificación' }: { matches: LeagueMatch[]; onBack: () => void; title?: string }) {
  return <div className="competition-heading">
    <PageTitle title={title} subtitle="El tablón de nuestra liga." actions={<button type="button" className="screen-back-button" onClick={onBack}>← Panel del club</button>} />
    <dl className="competition-context"><div><dt>Temporada</dt><dd>{competitionSeason(matches)}</dd></div><div><dt>Modalidad</dt><dd>Fútbol 11</dd></div><div><dt>Competición</dt><dd>4a Catalana</dd></div><div><dt>Liga</dt><dd>12 equipos · 22 jornadas</dd></div></dl>
  </div>
}
