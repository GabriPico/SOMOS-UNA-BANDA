import type { CompetitionPortalData } from '../../domain/competitionPortal'
import type { LeagueMatch } from '../../domain/models'
import { fixtureDate } from '../../domain/competitionPresentation'
import { ClubLink } from './ClubLink'
type Props = { data: CompetitionPortalData; onOpenClub: (id: string) => void; onOpenMatch: (id: string) => void }

export function CompetitionMatchRows({ data, matches, nextMatchId, onOpenClub, onOpenMatch }: Props & { matches: LeagueMatch[]; nextMatchId?: string }) {
  return <div className="federation-fixtures">{matches.map(match => <article className={`federation-fixture${match.id === nextMatchId ? ' is-next-match' : ''}`} key={match.id}><div className="federation-fixture-home"><ClubLink data={data} clubId={match.homeTeamId} onOpen={onOpenClub} /></div><div className="federation-score"><strong>{match.status === 'played' ? `${match.homeGoals} – ${match.awayGoals}` : 'VS'}</strong><small>{match.status === 'played' ? 'Jugado' : match.id === nextMatchId ? 'Próximo partido' : 'Pendiente'}</small></div><div className="federation-fixture-away"><ClubLink data={data} clubId={match.awayTeamId} onOpen={onOpenClub} /></div><div className="federation-fixture-info"><time dateTime={`${match.date}T${match.time}`}>{fixtureDate(match.date)} · {match.time} h</time>{match.venue && <span>{match.venue}</span>}<button type="button" className="federation-match-link" onClick={() => onOpenMatch(match.id)} aria-label={`${match.status === 'played' ? 'Ver acta' : 'Ver ficha'} del partido ${match.id}`}>{match.status === 'played' ? 'Ver acta' : 'Ver ficha'} →</button></div></article>)}{!matches.length && <p className="federation-empty">No hay partidos en esta selección.</p>}</div>
}
export function ResultsView({ data, matchday, friendly, onFriendlyChange, ...actions }: Props & { matchday: number; friendly: boolean; onFriendlyChange: (value: boolean) => void }) {
  const matches = friendly ? data.matches.filter(match => match.competitionType === 'FRIENDLY') : data.rounds.find(round => round.number === matchday)?.matches ?? []
  return <><div className="federation-section-heading"><h2>{friendly ? 'Amistosos de pretemporada' : `Resultados · Jornada ${matchday}`}</h2><div className="federation-filter" aria-label="Competición de los resultados"><button type="button" aria-pressed={!friendly} onClick={() => onFriendlyChange(false)}>Liga</button><button type="button" aria-pressed={friendly} onClick={() => onFriendlyChange(true)}>Amistosos</button></div></div><CompetitionMatchRows data={data} matches={matches} {...actions} /></>
}
export function CalendarView({ data, ...actions }: Props) {
  const split = Math.ceil(data.rounds.length / 2)
  return <div className="federation-calendar">{[data.rounds.slice(0, split), data.rounds.slice(split)].map((rounds, index) => <section className="federation-calendar-half" key={index}><h2>{index === 0 ? 'Primera vuelta' : 'Segunda vuelta'}</h2>{rounds.map(round => <details className="federation-round" key={round.number}><summary><strong>Jornada {round.number}</strong><time>{round.date && fixtureDate(round.date)}</time><span aria-hidden="true">⌄</span></summary><CompetitionMatchRows data={data} matches={round.matches} {...actions} /></details>)}</section>)}</div>
}
