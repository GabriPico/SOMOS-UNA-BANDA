import type { DialogueContext, DialogueEffect, DialogueScene } from '../domain/dialogue'
import { MANOLO_ESCUDERO } from './characters'

const setCoachName: DialogueEffect = (context) => {
  const name = String(context.variables.coachName).trim()
  return { ...context, game: { ...context.game, coachName: name, staff: { ...context.game.staff, members: context.game.staff.members.map((member) => member.role === 'PRIMER_ENTRENADOR' ? { ...member, name } : member) } } }
}
const setCoachAge: DialogueEffect = (context) => {
  const age = Number(context.variables.coachAge)
  return { ...context, game: { ...context.game, coachAge: age, staff: { ...context.game.staff, members: context.game.staff.members.map((member) => member.role === 'PRIMER_ENTRENADOR' ? { ...member, age } : member) } } }
}
const evidence = (value: number, source: string): DialogueEffect => (context) => ({ ...context, game: { ...context.game, coachEvidence: [...context.game.coachEvidence, { axis: 'boldness', value, source }] } })
const completeIntro: DialogueEffect = (context) => ({ ...context, game: { ...context.game, completedScenes: context.game.completedScenes.includes('new-game-introduction') ? context.game.completedScenes : [...context.game.completedScenes, 'new-game-introduction'] } })
const hasRole = (role: string) => (context: DialogueContext) => context.game.staff.members.some((member) => member.role === role)

export const newGameIntroduction: DialogueScene = {
  id: 'new-game-introduction', location: 'Camp Municipal del Poblenou', startNodeId: 'opening',
  nodes: {
    opening: { id: 'opening', type: 'narration', eyebrow: 'AGOSTO · MARTES · 19:08', text: 'Manolo Escudero te ha citado en el campo antes del primer entrenamiento.', actionLabel: 'ENTRAR', next: 'arrival' },
    arrival: { id: 'arrival', type: 'narration', text: 'La puerta de las oficinas está abierta. Dentro, un hombre repasa unas hojas con una calculadora que parece más vieja que el club.', next: 'hello' },
    hello: { id: 'hello', type: 'dialogue', character: MANOLO_ESCUDERO, text: '—Bueno. Ya estamos.', next: 'ask-name' },
    'ask-name': { id: 'ask-name', type: 'input', character: MANOLO_ESCUDERO, text: '—Perdona… ¿cómo era tu nombre?', input: { key: 'coachName', label: 'Tu nombre', inputType: 'text', placeholder: 'Nombre del entrenador', validate: (value) => { const length = value.trim().length; return length < 2 ? 'Escribe un nombre.' : length > 40 ? 'El nombre no puede superar los 40 caracteres.' : null } }, effects: [setCoachName], next: 'name-reply' },
    'name-reply': { id: 'name-reply', type: 'dialogue', character: MANOLO_ESCUDERO, text: ({ game }) => `—Eso. ${game.coachName}.`, next: 'ask-age' },
    'ask-age': { id: 'ask-age', type: 'input', character: MANOLO_ESCUDERO, text: '—Y recuérdame una cosa más. ¿Cuántos años tienes?', input: { key: 'coachAge', label: 'Tu edad', inputType: 'number', placeholder: 'Edad', validate: (value) => { const age = Number(value); return !Number.isInteger(age) || age < 18 || age > 80 ? 'Introduce una edad entre 18 y 80 años.' : null } }, effects: [setCoachAge], next: 'amateur' },
    amateur: { id: 'amateur', type: 'dialogue', character: MANOLO_ESCUDERO, text: '—Aquí entrenamos dos días. El que trabaja llega cuando puede y alguno aparecerá cuando le dé la gana. No te vuelvas loco el primer martes.', next: 'last-year' },
    'last-year': { id: 'last-year', type: 'dialogue', character: MANOLO_ESCUDERO, text: '—El año pasado estuvimos a media tabla. Este año quiero vernos arriba.', next: 'expectation-choice' },
    'expectation-choice': { id: 'expectation-choice', type: 'choice', character: MANOLO_ESCUDERO, text: 'Manolo deja las hojas sobre la mesa y espera tu respuesta.', choices: [
      { id: 'promotion', label: 'Tenemos que intentar subir.', next: 'expectation-answer-bold', effects: [evidence(2, 'Primera conversación con el presidente')] },
      { id: 'assess', label: 'Primero quiero ver qué equipo tenemos.', next: 'expectation-answer-careful', effects: [evidence(-1, 'Primera conversación con el presidente')] },
      { id: 'resources', label: '¿Con qué recursos cuento?', next: 'expectation-answer-resources' },
    ] },
    'expectation-answer-bold': { id: 'expectation-answer-bold', type: 'dialogue', character: MANOLO_ESCUDERO, text: '—Eso está bien. Primero métete en el playoff y luego ya hablamos de celebraciones.', next: 'budget' },
    'expectation-answer-careful': { id: 'expectation-answer-careful', type: 'dialogue', character: MANOLO_ESCUDERO, text: '—Míratelos. Pero al final de temporada quiero al equipo en el playoff.', next: 'budget' },
    'expectation-answer-resources': { id: 'expectation-answer-resources', type: 'dialogue', character: MANOLO_ESCUDERO, text: '—Los que hay. Y con ellos quiero estar en el playoff. Ahora vamos al dinero.', next: 'budget' },
    budget: { id: 'budget', type: 'dialogue', character: MANOLO_ESCUDERO, text: ({ game }) => `—Para ti y la gente que te ayude tenemos ${game.staff.budget.monthlyTotal} euros al mes. Lo tuyo son ${game.staff.budget.headCoachMonthlyCompensation}.`, next: 'assistant-check' },
    'assistant-check': { id: 'assistant-check', type: 'condition', when: hasRole('SEGUNDO_ENTRENADOR'), then: 'assistant', otherwise: 'delegate-check' },
    assistant: { id: 'assistant', type: 'dialogue', character: MANOLO_ESCUDERO, text: ({ game }) => { const person = game.staff.members.find((member) => member.role === 'SEGUNDO_ENTRENADOR')!; return `—${person.name.split(' ')[0]} estará contigo. Es joven, tiene ganas y quiere aprender. Su padre es socio de hace años.` }, next: 'assistant-note' },
    'assistant-note': { id: 'assistant-note', type: 'dialogue', character: MANOLO_ESCUDERO, text: '—Dale una oportunidad. No te digo que tenga que llevar el equipo.', next: 'delegate-check' },
    'delegate-check': { id: 'delegate-check', type: 'condition', when: hasRole('DELEGADO'), then: 'delegate', otherwise: 'alone-check' },
    delegate: { id: 'delegate', type: 'dialogue', character: MANOLO_ESCUDERO, text: ({ game }) => { const person = game.staff.members.find((member) => member.role === 'DELEGADO')!; return `—También está ${person.name.split(' ')[0]}. Lleva aquí toda la vida. Con ese no me hagas inventos.` }, next: 'physio-check' },
    'alone-check': { id: 'alone-check', type: 'condition', when: ({ game }) => game.staff.members.length === 1, then: 'alone', otherwise: 'physio-check' },
    alone: { id: 'alone', type: 'dialogue', character: MANOLO_ESCUDERO, text: '—De momento estás tú solo. Si necesitas a alguien, vienes y me lo dices. Antes de prometerle dinero a nadie.', next: 'physio-check' },
    'physio-check': { id: 'physio-check', type: 'condition', when: hasRole('FISIO'), then: 'physio-member', otherwise: 'physio-candidate-check' },
    'physio-member': { id: 'physio-member', type: 'dialogue', character: MANOLO_ESCUDERO, text: ({ game }) => { const person = game.staff.members.find((member) => member.role === 'FISIO')!; return `—Y ${person.name.split(' ')[0]} quizá pueda venir algún domingo. Tener fisio, tener… no. Pero si hace falta se le escribe.` }, next: 'field-action' },
    'physio-candidate-check': { id: 'physio-candidate-check', type: 'condition', when: ({ game }) => game.staff.candidates.some((person) => person.role === 'FISIO'), then: 'physio-possible', otherwise: 'field-action' },
    'physio-possible': { id: 'physio-possible', type: 'dialogue', character: MANOLO_ESCUDERO, text: '—Hay una fisio de por aquí que quizá pueda venir algún domingo. No está contratada. Si hace falta, se le escribe y se pregunta.', next: 'field-action' },
    'field-action': { id: 'field-action', type: 'narration', text: ({ game }) => `${game.staff.clubPersonnel.name} asoma por la puerta con un manojo de llaves en la mano.`, next: 'field-manager' },
    'field-manager': { id: 'field-manager', type: 'dialogue', character: ({ game }) => ({ id: game.staff.clubPersonnel.id, name: game.staff.clubPersonnel.name, role: 'Encargado del campo' }), text: '—Manolo, ¿la llave del almacén la tienes tú o ha vuelto a desaparecer?', next: 'field-intro' },
    'field-intro': { id: 'field-intro', type: 'dialogue', character: MANOLO_ESCUDERO, text: ({ game }) => `—Este es ${game.staff.clubPersonnel.name.split(' ')[0]}. Se ocupa del campo y acaba arreglando lo que rompemos los demás.`, next: 'favor-hint' },
    'favor-hint': { id: 'favor-hint', type: 'dialogue', character: MANOLO_ESCUDERO, text: '—Si hace falta algo que no entra en el presupuesto, primero me preguntas a mí.', next: 'favor-choice' },
    'favor-choice': { id: 'favor-choice', type: 'choice', character: MANOLO_ESCUDERO, text: 'Lo dice mientras guarda la calculadora en un cajón.', choices: [{ id: 'more-money', label: '¿Hay más dinero?', next: 'not-money' }, { id: 'understood', label: 'Entendido.', next: 'squad' }] },
    'not-money': { id: 'not-money', type: 'dialogue', character: MANOLO_ESCUDERO, text: '—Yo no he dicho eso.', next: 'squad' },
    squad: { id: 'squad', type: 'dialogue', character: MANOLO_ESCUDERO, text: '—La plantilla ya está hecha. Son veinte. Más o menos. Míratelos tú, que para eso eres el entrenador.', next: 'silence' },
    silence: { id: 'silence', type: 'narration', text: 'Fuera se oye botar un balón contra la pared. Manolo se queda unos segundos callado.', next: 'finish-one' },
    'finish-one': { id: 'finish-one', type: 'dialogue', character: MANOLO_ESCUDERO, text: '—Bueno. Creo que está todo. Los tienes ahí fuera.', next: 'finish-choice' },
    'finish-choice': { id: 'finish-choice', type: 'choice', character: MANOLO_ESCUDERO, text: 'Manolo señala la puerta con la barbilla.', choices: [{ id: 'now', label: '¿Ahora?', next: 'finish-two' }, { id: 'go', label: 'Vamos.', next: 'end' }] },
    'finish-two': { id: 'finish-two', type: 'dialogue', character: MANOLO_ESCUDERO, text: '—¿Cuándo querías empezar?', next: 'end' },
    end: { id: 'end', type: 'end', text: 'El primer entrenamiento está a punto de comenzar.', actionLabel: 'IR AL VESTUARIO', effects: [completeIntro] },
  },
}
