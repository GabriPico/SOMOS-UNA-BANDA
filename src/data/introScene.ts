import type { DialogueContext, DialogueEffect, DialogueScene } from '../domain/dialogue'
import { MANOLO_ESCUDERO, SITO } from './characters'
import { completeOnboardingMilestone } from '../domain/onboarding'

const setCoachName: DialogueEffect = (context) => {
  const name = String(context.variables.coachName).trim()
  return { ...context, game: { ...context.game, coachName: name, staff: { ...context.game.staff, members: context.game.staff.members.map((member) => member.role === 'PRIMER_ENTRENADOR' ? { ...member, name } : member) } } }
}
const evidence = (value: number, source: string): DialogueEffect => (context) => ({ ...context, game: { ...context.game, coachEvidence: [...context.game.coachEvidence, { axis: 'boldness', value, source }] } })
const completeIntro: DialogueEffect = (context) => {
  const game = { ...context.game, completedScenes: context.game.completedScenes.includes('new-game-introduction') ? context.game.completedScenes : [...context.game.completedScenes, 'new-game-introduction'] }
  return { ...context, game: completeOnboardingMilestone(game, 'INTRO') }
}
const hasRole = (role: string) => (context: DialogueContext) => context.game.staff.members.some((member) => member.role === role)

export const newGameIntroduction: DialogueScene = {
  id: 'new-game-introduction', location: 'Camp Municipal del Poblenou', startNodeId: 'opening', completionFlow: 'CONTINUE',
  nodes: {
    opening: { id: 'opening', type: 'narration', eyebrow: 'AGOSTO · MARTES · 19:08', text: 'Manolo Escudero te ha citado en el campo antes del primer entrenamiento.', actionLabel: 'ENTRAR', next: 'arrival' },
    arrival: { id: 'arrival', type: 'narration', text: 'La puerta de las oficinas está abierta. Dentro, un hombre repasa unas hojas con una calculadora que parece más vieja que el club.', next: 'hello' },
    hello: { id: 'hello', type: 'dialogue', character: MANOLO_ESCUDERO, text: '—Bueno. Ya estamos.', next: 'ask-name' },
    'ask-name': { id: 'ask-name', type: 'input', character: MANOLO_ESCUDERO, text: '—Perdona… ¿cómo era tu nombre?', input: { key: 'coachName', label: 'Tu nombre', inputType: 'text', placeholder: 'Nombre del entrenador', validate: (value) => { const length = value.trim().length; return length < 2 ? 'Escribe un nombre.' : length > 40 ? 'El nombre no puede superar los 40 caracteres.' : null } }, effects: [setCoachName], next: 'name-reply' },
    'name-reply': { id: 'name-reply', type: 'dialogue', character: MANOLO_ESCUDERO, text: ({ game }) => `—Eso. ${game.coachName}.`, next: 'amateur' },
    amateur: { id: 'amateur', type: 'dialogue', character: MANOLO_ESCUDERO, text: '—Aquí entrenamos dos días. El que trabaja llega cuando puede y alguno aparecerá cuando le dé la gana. No te vuelvas loco el primer martes.', next: 'objective' },
    objective: { id: 'objective', type: 'dialogue', character: MANOLO_ESCUDERO, text: '—Te voy a ahorrar el discurso. Este año hay que subir a 3a Catalana.', next: 'objective-choice' },
    'objective-choice': { id: 'objective-choice', type: 'choice', character: MANOLO_ESCUDERO, text: 'Manolo deja las hojas sobre la mesa y espera tu respuesta.', choices: [
      { id: 'promotion', label: 'Vamos a por el ascenso.', next: 'objective-answer-bold', effects: [evidence(2, 'Primera conversación con el presidente')] },
      { id: 'playoff', label: '¿Por playoff?', next: 'objective-answer-playoff' },
      { id: 'assess', label: 'Primero quiero ver qué equipo tenemos.', next: 'objective-answer-careful', effects: [evidence(-1, 'Primera conversación con el presidente')] },
    ] },
    'objective-answer-bold': { id: 'objective-answer-bold', type: 'dialogue', character: MANOLO_ESCUDERO, text: '—Eso quería oír. Directo o por playoff, me da igual. A Tercera.', next: 'budget' },
    'objective-answer-playoff': { id: 'objective-answer-playoff', type: 'dialogue', character: MANOLO_ESCUDERO, text: '—Me da igual cómo. Directos, playoff, en el último minuto… pero a Tercera.', next: 'budget' },
    'objective-answer-careful': { id: 'objective-answer-careful', type: 'dialogue', character: MANOLO_ESCUDERO, text: '—Míratelos. Luego subes con ellos. Directo o por playoff, eso ya es cosa tuya.', next: 'budget' },
    budget: { id: 'budget', type: 'dialogue', character: MANOLO_ESCUDERO, text: ({ game }) => `—Para el bloque deportivo hay ${game.sportsBudget.monthlyTotal} euros al mes.`, next: 'budget-question' },
    'budget-question': { id: 'budget-question', type: 'choice', character: MANOLO_ESCUDERO, text: 'Manolo da un golpecito a la cifra con el bolígrafo.', choices: [{ id: 'staff-only', label: '¿Para el cuerpo técnico?', next: 'budget-explanation' }, { id: 'understood', label: 'Para todo el equipo.', next: 'budget-confirmation' }] },
    'budget-explanation': { id: 'budget-explanation', type: 'dialogue', character: MANOLO_ESCUDERO, text: '—Para los que cobran: jugadores, ayudantes y tú. Las cuotas van al club; esa caja la llevo yo.', next: 'coach-pay' },
    'budget-confirmation': { id: 'budget-confirmation', type: 'dialogue', character: MANOLO_ESCUDERO, text: '—Eso es. Jugadores, ayudantes y tú. Una sola caja.', next: 'coach-pay' },
    'coach-pay': { id: 'coach-pay', type: 'dialogue', character: MANOLO_ESCUDERO, text: ({ game }) => `—Y tú cóbrate algo. Menos de ${game.sportsBudget.minimumCoachCompensation} al mes, no.`, next: 'coach-pay-choice' },
    'coach-pay-choice': { id: 'coach-pay-choice', type: 'choice', character: MANOLO_ESCUDERO, text: 'La cantidad ya aparece apuntada junto a tu nombre.', choices: [{ id: 'why', label: '¿Por qué hay un mínimo?', next: 'coach-pay-reason' }, { id: 'fine', label: 'De acuerdo.', next: 'assistant-check' }] },
    'coach-pay-reason': { id: 'coach-pay-reason', type: 'dialogue', character: MANOLO_ESCUDERO, text: '—Porque trabajar gratis queda muy bien hasta que llevas tres derrotas y llueve. Déjalo así.', next: 'assistant-check' },
    'assistant-check': { id: 'assistant-check', type: 'condition', when: hasRole('SEGUNDO_ENTRENADOR'), then: 'assistant', otherwise: 'delegate-check' },
    assistant: { id: 'assistant', type: 'dialogue', character: MANOLO_ESCUDERO, text: ({ game }) => { const person = game.staff.members.find((member) => member.role === 'SEGUNDO_ENTRENADOR')!; return `—${person.name.split(' ')[0]} estará contigo. Es joven, tiene ganas y quiere aprender. Su padre es socio de hace años.` }, next: 'assistant-note' },
    'assistant-note': { id: 'assistant-note', type: 'dialogue', character: MANOLO_ESCUDERO, text: '—Dale una oportunidad. No te digo que tenga que llevar el equipo.', next: 'delegate-check' },
    'delegate-check': { id: 'delegate-check', type: 'condition', when: hasRole('DELEGADO'), then: 'delegate', otherwise: 'alone-check' },
    delegate: { id: 'delegate', type: 'dialogue', character: MANOLO_ESCUDERO, text: ({ game }) => { const person = game.staff.members.find((member) => member.role === 'DELEGADO')!; return `—También está ${person.name.split(' ')[0]}. Lleva aquí toda la vida. Con ese no me hagas inventos.` }, next: 'physio-check' },
    'alone-check': { id: 'alone-check', type: 'condition', when: ({ game }) => game.staff.members.length === 1, then: 'alone', otherwise: 'physio-check' },
    alone: { id: 'alone', type: 'dialogue', character: MANOLO_ESCUDERO, text: '—De momento estás tú solo. Si necesitas a alguien, vienes y me lo dices. Antes de prometerle dinero a nadie.', next: 'physio-check' },
    'physio-check': { id: 'physio-check', type: 'condition', when: hasRole('FISIO'), then: 'physio-member', otherwise: 'physio-contact-check' },
    'physio-member': { id: 'physio-member', type: 'dialogue', character: MANOLO_ESCUDERO, text: ({ game }) => { const person = game.staff.members.find((member) => member.role === 'FISIO')!; return `—Y este año tenemos hasta fisio del club: ${person.name}. No te acostumbres, que esto aquí es un lujo.` }, next: 'sito-action' },
    'physio-contact-check': { id: 'physio-contact-check', type: 'condition', when: ({ game }) => game.physiotherapyContacts.length > 0, then: 'physio-contact', otherwise: 'sito-action' },
    'physio-contact': { id: 'physio-contact', type: 'dialogue', character: MANOLO_ESCUDERO, text: ({ game }) => `—Si alguien necesita fisio, tenemos el contacto de ${game.physiotherapyContacts[0].name}. Va por sesiones y normalmente se lo paga cada jugador.`, next: 'sito-action' },
    'sito-action': { id: 'sito-action', type: 'narration', text: 'Alguien abre la puerta sin llamar. Lleva un manojo de llaves en una mano y una bolsa de balones en la otra.', next: 'sito' },
    sito: { id: 'sito', type: 'dialogue', character: SITO, text: '—Manolo, ¿tienes tú las llaves del almacén o las ha vuelto a coger el juvenil?', next: 'sito-intro' },
    'sito-intro': { id: 'sito-intro', type: 'dialogue', character: MANOLO_ESCUDERO, text: '—Este es Sito. Se ocupa del campo y normalmente sabe dónde está todo… o quién lo tiene.', next: 'favor-hint' },
    'favor-hint': { id: 'favor-hint', type: 'dialogue', character: MANOLO_ESCUDERO, text: '—Si hace falta algo que no entra en el presupuesto, primero me preguntas a mí.', next: 'favor-choice' },
    'favor-choice': { id: 'favor-choice', type: 'choice', character: MANOLO_ESCUDERO, text: 'Lo dice mientras guarda la calculadora en un cajón.', choices: [{ id: 'more-money', label: '¿Hay más dinero?', next: 'not-money' }, { id: 'understood', label: 'Entendido.', next: 'squad' }] },
    'not-money': { id: 'not-money', type: 'dialogue', character: MANOLO_ESCUDERO, text: '—Yo no he dicho eso.', next: 'squad' },
    squad: { id: 'squad', type: 'dialogue', character: MANOLO_ESCUDERO, text: '—Hay unos cuantos del año pasado y otros que están probando. Míratelos tú, que para eso eres el entrenador.', next: 'silence' },
    silence: { id: 'silence', type: 'narration', text: 'Fuera se oye botar un balón contra la pared. Manolo se queda unos segundos callado.', next: 'finish-one' },
    'finish-one': { id: 'finish-one', type: 'dialogue', character: MANOLO_ESCUDERO, text: ({ game }) => { const assistant = game.staff.members.find((member) => member.role === 'SEGUNDO_ENTRENADOR'); return assistant ? `—Bueno, ya sabes lo importante. ${assistant.name.split(' ')[0]} está por ahí. Ve con él.` : '—Bueno, ya sabes lo importante. Sal ahí y mira con quién cuentas.' }, next: 'finish-choice' },
    'finish-choice': { id: 'finish-choice', type: 'choice', character: MANOLO_ESCUDERO, text: 'Manolo señala la puerta con la barbilla.', choices: [{ id: 'now', label: '¿Ahora?', next: 'finish-two' }, { id: 'go', label: 'Vamos.', next: 'end' }] },
    'finish-two': { id: 'finish-two', type: 'dialogue', character: MANOLO_ESCUDERO, text: '—¿Cuándo querías empezar?', next: 'end' },
    end: { id: 'end', type: 'end', text: 'Fuera empieza a moverse el club.', actionLabel: 'CONTINUAR', effects: [completeIntro] },
  },
}
