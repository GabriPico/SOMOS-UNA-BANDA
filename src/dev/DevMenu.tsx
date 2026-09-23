import { useState } from 'react'
import { DEV_SCENARIOS, type DevScenarioId } from './devScenarios'
import type { AssistantArchetype } from '../domain/staff'
import type { InitialGameOverrides } from '../data/gameState'
import './DevMenu.css'
import type { GameState } from '../domain/gameState'
import { calculateTeamMorale, calculateWeightedPlayerAuthority, getOverallHappiness } from '../domain/consequences'
import { players } from '../data/mockData'
import type { NarrativeRuntime } from '../domain/narrative'

type Props = { activeScenarioId: DevScenarioId | null; seed: number; generatedAssistant: AssistantArchetype; hasDelegate: boolean; gameState: GameState; narrativeRuntime: NarrativeRuntime | null; onLoad: (id: DevScenarioId, seed: number) => void; onReset: () => void; onResetOnboarding: (seed: number, overrides: InitialGameOverrides) => void }

const ASSISTANT_LABELS: Record<AssistantArchetype, string> = { CONNECTED_YOUNGSTER: 'Joven enchufado', CLUB_VETERAN: 'Veterano del club', FORMER_CAPTAIN: 'Excapitán', TRUSTED_ASSISTANT: 'Segundo de confianza' }

export default function DevMenu({ activeScenarioId, seed, generatedAssistant, hasDelegate, gameState, narrativeRuntime, onLoad, onReset, onResetOnboarding }: Props) {
  const [open, setOpen] = useState(false)
  const [seedInput, setSeedInput] = useState(String(seed))
  const [assistantOverride, setAssistantOverride] = useState<'RANDOM' | AssistantArchetype>('RANDOM')
  const [delegateOverride, setDelegateOverride] = useState<'DEFAULT' | 'PRESENT' | 'ABSENT'>('DEFAULT')
  const parsedSeed = Number(seedInput)
  const validSeed = Number.isInteger(parsedSeed) && parsedSeed >= 0 && parsedSeed <= 0xffffffff
  const active = DEV_SCENARIOS.find((scenario) => scenario.id === activeScenarioId)

  return <aside className="dev-tools">
    <button type="button" className="dev-trigger" onClick={() => setOpen((value) => !value)}>DEV{active ? ` · ${active.label}` : ''}</button>
    {open && <section className="dev-panel">
      <header><strong>IR A ESCENARIO</strong><button type="button" onClick={() => setOpen(false)}>×</button></header>
      <label>Seed<input value={seedInput} onChange={(event) => setSeedInput(event.target.value)} inputMode="numeric" /></label>
      {!validSeed && <small>Introduce un entero entre 0 y 4294967295.</small>}
      <section className="dev-onboarding-config">
        <h3>CONFIGURACIÓN INICIAL DEL ONBOARDING</h3>
        <label>Segundo entrenador<select value={assistantOverride} onChange={(event) => setAssistantOverride(event.target.value as 'RANDOM' | AssistantArchetype)}><option value="RANDOM">Aleatorio</option><option value="CONNECTED_YOUNGSTER">Joven enchufado</option><option value="CLUB_VETERAN">Veterano del club</option><option value="FORMER_CAPTAIN">Excapitán</option><option value="TRUSTED_ASSISTANT">Segundo de confianza</option></select></label>
        <label>Delegado<select value={delegateOverride} onChange={(event) => setDelegateOverride(event.target.value as 'DEFAULT' | 'PRESENT' | 'ABSENT')}><option value="DEFAULT">Aleatorio</option><option value="PRESENT">Forzar que exista</option><option value="ABSENT">Forzar que no exista</option></select></label>
        <button type="button" className="dev-onboarding-reset" disabled={!validSeed} onClick={() => onResetOnboarding(parsedSeed, { ...(assistantOverride === 'RANDOM' ? {} : { assistantArchetype: assistantOverride }), delegate: delegateOverride })}>REINICIAR ONBOARDING</button>
        <small className="dev-generated-state">Segundo generado: {ASSISTANT_LABELS[generatedAssistant]}<br />Delegado: {hasDelegate ? 'Sí' : 'No'}<br />Seed actual: {seed}</small>
      </section>
      <div className="dev-scenario-list">{DEV_SCENARIOS.map((scenario) => <button type="button" disabled={scenario.disabled || !validSeed} title={scenario.note} className={scenario.id === activeScenarioId ? 'is-active' : ''} key={scenario.id} onClick={() => onLoad(scenario.id, parsedSeed)}>{scenario.label}{scenario.disabled ? ' · pendiente' : ''}</button>)}</div>
      {narrativeRuntime && <details className="dev-narrative" open><summary>NARRATIVE</summary><dl><div><dt>Scene</dt><dd>{narrativeRuntime.sceneId}</dd></div><div><dt>Node</dt><dd>{narrativeRuntime.currentNodeId}</dd></div><div><dt>Background</dt><dd>{narrativeRuntime.backgroundId}</dd></div><div><dt>Waiting</dt><dd>{String(narrativeRuntime.isWaiting)}</dd></div><div><dt>Typing</dt><dd>{String(narrativeRuntime.isTyping)}</dd></div><div><dt>Transitioning</dt><dd>{String(narrativeRuntime.isTransitioning)}</dd></div><div><dt>Visible characters</dt><dd>{narrativeRuntime.visibleCharacters.filter((item) => item.visible).map((item) => `${item.characterId}@${item.position}:${item.expression}`).join(', ') || '[]'}</dd></div></dl></details>}
      <details className="dev-consequences"><summary>CONSECUENCIAS</summary>
        <h3>Estado global</h3><dl><div><dt>Autoridad general</dt><dd>{gameState.manager.generalAuthority.toFixed(1)}</dd></div><div><dt>Autoridad ponderada</dt><dd>{calculateWeightedPlayerAuthority(gameState).toFixed(1)}</dd></div><div><dt>Cohesión</dt><dd>{gameState.team.cohesion.toFixed(1)}</dd></div><div><dt>Moral calculada</dt><dd>{calculateTeamMorale(gameState).toFixed(1)}</dd></div><div><dt>RecentResultsMood</dt><dd>{gameState.team.recentResultsMood.toFixed(1)}</dd></div></dl>
        <h3>Jugadores</h3><div className="dev-state-table">{Object.values(gameState.training.players).map((state) => <div key={state.playerId}><b>{players.find((player) => player.id === state.playerId)?.name ?? state.playerId}</b><span>F {getOverallHappiness(state).toFixed(1)} · R {state.managerRelationship.toFixed(1)} · A {state.managerAuthority.toFixed(1)} · {state.lockerRoomInfluence}</span></div>)}</div>
        <h3>Memorias</h3>{gameState.consequences.memories.length ? gameState.consequences.memories.map((memory) => <p key={`${memory.characterId}:${memory.id}`}>{memory.characterId}: {memory.id} ({memory.importance ?? '—'})</p>) : <p>Sin memorias.</p>}
        <h3>Flags</h3>{Object.keys(gameState.consequences.flags).length ? Object.entries(gameState.consequences.flags).map(([id, value]) => <p key={id}>{id}: {String(value)}</p>) : <p>Sin flags.</p>}
        <h3>Historial</h3>{gameState.consequences.decisionLog.slice(-10).reverse().map((entry) => <article key={entry.id}><b>{entry.date} · {entry.source}</b><span>{entry.decisionId} · {entry.effectsApplied.map((effect) => `${effect.type} ${effect.appliedDelta >= 0 ? '+' : ''}${effect.appliedDelta.toFixed(1)}`).join(', ') || 'sin efectos'} · memorias: {entry.memoriesCreated.join(', ') || '—'} · flags: {Object.keys(entry.flagsChanged).join(', ') || '—'}</span></article>)}</details>
      <button type="button" className="dev-reset" disabled={!activeScenarioId} onClick={onReset}>REINICIAR</button>
    </section>}
  </aside>
}
