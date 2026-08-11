import type { Player, PlayerAttribute, PlayerAttributes, PlayerTrait, PreferredFoot } from './models'
import { calculateGeneralRating, getPlayerPositions, POSITION_RATING_WEIGHTS, POSITION_TO_RATING_PROFILE } from './playerRatings'

export const ARCHETYPE_DESCRIPTIONS: Record<string, string> = {
  'Parador': 'Portero de reflejos y cabeza fría, más cómodo evitando goles que iniciando jugadas.',
  'Dominador aéreo': 'Portero valiente en las salidas, comunicativo y fiable cuando el balón vuela.',
  'Portero moderno': 'Portero seguro con los pies y atento para iniciar el juego desde atrás.',
  'Completo': 'Portero equilibrado en las facetas principales y sin una carencia marcada.',
  'Central dominante': 'Central poderoso por arriba y en el cuerpo a cuerpo, menos cómodo persiguiendo espacios.',
  'Central marcador': 'Defensa intenso, pegajoso y fuerte en entradas y marcaje.',
  'Central rápido': 'Central ágil para corregir a campo abierto, con menor dominio aéreo.',
  'Central con salida': 'Defensa capaz de iniciar el juego con criterio y buen pase.',
  'Lateral físico': 'Lateral de recorrido, rápido e intenso durante todo el partido.',
  'Lateral defensivo': 'Lateral fiable en el duelo y disciplinado para proteger su banda.',
  'Lateral ofensivo': 'Lateral profundo que aporta velocidad, pase y llegada exterior.',
  'Lateral equilibrado': 'Lateral sin extremos, solvente tanto para defender como para acompañar.',
  'Destructor': 'Mediocentro agresivo para recuperar, chocar y sostener al equipo.',
  'Organizador': 'Centrocampista que da sentido al balón mediante técnica, pase y lectura.',
  'Todoterreno': 'Medio intenso y resistente que aparece en muchas zonas.',
  'MC físico': 'Centrocampista potente y resistente, menos fino con el balón.',
  'Creador': 'Mediapunta imaginativo que encuentra pases y recibe entre líneas.',
  'Extremo velocista': 'Atacante de banda explosivo, peligroso cuando tiene metros por delante.',
  'Extremo regateador': 'Extremo ágil y técnico que busca superar rivales en el uno contra uno.',
  'Hombre objetivo': 'Delantero fuerte en el juego aéreo y de espaldas, menos peligroso atacando espacios.',
  'Delantero rápido': 'Punta móvil que amenaza los espacios con velocidad y agilidad.',
  'Delantero trabajador': 'Delantero sacrificado, intenso y resistente que incomoda siempre.',
}

export const ARCHETYPE_PROBABILITIES: Record<string, ReadonlyArray<readonly [string, number]>> = {
  POR: [['Parador', 35], ['Dominador aéreo', 20], ['Portero moderno', 10], ['Completo', 10]],
  DFC: [['Central dominante', 30], ['Central marcador', 25], ['Central rápido', 15], ['Central con salida', 10], ['Central completo', 5]],
  LAT: [['Lateral defensivo', 30], ['Lateral físico', 25], ['Lateral ofensivo', 20], ['Lateral equilibrado', 15], ['Lateral técnico', 10]],
  CAR: [['Carrilero incansable', 30], ['Carrilero reconvertido', 25], ['Carrilero ofensivo', 20], ['Carrilero asociativo', 10], ['Carrilero completo', 15]],
  MCD: [['Destructor', 30], ['Pivote posicional', 25], ['MCD físico', 20], ['Pivote constructor', 15], ['MCD completo', 10]],
  MC: [['Todoterreno', 25], ['Organizador', 20], ['MC defensivo', 20], ['MC físico', 15], ['MC técnico', 15], ['MC completo', 5]],
  MP: [['Creador', 25], ['Regateador', 20], ['Llegador', 20], ['Segundo delantero', 20], ['Mediapunta completo', 15]],
  MD_MI: [['Banda trabajador', 30], ['Banda ofensivo', 20], ['Banda defensivo', 20], ['Banda asociativo', 15], ['Banda completo', 15]],
  EXT: [['Extremo velocista', 25], ['Extremo regateador', 25], ['Extremo técnico', 20], ['Extremo goleador', 20], ['Extremo completo', 10]],
  DC: [['Hombre objetivo', 25], ['Delantero rápido', 20], ['Rematador', 20], ['Delantero trabajador', 15], ['Delantero técnico', 10], ['Segundo punta', 5], ['Delantero completo', 5]],
}

const ALL_ATTRIBUTES: PlayerAttribute[] = ['paradas', 'juegoPiesPortero', 'juegoAereoPortero', 'comunicacion', 'intensidad', 'mentalidad', 'rapidez', 'alcanceAereo', 'fuerza', 'resistencia', 'agilidad', 'tecnica', 'regate', 'pases', 'remate', 'balonParado', 'entradas', 'marcaje']
const PHYSICAL: PlayerAttribute[] = ['rapidez', 'fuerza', 'resistencia', 'agilidad']
const GOALKEEPER_RANGES: Record<PlayerAttribute, readonly [number, number]> = {
  paradas: [8, 16], juegoPiesPortero: [6, 14], juegoAereoPortero: [8, 16], comunicacion: [8, 15], mentalidad: [8, 16],
  intensidad: [6, 13], rapidez: [4, 10], alcanceAereo: [3, 9], fuerza: [6, 13], resistencia: [5, 12], agilidad: [7, 14],
  tecnica: [3, 8], regate: [1, 5], pases: [3, 8], remate: [1, 4], balonParado: [1, 6], entradas: [1, 6], marcaje: [1, 6],
}
const HIGH: Record<string, PlayerAttribute[]> = {
  'Parador': ['paradas', 'mentalidad'], 'Dominador aéreo': ['juegoAereoPortero', 'comunicacion'],
  'Portero moderno': ['juegoPiesPortero', 'mentalidad'],
  'Central dominante': ['alcanceAereo', 'fuerza', 'marcaje'], 'Central marcador': ['marcaje', 'entradas', 'intensidad'],
  'Central rápido': ['rapidez', 'agilidad', 'entradas'], 'Central con salida': ['pases', 'tecnica', 'mentalidad'],
  'Lateral físico': ['rapidez', 'resistencia', 'intensidad'], 'Lateral defensivo': ['entradas', 'marcaje', 'intensidad'],
  'Lateral ofensivo': ['rapidez', 'resistencia', 'pases'], 'Lateral equilibrado': ['rapidez', 'resistencia', 'entradas', 'marcaje', 'pases'],
  'Destructor': ['entradas', 'intensidad', 'fuerza'], 'Organizador': ['pases', 'tecnica', 'mentalidad'],
  'Todoterreno': ['resistencia', 'intensidad'], 'MC físico': ['fuerza', 'resistencia', 'intensidad'],
  'Creador': ['pases', 'tecnica', 'mentalidad'], 'Extremo velocista': ['rapidez', 'agilidad'],
  'Extremo regateador': ['regate', 'agilidad', 'tecnica'], 'Hombre objetivo': ['alcanceAereo', 'fuerza', 'remate'],
  'Delantero rápido': ['rapidez', 'agilidad', 'remate'], 'Delantero trabajador': ['intensidad', 'mentalidad', 'resistencia'],
}
const LOW: Record<string, PlayerAttribute[]> = {
  'Parador': ['juegoPiesPortero'], 'Dominador aéreo': ['juegoPiesPortero'], 'Portero moderno': ['juegoAereoPortero'],
  'Central dominante': ['rapidez', 'regate'], 'Central marcador': ['tecnica', 'regate'],
  'Central rápido': ['alcanceAereo'], 'Lateral defensivo': ['regate', 'tecnica'],
  'Lateral ofensivo': ['alcanceAereo', 'marcaje'], 'Organizador': ['fuerza', 'entradas'],
  'MC físico': ['tecnica', 'regate'], 'Creador': ['fuerza', 'entradas', 'marcaje'],
  'Extremo velocista': ['fuerza', 'marcaje', 'entradas'], 'Extremo regateador': ['fuerza', 'entradas', 'marcaje'],
  'Hombre objetivo': ['rapidez', 'agilidad', 'regate'], 'Delantero rápido': ['alcanceAereo', 'fuerza'],
}

export type PlayerSeed = Omit<Player, 'attributes'> & { targetRating: number; seed: number }
function random(seed: number) { let state = seed >>> 0; return () => ((state = Math.imul(1664525, state) + 1013904223 >>> 0) / 4294967296) }
const clamp = (value: number, minimum = 1) => Math.max(minimum, Math.min(20, Math.round(value)))

const randomInRange = (rng: () => number, [minimum, maximum]: readonly [number, number]) =>
  minimum + rng() * (maximum - minimum)

function createInitialAttributes(seedData: PlayerSeed, rng: () => number): PlayerAttributes {
  if (seedData.primaryPosition === 'POR') {
    return Object.fromEntries(ALL_ATTRIBUTES.map((attribute) =>
      [attribute, clamp(randomInRange(rng, GOALKEEPER_RANGES[attribute]), PHYSICAL.includes(attribute) ? 3 : 1)],
    )) as PlayerAttributes
  }

  const base = seedData.targetRating / 5
  const naturalPositions = [seedData.primaryPosition, ...seedData.secondaryPositions]
  const relevantAttributes = new Set(naturalPositions.flatMap((position) =>
    Object.keys(POSITION_RATING_WEIGHTS[POSITION_TO_RATING_PROFILE[position]]) as PlayerAttribute[],
  ))
  return Object.fromEntries(ALL_ATTRIBUTES.map((attribute) => {
    const goalkeeperAttribute = ['paradas', 'juegoPiesPortero', 'juegoAereoPortero'].includes(attribute)
    const value = goalkeeperAttribute
      ? randomInRange(rng, [1, 5])
      : relevantAttributes.has(attribute)
        ? base + (rng() + rng() - 1) * 3.5
        : randomInRange(rng, attribute === 'balonParado' ? [1, 10] : [3, 10])
    return [attribute, clamp(value, PHYSICAL.includes(attribute) ? 3 : 1)]
  })) as PlayerAttributes
}

export function generatePlayer(seedData: PlayerSeed): Player {
  if (!seedData.primaryPosition) throw new Error('Un jugador necesita posición principal')
  const rng = random(seedData.seed)
  const attributes = createInitialAttributes(seedData, rng)
  applyArchetype(attributes, seedData, rng)
  applyTraits(attributes, seedData.traits, rng)
  const player: Player = { ...seedData, attributes }
  delete (player as Player & { targetRating?: number; seed?: number }).targetRating
  delete (player as Player & { targetRating?: number; seed?: number }).seed

  // Ajusta solo atributos que participan en alguna posición natural; conserva contrastes del arquetipo.
  const recentlyAdjusted: PlayerAttribute[] = []
  for (let pass = 0; pass < 200; pass++) {
    const difference = seedData.targetRating - calculateGeneralRating(player)
    if (Math.abs(difference) <= .5) break
    const bestProfile = POSITION_TO_RATING_PROFILE[getPlayerPositions(player).reduce((best, position) => {
      const weights = POSITION_RATING_WEIGHTS[POSITION_TO_RATING_PROFILE[position]]
      const score = Object.entries(weights).reduce((sum, [key, weight]) => sum + attributes[key as PlayerAttribute] * weight, 0)
      return score > best.score ? { position, score } : best
    }, { position: player.primaryPosition, score: -1 }).position]
    const relevant = Object.keys(POSITION_RATING_WEIGHTS[bestProfile]) as PlayerAttribute[]
    const strengths = HIGH[seedData.archetype] ?? []
    const weaknesses = LOW[seedData.archetype] ?? []
    const candidates = relevant.filter((attribute) => difference < 0 || canIncreaseAttribute(
      attributes[attribute], strengths.includes(attribute), seedData.targetRating, rng,
    ))
    if (candidates.length === 0) break
    const ranked = candidates.map((attribute) => ({
      attribute,
      score: attributes[attribute]
        - (strengths.includes(attribute) ? 1.25 : 0)
        + (weaknesses.includes(attribute) ? 1.25 : 0)
        - (bestProfile === 'POR' ? (POSITION_RATING_WEIGHTS.POR[attribute] ?? 0) * 4 : 0)
        + (recentlyAdjusted.includes(attribute) ? 2 : 0)
        + rng() * .75,
    })).sort((left, right) => difference > 0 ? left.score - right.score : right.score - left.score)
    const attribute = ranked[0].attribute
    attributes[attribute] = clamp(attributes[attribute] + Math.sign(difference), PHYSICAL.includes(attribute) ? 3 : 1)
    recentlyAdjusted.push(attribute)
    if (recentlyAdjusted.length > 3) recentlyAdjusted.shift()
  }
  validateGeneratedPlayer(player)
  return player
}

export function validateGeneratedPlayer(player: Player) {
  if (!player.primaryPosition) throw new Error(`${player.name} no tiene posición principal`)
  for (const [attribute, value] of Object.entries(player.attributes)) {
    if (value < 1 || value > 20) throw new Error(`${player.name}: ${attribute} fuera de 1-20`)
  }
  for (const attribute of PHYSICAL) if (player.attributes[attribute] < 3) {
    throw new Error(`${player.name}: ${attribute} físico por debajo de 3`)
  }
  return true
}

function applyArchetype(attributes: PlayerAttributes, seedData: PlayerSeed, rng: () => number) {
  const base = seedData.targetRating / 5
  for (const attribute of HIGH[seedData.archetype] ?? []) {
    const strengthTarget = Math.min(18, Math.round(base + 1.5 + rng() * 1.5))
    attributes[attribute] = Math.max(attributes[attribute], strengthTarget)
    const exceptionalRoll = rng()
    if (seedData.targetRating >= 60 && exceptionalRoll < .0005) attributes[attribute] = 20
    else if (seedData.targetRating >= 60 && exceptionalRoll < .012) attributes[attribute] = 19
  }
  for (const attribute of LOW[seedData.archetype] ?? []) {
    const weaknessTarget = Math.round(Math.max(3, Math.min(10, base - 4 + rng() * 2)))
    attributes[attribute] = Math.min(attributes[attribute], weaknessTarget)
  }
}

function canIncreaseAttribute(value: number, isStrength: boolean, targetRating: number, rng: () => number) {
  const normalSoftCap = Math.min(17, Math.max(14, Math.round(targetRating / 5)))
  const softCap = isStrength ? Math.min(18, normalSoftCap + 1) : normalSoftCap
  if (value < softCap) return true
  if (value >= 18) return false
  return isStrength && rng() < .12
}

function applyTraits(attributes: PlayerAttributes, traits: PlayerTrait[], rng: () => number) {
  const changes: Partial<Record<PlayerTrait, Partial<Record<PlayerAttribute, number>>>> = {
    VETERANO: { mentalidad: 2, comunicacion: 1, rapidez: -2, agilidad: -1 }, MUY_FISICO: { fuerza: 2, resistencia: 1, intensidad: 1 },
    FRAGIL_FISICAMENTE: { fuerza: -2, resistencia: -2 }, TALENTOSO: { tecnica: 2, regate: 1, pases: 1 },
    LIMITADO_TECNICAMENTE: { tecnica: -2, regate: -2, pases: -1 }, RAPIDO: { rapidez: 2, agilidad: 1 },
    LENTO: { rapidez: -2, agilidad: -1 }, POTENTE_POR_ARRIBA: { alcanceAereo: 2 }, BAJITO: { alcanceAereo: -2, agilidad: 1 },
  }
  for (const trait of traits) for (const [attribute, amount] of Object.entries(changes[trait] ?? {})) {
    const key = attribute as PlayerAttribute
    const distributedAmount = Math.sign(amount) * Math.max(1, Math.abs(amount) - (rng() < .5 ? 1 : 0))
    const adjustedValue = attributes[key] + distributedAmount
    const traitCappedValue = distributedAmount > 0 && attributes[key] < 19
      ? Math.min(18, adjustedValue)
      : adjustedValue
    attributes[key] = clamp(traitCappedValue, PHYSICAL.includes(key) ? 3 : 1)
  }
}

export const PREFERRED_FOOT_LABELS: Record<PreferredFoot, string> = { RIGHT: 'Derecha', LEFT: 'Izquierda', BOTH: 'Ambas' }
