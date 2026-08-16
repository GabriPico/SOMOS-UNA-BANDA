export type ScreenId =
  | 'main-menu' | 'club-panel' | 'staff' | 'squad' | 'tactics' | 'training'
  | 'match' | 'next-match' | 'post-match' | 'standings' | 'league-results' | 'league-scorers' | 'league-sanctions' | 'dressing-room' | 'inbox'

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
export type ClubStatus = { name: string; seasonGoal: string; league: string; matchday: number; authority: number; dressingRoomCohesion: number; physicalCondition: number; presidentRelationship: number; budget: string }
export type ClubEvent = { title: string; speaker: string; detail: string }
export type Tactics = { formation: '4-2-3-1'; selectedStyle: PlayStyle; availableStyles: PlayStyle[]; startingEleven: number[]; bench: number[] }
export type Formation = '4-4-2' | '4-3-3' | '4-2-3-1' | '3-5-2' | '5-4-1'
export type TacticalPlan = {
  formation: Formation
  mentality: 'Ofensiva' | 'Equilibrada' | 'Cauta'
  passingStyle: 'En corto' | 'Mixto' | 'Directo'
  tempo: 'Alto' | 'Medio' | 'Bajo'
  afterRecovery: 'Contraataque' | 'Equilibrada' | 'Mantener posición'
  pressingHeight: 'Alta' | 'Media' | 'Baja'
  pressingIntensity: 'Alta' | 'Media' | 'Baja'
  afterLoss: 'Presión tras pérdida' | 'Mixto' | 'Repliegue'
  timeWasting: 'Sí' | 'No'
  aggression: 'Sí' | 'No'
}
export type TrainingIntensity = 'Baja' | 'Media' | 'Alta'
export type TrainingBlock = 'Completo' | 'Lúdico' | 'Físico' | 'Ataque posicional' | 'Transición ofensiva' | 'Defensa posicional / Presión' | 'Transición defensiva' | 'Táctica' | 'Balón parado' | 'Descanso'
export type TrainingSessionStatus = 'pending' | 'completed'
export type TrainingQualityLabel = 'Excelente' | 'Buena' | 'Correcta' | 'Floja' | 'Mala' | 'De mínimos'
export type TrainingSession = { id: string; day: string; intensity: TrainingIntensity; blocks: [TrainingBlock, TrainingBlock]; status: TrainingSessionStatus; attendance: number; totalPlayers: number; quality?: number; qualityLabel?: TrainingQualityLabel }
export type TacticalFamiliarity = { overall: number; formation: Record<Formation, number>; instructions: Record<string, Record<string, number>> }
export type ProvisionalAttributeProgress = Partial<Record<PlayerAttribute, number>>
export type MatchPreview = { homeTeam: string; awayTeam: string; venue: string; context: string; opponentNote: string }
export type PostMatchSummary = { score: string; headline: string; notes: string[] }
export type LeagueTeam = { id: string; name: string }
export type MatchOutcome = 'G' | 'E' | 'P'
export type StandingRow = { position: number; teamId: LeagueTeam['id']; played: number; won: number; drawn: number; lost: number; goalsFor: number; goalsAgainst: number; goalDifference: number; points: number; recentForm: MatchOutcome[] }
export type MatchStatus = 'played' | 'scheduled'
export type LeagueMatch = { id: string; matchday: number; homeTeamId: LeagueTeam['id']; awayTeamId: LeagueTeam['id']; homeGoals: number; awayGoals: number; status: MatchStatus; date: string; time: string }
export type GoalEvent = { id: string; matchId: string; teamId: LeagueTeam['id']; scorerId: number; minute: number; isPenalty: boolean }
export type RivalPlayer = Pick<Player, 'id' | 'name' | 'primaryPosition' | 'secondaryPositions' | 'archetype' | 'attributes'> & { teamId: LeagueTeam['id'] }
export type RivalTeamProfile = {
  teamId: LeagueTeam['id']
  previousSeasonPosition: number
  preferredFormation: Formation
  scouting: { withBall: string; withoutBall: string; observedPattern?: string }
  collectiveWeaknesses?: string[]
}
export type TopScorerRow = { position: number; playerId: number; playerName: string; teamId: LeagueTeam['id']; goals: number; penaltyGoals: number }
export type SanctionReason = 'Roja directa' | 'Doble amarilla' | 'Acumulación de amarillas'
export type LeagueSanction = { id: string; playerId: number; teamId: LeagueTeam['id']; reason: SanctionReason; startMatchday: number; matches: number; originMatchId?: string }
export type ActiveSanction = LeagueSanction & { remainingMatches: number }
export type LeagueSeasonData = { totalMatchdays: number; currentMatchday: number; matches: LeagueMatch[]; goalEvents: GoalEvent[]; sanctions: LeagueSanction[] }
