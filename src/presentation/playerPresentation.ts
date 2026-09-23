import type { Player, PlayerAttribute, PlayerPosition } from '../domain/models'
import type { PlayerSeasonStats } from '../domain/gameState'
import type { PlayerEligibility } from '../domain/squadSelection'
import type { TrainingGameState, TrainingPlayerState } from '../domain/trainingTypes'
import { getConditionAlert, getFatigueLabel, getHappinessLabel } from '../domain/humanState'
import { getPhysicalIssueLabel } from '../domain/physicalIssues'
import { getPlayerHappiness } from '../domain/trainingEngine'
import { getPlayerPositions } from '../domain/playerRatings'
import type { StatusTone } from './managementPresentation'
import type { DressingRoomPlayerProfile, SquadRole } from '../domain/humanState'

export const POSITION_LABELS: Record<PlayerPosition, string> = {
  POR: 'Portero', DFC: 'Defensa central', LD: 'Lateral derecho', LI: 'Lateral izquierdo',
  CAD: 'Carrilero derecho', CAI: 'Carrilero izquierdo', MCD: 'Mediocentro defensivo',
  MC: 'Centrocampista', MP: 'Mediapunta', MD: 'Interior derecho', MI: 'Interior izquierdo',
  ED: 'Extremo derecho', EI: 'Extremo izquierdo', DC: 'Delantero centro',
}
export const POSITION_POINTS: Record<PlayerPosition, readonly [number, number]> = {
  POR: [8, 50], DFC: [24, 50], LD: [26, 83], LI: [26, 17], CAD: [40, 87], CAI: [40, 13],
  MCD: [41, 50], MC: [56, 50], MP: [72, 50], MD: [57, 83], MI: [57, 17],
  ED: [79, 83], EI: [79, 17], DC: [89, 50],
}
export const ATTRIBUTE_GROUPS: ReadonlyArray<{ title: string; color: string; attributes: ReadonlyArray<readonly [PlayerAttribute, string]> }> = [
  { title: 'Técnicos', color: 'technical', attributes: [['tecnica', 'Técnica'], ['regate', 'Regate'], ['pases', 'Pases'], ['remate', 'Remate'], ['balonParado', 'Balón parado'], ['entradas', 'Entradas'], ['marcaje', 'Marcaje']] },
  { title: 'Mentales', color: 'mental', attributes: [['comunicacion', 'Comunicación'], ['intensidad', 'Intensidad'], ['mentalidad', 'Mentalidad']] },
  { title: 'Físicos', color: 'physical', attributes: [['rapidez', 'Rapidez'], ['alcanceAereo', 'Alcance aéreo'], ['fuerza', 'Fuerza'], ['resistencia', 'Resistencia'], ['agilidad', 'Agilidad']] },
  { title: 'Portería', color: 'technical', attributes: [['paradas', 'Paradas'], ['juegoPiesPortero', 'Juego de pies'], ['juegoAereoPortero', 'Juego aéreo']] },
]
export function getVisibleAttributeGroups(player: Player) {
  const keeper = getPlayerPositions(player).includes('POR')
  return ATTRIBUTE_GROUPS.filter(group => keeper || group.title !== 'Portería').map(group => ({
    ...group, attributes: group.attributes.filter(([key]) => !keeper || key !== 'alcanceAereo'),
  }))
}

/** Map the complete 1–20 range to 0–5 stars, rounded to the nearest half star. */
export function getAttributePresentation(value: number) {
  const normalized = Math.max(1, Math.min(20, Number.isFinite(value) ? value : 1))
  return { stars: Math.round((normalized - 1) / 19 * 10) / 2 }
}

const TEAM_ROLE_DESCRIPTIONS: Record<SquadRole, string> = {
  Estrella: 'Una de las referencias del equipo. Espera llevar el peso en los partidos.',
  Importante: 'Tiene un papel destacado y espera jugar con continuidad.',
  Titular: 'Espera salir de inicio habitualmente y tener continuidad en el once.',
  Rotación: 'Alterna titularidades y suplencias para dar opciones al equipo.',
  Suplente: 'Aporta recambios al once y espera oportunidades desde el banquillo.',
}
export function getPlayerRolePresentation(player: Player, profile?: DressingRoomPlayerProfile) {
  if (player.clubStatus === 'TRIAL') return { label: 'A prueba', description: 'Entrena con el grupo y busca un sitio en la plantilla.' }
  return { label: profile ? [profile.socialRole, profile.squadRole].filter(Boolean).join(' · ') : player.role,
    description: profile ? TEAM_ROLE_DESCRIPTIONS[profile.squadRole] : 'Su papel en el equipo está pendiente de definir.' }
}
export function getHappinessPresentation(player: Player, training?: TrainingPlayerState) {
  const label = getHappinessLabel(training ? getPlayerHappiness(training) : player.happiness)
  const tone = label.includes('descontento') || label === 'Descontento' ? 'negative' : label === 'Conforme' ? 'warning' : 'positive'
  return { label, tone } as const
}

export type PlayerStatusView = { label: string; description: string; tone: StatusTone; observations: string[] }
export type PlayerContext = { injured?: boolean; eligibility?: PlayerEligibility; observations?: string[] }
export function getPlayerStatus(player: Player, training?: TrainingPlayerState, context: PlayerContext = {}): PlayerStatusView {
  const observations = [...(context.observations ?? [])]
  const result = (label: string, description: string, tone: StatusTone): PlayerStatusView => ({ label, description, tone, observations })
  if (context.injured || context.eligibility?.status === 'INJURED') return result('Lesionado', 'No está en condiciones de jugar. Recuperación pendiente de valoración.', 'negative')
  if (context.eligibility?.status === 'SUSPENDED') return result('Sancionado', 'No puede disputar el próximo partido oficial.', 'negative')
  if (context.eligibility?.status === 'UNAVAILABLE') return result('No disponible', context.eligibility.reason ?? 'No puede acudir al próximo partido.', 'negative')
  if (context.eligibility?.status === 'NOT_REGISTERED') observations.push(context.eligibility.reason ?? 'No inscrito para Liga')
  if (training?.currentIssue) {
    const issue = training.currentIssue
    if (issue.type === 'HANGOVER') return result('Con resaca', 'Su estado físico es peor de lo habitual.', 'warning')
    if (issue.type === 'MUSCLE_DISCOMFORT') return result('Con molestias', 'Tiene molestias musculares; conviene vigilar la carga.', 'warning')
    if (issue.type === 'MINOR_KNOCK') return result('Tocado', 'Arrastra un golpe leve.', 'warning')
    return result(getPhysicalIssueLabel(issue)!, 'Incidencia física temporal que afecta a su rendimiento.', 'warning')
  }
  if (getConditionAlert(training?.fitness ?? player.fitness)) return result('Falta de ritmo (cardio)', 'Le cuesta mantener la intensidad durante todo el partido.', 'warning')
  const fatigue = training ? getFatigueLabel(training.fatigue) : 'Fresco'
  if (['Algo cansado', 'Cansado', 'Muy cansado'].includes(fatigue)) return result(fatigue, 'Acumula cansancio y necesita recuperar.', 'warning')
  return result('Disponible', 'Sin problemas físicos destacados.', 'positive')
}

/** Only current, explicitly recorded training availability; never infer work or family commitments. */
export function getTrainingObservations(state: TrainingGameState, playerId: number) {
  return [...new Set(state.sessions.filter(session => session.status === 'pending' && session.plannedAbsentPlayerIds?.includes(playerId))
    .map(session => `${session.day}: ${session.plannedAbsenceReasons?.[playerId] || 'No puede venir a entrenar'}`))]
}

/** Match history is the source for minutes; friendly games never inflate league totals. */
export function getSeasonStatsPresentation(player: Player, stats?: PlayerSeasonStats) {
  const appearances = stats?.appearances ?? player.appearances
  const history = (stats?.ratings ?? []).filter(item => item.competitionType === 'LEAGUE')
  const complete = history.length === appearances
  const starts = stats?.starts ?? (complete ? history.filter(item => item.started).length : undefined)
  return {
    appearances, starts, played: `${appearances}(${starts ?? '—'})`,
    minutes: history.length || appearances === 0 ? history.reduce((sum, item) => sum + item.minutesPlayed, 0) : undefined,
    minutesNote: complete ? 'Minutos de Liga' : 'Minutos de Liga registrados; el histórico anterior no está disponible',
    goals: stats?.goals ?? player.goals, yellowCards: stats?.yellowCards, redCards: stats?.redCards,
  }
}
export function getSeasonLabel(startedAt?: string) {
  if (!startedAt) return 'Temporada actual'
  const year = Number(startedAt.slice(0, 4)) - (Number(startedAt.slice(5, 7)) < 7 ? 1 : 0)
  return `Temporada ${year}/${String(year + 1).slice(-2)}`
}
export type SquadSort = 'position' | 'name' | 'age' | 'appearances' | 'minutes' | 'goals'
export function filterAndSortSquad(players: Player[], position: string, search: string, sort: SquadSort, stats: Record<number, PlayerSeasonStats>) {
  const normalize = (text: string) => text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase('es')
  const order = Object.keys(POSITION_LABELS)
  return players.filter(player => (!position || getPlayerPositions(player).includes(position as PlayerPosition)) && normalize(player.name).includes(normalize(search.trim())))
    .sort((a, b) => {
      const first = getSeasonStatsPresentation(a, stats[a.id]), second = getSeasonStatsPresentation(b, stats[b.id])
      const difference = sort === 'position' ? order.indexOf(a.primaryPosition) - order.indexOf(b.primaryPosition)
        : sort === 'age' ? a.age - b.age : sort === 'appearances' ? second.appearances - first.appearances
        : sort === 'minutes' ? (second.minutes ?? -1) - (first.minutes ?? -1) : sort === 'goals' ? second.goals - first.goals : 0
      return difference || a.name.localeCompare(b.name, 'es') || a.id - b.id
    })
}
