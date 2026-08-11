export type ScreenId =
  | 'main-menu' | 'club-panel' | 'staff' | 'squad' | 'tactics'
  | 'match' | 'post-match' | 'standings'

export type PlayerPosition =
  | 'POR' | 'DFC' | 'LD' | 'LI' | 'CAD' | 'CAI' | 'MCD'
  | 'MC' | 'MP' | 'MD' | 'MI' | 'ED' | 'EI' | 'DC'

export type PlayerAttribute =
  | 'paradas' | 'juegoPiesPortero' | 'juegoAereoPortero'
  | 'comunicacion' | 'intensidad' | 'mentalidad' | 'rapidez'
  | 'alcanceAereo' | 'fuerza' | 'resistencia' | 'agilidad'
  | 'tecnica' | 'regate' | 'pases' | 'remate' | 'balonParado'
  | 'entradas' | 'marcaje'

export type PlayerAttributes = Record<PlayerAttribute, number>
export type PreferredFoot = 'RIGHT' | 'LEFT' | 'BOTH'
export type PlayerTrait =
  | 'VETERANO' | 'IRREGULAR' | 'MUY_FISICO' | 'FRAGIL_FISICAMENTE'
  | 'TALENTOSO' | 'LIMITADO_TECNICAMENTE' | 'RAPIDO' | 'LENTO'
  | 'POTENTE_POR_ARRIBA' | 'BAJITO'

export type PlayerArchetype = string

export type Player = {
  id: number
  name: string
  age: number
  primaryPosition: PlayerPosition
  secondaryPositions: PlayerPosition[]
  preferredFoot: PreferredFoot
  archetype: PlayerArchetype
  traits: PlayerTrait[]
  role: string
  morale: string
  fitness: number
  form: number
  appearances: number
  goals: number
  personality: string
  happiness: number
  income: number
  attributes: PlayerAttributes
}

export type PlayStyle = 'Equilibrada' | 'Juego directo' | 'Posesión' | 'Repliegue y contraataque'
export type StaffMember = { id: number; role: string; name: string; quality: number; personality: string }
export type ClubStatus = { name: string; seasonGoal: string; league: string; matchday: number; authority: number; dressingRoomCohesion: number; physicalCondition: number; presidentRelationship: number; budget: string }
export type ClubEvent = { title: string; speaker: string; detail: string }
export type Tactics = { formation: '4-2-3-1'; selectedStyle: PlayStyle; availableStyles: PlayStyle[]; startingEleven: number[]; bench: number[] }
export type MatchPreview = { homeTeam: string; awayTeam: string; venue: string; context: string; opponentNote: string }
export type PostMatchSummary = { score: string; headline: string; notes: string[] }
export type StandingRow = { position: number; team: string; played: number; won: number; drawn: number; lost: number; goalsFor: number; goalsAgainst: number; points: number }
