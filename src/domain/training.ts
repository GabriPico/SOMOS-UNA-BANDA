import type { TrainingBlock, TrainingIntensity } from './models'

export const TRAINING_BLOCKS: readonly TrainingBlock[] = ['Completo', 'Lúdico', 'Físico', 'Ataque posicional', 'Transición ofensiva', 'Defensa posicional / Presión', 'Transición defensiva', 'Táctica', 'Balón parado', 'Descanso']
export const FULL_SESSION_BLOCKS: readonly TrainingBlock[] = ['Completo', 'Lúdico', 'Descanso']

export type EffectLevel = '↑' | '↑↑' | '↓' | '↓↓' | 'Sin efecto'
type BlockEffect = { summary: string; attributes: string[]; effects: Record<string, EffectLevel>; familiarity: string[]; note?: string }

export const TRAINING_EFFECTS: Record<TrainingBlock, BlockEffect> = {
  Completo: { summary: 'Entrenamiento general y versátil.', attributes: ['Varias familias de atributos'], effects: { 'Condición física': '↑', Cansancio: '↑' }, familiarity: ['Formación', 'Opciones tácticas seleccionadas'], note: 'Menos efectivo que trabajar un aspecto específico.' },
  Lúdico: { summary: 'Sesión para disfrutar y hacer grupo.', attributes: [], effects: { 'Relación entre compañeros': '↑↑', 'Felicidad entreno': '↑', Autoridad: '↓', Cansancio: 'Sin efecto', 'Condición física': 'Sin efecto' }, familiarity: [], note: 'No mejora atributos y abusar de ella podrá tener consecuencias.' },
  Físico: { summary: 'Trabajo exigente de piernas y capacidad atlética.', attributes: ['Rapidez', 'Fuerza', 'Resistencia', 'Agilidad'], effects: { 'Condición física': '↑↑', Cansancio: '↑↑', Autoridad: '↑', 'Felicidad entreno': '↓' }, familiarity: [] },
  'Ataque posicional': { summary: 'Construcción de ataques organizados.', attributes: ['Técnica', 'Regate', 'Pases', 'Remate'], effects: { 'Condición física': '↑', Cansancio: '↑' }, familiarity: ['Mentalidad', 'Estilo de pase', 'Ritmo'] },
  'Transición ofensiva': { summary: 'Atacar con velocidad tras recuperar.', attributes: ['Resistencia', 'Rapidez', 'Intensidad', 'Remate'], effects: { 'Condición física': '↑', Cansancio: '↑' }, familiarity: ['Tras recuperación'] },
  'Defensa posicional / Presión': { summary: 'Orden defensivo y coordinación de la presión.', attributes: ['Comunicación', 'Entradas', 'Marcaje', 'Mentalidad'], effects: { 'Condición física': '↑', Cansancio: '↑' }, familiarity: ['Altura de presión', 'Intensidad de presión'] },
  'Transición defensiva': { summary: 'Reacción del equipo cuando pierde el balón.', attributes: ['Rapidez', 'Entradas', 'Intensidad', 'Resistencia'], effects: { 'Condición física': '↑', Cansancio: '↑' }, familiarity: ['Tras pérdida'] },
  Táctica: { summary: 'Trabajo amplio del planteamiento seleccionado.', attributes: [], effects: { Cansancio: '↓', Autoridad: '↑', 'Condición física': 'Sin efecto', 'Felicidad entreno': '↓' }, familiarity: ['Planteamiento completo', 'Formación'], note: 'Sus efectos no dependen de la intensidad.' },
  'Balón parado': { summary: 'Rutinas compartidas a balón parado.', attributes: ['Comunicación', 'Balón parado', 'Marcaje', 'Mentalidad'], effects: { 'Familiaridad balón parado': '↑↑', Cansancio: '↓', Autoridad: '↑', 'Condición física': 'Sin efecto' }, familiarity: [], note: 'Sus efectos no dependen de la intensidad.' },
  Descanso: { summary: 'Recuperación sin trabajo de campo.', attributes: [], effects: { Cansancio: '↓↓', 'Condición física': '↓', Autoridad: '↓', 'Felicidad entreno': '↓' }, familiarity: [] },
}

const levelScore: Record<EffectLevel, number> = { '↓↓': -2, '↓': -1, 'Sin efecto': 0, '↑': 1, '↑↑': 2 }
const scoreLevel = (score: number): EffectLevel => score >= 2 ? '↑↑' : score === 1 ? '↑' : score <= -2 ? '↓↓' : score === -1 ? '↓' : 'Sin efecto'

export function previewTraining(blocks: TrainingBlock[], intensity: TrainingIntensity) {
  const effects: Record<string, number> = {}
  const attributes = new Set<string>()
  const familiarity = new Set<string>()
  blocks.forEach((block) => {
    const definition = TRAINING_EFFECTS[block]
    definition.attributes.forEach((item) => attributes.add(item))
    definition.familiarity.forEach((item) => familiarity.add(item))
    Object.entries(definition.effects).forEach(([name, level]) => { effects[name] = (effects[name] ?? 0) + levelScore[level] })
  })
  const intensityNote = blocks.some((block) => block === 'Táctica' || block === 'Balón parado') ? 'Parte de la sesión no depende de la intensidad.' : `Intensidad ${intensity.toLowerCase()} aplicada a toda la sesión.`
  return { effects: Object.entries(effects).map(([name, score]) => [name, scoreLevel(score)] as const), attributes: [...attributes], familiarity: [...familiarity], intensityNote }
}
