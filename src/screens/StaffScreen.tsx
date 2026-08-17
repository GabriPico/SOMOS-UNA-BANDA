import { useState } from 'react'
import { StaffDetail } from '../components/StaffDetail'
import { calculateSportsBudgetUsage } from '../domain/economy'
import type { SportsBudget } from '../domain/economy'
import type { PlayerClubCompensation } from '../domain/playerFinance'
import type { StaffSearchRequest } from '../domain/staff'
import type { ClubPersonnel, StaffPerson, StaffState } from '../domain/staff'
import { AVAILABILITY_LABELS, STAFF_ROLE_LABELS, canDismissStaffMember, describePersonality, formatCompensation } from '../domain/staff'
import './StaffScreen.css'

type Props = { staffState: StaffState; sportsBudget: SportsBudget; playerCompensations: PlayerClubCompensation[]; staffSearchRequests: StaffSearchRequest[]; onTalkToManolo: () => void; onStaffStateChange: (state: StaffState) => void; onBack: () => void }

export function StaffScreen({ staffState, sportsBudget, playerCompensations, staffSearchRequests, onTalkToManolo, onStaffStateChange, onBack }: Props) {
  const [selected, setSelected] = useState<StaffPerson | ClubPersonnel | null>(null)
  const budget = calculateSportsBudgetUsage(sportsBudget, staffState.members, playerCompensations)
  const dismiss = selected && selected.role !== 'ENCARGADO_DEL_CAMPO' ? canDismissStaffMember(selected) : null
  const pendingSearch = staffSearchRequests.some((request) => request.status === 'PENDING')
  const dismissSelected = () => { if (selected && selected.role !== 'ENCARGADO_DEL_CAMPO' && canDismissStaffMember(selected).allowed) { onStaffStateChange({ ...staffState, members: staffState.members.filter((person) => person.id !== selected.id) }); setSelected(null) } }
  return <section className="staff-screen"><header className="screen-header"><button className="screen-back-button" type="button" onClick={onBack}>← Panel del club</button><h2>Staff</h2></header>
    <div className="staff-intro"><div><h3>Cuerpo técnico</h3><p>Somos pocos. Aquí cada uno acaba echando una mano donde haga falta.</p>{pendingSearch && <small className="staff-search-status">Manolo está preguntando por alguien.</small>}</div><button className="staff-primary-button" type="button" onClick={onTalkToManolo}>HABLAR CON MANOLO</button></div>
    <div className="staff-table-wrapper"><table className="staff-table" aria-label="Cuerpo técnico del club"><thead><tr><th>Rol</th><th>Nombre</th><th>Carácter</th><th>Disponibilidad</th><th>Coste</th></tr></thead><tbody>{staffState.members.map((person) => <tr key={person.id} tabIndex={0} onClick={() => setSelected(person)} onKeyDown={(event) => { if (event.key === 'Enter') setSelected(person) }}><td>{STAFF_ROLE_LABELS[person.role]}</td><td><button type="button">{person.name}</button></td><td>{describePersonality(person)}</td><td>{AVAILABILITY_LABELS[person.availability]}</td><td>{formatCompensation(person.compensation)}</td></tr>)}</tbody></table></div>
    <section className="staff-budget"><h3>Presupuesto deportivo</h3><dl><div><dt>Total mensual</dt><dd>{budget.total} €/mes</dd></div><div><dt>Tu compensación</dt><dd>{budget.headCoach} €/mes</dd></div><div><dt>Staff</dt><dd>{budget.staff} €/mes</dd></div><div><dt>Pagos a jugadores</dt><dd>{budget.playerPayments} €/mes</dd></div><div><dt>Disponible</dt><dd>{budget.remaining} €/mes</dd></div></dl><p>Este es el dinero que gestionas para entrenador, staff y jugadores remunerados. Las cuotas pertenecen al club y no aumentan el disponible.</p></section>
    <section className="club-personnel"><h3>Personal del club</h3><p>No forma parte de tu cuerpo técnico ni consume presupuesto deportivo.</p><button type="button" onClick={() => setSelected(staffState.clubPersonnel)}><span>{STAFF_ROLE_LABELS[staffState.clubPersonnel.role]}</span><strong>{staffState.clubPersonnel.name}</strong><small>{staffState.clubPersonnel.currentDescription}</small></button></section>
    {selected && <StaffDetail person={selected} onClose={() => setSelected(null)} onDismiss={dismiss?.allowed ? dismissSelected : undefined} dismissReason={dismiss && !dismiss.allowed ? dismiss.reason : undefined} />}
  </section>
}
