import { staffMembers } from '../data/mockData'
import './StaffScreen.css'

export function StaffScreen() {
  return (
    <section className="staff-screen">
      <h2>Staff</h2>

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
