import type { PlayerClubCompensation } from './playerFinance'
import type { StaffPerson } from './staff'

export type SportsBudget = {
  monthlyTotal: number
  minimumCoachCompensation: number
}

export type SportsBudgetUsage = {
  total: number
  headCoach: number
  staff: number
  playerPayments: number
  players: number
  remaining: number
}

const fixedMonthlyCost = (person: StaffPerson) => person.compensation.type === 'MONTHLY' ? person.compensation.amount : 0

export function calculateSportsBudgetUsage(budget: SportsBudget, members: StaffPerson[], playerCompensations: PlayerClubCompensation[]): SportsBudgetUsage {
  const headCoach = members.find((person) => person.role === 'PRIMER_ENTRENADOR')
  const headCoachCost = headCoach ? fixedMonthlyCost(headCoach) : budget.minimumCoachCompensation
  const staffCost = members.filter((person) => person.role !== 'PRIMER_ENTRENADOR').reduce((sum, person) => sum + fixedMonthlyCost(person), 0)
  const playerPayments = playerCompensations.filter((compensation) => compensation.funding === 'SPORTS_BUDGET').reduce((sum, compensation) => sum + compensation.monthlyAmount, 0)
  return {
    total: budget.monthlyTotal,
    headCoach: headCoachCost,
    staff: staffCost,
    playerPayments,
    players: playerPayments,
    remaining: budget.monthlyTotal - headCoachCost - staffCost - playerPayments,
  }
}

export function isValidCoachCompensation(amount: number, budget: SportsBudget, maximumAffordable = budget.monthlyTotal) {
  return Number.isInteger(amount) && amount % 50 === 0 && amount >= budget.minimumCoachCompensation && amount <= Math.min(budget.monthlyTotal, maximumAffordable)
}
