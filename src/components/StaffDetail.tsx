import { useEffect } from 'react'
import type { ClubPersonnel, StaffPerson } from '../domain/staff'
import { AVAILABILITY_LABELS, STAFF_ROLE_LABELS, describePersonality, formatCompensation } from '../domain/staff'
import './StaffDetail.css'

type Props = { person: StaffPerson | ClubPersonnel; onClose: () => void; onDismiss?: () => void; dismissReason?: string }
export function StaffDetail({ person, onClose, onDismiss, dismissReason }: Props) {
  const isClubPersonnel = person.role === 'ENCARGADO_DEL_CAMPO'
  useEffect(() => { const close = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }; window.addEventListener('keydown', close); return () => window.removeEventListener('keydown', close) }, [onClose])
  return <div className="staff-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><article className="staff-detail" role="dialog" aria-modal="true" aria-labelledby="staff-detail-title">
    <header><div><h3 id="staff-detail-title">{person.name}</h3><p>{STAFF_ROLE_LABELS[person.role]}{person.age ? ` · ${person.age} años` : ''}</p></div><button type="button" onClick={onClose} autoFocus>Volver</button></header>
    <p className="staff-detail-description">{person.currentDescription}</p><dl><div><dt>Carácter conocido</dt><dd>{describePersonality(person)}</dd></div><div><dt>Disponibilidad</dt><dd>{AVAILABILITY_LABELS[person.availability]}</dd></div>{!isClubPersonnel && <div><dt>Compensación</dt><dd>{formatCompensation(person.compensation)}</dd></div>}<div><dt>Cómo llegó</dt><dd>{person.arrivalStory}</dd></div><div><dt>Situación actual</dt><dd>{person.currentSituation}</dd></div></dl>
    {person.knownClues.length > 0 && <section><h4>Lo que sabes</h4>{person.knownClues.map((clue) => <p key={clue}>{clue}</p>)}</section>}<section><h4>Disponibilidad habitual</h4>{person.availabilityNotes.map((note) => <p key={note}>{note}</p>)}</section>
    {!isClubPersonnel && person.role === 'PRIMER_ENTRENADOR' && <section><h4>Tu perfil</h4><p>Tendencias tácticas: Por definir.</p><p>Gestión de grupo, disciplina y estilo de gestión: Por definir.</p></section>}{!isClubPersonnel && person.presidentContext && <section className="staff-president-note"><h4>Relación con el club</h4><p>{person.presidentContext}</p></section>}
    {!isClubPersonnel && person.role !== 'PRIMER_ENTRENADOR' && <footer>{dismissReason && <p>{dismissReason}</p>}<button className="staff-secondary-button" type="button" onClick={onDismiss} disabled={!onDismiss}>Dejar de contar con esta persona</button></footer>}
  </article></div>
}
