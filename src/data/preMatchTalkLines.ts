import type { PrematchTalkContext, TalkIntent, TalkSituation } from '../domain/preMatchTalkTypes'
import type { AssistantTalkContribution } from '../domain/preMatchTalkTopics'

export type ContextMessage = { id: string; intent: TalkIntent; label: string; lines: string[]; mentions?: string[] }
const contextLabels: Record<string, string> = {
  learn: 'Dar prioridad a empezar a competir juntos, por encima del resultado.',
  win: 'Dar importancia a competir para ganar el partido.',
  test: 'Presentarlo como una oportunidad para probar sin miedo a equivocarse.',
  places: 'Recordar que estos minutos también sirven para ganarse el puesto.',
  points: 'Marcar que empieza la Liga y pedir seriedad desde el inicio.',
  normal: 'Normalizar el debut y quitar nervios.',
  pressure: 'Subir la exigencia y pedir que respondan en el campo.',
  meaning: 'Recordar lo que significa el derbi para el club.',
  compete: 'Picarles para competir de tú a tú con el rival.',
  reset: 'Darles un respiro y plantear un nuevo comienzo.',
  respect: 'Pedir respeto por el rival y evitar la confianza excesiva.',
}
const intentLabels: Record<TalkIntent, string> = {
  SIMPLIFY: 'Centrarse en lo sencillo y dejar margen para equivocarse.',
  TRUST: 'Transmitir confianza en el equipo.', DEMAND: 'Pedir seriedad y compromiso desde el inicio.',
  FOCUS: 'Pedir concentración y evitar que se confíen.', PROVOKE: 'Tocarles el orgullo para subir la intensidad.',
  CALM: 'Quitar presión y darles tranquilidad para jugar.',
}
const message = (id: string, intent: TalkIntent, lines: string[], mentions?: string[]): ContextMessage => ({ id, intent, label: contextLabels[id] ?? intentLabels[intent], lines, mentions })

export const PREMATCH_OPENINGS = [
  'Los jugadores terminan de prepararse. En unos minutos saldréis al campo.',
  'Se oyen tacos sobre el suelo y el ruido de una botella. Los jugadores van levantando la mirada hacia ti.',
  'Uno acaba de atarse las botas. Otro deja la camiseta en su sitio. El vestuario espera tus palabras.',
]

export const PREMATCH_CONTEXT_CHOICES: Record<TalkSituation, ContextMessage[]> = {
  FIRST_FRIENDLY: [
    message('learn', 'SIMPLIFY', ['El resultado es secundario. Quiero empezar a ver cómo competimos juntos.', 'Hoy quiero ver cómo nos ayudamos. El marcador ya lo miraremos después.']),
    message('win', 'DEMAND', ['Es amistoso, pero quiero empezar ganando.']),
    message('enjoy', 'CALM', ['Salid, disfrutad y no os compliquéis demasiado.']),
    message('places', 'PROVOKE', ['Quiero intensidad. El que se relaje hoy me lo pone fácil para decidir el once.'], ['topic:intensity', 'topic:demand']),
  ],
  FRIENDLY: [
    message('test', 'SIMPLIFY', ['Hoy seguimos probando. Prefiero que intentéis las cosas a que juguéis con miedo.']),
    message('win', 'DEMAND', ['Será amistoso, pero me importa cómo competimos. Quiero ganar.']),
    message('enjoy', 'CALM', ['Aprovechad los minutos. Disfrutad y ayudad al compañero.']),
    message('places', 'PROVOKE', ['Los minutos de hoy también cuentan para ganarse el puesto.'], ['topic:demand']),
  ],
  LEAGUE_DEBUT: [
    message('points', 'DEMAND', ['Hoy empiezan los puntos. Quiero que se note desde el primer minuto.']),
    message('normal', 'CALM', ['No nos compliquemos porque ya sea Liga. Juntos y sin miedo.']),
    message('trust', 'TRUST', ['Confío en vosotros para ir a por los primeros tres puntos.'], ['topic:confidence']),
    message('pressure', 'PROVOKE', ['Hoy ya no quiero excusas. Hay que competir.'], ['topic:demand']),
  ],
  LEAGUE: [
    message('calm', 'CALM', ['Son tres puntos. No convirtamos esto en algo más grande de lo que es.', 'Es otro partido. Vamos a hacer las cosas sencillas, sin volvernos locos.']),
    message('serious', 'DEMAND', ['Quiero que noten desde el principio que hoy vamos en serio.', 'Hoy quiero que nadie se guarde nada. Los puntos hay que pelearlos.']),
    message('trust', 'TRUST', ['Confío en vosotros. Salid a jugar y ayudaos.', 'Sois capaces de sacarlo adelante. Jugad con confianza.'], ['topic:confidence']),
  ],
  DIRECT_RIVAL: [
    message('win', 'DEMAND', ['Si queremos estar arriba, estos partidos hay que ganarlos.']),
    message('calm', 'CALM', ['No quiero que la clasificación nos saque de nuestro partido.']),
    message('compete', 'PROVOKE', ['Hoy no necesitamos jugar bonito. Necesitamos competir.']),
  ],
  DERBY: [
    message('meaning', 'DEMAND', ['Sabéis quiénes son. No hace falta que os explique lo que significa.']),
    message('calm', 'CALM', ['Es un derbi, pero seguimos jugando con un balón. Nada de perder la cabeza.']),
    message('provoke', 'PROVOKE', ['Que les quede claro desde el principio quién quiere ganar este partido.']),
  ],
  GOOD_RUN: [
    message('trust', 'TRUST', ['Estamos haciendo las cosas bien. Confío en vosotros para seguir.'], ['topic:confidence']),
    message('focus', 'FOCUS', ['Venimos ganando, pero hoy empezamos de cero. Nada de confiarnos.']),
    message('demand', 'DEMAND', ['Vamos bien. Precisamente por eso hoy os voy a pedir más.']),
  ],
  BAD_RUN: [
    message('reset', 'CALM', ['Olvidaos de los últimos partidos. Hoy empieza otra cosa.']),
    message('trust', 'TRUST', ['Confío en vosotros. Estamos más cerca de cambiar esto de lo que parece.'], ['topic:confidence']),
    message('pressure', 'PROVOKE', ['Otra derrota hoy sería difícil de explicar. Quiero una respuesta.']),
  ],
  REACTION: [
    message('calm', 'CALM', ['No arreglaremos las últimas derrotas en la primera jugada. Vamos paso a paso.']),
    message('trust', 'TRUST', ['Os sigo teniendo confianza. Podemos salir de esta juntos.'], ['topic:confidence']),
    message('demand', 'DEMAND', ['Hoy necesito ver una reacción. Que nadie se esconda.']),
    message('pressure', 'PROVOKE', ['Otra derrota hoy sería difícil de explicar. Hay que responder.']),
  ],
  STRONG_RIVAL: [
    message('calm', 'CALM', ['No hace falta resolverlo solos. Nos ayudamos y competimos.']),
    message('provoke', 'PROVOKE', ['Llevan buena Liga. Que hoy tengan que ganárselo de verdad.']),
    message('trust', 'TRUST', ['Los resultados dicen que van mejor. Yo creo que podemos jugarles de tú a tú.'], ['topic:confidence']),
  ],
  WEAK_RIVAL: [
    message('respect', 'FOCUS', ['Que estén abajo no pone ningún gol en el marcador. Respeto y a jugar.']),
    message('win', 'DEMAND', ['Hoy espero que ganemos. Hay que demostrar la diferencia en el campo.']),
    message('calm', 'CALM', ['No os obsesionéis con lo que pone la tabla. Haced vuestro partido.']),
  ],
  PRESIDENT: [
    message('pressure', 'DEMAND', ['El club espera más de nosotros. Hoy quiero una respuesta.']),
    message('calm', 'CALM', ['De lo que pide el presidente ya me ocupo yo. Vosotros, a jugar.']),
    message('trust', 'TRUST', ['Podemos acercarnos a lo que nos han pedido. Confío en vosotros.'], ['topic:confidence']),
  ],
  PROMOTION: [
    message('win', 'DEMAND', ['Si queremos subir, no podemos dejar pasar estos puntos.']),
    message('calm', 'CALM', ['No juguéis toda la temporada hoy. Pensad en el balón que viene.']),
    message('trust', 'TRUST', ['Nos hemos puesto cerca de la cabeza. Podemos seguir ahí.'], ['topic:confidence']),
  ],
  PLAYOFF_RACE: [
    message('win', 'DEMAND', ['Queremos estar en ese playoff. Hoy hay que ganarse el sitio.']),
    message('calm', 'CALM', ['La tabla vendrá después. Ahora, nuestro partido.']),
    message('trust', 'TRUST', ['Estamos cerca. Jugad con confianza y ayudad al de al lado.'], ['topic:confidence']),
  ],
  DECISIVE: [
    message('trust', 'TRUST', ['No os voy a explicar lo que significa esto. Ya lo sabéis. Confío en vosotros.'], ['topic:confidence']),
    message('calm', 'CALM', ['Toda la presión me la quedo yo. Vosotros jugad.']),
    message('demand', 'DEMAND', ['Hoy no podemos guardarnos nada. Quiero vernos competir cada balón.']),
  ],
  PLAYOFF_SEMIFINAL: [
    message('trust', 'TRUST', ['Nos hemos ganado estar aquí. Ahora podemos ganarnos la final.'], ['topic:confidence']),
    message('calm', 'CALM', ['Que sea una semifinal no nos quite la calma. Juntos y a jugar.']),
    message('demand', 'DEMAND', ['La final está al otro lado. Hoy quiero que nadie se guarde nada.']),
  ],
  PLAYOFF_FINAL: [
    message('demand', 'DEMAND', ['Es nuestra final. Vamos a dejarlo todo en el campo.']),
    message('enjoy', 'TRUST', ['Os habéis ganado jugarla. Disfrutad de hacerlo juntos.']),
    message('calm', 'CALM', ['No juguéis el ascenso entero en el primer balón. Calma.']),
  ],
  INCIDENT: [
    message('calm', 'CALM', ['Lo que tengamos que hablar, lo hablaremos. Ahora nos ayudamos.']),
    message('trust', 'TRUST', ['Hoy os necesito juntos. Confío en que respondáis.'], ['topic:confidence']),
    message('demand', 'DEMAND', ['Lo del vestuario se queda aquí. En el campo quiero compromiso.']),
  ],
}

type OrdinaryContribution = Exclude<AssistantTalkContribution, 'SCOUTING' | 'NONE'>
export const ASSISTANT_PREMATCH_LINES: Record<NonNullable<PrematchTalkContext['assistant']>['voice'], Record<OrdinaryContribution, string[]>> = {
  ANALYTICAL: {
    FIRST_DAY: ['Yo hoy no les cargaría demasiado la cabeza. A ver primero cómo interpretan lo trabajado.', 'Primer partido. Con una idea clara ya tenemos bastante para empezar.'],
    TIRED: ['Algunos llegan cargados. Yo les daría una idea clara y los dejaría salir.'],
    UNEASY: ['Los veo poco sueltos. Quizá convenga hablarles claro y no alargarlo mucho.'],
    TRAINING: ['Tenemos el trabajo de la semana. Yo elegiría una cosa para recordarles.'],
    UNKNOWN_RIVAL: ['De estos sé poco, míster. Mejor que hoy nos fijemos en nosotros.'],
  },
  PRAGMATIC: {
    FIRST_DAY: ['Primer día. Que corran, se ayuden y ya tendremos tiempo de complicarlo.', 'Hoy con que se ayuden ya tenemos por dónde empezar. No les metas media libreta.'],
    TIRED: ['Hay piernas cargadas. Cuatro cosas claras y al campo, míster.'],
    UNEASY: ['El vestuario está algo torcido. Yo no me enrollaría hoy.'],
    TRAINING: ['Lo de esta semana ya está hecho. Recuérdales una cosa y que la hagan.'],
    UNKNOWN_RIVAL: ['De estos no tengo gran cosa. Mejor preocuparnos por los nuestros.'],
  },
  DIRECT: {
    FIRST_DAY: ['Primer partido. Una idea clara y que empiecen a jugar juntos.'],
    TIRED: ['Llegan cargados. Que las indicaciones sean cortas.'],
    UNEASY: ['Hoy el ambiente está raro. Conviene ser claro y acabar pronto.'],
    TRAINING: ['Han trabajado durante la semana. Elige qué quieres que recuerden.'],
    UNKNOWN_RIVAL: ['No tenemos información suficiente de ellos. Vamos con lo nuestro.'],
  },
  CAUTIOUS: {
    FIRST_DAY: ['Yo hoy les pediría poco y claro. Primero veremos cómo se encuentran.'],
    TIRED: ['Ojo con los que llegan cargados. Quizá convenga no añadirles demasiadas cosas.'],
    UNEASY: ['Me parece que están algo tensos. Yo tendría cuidado con apretar más.'],
    TRAINING: ['Podemos recordar lo que hemos trabajado. Sin dar por hecho que va a salir a la primera.'],
    UNKNOWN_RIVAL: ['De ellos sabemos poco. Yo no cambiaría cosas por una suposición.'],
  },
}
