export const STANDARD_PLAYER_SEASON_FEE = 500

export type FeeMonth = 'septiembre' | 'octubre' | 'noviembre' | 'diciembre' | 'enero' | 'febrero' | 'marzo' | 'abril' | 'mayo'
export type PlayerFeeType = 'STANDARD' | 'SPECIAL_AGREEMENT' | 'EXEMPT'
export type PlayerFeePaymentMethod = 'FULL' | 'INSTALLMENTS' | 'NONE'
export type FinancialInformationVisibility = 'COACH_ONLY' | 'DRESSING_ROOM_KNOWN'
export type FeePayment = { id: string; amount: number; month?: FeeMonth }
export type ClubEligibilityRestriction = { type: 'CLUB_FEE_DEBT'; active: boolean; imposedBy: 'PRESIDENT'; reason: string }

type BasePlayerFeePlan = {
  paymentMethod: PlayerFeePaymentMethod
  payments: FeePayment[]
  missingMonths: FeeMonth[]
  specialAgreement?: string
  visibility: FinancialInformationVisibility
  eligibilityRestriction?: ClubEligibilityRestriction
}
export type PlayerFeePlan =
  | BasePlayerFeePlan & { type: 'STANDARD'; seasonTotal: typeof STANDARD_PLAYER_SEASON_FEE }
  | BasePlayerFeePlan & { type: 'SPECIAL_AGREEMENT'; seasonTotal: number }
  | BasePlayerFeePlan & { type: 'EXEMPT'; seasonTotal: 0 }

export type PlayerClubCompensation = { playerId: number; monthlyAmount: 50 | 100; funding: 'SPORTS_BUDGET' | 'MANOLO_EXTERNAL'; context: string; visibility: FinancialInformationVisibility }
export type ClubFinances = { playerFees: Record<number, PlayerFeePlan>; playerCompensations: Record<number, PlayerClubCompensation> }
export type FeeIssueSeverity = 'MINOR' | 'RELEVANT' | 'SEVERE'
export type TeamFeeSummary = {
  assessment: 'UP_TO_DATE' | 'SOME_DELAYS' | 'SEVERAL_PENDING' | 'CONCERNING'
  severity: FeeIssueSeverity | null
  counts: { upToDate: number; pending: number; specialAgreement: number; exempt: number; paidByClub: number }
  attention: { playerId: number; missingMonths: FeeMonth[]; severity: FeeIssueSeverity }[]
  manoloPressure: string
  knownDifferentialTreatments: number
}

export function isPlayerFeeUpToDate(plan: PlayerFeePlan) {
  return plan.type !== 'STANDARD' || plan.missingMonths.length === 0
}

export const getMissingFeeMonths = (plan: PlayerFeePlan) => [...plan.missingMonths]

export function getPlayerFeeLabel(plan: PlayerFeePlan, clubMonthlyPayment = 0) {
  if (clubMonthlyPayment > 0) return 'Cobra del club'
  if (plan.type === 'EXEMPT') return 'No paga cuota'
  if (plan.type === 'SPECIAL_AGREEMENT') return 'Acuerdo con el club'
  if (plan.paymentMethod === 'FULL' && isPlayerFeeUpToDate(plan)) return 'Pagada'
  if (plan.missingMonths.length) return `Pendiente · ${plan.missingMonths.join(' y ')}`
  return 'Al día'
}

export function getPlayerFeeDetail(plan: PlayerFeePlan, clubMonthlyPayment = 0) {
  if (clubMonthlyPayment > 0) return 'Cobra una compensación mensual del club.'
  if (plan.type === 'EXEMPT') return plan.specialAgreement ?? 'No paga cuota esta temporada.'
  if (plan.type === 'SPECIAL_AGREEMENT') return plan.specialAgreement ?? 'Tiene un acuerdo especial con el club.'
  if (plan.paymentMethod === 'FULL') return 'Cuota de la temporada pagada completa.'
  if (plan.missingMonths.length) return `Pendiente: ${plan.missingMonths.join(' y ')}.`
  return 'Pagos a plazos al día.'
}

export function getFeeIssueSeverity(plan: PlayerFeePlan): FeeIssueSeverity | null {
  if (plan.eligibilityRestriction?.active) return 'SEVERE'
  if (plan.missingMonths.length >= 3) return 'SEVERE'
  if (plan.missingMonths.length >= 2) return 'RELEVANT'
  if (plan.missingMonths.length === 1) return 'MINOR'
  return null
}

export function getTeamFeeSummary(playerFees: Record<number, PlayerFeePlan>, compensations: Record<number, PlayerClubCompensation>): TeamFeeSummary {
  const counts = { upToDate: 0, pending: 0, specialAgreement: 0, exempt: 0, paidByClub: 0 }
  const attention: TeamFeeSummary['attention'] = []
  let knownDifferentialTreatments = 0
  Object.entries(playerFees).forEach(([rawPlayerId, plan]) => {
    const playerId = Number(rawPlayerId)
    const compensation = compensations[playerId]
    if (compensation) {
      counts.paidByClub += 1
      if (compensation.visibility === 'DRESSING_ROOM_KNOWN') knownDifferentialTreatments += 1
      return
    }
    if (plan.type === 'SPECIAL_AGREEMENT') {
      counts.specialAgreement += 1
      if (plan.visibility === 'DRESSING_ROOM_KNOWN') knownDifferentialTreatments += 1
      return
    }
    if (plan.type === 'EXEMPT') {
      counts.exempt += 1
      if (plan.visibility === 'DRESSING_ROOM_KNOWN') knownDifferentialTreatments += 1
      return
    }
    const severity = getFeeIssueSeverity(plan)
    if (severity) { counts.pending += 1; attention.push({ playerId, missingMonths: [...plan.missingMonths], severity }); return }
    counts.upToDate += 1
  })
  const missingPayments = attention.reduce((sum, issue) => sum + issue.missingMonths.length, 0)
  const severity = attention.some((issue) => issue.severity === 'SEVERE') || missingPayments >= 5 ? 'SEVERE' : missingPayments >= 2 ? 'RELEVANT' : missingPayments === 1 ? 'MINOR' : null
  const assessment = severity === 'SEVERE' ? 'CONCERNING' : severity === 'RELEVANT' ? 'SEVERAL_PENDING' : severity === 'MINOR' ? 'SOME_DELAYS' : 'UP_TO_DATE'
  const manoloPressure = severity === 'SEVERE' ? 'Manolo espera que soluciones cuanto antes los pagos pendientes.' : severity === 'RELEVANT' ? 'Manolo quiere que hables con los jugadores que acumulan retrasos.' : severity === 'MINOR' ? 'Manolo quiere que recuerdes el pago pendiente.' : 'Manolo no está preocupado por las cuotas actualmente.'
  return { assessment, severity, counts, attention, manoloPressure, knownDifferentialTreatments }
}

export const TEAM_FEE_ASSESSMENT_LABELS: Record<TeamFeeSummary['assessment'], string> = { UP_TO_DATE: 'Al día', SOME_DELAYS: 'Algún retraso', SEVERAL_PENDING: 'Varios pagos pendientes', CONCERNING: 'Situación preocupante' }
