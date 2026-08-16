import { useState } from 'react'
import type { DialogueContext, DialogueScene } from '../domain/dialogue'
import { applyDialogueEffects, resolveCharacter, resolveDialogueNode, resolveText } from '../domain/dialogue'
import type { GameState } from '../domain/gameState'
import './ConversationScreen.css'

type Props = { scene: DialogueScene; gameState: GameState; onGameStateChange: (state: GameState) => void; onComplete: (state: GameState) => void }

export function ConversationScreen({ scene, gameState, onGameStateChange, onComplete }: Props) {
  const [nodeId, setNodeId] = useState(scene.startNodeId)
  const [variables, setVariables] = useState<Record<string, string | number | boolean>>({})
  const [inputValue, setInputValue] = useState('')
  const [error, setError] = useState<string | null>(null)
  const resolved = resolveDialogueNode(scene, nodeId, { game: gameState, variables })
  const { node } = resolved
  const context = resolved.context
  const character = 'character' in node && node.character ? resolveCharacter(node.character, context) : undefined

  function move(next: string, nextContext: DialogueContext) {
    setVariables(nextContext.variables)
    onGameStateChange(nextContext.game)
    setInputValue('')
    setError(null)
    setNodeId(next)
  }

  function continueScene() {
    if (node.type === 'end') {
      const finalContext = applyDialogueEffects(context, node.effects)
      onGameStateChange(finalContext.game)
      onComplete(finalContext.game)
      return
    }
    if ('next' in node && node.next) move(node.next, context)
  }

  function submitInput() {
    if (node.type !== 'input') return
    const validation = node.input.validate(inputValue)
    if (validation) { setError(validation); return }
    const value = node.input.inputType === 'number' ? Number(inputValue) : inputValue.trim()
    const withVariable = { ...context, variables: { ...context.variables, [node.input.key]: value } }
    move(node.next, applyDialogueEffects(withVariable, node.effects))
  }

  return <main className="conversation-screen">
    <section className="conversation-stage" aria-live="polite">
      <header className="conversation-setting"><span>{scene.location}</span>{node.type === 'narration' && node.eyebrow && <strong>{resolveText(node.eyebrow, context)}</strong>}</header>
      <div className={`conversation-content is-${node.type}`}>
        {character && <div className="conversation-speaker"><h1>{character.name}</h1><p>{character.role}</p></div>}
        <p className="conversation-text">{resolveText(node.text, context)}</p>
        {node.type === 'input' && <form className="conversation-input" onSubmit={(event) => { event.preventDefault(); submitInput() }}>
          <label htmlFor={`scene-input-${node.id}`}>{node.input.label}</label>
          <input id={`scene-input-${node.id}`} type={node.input.inputType} value={inputValue} placeholder={node.input.placeholder} min={node.input.inputType === 'number' ? 18 : undefined} max={node.input.inputType === 'number' ? 80 : undefined} autoFocus onChange={(event) => { setInputValue(event.target.value); setError(null) }} />
          {error && <p className="conversation-error" role="alert">{error}</p>}
          <button type="submit">CONTINUAR</button>
        </form>}
        {node.type === 'choice' && <div className="conversation-choices">{node.choices.map((choice) => <button type="button" key={choice.id} onClick={() => move(choice.next, applyDialogueEffects(context, choice.effects))}>{resolveText(choice.label, context)}</button>)}</div>}
        {(node.type === 'dialogue' || node.type === 'narration' || node.type === 'end') && <button className="conversation-continue" type="button" onClick={continueScene}>{node.type === 'end' ? node.actionLabel : node.actionLabel ?? 'CONTINUAR'}</button>}
      </div>
      <footer className="conversation-progress">SOMOS UNA BANDA</footer>
    </section>
  </main>
}
