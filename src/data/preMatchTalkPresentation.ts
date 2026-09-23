import type { PrematchTalkContext, PrematchTalkState, TalkIntent } from '../domain/preMatchTalkTypes'
import { getPrematchPlanTopics } from '../domain/preMatchTalkTopics'
import { getPrematchTopicLine } from './preMatchTalkTopicLines'
import { getRallyReception } from '../domain/preMatchTalk'
import { getCohesionLabel } from '../domain/humanState'

const contextNarrations: Record<TalkIntent, string> = {
  SIMPLIFY: 'Pones el encuentro en perspectiva y dejas margen para probar y equivocarse. Varias miradas vuelven hacia ti.',
  TRUST: 'Les haces sentir que cuentas con ellos para sacar el partido adelante. Uno deja la botella y escucha.',
  DEMAND: 'Marcas lo que esperas del equipo hoy y pides que cada uno asuma su parte. Las conversaciones del fondo se apagan.',
  FOCUS: 'Centras el mensaje en entrar atentos al partido. Un par terminan de ajustarse las medias sin perderte de vista.',
  PROVOKE: 'Subes el tono para tocarles el orgullo y pedir una respuesta en el campo. Unos levantan la barbilla; otros permanecen callados.',
  CALM: 'Bajas las expectativas de resolverlo todo de golpe y les das espacio para jugar. Al fondo, uno suelta el aire despacio.',
}
export const getContextNarration = (intent: TalkIntent) => contextNarrations[intent]

export function getPlanNarration(context: PrematchTalkContext, trainedOnly = false) {
  const topics = getPrematchPlanTopics(context, trainedOnly)
  const ideas: Record<string, string> = {
    structure: context.formationUse === 'NEW' && ['3-5-2', '5-4-1'].includes(context.plan.formation) ? 'las ayudas al colocarse con tres centrales' : 'las distancias y las ayudas entre compañeros',
    pressing: context.plan.pressingHeight === 'Alta' ? 'cómo acompañar al que salte a presionar arriba' : 'dónde juntarse para defender',
    'transition-attack': context.plan.afterRecovery === 'Contraataque' ? 'las salidas con apoyo después de robar' : 'cómo asegurar el balón al recuperarlo',
    'transition-defense': context.plan.afterLoss === 'Presión tras pérdida' ? 'la ayuda al primero que apriete tras perderla' : 'cómo volver a juntarse al perderla',
    tempo: 'el ritmo con el balón', 'direct-play': 'las ayudas para la segunda jugada', possession: 'los apoyos para jugar por abajo', wings: 'las salidas por fuera', 'set-pieces': 'las marcas y los rechaces a balón parado',
  }
  const detail = topics.map((topic) => ideas[topic.id]).join(' y ')
  if (trainedOnly) {
    const days = [...new Set(topics.flatMap((topic) => topic.id === 'structure' ? context.formationTrainingDays : topic.connection?.days ?? []))]
    const when = days.length === 1 ? `el ${days[0].toLowerCase()}` : 'esta semana'
    return `Recuerdas brevemente lo trabajado ${when}: ${detail}. No añades instrucciones nuevas. Un par asienten al reconocer el ejercicio.`
  }
  return `Repasas ${detail || 'las ayudas entre compañeros'} con un par de indicaciones. Señalas dónde tienen que encontrarse; los más cercanos siguen el gesto.`
}

export function getAssistantPlanLine(context: PrematchTalkContext) {
  const second = context.assistant!
  const topics = getPrematchPlanTopics(context)
  const detail = topics.slice(0, second.voice === 'PRAGMATIC' ? 1 : 2).map((topic) => getPrematchTopicLine(topic, context).text).join(' ')
  if (second.planDelivery === 'RAMBLING') return `A ver, cuando tengamos el balón... Bueno, primero hay que estar bien colocados. ${getPrematchTopicLine(topics[0], context).text} Lo otro ya lo iremos viendo, pero atentos a las dos cosas.`
  if (second.voice === 'PRAGMATIC') return `Chavales, dos cosas y fuera. ${detail} Hablad y echad una mano al de al lado.`
  if (second.planDelivery === 'CONNECTED') return `Venga, que nos conocemos. ${detail} Si uno se atasca, el de al lado le da una salida. Nadie tiene que hacerlo solo.`
  return `${second.voice === 'ANALYTICAL' ? 'Quedaos con estas dos referencias.' : 'Vamos a dejar claras las ayudas.'} ${detail}`
}

export const RALLY_CHOICES = [
  { id: 'demand', intent: 'DEMAND', label: 'Recordarles lo que os jugáis y exigir que den un paso adelante.' },
  { id: 'calm', intent: 'CALM', label: 'Quitar presión y pedirles que jueguen el partido, no la clasificación.' },
  { id: 'provoke', intent: 'PROVOKE', label: 'Utilizar al rival para picarles y subir la intensidad.' },
  { id: 'trust', intent: 'TRUST', label: 'Transmitir confianza y recordarles que han llegado hasta aquí por méritos propios.' },
] as const

export function getRallyNarration(context: PrematchTalkContext, intent: TalkIntent) {
  const stakes = context.situations.includes('PLAYOFF_FINAL') ? 'la final y la oportunidad de subir'
    : context.situations.includes('PLAYOFF_SEMIFINAL') ? 'la posibilidad de ganarse un sitio en la final'
    : context.situations.includes('DECISIVE') ? 'lo que se decide en esta última jornada'
    : context.situations.includes('DERBY') ? 'lo que significa este derbi para la gente del club'
    : context.situations.includes('PROMOTION') ? 'los puntos que os mantienen en la pelea por subir'
    : context.situations.includes('PLAYOFF_RACE') ? 'la posibilidad de entrar en el playoff'
    : context.situations.includes('BAD_RUN') || context.situations.includes('REACTION') ? 'la necesidad de salir juntos de esta mala racha'
    : context.situations.includes('DIRECT_RIVAL') ? 'los puntos ante un equipo con el que estáis peleando en la tabla'
    : 'el objetivo que os ha pedido el club'
  const opening = context.importance >= 3 ? 'Dejas unos segundos de silencio y te acercas al grupo. Esta vez te alargas algo más. ' : 'Reúnes las últimas miradas antes de salir. '
  if (intent === 'DEMAND') return `${opening}Les recuerdas ${stakes} y les pides que hoy den un paso adelante. Cada uno tiene una parte que asumir.`
  if (intent === 'CALM') return `${opening}Reconoces ${stakes}, pero les apartas ese peso de los hombros. Llevas el mensaje al siguiente balón y al compañero que tendrán al lado.`
  if (intent === 'PROVOKE') return `${opening}Nombras a ${context.rival.name} y utilizas la rivalidad de hoy para tocarles el orgullo. Pides intensidad sin regalar faltas ni perder la cabeza.`
  return `${opening}Pones en valor el trabajo que les ha traído hasta aquí. Hablas de ${stakes} desde la confianza en lo que pueden hacer juntos.`
}

export function getRallyReaction(talk: PrematchTalkState) {
  const reception = getRallyReception(talk)
  if (!reception) return 'El vestuario guarda un momento de silencio.'
  const tense = reception.players.find((item) => item.delta.nerves > 1)
  const relieved = reception.players.find((item) => item.delta.nerves < -1 && item.player.confidence < 55)
  const eager = reception.players.find((item) => item.delta.motivation > 1)
  const group = {
    ENERGIZED: 'Varias cabezas asienten a la vez. Las últimas palabras parecen haber encontrado respuesta.',
    REJECTED: 'El silencio pesa más de lo que esperabas. Uno aparta la mirada y nadie recoge el impulso.',
    FLAT: 'Te escuchan hasta el final, aunque el grupo no termina de encenderse.',
    MIXED: 'Las palabras no llegan igual a todos. Hay gestos de acuerdo y miradas más reservadas.',
  }[reception.mood]
  return `${group}${tense ? ` ${tense.player.name} aprieta las manos, más tenso que antes.` : relieved ? ` ${relieved.player.name} afloja los hombros y respira con más calma.` : eager ? ` ${eager.player.name} se inclina hacia delante, con ganas de salir.` : ''}`
}

export function getHuddleNarration(talk: PrematchTalkState) {
  const mood = getRallyReception(talk)?.mood
  if (mood === 'ENERGIZED') return 'Las últimas palabras parecen haberles tocado. El grupo se junta rápidamente.'
  if (mood === 'REJECTED') return 'El grupo se reúne, pero el ambiente no termina de acompañar tus palabras.'
  const cohesion = getCohesionLabel(talk.context.cohesion)
  if (cohesion === 'Alta' || cohesion === 'Muy alta') return 'Antes incluso de que termines, varios ya se levantan y se acercan al centro.'
  if (cohesion === 'Baja' || cohesion === 'Muy baja') return 'La piña se forma, aunque algunos llegan con bastante menos entusiasmo que otros.'
  return 'Los jugadores se levantan y forman la piña.'
}
