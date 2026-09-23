import type { ApplyConsequencesInput } from './consequences'
import { getAuthorityStateLabel, getHappinessStateLabel, getOverallHappiness, getRelationshipStateLabel, hasFlag, hasMemory } from './consequences'
import type { GameState, OnboardingMilestone } from './gameState'
import type { Player } from './models'
import { getTalkAttentionSignal, shouldNarrateAttention, type TalkAttentionSignal } from './preMatchTalk'
import { getAvailablePrematchTopics, type PrematchTopicId } from './preMatchTalkTopics'

export type NarrativeBackgroundId = 'LOCKER_ROOM' | 'CLUB_OFFICE' | 'FOOTBALL_FIELD' | 'BENCH' | 'CORRIDOR' | 'CLUB_ROOM'
export type NarrativeExpressionId = 'NEUTRAL' | 'HAPPY' | 'ANGRY' | 'WORRIED' | 'SURPRISED'
export type NarrativeCharacterPosition = 'FAR_LEFT' | 'LEFT' | 'CENTER' | 'RIGHT' | 'FAR_RIGHT'
export type NarrativeVisualEffect = 'FADE_IN' | 'FADE_OUT' | 'SHAKE_SMALL' | 'SHAKE_MEDIUM' | 'SHAKE_STRONG' | 'FLASH' | 'ZOOM_IN' | 'ZOOM_OUT' | 'TITLE'
export type NarrativeCharacterAction = 'ENTER' | 'EXIT' | 'MOVE' | 'CHANGE_EXPRESSION' | 'SHOW' | 'HIDE'
export type QualitativeState = 'VERY_BAD' | 'BAD' | 'NEUTRAL' | 'GOOD' | 'VERY_GOOD'

export type NarrativeText = string | ((game: GameState) => string)
export type NarrativeCharacterId = string | number
type BaseNode = { id: string }
export type DialogueNode = BaseNode & { type: 'DIALOGUE'; characterId: NarrativeCharacterId; expression: NarrativeExpressionId; text: NarrativeText; next: string }
export type NarrationNode = BaseNode & { type: 'NARRATION'; text: NarrativeText; next: string }
export type NarrativeChoice = { id: string; text: string; next: string; condition?: NarrativeCondition }
export type ChoiceNode = BaseNode & { type: 'CHOICE'; prompt: NarrativeText; choices: NarrativeChoice[] }
export type InputNode = BaseNode & { type: 'INPUT'; characterId?: NarrativeCharacterId; expression?: NarrativeExpressionId; text: NarrativeText; input: { key: string; label: string; target: 'COACH_NAME' | 'ASSISTANT_NAME'; placeholder?: string; minLength?: number; maxLength?: number }; next: string }
export type CharacterActionNode = BaseNode & { type: 'CHARACTER_ACTION'; characterId: NarrativeCharacterId; action: NarrativeCharacterAction; position?: NarrativeCharacterPosition; expression?: NarrativeExpressionId; next: string }
export type VisualEffectNode = BaseNode & { type: 'VISUAL_EFFECT'; effect: NarrativeVisualEffect; title?: string; next: string }
export type ConsequenceNode = BaseNode & { type: 'CONSEQUENCE'; consequence: ApplyConsequencesInput; next: string }
export type NarrativeCondition =
  | { type: 'PREMATCH_ATTENTION'; matchId: string; signal?: TalkAttentionSignal }
  | { type: 'PREMATCH_TOPIC_AVAILABLE'; matchId: string; topicId: PrematchTopicId }
  | { type: 'PREMATCH_NOT_MENTIONED'; matchId: string; mention: string }
  | { type: 'HAS_FLAG'; flagId: string }
  | { type: 'HAS_MEMORY'; characterId: string; memoryId: string }
  | { type: 'PLAYER_HAPPINESS_STATE' | 'PLAYER_RELATIONSHIP_STATE' | 'PLAYER_AUTHORITY_STATE'; playerId: number; state: QualitativeState }
  | { type: 'GENERAL_AUTHORITY_STATE'; state: QualitativeState }
export type ConditionNode = BaseNode & { type: 'CONDITION'; condition: NarrativeCondition; then: string; otherwise: string }
export type WaitNode = BaseNode & { type: 'WAIT'; durationMs: number; next: string }
export type GroupCallNode = BaseNode & { type: 'GROUP_CALL'; text: NarrativeText; emphasis: 'CALL' | 'RESPONSE'; durationMs: number; next: string }
export type JumpNode = BaseNode & { type: 'JUMP'; target: string }
export type EndNode = BaseNode & { type: 'END'; text?: NarrativeText; actionLabel?: string; autoComplete?: boolean; result: { destination: string } }
export type SceneNode = DialogueNode | NarrationNode | ChoiceNode | InputNode | CharacterActionNode | VisualEffectNode | ConsequenceNode | ConditionNode | WaitNode | GroupCallNode | JumpNode | EndNode

export type NarrativeScene = {
  id: string
  backgroundId: NarrativeBackgroundId
  startNodeId: string
  nodes: Record<string, SceneNode>
  completion?: { completedSceneId?: string; onboardingMilestone?: OnboardingMilestone }
  persistProgress?: boolean
  version?: number
  resumeNodeId?: (game: GameState) => string
  pointOfView?: { characterId: NarrativeCharacterId; label: string }
}
export type VisibleNarrativeCharacter = { characterId: NarrativeCharacterId; position: NarrativeCharacterPosition; expression: NarrativeExpressionId; visible: boolean }
export type NarrativeRuntime = { sceneId: string; sceneVersion?: number; currentNodeId: string; backgroundId: NarrativeBackgroundId; visibleCharacters: VisibleNarrativeCharacter[]; activeSpeakerId?: string; isTyping: boolean; isWaiting: boolean; isTransitioning: boolean; visualEffect?: NarrativeVisualEffect; characterTransition?: { characterId: string; action: NarrativeCharacterAction } }

export type NarrativeCharacterAsset = { id: string; name: string; portraits: Partial<Record<NarrativeExpressionId, string>> }
export type NarrativeBackgroundAsset = { id: NarrativeBackgroundId; label: string; imageUrl?: string }

export const NARRATIVE_TYPEWRITER_MS = 32
export const NARRATIVE_GROUP_CALL_MS = { CALL: 1100, RESPONSE: 1500 } as const
export const MAX_NARRATIVE_WAIT_MS = 10_000
export const MAX_AUTOMATIC_NARRATIVE_TRANSITIONS = 50
export const NARRATIVE_VISUAL_EFFECT_WATCHDOG_GRACE_MS = 500
export const NARRATIVE_EFFECT_DURATION_MS: Record<NarrativeVisualEffect, number> = { FADE_IN: 300, FADE_OUT: 300, SHAKE_SMALL: 180, SHAKE_MEDIUM: 240, SHAKE_STRONG: 320, FLASH: 180, ZOOM_IN: 260, ZOOM_OUT: 260, TITLE: 800 }

const qualitativeState = (label: string): QualitativeState => {
  if (/Nula|Muy baja|Muy mala|Hundido|Muy descontento/.test(label)) return 'VERY_BAD'
  if (/Baja|Mala|Fría|Descontento/.test(label)) return 'BAD'
  if (/Alta|Buena|Contento/.test(label)) return 'GOOD'
  if (/Muy alta|Total|Muy buena|Excelente|Muy contento|Encantado/.test(label)) return 'VERY_GOOD'
  return 'NEUTRAL'
}

export function evaluateNarrativeCondition(game: GameState, condition: NarrativeCondition) {
  if (condition.type === 'PREMATCH_ATTENTION') { const talk = game.preMatchPreparations[condition.matchId]?.talk; return Boolean(talk && (condition.signal ? getTalkAttentionSignal(talk) === condition.signal : shouldNarrateAttention(talk))) }
  if (condition.type === 'PREMATCH_TOPIC_AVAILABLE') { const talk = game.preMatchPreparations[condition.matchId]?.talk; return Boolean(talk && getAvailablePrematchTopics(talk).some((topic) => topic.id === condition.topicId)) }
  if (condition.type === 'PREMATCH_NOT_MENTIONED') { const talk = game.preMatchPreparations[condition.matchId]?.talk; return Boolean(talk && !talk.beats.some((beat) => beat.mentions?.includes(condition.mention))) }
  if (condition.type === 'HAS_FLAG') return hasFlag(game.consequences, condition.flagId)
  if (condition.type === 'HAS_MEMORY') return hasMemory(game.consequences, condition.characterId, condition.memoryId)
  if (condition.type === 'GENERAL_AUTHORITY_STATE') return qualitativeState(getAuthorityStateLabel(game.manager.generalAuthority)) === condition.state
  const player = game.training.players[condition.playerId]
  if (!player) return false
  const label = condition.type === 'PLAYER_HAPPINESS_STATE' ? getHappinessStateLabel(getOverallHappiness(player)) : condition.type === 'PLAYER_RELATIONSHIP_STATE' ? getRelationshipStateLabel(player.managerRelationship) : getAuthorityStateLabel(player.managerAuthority)
  return qualitativeState(label) === condition.state
}

export function createNarrativeRuntime(scene: NarrativeScene, game?: GameState): NarrativeRuntime {
  const saved = scene.persistProgress ? game?.narrativeRuntimes?.[scene.id] : undefined
  if (saved && saved.sceneVersion === scene.version && scene.nodes[saved.currentNodeId]) return { ...saved, visibleCharacters: saved.visibleCharacters.filter((item) => !isNarrativePointOfView(scene, item.characterId)), isTyping: false, isWaiting: false, isTransitioning: false, visualEffect: undefined, characterTransition: undefined }
  return { sceneId: scene.id, sceneVersion: scene.version, currentNodeId: game && scene.resumeNodeId ? scene.resumeNodeId(game) : scene.startNodeId, backgroundId: scene.backgroundId, visibleCharacters: [], isTyping: false, isWaiting: false, isTransitioning: false }
}

export const getNarrativeChoices = (node: ChoiceNode, game: GameState) => node.choices.filter((choice) => !choice.condition || evaluateNarrativeCondition(game, choice.condition))
export const isNarrativePointOfView = (scene: NarrativeScene, id: NarrativeCharacterId) => scene.pointOfView !== undefined && String(scene.pointOfView.characterId) === String(id)

export function saveNarrativeProgress(game: GameState, scene: NarrativeScene, runtime: NarrativeRuntime): GameState {
  if (!scene.persistProgress) return game
  return { ...game, narrativeRuntimes: { ...game.narrativeRuntimes, [scene.id]: { ...runtime, isTyping: false, isWaiting: false, isTransitioning: false, visualEffect: undefined, characterTransition: undefined } } }
}

export const resolveNarrativeText = (value: NarrativeText | undefined, game: GameState) => typeof value === 'function' ? value(game) : value ?? ''

export function resolveNarrativeCharacter(id: NarrativeCharacterId, game: GameState, players: Player[], assets: Record<string, NarrativeCharacterAsset>): NarrativeCharacterAsset {
  const key = String(id)
  const fixed = assets[key]
  if (fixed) return fixed
  const playerId = typeof id === 'number' ? id : /^player-\d+$/.test(id) ? Number(id.slice(7)) : undefined
  const player = playerId === undefined ? undefined : players.find((item) => item.id === playerId)
  if (player) return { id: key, name: player.name, portraits: {} }
  const staff = game.staff.members.find((member) => member.id === key)
  if (staff) return { id: key, name: staff.name, portraits: {} }
  if (game.staff.clubPersonnel.id === key) return { id: key, name: game.staff.clubPersonnel.name, portraits: {} }
  return { id: key, name: key, portraits: {} }
}

export const isAutomaticNarrativeNode = (node: SceneNode) => !['DIALOGUE', 'NARRATION', 'CHOICE', 'INPUT'].includes(node.type)

export function validateNarrativeScene(scene: NarrativeScene, characterIds: ReadonlySet<string>, backgroundIds: ReadonlySet<string>, allowDynamicCharacters = true) {
  const errors: string[] = []
  if (!scene.nodes[scene.startNodeId]) errors.push(`Missing start node: ${scene.startNodeId}`)
  if (!backgroundIds.has(scene.backgroundId)) errors.push(`Missing background: ${scene.backgroundId}`)
  const targets = (node: SceneNode): string[] => node.type === 'CHOICE' ? node.choices.map((choice) => choice.next) : node.type === 'CONDITION' ? [node.then, node.otherwise] : node.type === 'JUMP' ? [node.target] : node.type === 'END' ? [] : [node.next]
  Object.values(scene.nodes).forEach((node) => {
    if ((node.type === 'DIALOGUE' || node.type === 'CHARACTER_ACTION' || node.type === 'INPUT') && node.characterId !== undefined && !characterIds.has(String(node.characterId)) && !allowDynamicCharacters) errors.push(`Node ${node.id}: missing character ${node.characterId}`)
    targets(node).forEach((target) => { if (!scene.nodes[target]) errors.push(`Node ${node.id}: missing target ${target}`) })
  })
  const canReachEnd = new Set<string>()
  const visit = (id: string, visiting = new Set<string>()): boolean => {
    if (canReachEnd.has(id)) return true
    if (visiting.has(id) || !scene.nodes[id]) return false
    const node = scene.nodes[id]
    if (node.type === 'END') { canReachEnd.add(id); return true }
    const nextVisiting = new Set(visiting).add(id)
    const reachable = targets(node).some((target) => visit(target, nextVisiting))
    if (reachable) canReachEnd.add(id)
    return reachable
  }
  if (scene.nodes[scene.startNodeId] && !visit(scene.startNodeId)) errors.push('No path from startNodeId reaches END')
  return errors
}
