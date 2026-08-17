import { useState } from 'react'
import { DEV_SCENARIOS, type DevScenarioId } from './devScenarios'
import './DevMenu.css'

type Props = { activeScenarioId: DevScenarioId | null; seed: number; onLoad: (id: DevScenarioId, seed: number) => void; onReset: () => void }

export default function DevMenu({ activeScenarioId, seed, onLoad, onReset }: Props) {
  const [open, setOpen] = useState(false)
  const [seedInput, setSeedInput] = useState(String(seed))
  const parsedSeed = Number(seedInput)
  const validSeed = Number.isInteger(parsedSeed) && parsedSeed >= 0 && parsedSeed <= 0xffffffff
  const active = DEV_SCENARIOS.find((scenario) => scenario.id === activeScenarioId)

  return <aside className="dev-tools">
    <button type="button" className="dev-trigger" onClick={() => setOpen((value) => !value)}>DEV{active ? ` · ${active.label}` : ''}</button>
    {open && <section className="dev-panel">
      <header><strong>IR A ESCENARIO</strong><button type="button" onClick={() => setOpen(false)}>×</button></header>
      <label>Seed<input value={seedInput} onChange={(event) => setSeedInput(event.target.value)} inputMode="numeric" /></label>
      {!validSeed && <small>Introduce un entero entre 0 y 4294967295.</small>}
      <div className="dev-scenario-list">{DEV_SCENARIOS.map((scenario) => <button type="button" disabled={scenario.disabled || !validSeed} title={scenario.note} className={scenario.id === activeScenarioId ? 'is-active' : ''} key={scenario.id} onClick={() => onLoad(scenario.id, parsedSeed)}>{scenario.label}{scenario.disabled ? ' · pendiente' : ''}</button>)}</div>
      <button type="button" className="dev-reset" disabled={!activeScenarioId} onClick={onReset}>REINICIAR</button>
    </section>}
  </aside>
}
