import { useState } from 'react'
import { StaffDetail } from '../components/StaffDetail'
import { PageTitle, Card, PrimaryButton } from '../components/ClubUi'
import { SectionHeader, StatusBar } from '../components/PlayerUi'
import { calculateSportsBudgetUsage, type SportsBudget } from '../domain/economy'
import type { GameState, NarrativeCharacter } from '../domain/gameState'
import type { PlayerClubCompensation } from '../domain/playerFinance'
import { AVAILABILITY_LABELS, STAFF_ROLE_LABELS, canDismissStaffMember, describePersonality, formatCompensation, describeStaffRelationship, describeStaffSatisfaction, type StaffSearchRequest, type ClubPersonnel, type StaffPerson, type StaffState } from '../domain/staff'
import './StaffScreen.css'

type Props = { staffState: StaffState; sportsBudget: SportsBudget; playerCompensations: PlayerClubCompensation[]; staffSearchRequests: StaffSearchRequest[]; president: NarrativeCharacter; presidentRelationship: GameState['presidentRelationship']; onTalkToManolo: () => void; onStaffStateChange: (state: StaffState) => void; onBack: () => void }

export function StaffScreen({ staffState, sportsBudget, playerCompensations, staffSearchRequests, president, presidentRelationship, onTalkToManolo, onStaffStateChange, onBack }: Props) {
  const [selected, setSelected] = useState<StaffPerson | ClubPersonnel | null>(null)
  const budget = calculateSportsBudgetUsage(sportsBudget, staffState.members, playerCompensations)
  const dismiss = selected && selected.role !== 'ENCARGADO_DEL_CAMPO' ? canDismissStaffMember(selected) : null
  const pendingSearch = staffSearchRequests.some(request => request.status === 'PENDING')
  const dismissSelected = () => { if (selected && selected.role !== 'ENCARGADO_DEL_CAMPO' && canDismissStaffMember(selected).allowed) { onStaffStateChange({ ...staffState, members: staffState.members.filter(person => person.id !== selected.id) }); setSelected(null) } }
  const relationship = describeStaffRelationship(presidentRelationship.relationshipWithManager)
  const satisfaction = describeStaffSatisfaction(presidentRelationship.satisfaction)
  const personnel = staffState.clubPersonnel
  return <section className="staff-screen">
    <PageTitle title="Staff" subtitle="Las personas que hacen posible el FC Poblenou." actions={<button type="button" className="screen-back-button" onClick={onBack}>← Panel del club</button>} />
    <div className="staff-workspace">
      <Card className="staff-roster">
        <SectionHeader title="Cuerpo técnico" icon="staff" count={staffState.members.length} />
        <p className="staff-intro">Somos pocos. Aquí cada uno acaba echando una mano donde haga falta.</p>
        <div className="staff-table-wrapper"><table className="staff-table" aria-label="Cuerpo técnico del club">
          <thead><tr><th>Rol</th><th>Nombre</th><th>Carácter</th><th>Disponibilidad</th><th>Coste</th></tr></thead>
          <tbody>{staffState.members.map(person => <tr key={person.id} onClick={() => setSelected(person)}><td>{STAFF_ROLE_LABELS[person.role]}</td><td><button type="button" onClick={event => { event.stopPropagation(); setSelected(person) }}>{person.name}</button></td><td>{describePersonality(person)}</td><td>{AVAILABILITY_LABELS[person.availability]}</td><td>{formatCompensation(person.compensation)}</td></tr>)}</tbody>
        </table></div>
        <div className="staff-search-status"><span>{pendingSearch ? 'Manolo está preguntando por alguien.' : '¿Hace falta otra mano? Consulta las incorporaciones con el presidente.'}</span><PrimaryButton onClick={onTalkToManolo}>HABLAR CON {president.name.split(' ')[0].toUpperCase()}</PrimaryButton></div>
      </Card>
      <div className="staff-finances">
        <Card className="staff-president">
          <div className="staff-person-heading"><span className="staff-avatar" aria-hidden="true">{president.name.split(' ').map(part => part[0]).slice(0, 2).join('')}</span><div><h3>{president.name}</h3><span>Presidente del club</span></div></div>
          <p>El punto de apoyo para buscar ayuda y hablar de los acuerdos del club.</p>
          <dl className="staff-relationship">
            <div><dt>Relación contigo</dt><dd>{relationship}</dd><StatusBar label="Relación con el presidente" value={relationship} level={presidentRelationship.relationshipWithManager} /></div>
            <div><dt>Satisfacción</dt><dd>{satisfaction}</dd><StatusBar label="Satisfacción del presidente" value={satisfaction} level={presidentRelationship.satisfaction} /></div>
          </dl>
        </Card>
        <Card className="staff-budget"><SectionHeader title="Presupuesto deportivo" icon="fees" /><dl>{[['Total mensual', budget.total], ['Tu compensación', budget.headCoach], ['Staff', budget.staff], ['Pagos a jugadores', budget.playerPayments], ['Disponible', budget.remaining]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value} €/mes</dd></div>)}</dl><p>Entrenador, staff y jugadores remunerados comparten esta caja. Las cuotas pertenecen al club.</p></Card>
      </div>
      <Card className="club-personnel"><SectionHeader title="Personal del club" /><button type="button" className="staff-personnel-button" onClick={() => setSelected(personnel)}><span className="staff-avatar" aria-hidden="true">{personnel.name[0]}</span><span><strong>{personnel.name}</strong><small>{STAFF_ROLE_LABELS[personnel.role]}</small><span>{personnel.currentDescription}</span></span><span aria-hidden="true">→</span></button><p>No consume presupuesto deportivo.</p></Card>
    </div>
    {selected && <StaffDetail person={selected} onClose={() => setSelected(null)} onDismiss={dismiss?.allowed ? dismissSelected : undefined} dismissReason={dismiss && !dismiss.allowed ? dismiss.reason : undefined} />}
  </section>
}
