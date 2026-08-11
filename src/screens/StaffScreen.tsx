import { staffMembers } from '../data/mockData'
import './StaffScreen.css'

type StaffScreenProps = {
  onBack: () => void
}

export function StaffScreen({ onBack }: StaffScreenProps) {
  return (
    <section className="staff-screen">
      <header className="screen-header">
        <button className="screen-back-button" type="button" onClick={onBack}>
          ← Panel del club
        </button>
        <h2>Staff</h2>
      </header>

      <div className="staff-table-wrapper">
        <table className="staff-table" aria-label="Tabla del staff del club">
          <thead>
            <tr>
              <th scope="col">Rol</th>
              <th scope="col">Nombre</th>
              <th scope="col">Calidad</th>
              <th scope="col">Personalidad</th>
            </tr>
          </thead>
          <tbody>
            {staffMembers.map((member) => (
              <tr key={member.id}>
                <td>{member.role}</td>
                <td>{member.name}</td>
                <td>{member.quality}</td>
                <td>{member.personality}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
