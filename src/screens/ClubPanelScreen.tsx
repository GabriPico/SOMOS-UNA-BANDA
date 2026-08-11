import "./ClubPanelScreen.css"

type ClubPanelScreenProps = {
  onOpenStaff: () => void
}

export function ClubPanelScreen({ onOpenStaff }: ClubPanelScreenProps) {
  return (
    <main className="club-panel-screen">
      <section className="dashboard-card">
        <h2>Próximo partido</h2>
      </section>

      <section className="dashboard-card">
        <h2>La liga</h2>
      </section>

      <button
        className="dashboard-card dashboard-card-action"
        type="button"
        onClick={onOpenStaff}
      >
        <h2>Staff</h2>
      </button>

      <section className="dashboard-card">
        <h2>Equipo</h2>
      </section>

      <section className="dashboard-card">
        <h2>Táctica</h2>
      </section>

      <section className="dashboard-card">
        <h2>Entrenamiento</h2>
      </section>

      <section className="dashboard-card">
        <h2>Estado del vestuario</h2>
      </section>

      <section className="dashboard-card">
        <h2>Buzón</h2>
        <p>Tienes X Mensajes nuevos</p>
      </section>

      <section className="dashboard-card">
        <button type="button">CONTINUAR</button>
      </section>
    </main>
  )
}
