import type { CompetitionPortalData } from '../domain/competitionPortal'

export function CompetitionHeader({ data, onBack, compact }: { data: CompetitionPortalData; onBack?: () => void; compact: boolean }) {
  return <>
    <header className="federation-header"><div className="federation-brand"><span className="federation-seal" aria-hidden="true">F</span><div><strong>FEDERACIÓ CATALANA</strong><span>DE FUTBOL · PORTAL DE COMPETICIÓN</span></div></div>{onBack && <button type="button" className="federation-back" onClick={onBack}>← Panel del club</button>}</header>
    <dl className="federation-context"><div><dt>Temporada</dt><dd>{data.season}</dd></div>{!compact && <div><dt>Modalidad</dt><dd>{data.metadata.modality}</dd></div>}<div><dt>Competición</dt><dd>{data.metadata.name}</dd></div>{data.metadata.group ? <div><dt>Grupo</dt><dd>{data.metadata.group}</dd></div> : !compact && <div><dt>Liga</dt><dd>{data.clubs.length} equipos · {data.matchdays.length} jornadas</dd></div>}</dl>
  </>
}
