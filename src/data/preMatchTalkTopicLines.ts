import type { PrematchTalkContext, TalkInstruction } from '../domain/preMatchTalkTypes'
import type { PrematchTopic } from '../domain/preMatchTalkTopics'
import { talkHash } from '../domain/preMatchTalkContext'
import { PREMATCH_TALK_BALANCE } from '../domain/preMatchTalkBalance'

const instructionLines: Record<TalkInstruction, Record<string, string>> = {
  mentality: { Ofensiva: 'Si hay ventaja, vamos hacia delante. Que el que lleve el balón tenga ayuda.', Equilibrada: 'Atacamos sin quedarnos vendidos detrás.', Cauta: 'Primero protegernos bien. No regalemos el partido por ir con prisa.' },
  passingStyle: { 'En corto': 'Quiero apoyos cerca. No dejemos solo al que recibe.', Mixto: 'Cerca si hay apoyo; largo si no. No forcemos siempre el mismo pase.', Directo: 'Buscad a los de arriba y acercaos para la segunda jugada. Que no peleen solos.' },
  tempo: { Alto: 'Movamos el balón rápido. Mirad antes de recibir, que luego nos falta tiempo.', Medio: 'Demos al balón el ritmo que pide la jugada, sin precipitarnos.', Bajo: 'Pausa con el balón. No hace falta correr para llegar antes a perderlo.' },
  afterRecovery: { Contraataque: 'Cuando robemos, primer pase sencillo hacia delante y salimos. Que el que arranque tenga compañía.', Equilibrada: 'Cuando robemos, miramos si hay hueco. Si no lo hay, aseguramos el primer pase.', 'Mantener posición': 'Cuando robemos, aseguramos el balón. No salgamos todos corriendo a la vez.' },
  pressingHeight: { Alta: 'Vamos a buscarles arriba. Cuando uno salte, los demás cerramos detrás.', Media: 'Nos juntamos en medio campo. Nada de saltar solo y dejar el hueco.', Baja: 'Esperamos juntos atrás. Que tengan que pasar por fuera, sin abrirnos por dentro.' },
  pressingIntensity: { Alta: 'Apretad con ganas, pero llegando juntos.', Media: 'Apretad cuando haya apoyo, sin partir el equipo.', Baja: 'No gastéis carreras en presiones que no podamos sostener juntos.' },
  afterLoss: { 'Presión tras pérdida': 'Cuando la perdamos, el primero aprieta y los demás cerramos. No quiero que nos partamos.', Mixto: 'Si la perdemos cerca y hay ayuda, apretamos. Si no, todos de vuelta.', Repliegue: 'Cuando la perdamos, primero volvemos a estar juntos detrás. Las carreras, hacia nuestra portería.' },
}

export function getPrematchTopicLine(topic: PrematchTopic, context: PrematchTalkContext): { label: string; text: string } {
  const connection = topic.connection
  const days = [...new Set(connection?.days ?? [])]
  const reminder = days.length === 1 ? `Lo del ${days[0].toLowerCase()}: ` : days.length > 1 ? 'Lo que trabajamos esta semana: ' : ''
  if (connection?.instruction) {
    const labels: Partial<Record<PrematchTopic['id'], string>> = {
      'transition-attack': days.length ? 'Recordar lo trabajado en las transiciones.' : 'Aclarar qué hacemos cuando robemos.',
      'transition-defense': 'Una cosa más: qué hacemos cuando la perdamos.',
      pressing: 'Insistir en cómo vamos a presionar.', tempo: 'Hablar del ritmo con el balón.',
      'direct-play': 'Pedir que los de arriba tengan ayuda en el juego directo.', possession: 'Pedir apoyos para jugar por abajo.',
    }
    return { label: labels[topic.id] ?? 'Recordar una idea del entrenamiento.', text: `${reminder}${instructionLines[connection.instruction][context.plan[connection.instruction]]}` }
  }
  const variants = (lines: string[]) => lines[talkHash(topic.id, context.seed) % lines.length]
  switch (topic.id) {
    case 'structure': {
      const changed = context.playedMatches > 0 && context.previousPlan && context.previousPlan.formation !== context.plan.formation
      const shape = changed ? context.plan.formation === '3-5-2' || context.plan.formation === '5-4-1' ? 'Hoy probamos con tres centrales. Hablad entre vosotros para que nadie salga a destiempo.' : context.plan.formation === '4-4-2' ? 'Hoy jugamos con dos arriba. Que no queden aislados.' : 'Hoy cambia cómo nos colocamos. Mirad al compañero y no dejemos metros entre nosotros.' : 'Hoy quiero algo sencillo: juntos y ayudas. Si uno salta, el de al lado le acompaña.'
      return { label: changed ? 'Explicar el cambio de colocación.' : 'Insistir en mantenernos juntos.', text: `${shape}${context.formationFamiliarity < PREMATCH_TALK_BALANCE.lowFamiliarity ? ' Todavía estamos verdes. Si algo no sale, seguimos y lo corregimos después.' : ''}` }
    }
    case 'wings': return { label: 'Recordar que también tenemos gente por fuera.', text: 'Si por dentro está lleno, mirad fuera. Y que el que reciba en la banda no tenga que inventárselo todo solo.' }
    case 'set-pieces': return { label: 'Recordar lo trabajado a balón parado.', text: `${reminder}en el balón parado, cada uno pendiente de su marca. Y después del primer balón seguimos jugando: atentos al rechace.` }
    case 'intensity': return { label: 'Pedir intensidad desde el inicio.', text: variants(['Quiero intensidad desde el principio. Disputad los balones y ayudad al compañero; correr cada uno por su lado no nos sirve.', 'Que se note que hemos venido a competir. Las ayudas y las disputas empiezan con el primer balón.']) }
    case 'confidence': return { label: 'Dar confianza a los que están más inseguros.', text: variants(['Si os equivocáis, no os escondáis. Confío en vosotros para pedir el siguiente balón.', 'Atreveos a jugar. Un error no os saca del partido; esconderos después sí.']) }
    case 'demand': return { label: 'Advertir que hoy también se ganan los puestos.', text: 'Quiero ver quién viene hoy a competir de verdad. El que hoy no compita empieza por detrás.' }
    case 'concentration': return { label: 'Pedir atención en los primeros minutos.', text: variants(['Los primeros minutos, atentos. Cabeza arriba y avisad al compañero.', 'No regalemos el primer balón por estar en otra cosa. Hablad y mirad antes de recibir.']) }
    case 'training': return { label: 'Recordar el esfuerzo de la semana.', text: 'Habéis sacado tiempo para entrenar después de trabajar. Ahora toca fiarse de ese trabajo y ayudarse cuando algo no salga.' }
    case 'rally': return { label: 'Añadir una arenga antes de salir.', text: context.importance >= 3 ? 'No sé cuándo volveremos a tener una oportunidad así. Nos ha costado llegar hasta aquí. Mirad al de al lado: hoy quiero que salga sabiendo que puede contar con vosotros hasta el último balón.' : 'Todos tenemos nuestras cosas fuera de aquí. Ahora estamos juntos y tenemos un partido delante. Quiero que se note que este rato nos importa. Que nadie salga al campo pensando que va a tener que hacerlo solo.' }
    case 'rival-player': return { label: 'Recordar al jugador rival que conocemos.', text: context.rival.facts.find((fact) => fact.id.startsWith('player:'))?.text ?? '' }
    case 'rival': return { label: 'Volver sobre la referencia concreta del rival.', text: 'Tened en cuenta lo que sabemos, pero mirad lo que pasa hoy. Si cambian algo, nos avisamos.' }
    default: return { label: 'Recordar una idea sencilla.', text: 'Juntos y con ayudas. Nada de complicarnos solos.' }
  }
}
