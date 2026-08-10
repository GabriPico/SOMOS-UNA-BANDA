
import "./ClubPanelScreen.css"

export function ClubPanelScreen() {
  return (
    <main className="club-panel-screen">
      <section className="dashboard-card">
        <h2>Próximo partido</h2>
      </section>

      <section className="dashboard-card">
        <h2>La liga</h2>
      </section>

      <section className="dashboard-card">
        <h2>Entrenador</h2>
      </section>

      <section className="dashboard-card">
        <h2>Equipo</h2>
      </section>

      <section className="dashboard-card">
        <h2>Táctica</h2>
      </section>

      <section className="dashboard-card">
        <h2>Estado del vestuario</h2>
      </section>

      <section className="dashboard-card">
        <h2>Mensaje del presidente</h2>
        <p>Este año queremos competir hasta el final.</p>
      </section>

      <section className="dashboard-card">
        <button type="button">CONTINUAR</button>
      </section>
    </main>
  )
}