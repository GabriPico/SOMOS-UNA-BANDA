import type { Player } from './models'
import type { AssistantArchetype, StaffPerson } from './staff'
import type { FunctionalTrainingSession, TrainingGameState, TrainingSessionEvent } from './trainingTypes'

export type AssistantTrainingVoice = { archetype: AssistantArchetype; before: string; during: string[]; incidentReaction?: string; ending: string; report: string; planningQuestion: string; keepReply: string; reviewReply: string; authorityReaction?: string }

export function ensureFirstTrainingAssistantPresence(staff: StaffPerson[], availableStaffIds: string[] = [], staffAbsenceNotes: string[] = []) {
  const assistant = staff.find((member) => member.role === 'SEGUNDO_ENTRENADOR' && member.isUsuallyAvailable)
  if (!assistant) return { availableStaffIds, staffAbsenceNotes }
  return { availableStaffIds: [...new Set([...availableStaffIds, assistant.id])], staffAbsenceNotes: staffAbsenceNotes.filter((note) => !note.startsWith(assistant.name)) }
}

const hash = (text: string, seed: number) => { let value = seed >>> 0; for (let index = 0; index < text.length; index += 1) value = Math.imul(value ^ text.charCodeAt(index), 16777619) >>> 0; return value }
const pick = (lines: string[], key: string, seed: number) => lines[hash(key, seed) % lines.length]
const playerName = (id: number, players: Player[]) => players.find((player) => player.id === id)?.name.split(' ')[0] ?? 'uno de los jugadores'
const performancePlayer = (events: TrainingSessionEvent[], level: 'GOOD' | 'POOR') => events.find((event): event is Extract<TrainingSessionEvent, { type: 'PLAYER_PERFORMANCE' }> => event.type === 'PLAYER_PERFORMANCE' && event.level === level)?.playerId

export function createAssistantTrainingVoice(assistant: StaffPerson, session: FunctionalTrainingSession, training: TrainingGameState, players: Player[]): AssistantTrainingVoice {
  const archetype = assistant.assistantArchetype ?? 'CONNECTED_YOUNGSTER'
  const seed = training.seed + training.week * 101 + (session.id === 'tuesday' ? 17 : 31)
  const events = session.result?.events ?? []
  const goodId = performancePlayer(events, 'GOOD'); const poorId = performancePlayer(events, 'POOR')
  const tired = Object.values(training.players).filter((state) => session.result?.attendees.includes(state.playerId) && state.fatigue >= 55).sort((a, b) => b.fatigue - a.fatigue)[0]
  const namedId = poorId ?? tired?.playerId ?? goodId; const named = namedId ? playerName(namedId, players) : undefined
  const highLoad = session.intensity === 'Alta' || (session.result?.appliedEffects?.teamFatigueDelta ?? 0) >= 8
  const lowQuality = ['Floja', 'Mala', 'De mínimos'].includes(session.result?.qualityLabel ?? '')
  const incident = events.some((event) => event.type === 'PLAYER_DISCOMFORT' || event.type === 'PLAYER_INJURY' || (event.type === 'PLAYER_ABSENCE' && !event.planned))
  const attendance = session.result?.attendees.length ?? session.attendance; const blocks = session.blocks.join(' y ').toLowerCase(); const key = `${assistant.id}:${session.id}:${events.map((event) => event.type).join(':')}`
  const isFirstTraining = training.week === 1 && session.id === 'tuesday'

  if (archetype === 'CLUB_VETERAN') return { archetype,
    before: isFirstTraining ? 'Bueno, ya los has conocido. Ahora a ver si conseguimos que corran un poco, que hablar se les da muy bien.' : pick(['Venga, que ya os conozco. Como vea a alguno escondiéndose detrás del último cono...', 'Vamos, hombres. Los petos están fuera; que luego siempre aparece uno diciendo que no encuentra el suyo.'], key, seed),
    during: [named ? `${named} hoy viene con el día torcido. A este se le nota enseguida; dale cinco minutos y veremos.` : 'De ánimo los veo bien. Cuando empiezan a meterse pullas entre ellos es que ya han entrado en calor.', ...(highLoad ? ['Se nota el esfuerzo en las piernas... aunque las ganas de bromear no las pierden.'] : [])],
    incidentReaction: incident ? 'Venga, no empecemos a hacer una montaña. Primero vemos cómo está y luego seguimos.' : undefined,
    ending: isFirstTraining ? 'Para ser el primer día, ni tan mal. Alguno mañana se acordará de ti, eso sí.' : highLoad ? 'Han acabado reventados, pero de ánimo los he visto bien.' : 'No ha estado mal. Han trabajado y todavía se van hablando entre ellos, que también cuenta.',
    report: `${attendance} han entrenado. ${named ? `${named} me ha llamado la atención; ya sabes que a este se le nota todo en la cara.` : 'Al grupo lo he visto junto y con buen ambiente.'} ${incident ? 'Ha habido una incidencia y conviene preguntar mañana cómo sigue.' : 'Nada serio, míster.'}`,
    planningQuestion: 'Para el jueves tenemos lo que dejamos preparado. ¿Lo mantenemos o quieres tocar algo?', keepReply: 'Hecho. El jueves seguimos con eso.', reviewReply: 'Vale, míster. Tócalo con calma y yo me encargo del material.' }
  if (archetype === 'FORMER_CAPTAIN') return { archetype,
    before: isFirstTraining ? 'Bien. Ya te han escuchado. Ahora viene lo importante: a estos los vas a conocer entrenando.' : pick(['Venga, ya habéis tenido suficiente charla. Ahora hacedle caso al míster.', 'Las bromas luego. El míster está listo y nosotros también. Vamos.'], key, seed),
    during: [named ? `${named} está ${poorId ? 'forzando las acciones porque hoy no le están saliendo' : tired ? 'dejando de llegar a tiempo cuando se alarga el ejercicio' : 'respondiendo bien hoy'}. Yo lo vigilaría.` : 'El grupo ha entendido la tarea. Si alguno baja el ritmo, lo voy a cortar enseguida.', ...(highLoad ? ['Los últimos minutos estamos perdiendo intensidad. No confundamos exigir con alargar por alargar.'] : [])],
    incidentReaction: incident ? `${named ?? 'Él'} ya te ha dicho lo que piensa. Ahora que siga y luego hablamos con calma.` : undefined,
    ending: isFirstTraining ? 'Bien. Has visto más o menos lo que hay. Hay dos o tres cosas que te comentaré luego.' : highLoad ? 'Ha estado bien, pero no te engañes: al final hemos perdido intensidad.' : 'Buena sesión. El grupo ha entendido lo que pedías y nadie se ha escondido.',
    report: `${attendance} disponibles. ${named ? `${named} ha sido el caso a seguir: ${poorId ? 'se ha frustrado y ha acelerado demasiado' : tired ? 'la carga le ha pasado factura al final' : 'ha respondido bien al trabajo'}.` : 'El vestuario ha respondido con seriedad.'} ${incident ? 'La incidencia ha cambiado el tono del tramo final.' : `En ${blocks} el equipo ha mantenido una respuesta reconocible.`}`,
    planningQuestion: 'El jueves está preparado. ¿Mantenemos el plan o quieres revisarlo?', keepReply: 'Bien. Yo me encargo de que entren enchufados desde el principio.', reviewReply: 'Revísalo y déjalo guardado. El jueves lo aplicamos.', authorityReaction: 'El grupo corta la conversación y vuelve al ejercicio en cuanto interviene.' }
  if (archetype === 'TRUSTED_ASSISTANT') return { archetype,
    before: pick(['Está todo listo. He separado los grupos y he dejado el material preparado. Cuando quieras arrancamos.', 'Ya están hechos los grupos y cada bloque tiene su espacio. Dame la señal y empezamos.'], key, seed),
    during: [`El bloque de ${blocks} ${lowQuality ? 'no está dando la calidad que buscábamos' : 'está funcionando'}. ${highLoad ? 'Al subir el ritmo perdemos precisión; se nota el esfuerzo acumulado.' : 'De momento no tocaría demasiado.'}`, ...(named ? [`Me da la sensación de que ${named} ${poorId ? 'necesita una corrección corta, no más presión' : tired ? 'está llegando justo a la segunda acción' : 'puede asumir algo más hoy'}.`] : [])],
    incidentReaction: incident ? 'Hay protesta, pero también carga real. Yo vigilaría cómo responde antes de tomar otra decisión.' : undefined,
    ending: isFirstTraining ? 'Buena primera sesión. Hay cosas que ajustar, pero ya tenemos una referencia real del grupo.' : `Sesión ${lowQuality ? 'mejorable' : 'útil'}. ${highLoad ? 'El trabajo ha salido mejor que el tramo físico; mañana miraría cómo recuperan.' : 'La carga y la respuesta del grupo han quedado equilibradas.'}`,
    report: `Resumen: ${attendance} jugadores. Trabajo: ${session.result?.qualityLabel?.toLowerCase() ?? 'correcto'}. Carga: ${highLoad ? 'alta, con pérdida de precisión al final' : 'controlada'}. ${named ? `Caso individual: ${named}, ${poorId ? 'con dificultades al ejecutar' : tired ? 'cargado en el tramo final' : 'con buena respuesta'}.` : 'Sin un caso individual claro.'} ${incident ? 'La incidencia merece seguimiento antes del jueves.' : 'Sin incidencias relevantes.'}`,
    planningQuestion: 'Para el jueves sigue listo el plan. ¿Lo mantenemos o quieres ajustar la segunda sesión?', keepReply: 'Perfecto. Lo dejo preparado y mañana comprobamos cómo llegan.', reviewReply: 'De acuerdo. Ajusta solo la segunda sesión y, cuando la guardes, preparo el resto.' }
  return { archetype,
    before: pick(['Bueno... yo voy preparando los petos y eso. Si quieres que haga algo concreto, me dices.', 'He dejado los conos por aquí. Creo que está todo... si necesitas otra cosa, avísame.'], key, seed),
    during: [named ? `Creo que a ${named} le está costando un poco... aunque igual es cosa mía.` : 'Parece que este ejercicio les está costando. ¿Quieres que les diga algo?', ...(highLoad ? ['Los veo un poco cansados... al final les está costando seguir el ritmo.'] : [])],
    incidentReaction: incident ? 'No sé si debería decirle algo... Dime si quieres que intervenga.' : undefined,
    ending: isFirstTraining ? 'Bueno... yo creo que no ha ido mal. Al final estaban bastante cansados.' : `Yo creo que ha ido ${lowQuality ? 'un poco justa' : 'bien'}... ${highLoad ? 'aunque al final estaban bastante cansados.' : 'Han terminado con buena cara.'} Tú sabrás mejor.`,
    report: `${attendance} jugadores han entrenado. ${highLoad ? 'Al final parecían cansados.' : 'La carga parecía normal.'} ${incident ? 'Ha pasado una cosa durante la sesión que conviene revisar.' : 'No he visto nada grave.'}`,
    planningQuestion: 'Para el jueves está lo que habíamos puesto. ¿Lo dejamos así o quieres cambiarlo?', keepReply: 'Vale, perfecto. Lo dejamos así.', reviewReply: 'Claro. Cuando lo cambies miro cómo queda.', authorityReaction: 'Un par de jugadores responden que sí, pero el ritmo apenas cambia.' }
}
