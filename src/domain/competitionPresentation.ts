import type { LeagueMatch } from './models'

export function competitionSeason(matches: LeagueMatch[]) {
  const first = matches.filter(match => match.competitionType !== 'FRIENDLY').map(match => match.date).sort()[0] ?? matches.map(match => match.date).sort()[0]
  if (!first) return 'Temporada actual'
  const [year, month] = first.split('-').map(Number)
  const start = month < 7 ? year - 1 : year
  return `${start} / ${String(start + 1).slice(-2)}`
}

export function fixtureDate(date: string) {
  return new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${date}T12:00:00Z`))
}

export function latestClubMatch(matches: LeagueMatch[]) {
  return matches.filter(match => match.status === 'played' && (match.homeTeamId === 'fc-poblenou' || match.awayTeamId === 'fc-poblenou')).sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time))[0]
}
