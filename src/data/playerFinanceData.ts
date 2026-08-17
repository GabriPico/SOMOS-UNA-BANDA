import { STANDARD_PLAYER_SEASON_FEE } from '../domain/playerFinance'
import type { ClubFinances, FeeMonth, PlayerClubCompensation, PlayerFeePlan } from '../domain/playerFinance'

const installmentPlan = (playerId: number, missingMonths: FeeMonth[] = []): PlayerFeePlan => ({
  type: 'STANDARD', paymentMethod: 'INSTALLMENTS', seasonTotal: STANDARD_PLAYER_SEASON_FEE,
  payments: [{ id: `fee-${playerId}-september`, amount: 50, month: 'septiembre' }], missingMonths, visibility: 'COACH_ONLY',
})

const playerFees: Record<number, PlayerFeePlan> = Object.fromEntries(Array.from({ length: 20 }, (_, index) => [index + 1, installmentPlan(index + 1)]))
playerFees[1] = { type: 'STANDARD', paymentMethod: 'FULL', seasonTotal: STANDARD_PLAYER_SEASON_FEE, payments: [{ id: 'fee-1-full', amount: STANDARD_PLAYER_SEASON_FEE }], missingMonths: [], visibility: 'COACH_ONLY' }
playerFees[3] = installmentPlan(3, ['octubre'])
playerFees[4] = installmentPlan(4, ['septiembre', 'octubre'])
playerFees[5] = { type: 'SPECIAL_AGREEMENT', paymentMethod: 'INSTALLMENTS', seasonTotal: 300, payments: [{ id: 'fee-5-september', amount: 30, month: 'septiembre' }], missingMonths: [], specialAgreement: 'Tiene plazos reducidos acordados con el club.', visibility: 'COACH_ONLY' }
playerFees[6] = { type: 'EXEMPT', paymentMethod: 'NONE', seasonTotal: 0, payments: [], missingMonths: [], specialAgreement: 'El club le ha concedido una exención esta temporada.', visibility: 'COACH_ONLY' }

export function createPlayerCompensations(seed: number): Record<number, PlayerClubCompensation> {
  const roll = (((seed >>> 0) * 22695477 + 1) >>> 0) % 1000
  if (roll >= 80) return {}
  const compensations: Record<number, PlayerClubCompensation> = {
    18: { playerId: 18, monthlyAmount: 100, funding: 'SPORTS_BUDGET', context: 'Manolo acordó una pequeña compensación para retener a un delantero que podía jugar más arriba.', visibility: 'COACH_ONLY' },
  }
  if (roll < 10) compensations[11] = { playerId: 11, monthlyAmount: 50, funding: 'SPORTS_BUDGET', context: 'Una compensación modesta ayudó a convencer a un jugador destacado para seguir en el club.', visibility: 'DRESSING_ROOM_KNOWN' }
  return compensations
}

export const initialClubFinances: ClubFinances = { playerFees, playerCompensations: {} }
