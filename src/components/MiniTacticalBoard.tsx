/** Diagram of the current formation, shared by the hub and training. */
export function MiniTacticalBoard({ formation }: { formation: string }) {
  const rows = [...formation.split('-').reverse().map(Number), 1]
  return <svg className="mini-tactical-board" viewBox="0 0 120 160" role="img" aria-label={'Formación ' + formation}>
    <rect x="1" y="1" width="118" height="158" rx="2" fill="#294f43" stroke="#a9ad91" />
    <g fill="none" stroke="#c3cbb1" strokeWidth=".7" opacity=".65">
      <path d="M8 8H112V152H8ZM8 80H112M34 8V30H86V8M34 152V130H86V152" />
      <circle cx="60" cy="80" r="17" />
    </g>
    {rows.map((count, row) => Array.from({ length: count }, (_, column) => <circle key={row + '-' + column} cx={12 + 96 * (column + 1) / (count + 1)} cy={20 + 120 * row / (rows.length - 1)} r="5" fill={row === rows.length - 1 ? '#cfac57' : '#f0ecdb'} stroke="#233e53" strokeWidth="1.5" />))}
  </svg>
}

