export type HumanStateLabels = {
  high: string
  medium: string
  low: string
}

export function getHumanStateLabel(
  value: number,
  labels: HumanStateLabels = { high: 'Buena', medium: 'Aceptable', low: 'Baja' },
) {
  if (value >= 72) return labels.high
  if (value >= 58) return labels.medium
  return labels.low
}

export function getHappinessLabel(value: number) {
  if (value >= 85) return 'Muy feliz'
  if (value >= 70) return 'Feliz'
  if (value >= 55) return 'Conforme'
  if (value >= 40) return 'Descontento'
  return 'Muy descontento'
}

export const getFatigueLabel = (value: number) => value >= 85 ? 'Muy cansado' : value >= 70 ? 'Cansado' : value >= 50 ? 'Algo cansado' : value >= 30 ? 'Bien' : 'Fresco'
export const getConditionLabel = (value: number) => value >= 85 ? 'Óptima' : value >= 70 ? 'Buena' : value >= 55 ? 'Justa' : value >= 40 ? 'Baja' : 'Muy baja'
export const getFamiliarityLabel = (value: number) => value >= 85 ? 'Muy buena' : value >= 70 ? 'Buena' : value >= 55 ? 'Aceptable' : value >= 40 ? 'Baja' : 'Muy baja'
export const getTrainingSatisfactionLabel = getHappinessLabel

export function getConditionAlert(condition: number): string | null {
  if (condition < 55) return 'Condición baja'
  if (condition < 70) return 'Condición justa'
  return null
}

export type DressingRoomIssueSeverity = 'positive' | 'warning' | 'negative'
export type DressingRoomChangeDirection = 'positive' | 'negative' | 'neutral'
export type SquadRole = 'Estrella' | 'Importante' | 'Titular' | 'Rotación' | 'Suplente'
export type SocialInfluence = 'Muy influyente' | 'Influyente' | 'Influencia normal' | 'Poca influencia'

export type DressingRoomIssue = { id: string; title: string; description: string; severity: DressingRoomIssueSeverity }
export type DressingRoomChange = { id: string; text: string; direction: DressingRoomChangeDirection }
export type DressingRoomPlayerProfile = {
  playerId: number
  squadRole: SquadRole
  coachRelationship: number
  situation?: string
  /** Links the individual situation to its existing collective issue, when present. */
  situationIssueId?: DressingRoomIssue['id']
  socialRole?: string
  influence: number
}
export type DressingRoomState = {
  cohesion: number
  issues: DressingRoomIssue[]
  changes: DressingRoomChange[]
  players: DressingRoomPlayerProfile[]
}

function getFiveLevelLabel(value: number, labels: readonly [string, string, string, string, string]) {
  if (value >= 85) return labels[0]
  if (value >= 70) return labels[1]
  if (value >= 55) return labels[2]
  if (value >= 40) return labels[3]
  return labels[4]
}

export const getCohesionLabel = (value: number) => getFiveLevelLabel(value, ['Muy alta', 'Alta', 'Normal', 'Baja', 'Muy baja'])
export const getMoodLabel = (value: number) => value >= 80 ? 'Excelente' : value >= 62 ? 'Bueno' : value >= 50 ? 'Normal' : value >= 38 ? 'Malo' : 'Muy malo'
export const getAuthorityLabel = (value: number) => value >= 85 ? 'Muy respetada' : value >= 70 ? 'Respetada' : value >= 55 ? 'Aceptada' : value >= 40 ? 'Cuestionada' : 'Muy cuestionada'
export const getDressingRoomHappinessLabel = (value: number) => value >= 82 ? 'Muy contento' : value >= 62 ? 'Contento' : value >= 58 ? 'Normal' : value >= 45 ? 'Descontento' : 'Muy descontento'

export function getCoachRelationshipLabel(value: number) {
  if (value >= 88) return 'Excelente'
  if (value >= 76) return 'Muy buena'
  if (value >= 64) return 'Buena'
  if (value >= 52) return 'Normal'
  if (value >= 40) return 'Mala'
  return 'Muy mala'
}

export function getInfluenceLabel(value: number): SocialInfluence {
  if (value >= 80) return 'Muy influyente'
  if (value >= 65) return 'Influyente'
  if (value >= 45) return 'Influencia normal'
  return 'Poca influencia'
}

export const getCohesionDescription = (value: number) => value >= 70 ? 'El grupo está bastante unido.' : value >= 55 ? 'El grupo mantiene una convivencia normal.' : 'El grupo necesita recuperar la unidad.'
export const getMoodDescription = (value: number) => value >= 62 ? 'La mayoría está contenta con la dinámica del equipo.' : value >= 50 ? 'El ánimo general es estable.' : 'Hay bastante descontento en la plantilla.'
export const getAuthorityDescription = (value: number) => value >= 62 ? 'El vestuario confía en ti.' : value >= 50 ? 'La mayoría acepta tus decisiones.' : 'Algunos jugadores cuestionan tus decisiones.'

export function getDressingRoomSummary(cohesion: number, mood: number, authority: number, unhappyPlayers: number) {
  const atmosphere = mood >= 62 ? 'bueno' : mood >= 50 ? 'estable' : 'complicado'
  const group = cohesion >= 70 ? 'parece unido' : cohesion >= 55 ? 'convive con normalidad' : 'muestra algunas divisiones'
  const trust = authority >= 62 ? 'La mayoría acepta tus decisiones' : 'Tu autoridad todavía no convence a todo el mundo'
  const concern = unhappyPlayers > 0 ? `, aunque ${unhappyPlayers === 1 ? 'un jugador empieza' : `${unhappyPlayers} jugadores empiezan`} a estar descontent${unhappyPlayers === 1 ? 'o' : 'os'}.` : '.'
  return `El ambiente es ${atmosphere} y el grupo ${group}. ${trust}${concern}`
}
