import { getClubPalette } from '../domain/clubAppearance'
/** Stylized game emblems, not official federation crests. */
export function TeamBadge({ teamId, name, large = false, onOpen }: { teamId: string; name: string; large?: boolean; onOpen?: (id: string) => void }) {
  const [primary, secondary] = getClubPalette(teamId)
  const initials = teamId === 'fc-poblenou' ? 'FCP' : name.split(/[\s-]+/).filter(Boolean).map(word => word[0]).slice(0, 3).join('')
  const crest = <svg className={`competition-badge${large ? ' competition-badge--large' : ''}`} viewBox="0 0 56 64" aria-hidden="true">
    <path d="M5 5Q28 0 51 5V32Q51 48 28 60Q5 48 5 32Z" fill={primary} stroke={secondary} strokeWidth="2.5" />
    <path d="M13 27v13l7 7V27m8 0v27l8-6V27m8 0v12" fill={secondary} opacity=".85" />
    <path d="M7 24h42" stroke={secondary} />
    <text x="28" y="19" fill={secondary} textAnchor="middle" fontSize="11" fontFamily="var(--club-font)" fontWeight="800">{initials}</text>
  </svg>
  return onOpen ? <button type="button" className="federation-club-link is-crest-only" onClick={() => onOpen(teamId)} aria-label={`Ver club: ${name}`} title={`Ver club: ${name}`}>{crest}</button> : crest
}
