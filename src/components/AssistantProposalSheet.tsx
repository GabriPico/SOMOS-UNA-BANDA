import type { AssistantLineupProposal, AssistantProposalSummary } from '../domain/assistantLineup'

export function AssistantProposalSheet({ proposal, summary, onCancel, onApply }: {
  proposal: AssistantLineupProposal
  summary: AssistantProposalSummary
  onCancel: () => void
  onApply: () => void
}) {
  const changedPosition = summary.positionChanges.filter(player => !player.samePosition)
  const changedZone = summary.positionChanges.filter(player => player.samePosition)

  return <aside className="assistant-proposal-sheet" aria-label={`Propuesta de ${proposal.assistantName}`}>
    <header className="assistant-proposal-sheet-header">
      <span>HOJA DEL SEGUNDO ENTRENADOR</span>
      <h3>Propuesta de {proposal.assistantName}</h3>
    </header>
    <div className="assistant-proposal-sheet-content">
      {summary.formationChange && <section><h4>Formación</h4><p>{summary.formationChange.from} → {summary.formationChange.to}</p></section>}
      {summary.entering.length > 0 && <section><h4>Entran</h4><ul>{summary.entering.map(player => <li key={player.playerId}>{player.name} <span>· {player.position}</span></li>)}</ul></section>}
      {summary.leaving.length > 0 && <section><h4>Salen</h4><ul>{summary.leaving.map(player => <li key={player.playerId}>{player.name} <span>· {player.position}</span></li>)}</ul></section>}
      {changedPosition.length > 0 && <section><h4>Cambian de puesto</h4><ul>{changedPosition.map(player => <li key={player.playerId}>{player.name} <span>· {player.from} → {player.to}</span></li>)}</ul></section>}
      {changedZone.length > 0 && <section><h4>Cambian de zona</h4><ul>{changedZone.map(player => <li key={player.playerId}>{player.name} <span>· {player.to}</span></li>)}</ul></section>}
      {summary.instructionChanges.length > 0 && <section><h4>Instrucciones</h4><ul>{summary.instructionChanges.map(change => <li key={change.label}>{change.label} <span>· {change.from} → {change.to}</span></li>)}</ul></section>}
      {!summary.hasChanges && <p className="assistant-proposal-sheet-unchanged">El once y la táctica ya coinciden con su propuesta.</p>}
      {summary.hasChanges && <p className="assistant-proposal-sheet-reason">{proposal.reasons[1] ?? `${proposal.assistantName.split(' ')[0]} ajustaría el once según su valoración de los jugadores.`}</p>}
    </div>
    <footer className="assistant-proposal-actions">
      <button type="button" onClick={onCancel}>Cancelar</button>
      <button className="primary-action" type="button" onClick={onApply}>Aplicar</button>
    </footer>
  </aside>
}
