import type { CoachEvidenceAxis } from '../domain/gameState'
import type { NarrativeScene } from '../domain/narrative'

const consequence = (decisionId: string, axis: CoachEvidenceAxis, value: number, cohesionMagnitude?: number) => ({
  source: 'first_training_talk', decisionId,
  effects: [
    { type: 'GENERAL_AUTHORITY' as const, magnitude: 'MINOR' as const, direction: 1 as const },
    ...(cohesionMagnitude ? [{ type: 'TEAM_COHESION' as const, magnitude: cohesionMagnitude }] : []),
  ],
  flags: [{ id: `first_training_talk_${decisionId}` }],
  feedback: [{ type: 'POSITIVE' as const, text: axis === 'discipline' ? 'El vestuario ha entendido que tomarás las decisiones.' : 'Tus primeras palabras han dejado una buena impresión en el grupo.' }],
  coachEvidence: { axis, value, source: 'Primeras palabras al vestuario' },
})

export const initialTeamTalkConsequences = {
  know: consequence('know', 'closeness', 2, 1),
  promotion: consequence('promotion', 'boldness', 2),
  earn: consequence('earn', 'discipline', 2, -1),
  together: consequence('together', 'closeness', 1, 2),
}

export const initialTeamTalkScene: NarrativeScene = {
  id: 'initial_team_talk', backgroundId: 'LOCKER_ROOM', startNodeId: 'fade-in', completion: { completedSceneId: 'first-training-talk', onboardingMilestone: 'FIRST_TRAINING_TALK' }, nodes: {
    'fade-in': { id: 'fade-in', type: 'VISUAL_EFFECT', effect: 'FADE_IN', next: 'settle' },
    settle: { id: 'settle', type: 'WAIT', durationMs: 250, next: 'opening' },
    opening: { id: 'opening', type: 'NARRATION', text: 'El grupo espera tus primeras palabras.', next: 'initial-choice' },
    'initial-choice': { id: 'initial-choice', type: 'CHOICE', prompt: '¿Qué les dices?', choices: [
      { id: 'know', text: 'Quiero conoceros primero. Ya tendremos tiempo de hablar de objetivos.', next: 'consequence-know' },
      { id: 'promotion', text: 'Estamos aquí para intentar subir. Quiero que lo tengamos claro desde hoy.', next: 'consequence-promotion' },
      { id: 'earn', text: 'Aquí nadie tiene el puesto asegurado. Os lo tendréis que ganar.', next: 'consequence-earn' },
      { id: 'together', text: 'Vamos a trabajar y a disfrutar. Si estamos juntos, llegarán las cosas.', next: 'consequence-together' },
    ] },
    'consequence-know': { id: 'consequence-know', type: 'CONSEQUENCE', consequence: initialTeamTalkConsequences.know, next: 'reaction-calm' },
    'consequence-promotion': { id: 'consequence-promotion', type: 'CONSEQUENCE', consequence: initialTeamTalkConsequences.promotion, next: 'reaction-bold' },
    'consequence-earn': { id: 'consequence-earn', type: 'CONSEQUENCE', consequence: initialTeamTalkConsequences.earn, next: 'reaction-demanding' },
    'consequence-together': { id: 'consequence-together', type: 'CONSEQUENCE', consequence: initialTeamTalkConsequences.together, next: 'reaction-together' },
    'reaction-calm': { id: 'reaction-calm', type: 'NARRATION', text: 'Marc escucha sin mostrar demasiado. Uno de los jugadores a prueba parece respirar algo más tranquilo.', next: 'fade-out' },
    'reaction-bold': { id: 'reaction-bold', type: 'NARRATION', text: 'Hugo asiente. Àlex mantiene la mirada fija, entre motivado y nervioso.', next: 'fade-out' },
    'reaction-demanding': { id: 'reaction-demanding', type: 'NARRATION', text: 'Los más competitivos parecen activarse. En el fondo, uno de los veteranos cruza los brazos.', next: 'fade-out' },
    'reaction-together': { id: 'reaction-together', type: 'NARRATION', text: 'Se oyen un par de asentimientos. La tensión de los nuevos baja un poco.', next: 'fade-out' },
    'fade-out': { id: 'fade-out', type: 'VISUAL_EFFECT', effect: 'FADE_OUT', next: 'end' },
    end: { id: 'end', type: 'END', text: 'Ya te has presentado al grupo. Fuera espera el primer entrenamiento.', actionLabel: 'TERMINAR CHARLA', result: { destination: 'CLUB_PANEL' } },
  },
}

const manoloPromotionConsequence = {
  source: 'manolo_intro', decisionId: 'promotion',
  effects: [{ type: 'STAFF_MANAGER_RELATIONSHIP' as const, targetId: 'manolo-escudero', magnitude: 'SMALL' as const }, { type: 'GENERAL_AUTHORITY' as const, magnitude: 'MINOR' as const }],
  memories: [{ characterId: 'manolo-escudero', id: 'MANAGER_SHARED_PROMOTION_AMBITION', sentiment: 'POSITIVE' as const, importance: 'MEDIUM' as const, eventId: 'new-game-introduction' }],
  flags: [{ id: 'manager_committed_to_promotion' }],
  feedback: [{ type: 'POSITIVE' as const, text: 'Manolo ha valorado tu ambición.' }, { type: 'MEMORY' as const, text: 'Manolo recordará que asumiste el objetivo sin dudar.' }],
  coachEvidence: { axis: 'boldness' as const, value: 2, source: 'Primera conversación con el presidente' },
}

export const manoloObjectiveScene: NarrativeScene = {
  id: 'manolo_objective', backgroundId: 'CLUB_OFFICE', startNodeId: 'fade-in', nodes: {
    'fade-in': { id: 'fade-in', type: 'VISUAL_EFFECT', effect: 'FADE_IN', next: 'manolo-enter' },
    'manolo-enter': { id: 'manolo-enter', type: 'CHARACTER_ACTION', characterId: 'manolo-escudero', action: 'ENTER', position: 'LEFT', expression: 'NEUTRAL', next: 'objective' },
    objective: { id: 'objective', type: 'DIALOGUE', characterId: 'manolo-escudero', expression: 'NEUTRAL', text: '—Te voy a ahorrar el discurso. Este año hay que subir a 3a Catalana.', next: 'objective-choice' },
    'objective-choice': { id: 'objective-choice', type: 'CHOICE', prompt: 'Manolo espera tu respuesta.', choices: [
      { id: 'promotion', text: 'Vamos a por el ascenso.', next: 'consequence-promotion' },
      { id: 'playoff', text: '¿Por playoff?', next: 'expression-playoff' },
      { id: 'assess', text: 'Primero quiero ver qué equipo tenemos.', next: 'consequence-assess' },
    ] },
    'consequence-promotion': { id: 'consequence-promotion', type: 'CONSEQUENCE', consequence: manoloPromotionConsequence, next: 'expression-happy' },
    'expression-happy': { id: 'expression-happy', type: 'CHARACTER_ACTION', characterId: 'manolo-escudero', action: 'CHANGE_EXPRESSION', expression: 'HAPPY', next: 'reaction-bold' },
    'reaction-bold': { id: 'reaction-bold', type: 'DIALOGUE', characterId: 'manolo-escudero', expression: 'HAPPY', text: '—Eso quería oír. Directo o por playoff, me da igual. A Tercera.', next: 'memory-check' },
    'expression-playoff': { id: 'expression-playoff', type: 'CHARACTER_ACTION', characterId: 'manolo-escudero', action: 'CHANGE_EXPRESSION', expression: 'SURPRISED', next: 'reaction-playoff' },
    'reaction-playoff': { id: 'reaction-playoff', type: 'DIALOGUE', characterId: 'manolo-escudero', expression: 'SURPRISED', text: '—Me da igual cómo. Directos, playoff, en el último minuto… pero a Tercera.', next: 'memory-check' },
    'consequence-assess': { id: 'consequence-assess', type: 'CONSEQUENCE', consequence: { source: 'manolo_intro', decisionId: 'assess', flags: [{ id: 'manager_wants_to_assess_squad' }], coachEvidence: { axis: 'boldness', value: -1, source: 'Primera conversación con el presidente' } }, next: 'expression-worried' },
    'expression-worried': { id: 'expression-worried', type: 'CHARACTER_ACTION', characterId: 'manolo-escudero', action: 'CHANGE_EXPRESSION', expression: 'WORRIED', next: 'reaction-careful' },
    'reaction-careful': { id: 'reaction-careful', type: 'DIALOGUE', characterId: 'manolo-escudero', expression: 'WORRIED', text: '—Míratelos. Luego subes con ellos. Directo o por playoff, eso ya es cosa tuya.', next: 'memory-check' },
    'memory-check': { id: 'memory-check', type: 'CONDITION', condition: { type: 'HAS_MEMORY', characterId: 'manolo-escudero', memoryId: 'MANAGER_SHARED_PROMOTION_AMBITION' }, then: 'remembered-beat', otherwise: 'ordinary-beat' },
    'remembered-beat': { id: 'remembered-beat', type: 'WAIT', durationMs: 120, next: 'manolo-exit' },
    'ordinary-beat': { id: 'ordinary-beat', type: 'WAIT', durationMs: 220, next: 'manolo-exit' },
    'manolo-exit': { id: 'manolo-exit', type: 'CHARACTER_ACTION', characterId: 'manolo-escudero', action: 'EXIT', next: 'fade-out' },
    'fade-out': { id: 'fade-out', type: 'VISUAL_EFFECT', effect: 'FADE_OUT', next: 'end' },
    end: { id: 'end', type: 'END', result: { destination: 'CLUB_PANEL' } },
  },
}

export const narrativeScenes: Record<string, NarrativeScene> = {
  [initialTeamTalkScene.id]: initialTeamTalkScene,
  [manoloObjectiveScene.id]: manoloObjectiveScene,
}
