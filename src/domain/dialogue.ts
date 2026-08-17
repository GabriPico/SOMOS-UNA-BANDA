import type { GameState, NarrativeCharacter } from './gameState'

export type DialogueContext = { game: GameState; variables: Record<string, string | number | boolean> }
type TextValue = string | ((context: DialogueContext) => string)
type CharacterValue = NarrativeCharacter | ((context: DialogueContext) => NarrativeCharacter)
type BaseNode = { id: string; next?: string }
export type NarrationNode = BaseNode & { type: 'narration'; text: TextValue; eyebrow?: TextValue; actionLabel?: string }
export type DialogueNode = BaseNode & { type: 'dialogue'; character: CharacterValue; text: TextValue; actionLabel?: string }
export type DialogueChoice = { id: string; label: TextValue; next: string; when?: (context: DialogueContext) => boolean; effects?: DialogueEffect[] }
export type ChoiceNode = Omit<BaseNode, 'next'> & { type: 'choice'; character?: CharacterValue; text: TextValue; choices: DialogueChoice[] }
export type InputNode = Omit<BaseNode, 'next'> & { type: 'input'; character?: CharacterValue; text: TextValue; input: { key: string; label: string; inputType: 'text' | 'number'; placeholder?: string; validate: (value: string) => string | null }; next: string; effects?: DialogueEffect[] }
export type ConditionNode = Omit<BaseNode, 'next'> & { type: 'condition'; when: (context: DialogueContext) => boolean; then: string; otherwise: string }
export type EffectNode = BaseNode & { type: 'effect'; next: string; effects: DialogueEffect[] }
export type JumpNode = Omit<BaseNode, 'next'> & { type: 'jump'; target: string }
export type EndNode = Omit<BaseNode, 'next'> & { type: 'end'; text: TextValue; actionLabel: string; effects?: DialogueEffect[] }
export type DialogueNodeType = NarrationNode | DialogueNode | ChoiceNode | InputNode | ConditionNode | EffectNode | JumpNode | EndNode
export type DialogueEffect = (context: DialogueContext) => DialogueContext
export type DialogueScene = { id: string; location?: string; startNodeId: string; nodes: Record<string, DialogueNodeType>; completionFlow?: 'RETURN' | 'CONTINUE' }

export const resolveText = (value: TextValue, context: DialogueContext) => typeof value === 'function' ? value(context) : value
export const resolveCharacter = (value: CharacterValue, context: DialogueContext) => typeof value === 'function' ? value(context) : value
export const applyDialogueEffects = (context: DialogueContext, effects: DialogueEffect[] = []) => effects.reduce((current, effect) => effect(current), context)

export function resolveDialogueNode(scene: DialogueScene, nodeId: string, context: DialogueContext) {
  let currentId = nodeId
  let currentContext = context
  const visited = new Set<string>()
  while (true) {
    if (visited.has(currentId)) throw new Error(`Bucle automático en la escena ${scene.id}: ${currentId}`)
    visited.add(currentId)
    const node = scene.nodes[currentId]
    if (!node) throw new Error(`Nodo inexistente en la escena ${scene.id}: ${currentId}`)
    if (node.type === 'condition') { currentId = node.when(currentContext) ? node.then : node.otherwise; continue }
    if (node.type === 'effect') { currentContext = applyDialogueEffects(currentContext, node.effects); currentId = node.next ?? ''; continue }
    if (node.type === 'jump') { currentId = node.target; continue }
    return { node, context: currentContext }
  }
}
