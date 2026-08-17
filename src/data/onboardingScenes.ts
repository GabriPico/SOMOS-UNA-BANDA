import type { DialogueEffect, DialogueScene } from '../domain/dialogue'
import type { GameState } from '../domain/gameState'
import { SITO } from './characters'

const completeScene = (sceneId: string): DialogueEffect => (context) => ({ ...context, game: { ...context.game, completedScenes: context.game.completedScenes.includes(sceneId) ? context.game.completedScenes : [...context.game.completedScenes, sceneId] } })
const firstWords = (axis: 'boldness' | 'closeness' | 'discipline', value: number, cohesion = 0): DialogueEffect => (context) => ({ ...context, game: { ...context.game, coachEvidence: [...context.game.coachEvidence, { axis, value, source: 'Primeras palabras al vestuario' }], dressingRoomCohesion: Math.max(0, Math.min(100, context.game.dressingRoomCohesion + cohesion)) } })
const staffByRole = (game: GameState, role: string) => game.staff.members.find((member) => member.role === role)

export function createStaffIntroduction(game: GameState): DialogueScene {
  const assistant = staffByRole(game, 'SEGUNDO_ENTRENADOR')
  const delegate = staffByRole(game, 'DELEGADO')
  const opening = assistant
    ? `—Buenas. Yo soy ${assistant.name}. Estaré echándote una mano cuando pueda.`
    : delegate
      ? `—Soy ${delegate.name}. Aquí hago un poco de todo. Para entrenar, de momento, vas bastante por tu cuenta.`
      : 'No aparece ningún ayudante. Manolo no exageraba: de momento vas bastante por tu cuenta.'
  return { id: 'onboarding-staff', location: 'Pasillo de vestuarios', startNodeId: 'opening', nodes: {
    opening: assistant || delegate ? { id: 'opening', type: 'dialogue', character: assistant ?? delegate!, text: opening, next: 'sito' } : { id: 'opening', type: 'narration', text: opening, next: 'sito' },
    sito: { id: 'sito', type: 'dialogue', character: SITO, text: '—Las llaves del almacén están aquí. Los conos buenos, si quedan, en la caja azul.', next: 'end' },
    end: { id: 'end', type: 'end', text: 'Echas un vistazo a la gente con la que contará el equipo.', actionLabel: 'VER STAFF', effects: [completeScene('onboarding-staff')] },
  } }
}

export function createTacticsIntroduction(game: GameState): DialogueScene {
  const assistant = staffByRole(game, 'SEGUNDO_ENTRENADOR')
  return { id: 'onboarding-tactics', location: 'Vestuario', startNodeId: 'opening', nodes: {
    opening: assistant ? { id: 'opening', type: 'dialogue', character: assistant, text: '—Antes de que lleguen todos, ¿cómo quieres colocar al equipo?', next: 'end' } : { id: 'opening', type: 'narration', text: 'Antes de que lleguen los jugadores, extiendes la pizarra sobre un banco y empiezas a montar el equipo.', next: 'end' },
    end: { id: 'end', type: 'end', text: 'La formación y el once serán el punto de partida del trabajo de esta semana.', actionLabel: 'PREPARAR TÁCTICA', effects: [completeScene('onboarding-tactics')] },
  } }
}

export function createSquadIntroduction(game: GameState): DialogueScene {
  const assistant = staffByRole(game, 'SEGUNDO_ENTRENADOR')
  const trials = 3
  const text = assistant ? `—Estos son más o menos los que siguen del año pasado. Y aquellos ${trials} están viniendo a probar. Ya veremos.` : `Van llegando los jugadores. La mayoría ya estaba el año pasado; ${trials} vienen a probar durante la pretemporada.`
  return { id: 'onboarding-squad', location: 'Campo Municipal del Poblenou', startNodeId: 'opening', nodes: {
    opening: assistant ? { id: 'opening', type: 'dialogue', character: assistant, text, next: 'detail' } : { id: 'opening', type: 'narration', text, next: 'detail' },
    detail: { id: 'detail', type: 'narration', text: 'Hugo ya conoce el club. Àlex está a prueba y dice que también puede ayudar por detrás del medio.', next: 'changing-room' },
    'changing-room': { id: 'changing-room', type: 'narration', eyebrow: 'VESTUARIO · PRIMER DÍA', text: 'Los jugadores terminan de cambiarse. Algunos hablan entre ellos; los tres que están a prueba se mantienen algo más apartados.', next: 'your-turn' },
    'your-turn': assistant ? { id: 'your-turn', type: 'dialogue', character: assistant, text: '—Bueno. Cuando quieras.', next: 'first-words' } : { id: 'your-turn', type: 'narration', text: 'Las conversaciones se apagan poco a poco. Te toca hablar.', next: 'first-words' },
    'first-words': { id: 'first-words', type: 'choice', text: 'El grupo espera tus primeras palabras.', choices: [
      { id: 'know', label: 'Quiero conoceros primero. Ya tendremos tiempo de hablar de objetivos.', next: 'reaction-calm', effects: [firstWords('closeness', 2, .4)] },
      { id: 'promotion', label: 'Estamos aquí para intentar subir. Quiero que lo tengamos claro desde hoy.', next: 'reaction-bold', effects: [firstWords('boldness', 2, .1)] },
      { id: 'earn', label: 'Aquí nadie tiene el puesto asegurado. Os lo tendréis que ganar.', next: 'reaction-demanding', effects: [firstWords('discipline', 2, -.1)] },
      { id: 'together', label: 'Vamos a trabajar y a disfrutar. Si estamos juntos, llegarán las cosas.', next: 'reaction-together', effects: [firstWords('closeness', 1, .7)] },
    ] },
    'reaction-calm': { id: 'reaction-calm', type: 'narration', text: 'Marc escucha sin mostrar demasiado. Uno de los jugadores a prueba parece respirar algo más tranquilo.', next: 'end' },
    'reaction-bold': { id: 'reaction-bold', type: 'narration', text: 'Hugo asiente. Àlex mantiene la mirada fija, entre motivado y nervioso.', next: 'end' },
    'reaction-demanding': { id: 'reaction-demanding', type: 'narration', text: 'Los más competitivos parecen activarse. En el fondo, uno de los veteranos cruza los brazos.', next: 'end' },
    'reaction-together': { id: 'reaction-together', type: 'narration', text: 'Se oyen un par de asentimientos. La tensión de los nuevos baja un poco.', next: 'end' },
    end: { id: 'end', type: 'end', text: 'No hace falta memorizar veinte nombres hoy. Sí saber quién forma parte del grupo y quién se está ganando un sitio.', actionLabel: 'VER EQUIPO', effects: [completeScene('onboarding-squad')] },
  } }
}
