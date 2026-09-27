/** Stylized game emblems, not official federation crests. */
export function TeamBadge({ teamId, name, large = false }: { teamId: string; name: string; large?: boolean }) {
  const palettes = [['#174f7c', '#edc34d'], ['#ab283f', '#f5e5d2'], ['#287050', '#f4f2df'], ['#275ba5', '#ffffff'], ['#dfbd42', '#263548'], ['#693b77', '#f6e5c4']]
  const index = [...teamId].reduce((sum, letter) => sum + letter.charCodeAt(0), 0) % palettes.length
  const [primary, secondary] = teamId === 'fc-poblenou' ? palettes[0] : palettes[index]
  const initials = teamId === 'fc-poblenou' ? 'FCP' : name.split(/[\s-]+/).filter(Boolean).map(word => word[0]).slice(0, 3).join('')
  return <svg className={`competition-badge${large ? ' competition-badge--large' : ''}`} viewBox="0 0 56 64" aria-hidden="true">
    <path d="M5 5Q28 0 51 5V32Q51 48 28 60Q5 48 5 32Z" fill={primary} stroke={secondary} strokeWidth="2.5" />
    <path d="M13 27v13l7 7V27m8 0v27l8-6V27m8 0v12" fill={secondary} opacity=".85" />
    <path d="M7 24h42" stroke={secondary} />
    <text x="28" y="19" fill={secondary} textAnchor="middle" fontSize="11" fontFamily="var(--club-font)" fontWeight="800">{initials}</text>
  </svg>
}
