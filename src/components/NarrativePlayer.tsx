import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { applyConsequences } from '../domain/consequences'
import type { GameState } from '../domain/gameState'
import { createNarrativeRuntime, evaluateNarrativeCondition, MAX_AUTOMATIC_NARRATIVE_TRANSITIONS, MAX_NARRATIVE_WAIT_MS, NARRATIVE_EFFECT_DURATION_MS, NARRATIVE_TYPEWRITER_MS, NARRATIVE_VISUAL_EFFECT_WATCHDOG_GRACE_MS, resolveNarrativeCharacter, resolveNarrativeText, type NarrativeRuntime, type NarrativeScene, validateNarrativeScene } from '../domain/narrative'
import { backgroundAssets, characterAssets } from '../data/narrativeAssets'
import { players } from '../data/mockData'
import './NarrativePlayer.css'
import { getNarrativeChoices, isNarrativePointOfView, saveNarrativeProgress } from '../domain/narrative'

type Props = { scene: NarrativeScene; gameState: GameState; onGameStateChange: (state: GameState) => void; onComplete: (state: GameState, destination: string) => void; onRuntimeChange?: (runtime: NarrativeRuntime | null) => void; devMode?: boolean }

export function NarrativePlayer({ scene, gameState, onGameStateChange, onComplete, onRuntimeChange, devMode = false }: Props) {
  const [runtime, setRuntime] = useState(() => createNarrativeRuntime(scene, gameState))
  const [displayedText, setDisplayedText] = useState('')
  const [choiceLocked, setChoiceLocked] = useState(false)
  const [runtimeError, setRuntimeError] = useState<string>()
  const [inputValue, setInputValue] = useState('')
  const [inputError, setInputError] = useState<string>()
  const typingTimer = useRef<number | undefined>(undefined)
  const automaticTransitions = useRef(0)
  const completionSent = useRef(false)
  const choiceSubmitted = useRef(false)
  const choiceTimer = useRef<number | undefined>(undefined)
  const gameRef = useRef(gameState); const runtimeRef = useRef(runtime)
  const onCompleteRef = useRef(onComplete); const onGameStateChangeRef = useRef(onGameStateChange)
  gameRef.current = gameState; runtimeRef.current = runtime; onCompleteRef.current = onComplete; onGameStateChangeRef.current = onGameStateChange
  const errors = useMemo(() => validateNarrativeScene(scene, new Set([...Object.keys(characterAssets), ...players.flatMap((player) => [String(player.id), `player-${player.id}`]), ...gameState.staff.members.map((member) => member.id), gameState.staff.clubPersonnel.id]), new Set(Object.keys(backgroundAssets)), false), [gameState.staff, scene])
  const node = scene.nodes[runtime.currentNodeId]
  useEffect(() => { onRuntimeChange?.(runtime) }, [onRuntimeChange, runtime])
  useEffect(() => () => onRuntimeChange?.(null), [onRuntimeChange])
  useEffect(() => () => window.clearTimeout(choiceTimer.current), [])

  const complete = useCallback((destination: string) => {
    if (completionSent.current) return
    completionSent.current = true
    onCompleteRef.current(gameRef.current, destination)
  }, [])

  const goTo = useCallback((next: string, automatic = false) => {
    if (!scene.nodes[next]) { setRuntimeError(`Node ${runtimeRef.current.currentNodeId}: missing target ${next}`); return }
    automaticTransitions.current = automatic ? automaticTransitions.current + 1 : 0
    if (automaticTransitions.current > MAX_AUTOMATIC_NARRATIVE_TRANSITIONS) { setRuntimeError(`Maximum automatic node transitions exceeded (${MAX_AUTOMATIC_NARRATIVE_TRANSITIONS})`); return }
    setDisplayedText(''); setChoiceLocked(false); setInputError(undefined)
    choiceSubmitted.current = false
    const nextNode = scene.nodes[next]
    const nextRuntime = { ...runtimeRef.current, currentNodeId: next, activeSpeakerId: nextNode.type === 'DIALOGUE' ? String(nextNode.characterId) : undefined, isTyping: false, isWaiting: false, isTransitioning: false, characterTransition: undefined }
    runtimeRef.current = nextRuntime
    setRuntime(nextRuntime)
    if (scene.persistProgress) {
      const nextGame = saveNarrativeProgress(gameRef.current, scene, nextRuntime)
      gameRef.current = nextGame
      onGameStateChangeRef.current(nextGame)
    }
  }, [scene])

  useEffect(() => {
    if (!node || errors.length || runtimeError) return
    let cancelled = false; let timer: number | undefined; let watchdog: number | undefined
    const auto = (next: string, delay = 0) => { timer = window.setTimeout(() => { if (!cancelled) goTo(next, true) }, delay) }
    if (node.type === 'WAIT' || node.type === 'GROUP_CALL') { setRuntime((current) => ({ ...current, isWaiting: true })); auto(node.next, Math.min(Math.max(0, node.durationMs), MAX_NARRATIVE_WAIT_MS)) }
    else if (node.type === 'JUMP') auto(node.target)
    else if (node.type === 'CONDITION') auto(evaluateNarrativeCondition(gameRef.current, node.condition) ? node.then : node.otherwise)
    else if (node.type === 'CONSEQUENCE') { timer = window.setTimeout(() => { if (cancelled) return; const nextGame = applyConsequences(gameRef.current, node.consequence); gameRef.current = nextGame; onGameStateChangeRef.current(nextGame); goTo(node.next, true) }, 0) }
    else if (node.type === 'END' && node.autoComplete) { timer = window.setTimeout(() => { if (!cancelled) complete(node.result.destination) }, 0) }
    else if (node.type === 'CHARACTER_ACTION') {
      setRuntime((current) => { const existing = current.visibleCharacters.find((item) => item.characterId === node.characterId); const updated = { characterId: node.characterId, position: node.position ?? existing?.position ?? 'CENTER' as const, expression: node.expression ?? existing?.expression ?? 'NEUTRAL' as const, visible: node.action !== 'EXIT' && node.action !== 'HIDE' }; return { ...current, visibleCharacters: [...current.visibleCharacters.filter((item) => item.characterId !== node.characterId), updated], isTransitioning: true, characterTransition: { characterId: String(node.characterId), action: node.action } } }); auto(node.next, 180)
    } else if (node.type === 'VISUAL_EFFECT') { setRuntime((current) => ({ ...current, visualEffect: node.effect, isTransitioning: true })); const duration = NARRATIVE_EFFECT_DURATION_MS[node.effect]; auto(node.next, duration); watchdog = window.setTimeout(() => { if (!cancelled && runtimeRef.current.currentNodeId === node.id) goTo(node.next, true) }, duration + NARRATIVE_VISUAL_EFFECT_WATCHDOG_GRACE_MS) }
    return () => { cancelled = true; window.clearTimeout(timer); window.clearTimeout(watchdog) }
  }, [complete, errors.length, goTo, node, runtimeError])

  useEffect(() => {
    if (!node || (node.type !== 'DIALOGUE' && node.type !== 'NARRATION') || errors.length) return
    const text = resolveNarrativeText(node.text, gameRef.current)
    setDisplayedText(''); setRuntime((current) => ({ ...current, isTyping: true, activeSpeakerId: node.type === 'DIALOGUE' ? String(node.characterId) : undefined }))
    let index = 0
    typingTimer.current = window.setInterval(() => { index += 1; setDisplayedText(text.slice(0, index)); if (index >= text.length) { window.clearInterval(typingTimer.current); setRuntime((current) => ({ ...current, isTyping: false })) } }, NARRATIVE_TYPEWRITER_MS)
    return () => window.clearInterval(typingTimer.current)
  }, [errors.length, node])

  const advance = useCallback(() => {
    if (!node || choiceLocked || node.type === 'CHOICE' || node.type === 'INPUT' || errors.length) return
    if ((node.type === 'DIALOGUE' || node.type === 'NARRATION') && runtime.isTyping) { window.clearInterval(typingTimer.current); setDisplayedText(resolveNarrativeText(node.text, gameRef.current)); setRuntime((current) => ({ ...current, isTyping: false })); return }
    if (node.type === 'DIALOGUE' || node.type === 'NARRATION') goTo(node.next)
    else if (node.type === 'END') complete(node.result.destination)
  }, [choiceLocked, complete, errors.length, goTo, node, runtime.isTyping])
  useEffect(() => { const handler = (event: KeyboardEvent) => { if ((event.key === ' ' || event.key === 'Enter') && node?.type !== 'CHOICE' && node?.type !== 'INPUT') { event.preventDefault(); advance() } }; window.addEventListener('keydown', handler); return () => window.removeEventListener('keydown', handler) }, [advance, node?.type])

  function submitInput() {
    if (node?.type !== 'INPUT') return
    const value = inputValue.trim()
    if (value.length < (node.input.minLength ?? 2)) { setInputError('Escribe un nombre.'); return }
    if (value.length > (node.input.maxLength ?? 40)) { setInputError('El nombre no puede superar los 40 caracteres.'); return }
    const current = gameRef.current
    const next = node.input.target === 'COACH_NAME' ? { ...current, coachName: value, staff: { ...current.staff, members: current.staff.members.map((member) => member.role === 'PRIMER_ENTRENADOR' ? { ...member, name: value } : member) } } : { ...current, staff: { ...current.staff, members: current.staff.members.map((member) => member.role === 'SEGUNDO_ENTRENADOR' ? { ...member, name: value } : member) } }
    gameRef.current = next; onGameStateChange(next); setInputValue(''); goTo(node.next)
  }

  if (errors.length || runtimeError || !node) return <div className="narrative-overlay narrative-error" role="alert"><section><span>NARRATIVE {devMode ? 'DEV ' : ''}ERROR</span><h1>{scene.id}</h1><pre>{runtimeError ?? errors.join('\n')}</pre><button type="button" onClick={() => onComplete(gameRef.current, 'CLUB_PANEL')}>VOLVER AL PANEL</button></section></div>
  const background = backgroundAssets[runtime.backgroundId]
  const isTextNode = node.type === 'DIALOGUE' || node.type === 'NARRATION' || (node.type === 'END' && !node.autoComplete)
  return <div className={`narrative-overlay ${node.type === 'GROUP_CALL' ? 'is-group-call' : ''} effect-${(runtime.visualEffect ?? 'none').toLowerCase().replaceAll('_', '-')}`} role="dialog" aria-modal="true" aria-label={background.label} onClick={isTextNode ? advance : undefined}>
    <div className="narrative-background" style={background.imageUrl ? { backgroundImage: `url(${background.imageUrl})` } : undefined}><span>{background.label}</span></div><div className="narrative-scrim" />
    {devMode && <aside className="narrative-inline-debug"><strong>NARRATIVE DEBUG</strong><span>Scene: {runtime.sceneId}</span><span>Node: {runtime.currentNodeId}</span><span>Type: {node.type}</span><span>Next: {'next' in node ? node.next : node.type === 'JUMP' ? node.target : '—'}</span><span>Visible characters:</span>{runtime.visibleCharacters.filter((item) => item.visible && !isNarrativePointOfView(scene, item.characterId)).map((item) => <span key={String(item.characterId)}>- {item.characterId} / {item.position} / {item.expression}</span>)}<span>Waiting: {String(runtime.isWaiting)} · Typing: {String(runtime.isTyping)} · Transitioning: {String(runtime.isTransitioning)}</span></aside>}
    <div className="narrative-characters">{runtime.visibleCharacters.filter((item) => item.visible && !isNarrativePointOfView(scene, item.characterId)).map((item) => { const character = resolveNarrativeCharacter(item.characterId, gameState, players, characterAssets); return <div key={String(item.characterId)} className={`narrative-character slot-${item.position.toLowerCase().replace('_', '-')} ${runtime.activeSpeakerId === String(item.characterId) ? 'is-speaking' : ''}`}><div className="narrative-portrait"><strong>{character.name}</strong>{devMode && <small>{item.expression}</small>}</div></div> })}</div>
    {node.type === 'GROUP_CALL' && <div key={node.id} className={`narrative-group-call is-${node.emphasis.toLowerCase()}`} role="status" aria-live="assertive"><p>{resolveNarrativeText(node.text, gameState)}</p></div>}
    {(isTextNode || node.type === 'CHOICE' || node.type === 'INPUT') && <section className={`narrative-dialogue-box ${node.type === 'NARRATION' ? 'is-narration' : ''}`} onClick={(event) => { if (node.type === 'CHOICE' || node.type === 'INPUT') event.stopPropagation() }}>
      {(node.type === 'DIALOGUE' || node.type === 'INPUT') && node.characterId !== undefined && <strong className="narrative-speaker-name">{isNarrativePointOfView(scene, node.characterId) ? scene.pointOfView!.label : resolveNarrativeCharacter(node.characterId, gameState, players, characterAssets).name}</strong>}
      {node.type === 'CHOICE' ? <><p className="narrative-choice-prompt">{resolveNarrativeText(node.prompt, gameState)}</p><div className="narrative-choices">{getNarrativeChoices(node, gameState).map((choice) => <button key={choice.id} disabled={choiceLocked} type="button" onClick={() => { if (choiceSubmitted.current || !getNarrativeChoices(node, gameRef.current).some((item) => item.id === choice.id)) return; choiceSubmitted.current = true; setChoiceLocked(true); choiceTimer.current = window.setTimeout(() => goTo(choice.next), 0) }}>{choice.text}</button>)}</div></> : node.type === 'INPUT' ? <form onSubmit={(event) => { event.preventDefault(); submitInput() }}><p className="narrative-text">{resolveNarrativeText(node.text, gameState)}</p><label>{node.input.label}<input autoFocus value={inputValue} placeholder={node.input.placeholder} onChange={(event) => { setInputValue(event.target.value); setInputError(undefined) }} /></label>{inputError && <p role="alert">{inputError}</p>}<button type="submit">CONTINUAR</button></form> : <><p className="narrative-text">{node.type === 'END' ? resolveNarrativeText(node.text, gameState) : displayedText}</p><span className="narrative-advance" aria-hidden="true">{node.type === 'END' ? node.actionLabel ?? 'TERMINAR' : runtime.isTyping ? '…' : '▼'}</span></>}
    </section>}
  </div>
}
