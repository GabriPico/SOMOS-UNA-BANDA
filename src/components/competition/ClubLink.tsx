import type { CompetitionPortalData } from '../../domain/competitionPortal'
import type { MatchOutcome } from '../../domain/models'
import { TeamBadge } from '../TeamBadge'

export function ClubLink({ data, clubId, onOpen, crestOnly = false, large = false }: { data: CompetitionPortalData; clubId: string; onOpen: (id: string) => void; crestOnly?: boolean; large?: boolean }) {
  const club = data.clubs.find(item => item.id === clubId)
  if (!club) return <span>Club no disponible</span>
  return <button type="button" className={`federation-club-link${crestOnly ? ' is-crest-only' : ''}`} onClick={() => onOpen(club.id)} title={`Ver club: ${club.name}`} aria-label={`Ver club: ${club.name}`}><TeamBadge teamId={club.id} name={club.name} large={large} />{!crestOnly && <span>{club.name}</span>}</button>
}
const LABELS = { G: 'Victoria', E: 'Empate', P: 'Derrota' }
export function RecentForm({ form }: { form: MatchOutcome[] }) {
  return <span className="federation-form" aria-label="Últimos cinco partidos">{Array.from({ length: 5 }, (_, index) => {
    const result = form[index]
    return <span key={index} className={`federation-outcome${result ? ` outcome-${result}` : ''}`} title={result ? LABELS[result] : 'Sin disputar'} aria-label={result ? LABELS[result] : 'Sin disputar'}>{result ?? '–'}</span>
  })}</span>
}
