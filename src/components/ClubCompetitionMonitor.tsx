import type { getClubPanelPresentation } from '../presentation/clubPanelPresentation'

/** Live interface aligned to the illustration's blank laptop screen. */
export function ClubCompetitionMonitor({ panel }: { panel: ReturnType<typeof getClubPanelPresentation> }) {
  return <svg className="scene-competition-monitor" viewBox="0 0 138 100" aria-hidden="true">
    <g transform="matrix(1 .012 -.055 1 27 11)">
      <rect width="100" height="58" fill="#faf9f3" />
      <text x="50" y="13" textAnchor="middle" fill="#e51616" fontSize="11" fontWeight="750" fontFamily="Arial, sans-serif" textLength="96" lengthAdjust="spacingAndGlyphs">CLASIFICACIÓN</text>
      <path d="M2 18h96" stroke="#d9dce4" strokeWidth=".6" />
      {panel.standings.slice(0, 3).map((row, index) => <g key={row.teamId} transform={`translate(2 ${23 + index * 10})`}>
        {row.teamId === 'fc-poblenou' && <rect x="-1" y="-1" width="98" height="9" fill="#e6edf3" />}
        <text y="7" fill="#1a284d" fontSize="5.8" fontFamily="Arial, sans-serif"><tspan x="0">{row.position}</tspan><tspan x="9">{(row.name ?? row.teamId).slice(0, 24)}</tspan><tspan x="96" textAnchor="end">{row.points}</tspan></text>
      </g>)}
    </g>
  </svg>
}
