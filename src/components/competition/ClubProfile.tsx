import { useState, type CSSProperties } from 'react'
import type { CompetitionPortalData } from '../../domain/competitionPortal'
import { ClubLink, RecentForm } from './ClubLink'
import { ClubKit } from './ClubKit'
import { CompetitionMatchRows } from './CompetitionFixtures'

type Props = { data: CompetitionPortalData; clubId: string; onBack: () => void; onOpenClub: (id: string) => void; onOpenMatch: (id: string) => void }
export function ClubProfile({ data, clubId, onBack, onOpenClub, onOpenMatch }: Props) {
  const [away, setAway] = useState(false)
  const club = data.clubs.find(item => item.id === clubId)
  if (!club) return <p className="federation-empty">Club no disponible. <button onClick={onBack} type="button">Volver a Competición</button></p>
  const row = club.standing
  return <article className="federation-club-profile">
    <nav className="federation-breadcrumb" aria-label="Ruta del club"><button type="button" onClick={onBack}>← Competición</button><span>/</span><span>{data.metadata.name}</span><span>/</span><strong>{club.name}</strong></nav>
    <header className="federation-club-banner" style={{ '--club-color': club.palette[0] } as CSSProperties}><ClubLink data={data} clubId={club.id} onOpen={onOpenClub} crestOnly large /><div><small>Ficha de equipo{club.id === 'fc-poblenou' ? ' · Tu club' : ''}</small><h1>{club.name}</h1><span>{data.metadata.name} · {data.season}</span></div></header>
    <section className="federation-club-info" aria-label="Información del club"><dl>{club.locality && <div><dt>Localidad / barrio</dt><dd>{club.locality}</dd></div>}{club.ground && <div><dt>Campo</dt><dd>{club.ground}</dd></div>}{club.surface && <div><dt>Superficie</dt><dd>{club.surface}</dd></div>}{club.founded && <div><dt>Fundación</dt><dd>{club.founded}</dd></div>}{club.colors && <div><dt>Colores</dt><dd>{club.colors}</dd></div>}{club.categorySeasons !== undefined && <div><dt>Temporadas en la categoría</dt><dd>{club.categorySeasons}</dd></div>}<div><dt>Goles a favor</dt><dd>{row.goalsFor}</dd></div><div><dt>Goles en contra</dt><dd>{row.goalsAgainst}</dd></div></dl><div className="federation-club-summary"><div><span>Posición</span><strong>{row.position}º</strong></div><div><span>Puntos</span><strong>{row.points} <small>PTS</small></strong></div><div><span>Últimos 5</span><RecentForm form={row.recentForm} /></div></div></section>
    <h2 className="federation-profile-title">Ficha de equipo</h2>
    <div className="federation-profile-columns"><section className="federation-profile-kits"><h2>Equipaciones</h2><div className="federation-kit-selector" aria-label="Equipación del club"><button type="button" aria-pressed={!away} onClick={() => setAway(false)}>1ª</button><button type="button" aria-pressed={away} onClick={() => setAway(true)}>2ª</button></div><ClubKit kit={away ? club.kits.away : club.kits.home} label={`${away ? 'Segunda' : 'Primera'} equipación de ${club.name}`} /></section><section className="federation-profile-matches"><h2>Partidos</h2><CompetitionMatchRows data={data} matches={club.fixtures} nextMatchId={club.nextMatchId} onOpenClub={onOpenClub} onOpenMatch={onOpenMatch} /></section></div>
    <section className="federation-squad"><h2>Jugadores</h2><div className="federation-table-wrap"><table className="federation-table" aria-label={`Plantilla de ${club.name}`}><thead><tr><th scope="col">Nombre</th><th scope="col">Posición</th>{club.id === 'fc-poblenou' && <><th scope="col">Edad</th><th scope="col">Dorsal</th></>}</tr></thead><tbody>{club.squad.map(player => <tr key={player.id}><th scope="row"><span data-player-id={player.id}>{player.name}</span></th><td>{player.positions}</td>{club.id === 'fc-poblenou' && <><td>{player.age ?? '—'}</td><td>{player.shirtNumber ?? '—'}</td></>}</tr>)}</tbody></table></div>{club.id !== 'fc-poblenou' && <p className="federation-note">Jugadores registrados en los datos de la competición. La plantilla rival completa aún no está disponible.</p>}</section>
  </article>
}
export function KitsView({ data, onOpenClub }: { data: CompetitionPortalData; onOpenClub: (id: string) => void }) {
  return <><div className="federation-section-heading"><h2>Equipaciones</h2><p>Primera y segunda equipación</p></div><div className="federation-kits-grid">{data.clubs.map(club => <article className="federation-kit-card" key={club.id}><ClubLink data={data} clubId={club.id} onOpen={onOpenClub} large /><div className="federation-kit-pair"><figure><ClubKit kit={club.kits.home} label={`Primera equipación de ${club.name}`} /><figcaption>1ª equipación</figcaption></figure><figure><ClubKit kit={club.kits.away} label={`Segunda equipación de ${club.name}`} /><figcaption>2ª equipación</figcaption></figure></div></article>)}</div></>
}
