export type PhysiotherapyContact = { id: string; name: string; sessionCost: number; availabilityNotes: string[] }
export type TreatmentDecision = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'ALTERNATIVE' | 'CLUB_HELP'
export type PlayerPhysiotherapyPlan = {
  playerId: number
  contactId: string
  recommendedSessions: number
  completedSessions: number
  costPerSession: number
  paidBy: 'PLAYER' | 'CLUB' | 'FREE'
  decision: TreatmentDecision
  recoverySupport: 'RECOMMENDED_TREATMENT' | 'WITHOUT_RECOMMENDED_TREATMENT' | 'ALTERNATIVE_TREATMENT'
}
