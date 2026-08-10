export type ScreenId =
  | 'main-menu'
  | 'club-panel'
  | 'squad'
  | 'tactics'
  | 'match'
  | 'post-match'
  | 'standings'

export type PlayerPosition =
  | 'POR'
  | 'LD'
  | 'LI'
  | 'DFC'
  | 'MCD'
  | 'MC'
  | 'MP'
  | 'ED'
  | 'EI'
  | 'DC'

export type PlayStyle =
  | 'Equilibrada'
  | 'Juego directo'
  | 'Posesión'
  | 'Repliegue y contraataque'

export type AttributeName =
  | 'Portería'
  | 'Defensa'
  | 'Técnica'
  | 'Pase'
  | 'Velocidad'
  | 'Resistencia'
  | 'Fuerza'
  | 'Definición'
  | 'Inteligencia táctica'
  | 'Juego aéreo'
  | 'Desborde'

export type PlayerAttributes = Record<AttributeName, number>

export type Player = {
  id: number
  name: string
  age: number
  position: PlayerPosition
  role: string
  morale: string
  fitness: number
  happiness: number
  attributes: PlayerAttributes
}

export type ClubStatus = {
  name: string
  seasonGoal: string
  league: string
  matchday: number
  authority: number
  dressingRoomCohesion: number
  physicalCondition: number
  presidentRelationship: number
  budget: string
}

export type ClubEvent = {
  title: string
  speaker: string
  detail: string
}

export type Tactics = {
  formation: '4-2-3-1'
  selectedStyle: PlayStyle
  availableStyles: PlayStyle[]
  startingEleven: number[]
  bench: number[]
}

export type MatchPreview = {
  homeTeam: string
  awayTeam: string
  venue: string
  context: string
  opponentNote: string
}

export type PostMatchSummary = {
  score: string
  headline: string
  notes: string[]
}

export type StandingRow = {
  position: number
  team: string
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  points: number
}
