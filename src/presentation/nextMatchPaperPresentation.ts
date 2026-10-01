import type { LeagueMatch } from '../domain/models'
import { competitionSeason, fixtureDate } from '../domain/competitionPresentation'

/** One presentation of the same calendar facts for both physical documents. */
export function getNextMatchPaperDetails(match: LeagueMatch) {
  return {
    date: fixtureDate(match.date),
    longDate: new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${match.date}T12:00:00Z`)),
    time: `${match.time} h`,
    venue: match.venue ?? 'Campo por confirmar',
    season: competitionSeason([match]),
    competition: match.competitionType === 'FRIENDLY' ? 'Amistoso' : `4a Catalana · Jornada ${match.matchday}`,
    context: match.competitionType === 'FRIENDLY' ? 'Amistoso · Pretemporada' : `4a Catalana · Jornada ${match.matchday}`,
  }
}
export type NextMatchPaperDetails = ReturnType<typeof getNextMatchPaperDetails>
