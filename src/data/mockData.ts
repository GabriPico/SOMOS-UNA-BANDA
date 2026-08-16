import type {
  ClubEvent,
  ClubStatus,
  LeagueTeam,
  LeagueSeasonData,
  LeagueMatch,
  GoalEvent,
  RivalPlayer,
  RivalTeamProfile,
  LeagueSanction,
  MatchPreview,
  PlayStyle,
  PostMatchSummary,
  Tactics,
  TacticalPlan,
  TacticalFamiliarity,
} from '../domain/models'
import { generatePlayer, type PlayerSeed } from '../domain/playerGeneration'
import { validateGoalEvents } from '../domain/leagueScorers'
import { validateSanctionPlayers } from '../domain/leagueSanctions'

export const TOTAL_LEAGUE_MATCHDAYS = 22
export const CURRENT_MATCHDAY = 10

const attributes = (
  porteria: number,
  defensa: number,
  tecnica: number,
  pase: number,
  velocidad: number,
  resistencia: number,
  fuerza: number,
  definicion: number,
  inteligencia: number,
  aereo: number,
  desborde: number,
): Record<string, number> => ({
  Portería: porteria,
  Defensa: defensa,
  Técnica: tecnica,
  Pase: pase,
  Velocidad: velocidad,
  Resistencia: resistencia,
  Fuerza: fuerza,
  Definición: definicion,
  'Inteligencia táctica': inteligencia,
  'Juego aéreo': aereo,
  Desborde: desborde,
})

export const clubStatus: ClubStatus = {
  name: 'FC Poblenou',
  seasonGoal: 'Pelear el ascenso en una liga de 12 equipos',
  league: '4a Catalana',
  matchday: CURRENT_MATCHDAY,
  authority: 62,
  dressingRoomCohesion: 58,
  physicalCondition: 71,
  presidentRelationship: 54,
  budget: 'Ajustado',
}

const legacyPlayers = [
  {
    id: 1,
    name: 'Arnau Casals',
    age: 31,
    position: 'POR',
    role: 'Portero titular',
    morale: 'Sereno',
    fitness: 86,
    happiness: 72,
    attributes: attributes(69, 34, 38, 45, 41, 62, 58, 18, 55, 61, 21),
  },
  {
    id: 2,
    name: 'Pau Martí',
    age: 22,
    position: 'POR',
    role: 'Portero suplente',
    morale: 'Paciente',
    fitness: 79,
    happiness: 65,
    attributes: attributes(58, 29, 35, 39, 47, 66, 52, 16, 48, 54, 25),
  },
  {
    id: 3,
    name: 'Nil Ferrer',
    age: 27,
    position: 'LD',
    role: 'Lateral profundo',
    morale: 'Motivado',
    fitness: 82,
    happiness: 75,
    attributes: attributes(10, 61, 54, 57, 70, 74, 59, 31, 58, 49, 62),
  },
  {
    id: 4,
    name: 'Marc Soler',
    age: 34,
    position: 'LI',
    role: 'Lateral sobrio',
    morale: 'Cansado',
    fitness: 64,
    happiness: 58,
    attributes: attributes(9, 63, 49, 52, 55, 60, 64, 27, 61, 56, 46),
  },
  {
    id: 5,
    name: 'Oriol Roca',
    age: 24,
    position: 'LD',
    role: 'Lateral reserva',
    morale: 'Impaciente',
    fitness: 88,
    happiness: 49,
    attributes: attributes(8, 55, 47, 50, 67, 72, 55, 29, 48, 43, 55),
  },
  {
    id: 6,
    name: 'Gerard Pons',
    age: 29,
    position: 'LI',
    role: 'Lateral mixto',
    morale: 'Estable',
    fitness: 76,
    happiness: 68,
    attributes: attributes(8, 59, 55, 56, 63, 69, 57, 32, 57, 50, 57),
  },
  {
    id: 7,
    name: 'Víctor Sanz',
    age: 32,
    position: 'DFC',
    role: 'Central corrector',
    morale: 'Líder',
    fitness: 73,
    happiness: 78,
    attributes: attributes(7, 69, 44, 51, 48, 66, 72, 35, 67, 70, 30),
  },
  {
    id: 8,
    name: 'Iker Navarro',
    age: 25,
    position: 'DFC',
    role: 'Central contundente',
    morale: 'Confiado',
    fitness: 81,
    happiness: 70,
    attributes: attributes(6, 66, 41, 47, 52, 68, 75, 36, 58, 73, 28),
  },
  {
    id: 9,
    name: 'Dani Serra',
    age: 28,
    position: 'DFC',
    role: 'Central suplente',
    morale: 'Discreto',
    fitness: 77,
    happiness: 61,
    attributes: attributes(7, 58, 43, 45, 50, 64, 68, 30, 55, 64, 26),
  },
  {
    id: 10,
    name: 'Pol Vidal',
    age: 30,
    position: 'MCD',
    role: 'Medio defensivo',
    morale: 'Aplicado',
    fitness: 80,
    happiness: 74,
    attributes: attributes(8, 62, 57, 61, 53, 73, 66, 38, 68, 58, 39),
  },
  {
    id: 11,
    name: 'Sergi Molina',
    age: 26,
    position: 'MC',
    role: 'Organizador',
    morale: 'Fino',
    fitness: 78,
    happiness: 76,
    attributes: attributes(8, 51, 66, 70, 58, 69, 54, 42, 64, 44, 50),
  },
  {
    id: 12,
    name: 'Jordi Alemany',
    age: 33,
    position: 'MC',
    role: 'Interior veterano',
    morale: 'Tocado',
    fitness: 61,
    happiness: 55,
    attributes: attributes(7, 55, 61, 65, 45, 57, 58, 45, 63, 48, 43),
  },
  {
    id: 13,
    name: 'Àlex Costa',
    age: 21,
    position: 'MC',
    role: 'Medio de recorrido',
    morale: 'Ambicioso',
    fitness: 90,
    happiness: 69,
    attributes: attributes(7, 52, 58, 59, 66, 78, 56, 40, 56, 45, 54),
  },
  {
    id: 14,
    name: 'Miquel Font',
    age: 29,
    position: 'MC',
    role: 'Medio trabajador',
    morale: 'Estable',
    fitness: 84,
    happiness: 71,
    attributes: attributes(8, 56, 54, 58, 59, 76, 62, 37, 59, 51, 45),
  },
  {
    id: 15,
    name: 'Biel Torres',
    age: 23,
    position: 'MP',
    role: 'Mediapunta',
    morale: 'Inspirado',
    fitness: 75,
    happiness: 73,
    attributes: attributes(6, 38, 68, 64, 61, 62, 45, 57, 60, 35, 66),
  },
  {
    id: 16,
    name: 'Raúl Benítez',
    age: 27,
    position: 'ED',
    role: 'Extremo derecho',
    morale: 'Irregular',
    fitness: 72,
    happiness: 60,
    attributes: attributes(6, 35, 62, 56, 72, 65, 48, 52, 49, 37, 70),
  },
  {
    id: 17,
    name: 'Joel Prat',
    age: 24,
    position: 'EI',
    role: 'Extremo izquierdo',
    morale: 'Eléctrico',
    fitness: 83,
    happiness: 77,
    attributes: attributes(6, 34, 64, 55, 76, 68, 46, 54, 50, 36, 73),
  },
  {
    id: 18,
    name: 'Hugo Vives',
    age: 30,
    position: 'DC',
    role: 'Delantero referencia',
    morale: 'Ansioso',
    fitness: 69,
    happiness: 57,
    attributes: attributes(7, 40, 53, 47, 56, 63, 70, 66, 51, 69, 38),
  },
  {
    id: 19,
    name: 'Adam Puig',
    age: 20,
    position: 'DC',
    role: 'Delantero móvil',
    morale: 'Con hambre',
    fitness: 87,
    happiness: 66,
    attributes: attributes(6, 31, 56, 48, 72, 70, 55, 61, 46, 49, 59),
  },
  {
    id: 20,
    name: 'Enric Grau',
    age: 36,
    position: 'DC',
    role: 'Recurso de área',
    morale: 'Veterano',
    fitness: 58,
    happiness: 63,
    attributes: attributes(6, 42, 48, 43, 38, 52, 73, 60, 55, 76, 30),
  },
]

const existingTeamMetadata = [
  { id: 1, form: 71, appearances: 4, goals: 0, personality: 'Sereno', income: 500 },
  { id: 3, form: 68, appearances: 3, goals: 0, personality: 'Motivado', income: 0 },
  { id: 11, form: 74, appearances: 4, goals: 1, personality: 'Organizador', income: 300 },
  { id: 15, form: 63, appearances: 3, goals: 2, personality: 'Ambicioso', income: -200 },
]

const playerSeeds: PlayerSeed[] = [
  [1, 'Arnau Casals', 31, 'POR', [], 'RIGHT', 'Parador', [], 72, 101],
  [2, 'Pau Martí', 22, 'POR', [], 'LEFT', 'Dominador aéreo', [], 64, 102],
  [3, 'Nil Ferrer', 27, 'DFC', [], 'RIGHT', 'Central dominante', ['POTENTE_POR_ARRIBA'], 76, 103],
  [4, 'Marc Soler', 34, 'DFC', [], 'LEFT', 'Central marcador', ['VETERANO'], 72, 104],
  [5, 'Oriol Roca', 24, 'DFC', [], 'RIGHT', 'Central rápido', ['RAPIDO'], 68, 105],
  [6, 'Gerard Pons', 29, 'DFC', [], 'RIGHT', 'Central con salida', [], 63, 106],
  [7, 'Víctor Sanz', 32, 'LD', ['CAD'], 'RIGHT', 'Lateral físico', ['VETERANO'], 74, 107],
  [8, 'Iker Navarro', 25, 'LD', ['DFC'], 'RIGHT', 'Lateral defensivo', [], 67, 108],
  [9, 'Dani Serra', 28, 'LI', ['CAI'], 'LEFT', 'Lateral ofensivo', [], 69, 109],
  [10, 'Pol Vidal', 30, 'LI', ['CAI'], 'LEFT', 'Lateral equilibrado', [], 64, 110],
  [11, 'Sergi Molina', 26, 'MCD', ['MC'], 'RIGHT', 'Destructor', ['MUY_FISICO'], 78, 111],
  [12, 'Jordi Alemany', 33, 'MC', [], 'RIGHT', 'Organizador', ['VETERANO'], 73, 112],
  [13, 'Àlex Costa', 21, 'MC', ['MCD'], 'BOTH', 'Todoterreno', [], 70, 113],
  [14, 'Miquel Font', 29, 'MC', ['MCD'], 'RIGHT', 'MC físico', [], 66, 114],
  [15, 'Biel Torres', 23, 'MP', ['MC'], 'LEFT', 'Creador', ['TALENTOSO'], 62, 115],
  [16, 'Raúl Benítez', 27, 'ED', ['MD'], 'RIGHT', 'Extremo velocista', ['RAPIDO'], 75, 116],
  [17, 'Joel Prat', 24, 'EI', ['MI'], 'LEFT', 'Extremo regateador', [], 69, 117],
  [18, 'Hugo Vives', 30, 'DC', [], 'RIGHT', 'Hombre objetivo', ['POTENTE_POR_ARRIBA'], 81, 118],
  [19, 'Adam Puig', 20, 'DC', ['ED'], 'RIGHT', 'Delantero rápido', ['BAJITO'], 71, 119],
  [20, 'Enric Grau', 36, 'DC', [], 'LEFT', 'Delantero trabajador', ['VETERANO'], 65, 120],
].map(([id, name, age, primaryPosition, secondaryPositions, preferredFoot, archetype, traits, targetRating, seed], index) => {
  const old = legacyPlayers[index]
  const table = existingTeamMetadata.find((entry) => entry.id === id)
  return {
    id, name, age, primaryPosition, secondaryPositions, preferredFoot, archetype, traits,
    targetRating, seed, role: old.role, morale: old.morale, fitness: old.fitness,
    form: table?.form ?? old.fitness, appearances: table?.appearances ?? (index % 5),
    goals: table?.goals ?? (primaryPosition === 'DC' ? index % 3 : 0),
    personality: table?.personality ?? old.morale, happiness: old.happiness,
    income: table?.income ?? 0,
  } as PlayerSeed
})

export const players = playerSeeds.map(generatePlayer)
/** Alias temporal para consumidores existentes; ambas pantallas usan la misma fuente. */
export const teamPlayers = players

export const clubEvents: ClubEvent[] = [
  {
    title: 'El presidente pide calma',
    speaker: 'Presidente',
    detail:
      'El ascenso es el objetivo, pero el club no puede permitirse empezar la temporada con urgencias.',
  },
  {
    title: 'El vestuario quiere un once claro',
    speaker: 'Capitán',
    detail:
      'Varios jugadores esperan saber pronto cuál será la base del equipo para la primera jornada.',
  },
  {
    title: 'Aviso del ayudante',
    speaker: 'Ayudante',
    detail:
      'La plantilla está bien de piernas, aunque algunos veteranos llegan justos para repetir esfuerzos.',
  },
]

export const playStyles: PlayStyle[] = [
  'Equilibrada',
  'Juego directo',
  'Posesión',
  'Repliegue y contraataque',
]

export const tactics: Tactics = {
  formation: '4-2-3-1',
  selectedStyle: 'Equilibrada',
  availableStyles: playStyles,
  startingEleven: [1, 3, 7, 8, 4, 10, 11, 16, 15, 17, 18],
  bench: [2, 5, 6, 9, 13, 19, 20],
}

export const initialTacticalPlan: TacticalPlan = {
  formation: '4-4-2', mentality: 'Equilibrada', passingStyle: 'Mixto', tempo: 'Medio',
  afterRecovery: 'Contraataque', pressingHeight: 'Media', pressingIntensity: 'Alta',
  afterLoss: 'Presión tras pérdida', timeWasting: 'No', aggression: 'Sí',
}

/** Mock preparado para memoria por opción; todavía no evoluciona. */
export const tacticalFamiliarity: TacticalFamiliarity = {
  overall: 68,
  formation: { '4-4-2': 78, '4-3-3': 42, '4-2-3-1': 65, '3-5-2': 12, '5-4-1': 18 },
  instructions: {
    mentality: { Ofensiva: 30, Equilibrada: 82, Cauta: 51 },
    passingStyle: { 'En corto': 48, Mixto: 74, Directo: 39 }, tempo: { Alto: 44, Medio: 71, Bajo: 35 },
    afterRecovery: { Contraataque: 66, Equilibrada: 58, 'Mantener posición': 29 },
    pressingHeight: { Alta: 41, Media: 72, Baja: 37 }, pressingIntensity: { Alta: 69, Media: 57, Baja: 25 },
    afterLoss: { 'Presión tras pérdida': 64, Mixto: 56, Repliegue: 31 },
  },
}

export const matchPreview: MatchPreview = {
  homeTeam: 'UE Montclar',
  awayTeam: 'Atlètic Vallirana',
  venue: 'Municipal de Montclar',
  context: 'Primera jornada de liga. El club empieza en casa con la grada cerca del banquillo.',
  opponentNote:
    'Rival intenso, acostumbrado a defender bajo y buscar segundas jugadas.',
}

export const postMatchSummary: PostMatchSummary = {
  score: 'UE Montclar 1 - 1 Atlètic Vallirana',
  headline: 'Empate serio, con margen para ajustar la idea de juego',
  notes: [
    'El equipo compitió bien, pero le costó cerrar el área en los últimos minutos.',
    'La autoridad del entrenador se mantiene estable tras un debut sin sobresaltos.',
    'El vestuario valora que el plan fuera reconocible desde el inicio.',
  ],
}

export const leagueTeams: LeagueTeam[] = [
  { id: 'fc-poblenou', name: 'FC Poblenou' },
  { id: 'ona-sant-adria', name: 'Ona Sant Adrià FC' },
  { id: 'la-salut-pere-gol', name: 'La Salut Pere Gol AE' },
  { id: 'pomar', name: 'Pomar CD' },
  { id: 'sistrells', name: 'Sistrells CF' },
  { id: 'torre-fuerte-cervello', name: 'Torre Fuerte Cervelló FC' },
  { id: 'legion', name: 'Legión CF' },
  { id: 'pena-pasion-xeneize', name: 'Peña Pasión Xeneize Barcelona' },
  { id: 'pujadas', name: 'Pujadas CD' },
  { id: 'young-talent-badalona', name: 'Young Talent Badalona' },
  { id: 'besos-baro-de-viver', name: 'Besòs Baró de Viver' },
  { id: 'gramenet', name: 'Gramenet UD' },
]

function createMockLeagueMatches(teams: LeagueTeam[], matchdays: number): LeagueMatch[] {
  const rotationOffset = 4
  const rotation = teams.map((_, index) => teams[(index + rotationOffset) % teams.length].id)
  const teamIndexes = new Map(teams.map((team, index) => [team.id, index]))
  const matches: LeagueMatch[] = []

  for (let matchday = 1; matchday <= matchdays; matchday += 1) {
    for (let pairing = 0; pairing < rotation.length / 2; pairing += 1) {
      const firstTeamId = rotation[pairing]
      const secondTeamId = rotation[rotation.length - 1 - pairing]
      const homeTeamId = matchday % 2 === 0 ? secondTeamId : firstTeamId
      const awayTeamId = matchday % 2 === 0 ? firstTeamId : secondTeamId
      const homeIndex = teamIndexes.get(homeTeamId) ?? 0
      const awayIndex = teamIndexes.get(awayTeamId) ?? 0
      const played = matchday <= CURRENT_MATCHDAY
      const kickoff = new Date(Date.UTC(2026, 8, 6 + (matchday - 1) * 7))
      matches.push({
        id: `j${matchday}-p${pairing + 1}`,
        matchday,
        homeTeamId,
        awayTeamId,
        homeGoals: played ? (matchday + homeIndex * 2 + awayIndex) % 4 : 0,
        awayGoals: played ? (matchday * 2 + awayIndex + homeIndex) % 3 : 0,
        status: played ? 'played' : 'scheduled',
        date: kickoff.toISOString().slice(0, 10),
        time: ['12:00', '16:00', '17:00', '18:30', '19:00', '20:00'][pairing],
      })
    }
    rotation.splice(1, 0, rotation.pop() as string)
  }

  return matches
}

export const leagueMatches = createMockLeagueMatches(leagueTeams, TOTAL_LEAGUE_MATCHDAYS)

const rivalFirstNames = ['Adrià', 'Eric', 'Jan', 'Kevin']
const rivalLastNames = ['Moreno', 'Campos', 'Ruiz', 'Santos', 'López', 'García', 'Navarro', 'Romero', 'Torres', 'Vega', 'Cano']

export const rivalPlayers: RivalPlayer[] = leagueTeams
  .filter((team) => team.id !== 'fc-poblenou')
  .flatMap((team, teamIndex) => rivalFirstNames.map((firstName, playerIndex) => {
    const positions = ['POR', 'DFC', 'MC', 'DC'] as const
    const archetypes = ['Parador', 'Central dominante', 'Organizador', 'Delantero rápido']
    const generated = generatePlayer({
      id: 1000 + teamIndex * 10 + playerIndex,
      name: `${firstName} ${rivalLastNames[(teamIndex + playerIndex * 3) % rivalLastNames.length]}`,
      age: 22 + ((teamIndex + playerIndex * 3) % 14),
      primaryPosition: positions[playerIndex], secondaryPositions: [], preferredFoot: playerIndex % 2 ? 'LEFT' : 'RIGHT',
      archetype: archetypes[playerIndex], traits: [], targetRating: 58 + ((teamIndex * 3 + playerIndex * 7) % 18),
      seed: 2000 + teamIndex * 10 + playerIndex, role: '', morale: '', fitness: 75, form: 65,
      appearances: 0, goals: 0, personality: '', happiness: 60, income: 0,
    })
    return {
      id: generated.id, name: generated.name, teamId: team.id,
      primaryPosition: generated.primaryPosition, secondaryPositions: generated.secondaryPositions,
      archetype: generated.archetype, attributes: generated.attributes,
    }
  }))

const rivalProfileVariants: Omit<RivalTeamProfile, 'teamId' | 'previousSeasonPosition'>[] = [
  { preferredFormation: '4-4-2', scouting: { withBall: 'Buscan jugar directo hacia los delanteros y no arriesgan demasiado en salida.', withoutBall: 'Defienden en bloque medio y no acostumbran a presionar demasiado arriba.', observedPattern: 'Tienden a atacar especialmente por su banda derecha.' }, collectiveWeaknesses: ['Sus centrales dominan el juego aéreo, pero dejan espacio a la espalda cuando adelantan la línea.'] },
  { preferredFormation: '4-3-3', scouting: { withBall: 'Intentan progresar con pases cortos y amplitud de los extremos.', withoutBall: 'Presionan arriba durante tramos cortos y después se ordenan en campo propio.' }, collectiveWeaknesses: ['Cuando pierden el balón con los laterales arriba conceden espacios en las bandas.'] },
  { preferredFormation: '4-2-3-1', scouting: { withBall: 'Buscan al mediapunta entre líneas y aceleran al llegar a tres cuartos.', withoutBall: 'Juntan dos líneas estrechas y protegen bien el carril central.', observedPattern: 'Sufren para salir cuando el rival les presiona desde el saque de portería.' }, collectiveWeaknesses: ['Su salida de balón se vuelve imprecisa ante una presión coordinada.'] },
  { preferredFormation: '3-5-2', scouting: { withBall: 'Cargan las bandas con los carrileros y buscan centros tempranos.', withoutBall: 'Repliegan con cinco defensas y conceden la iniciativa.' }, collectiveWeaknesses: ['El espacio junto a los carrileros aparece si se les obliga a retroceder rápido.'] },
]

export const rivalTeamProfiles: RivalTeamProfile[] = leagueTeams
  .filter((team) => team.id !== 'fc-poblenou')
  .map((team, index) => ({ teamId: team.id, previousSeasonPosition: 1 + ((index + 4) % 12), ...rivalProfileVariants[index % rivalProfileVariants.length] }))

function createMockGoalEvents(matches: LeagueMatch[]): GoalEvent[] {
  const clubScorers = [18, 18, 19, 15, 17, 18, 16, 19, 13]
  const rivalsByTeam = new Map<string, number[]>()
  rivalPlayers.forEach((player) => {
    const scorers = rivalsByTeam.get(player.teamId) ?? []
    scorers.push(player.id)
    rivalsByTeam.set(player.teamId, scorers)
  })
  const events: GoalEvent[] = []

  matches.forEach((match, matchIndex) => {
    const addGoals = (teamId: string, total: number, side: 'home' | 'away') => {
      const basePool = teamId === 'fc-poblenou' ? clubScorers : (rivalsByTeam.get(teamId) ?? [])
      const scorerPool = basePool.length === 4 ? [basePool[0], basePool[0], basePool[1], basePool[2], basePool[0], basePool[3], basePool[1]] : basePool
      for (let goalIndex = 0; goalIndex < total; goalIndex += 1) {
        const scorerId = scorerPool[(matchIndex + goalIndex * 2) % scorerPool.length]
        const eventNumber = events.length + 1
        events.push({
          id: `${match.id}-${side}-${goalIndex + 1}`,
          matchId: match.id,
          teamId,
          scorerId,
          minute: 7 + ((match.matchday * 3 + goalIndex * 17 + matchIndex) % 82),
          isPenalty: eventNumber % 11 === 0,
        })
      }
    }
    addGoals(match.homeTeamId, match.homeGoals, 'home')
    addGoals(match.awayTeamId, match.awayGoals, 'away')
  })
  return events
}

export const goalEvents = createMockGoalEvents(leagueMatches)
const goalEventErrors = validateGoalEvents(leagueMatches, goalEvents, players, rivalPlayers)
if (goalEventErrors.length > 0) throw new Error(goalEventErrors.join('\n'))

export const leagueSanctions: LeagueSanction[] = [
  { id: 'sanction-1', playerId: 7, teamId: 'fc-poblenou', reason: 'Roja directa', startMatchday: 3, matches: 1 },
  { id: 'sanction-2', playerId: 16, teamId: 'fc-poblenou', reason: 'Doble amarilla', startMatchday: 7, matches: 2 },
  { id: 'sanction-3', playerId: 1000, teamId: 'ona-sant-adria', reason: 'Roja directa', startMatchday: 2, matches: 2 },
  { id: 'sanction-4', playerId: 1021, teamId: 'pomar', reason: 'Acumulación de amarillas', startMatchday: 7, matches: 1 },
  { id: 'sanction-5', playerId: 1092, teamId: 'besos-baro-de-viver', reason: 'Doble amarilla', startMatchday: 9, matches: 1 },
]
const sanctionErrors = validateSanctionPlayers(leagueSanctions, players, rivalPlayers)
if (sanctionErrors.length > 0) throw new Error(sanctionErrors.join('\n'))

export const leagueSeason: LeagueSeasonData = {
  totalMatchdays: TOTAL_LEAGUE_MATCHDAYS,
  currentMatchday: CURRENT_MATCHDAY,
  matches: leagueMatches,
  goalEvents,
  sanctions: leagueSanctions,
}
