export type StaffRole = 'PRIMER_ENTRENADOR' | 'SEGUNDO_ENTRENADOR' | 'DELEGADO' | 'FISIO' | 'ENTRENADOR_PORTEROS'
export type ClubPersonnelRole = 'ENCARGADO_DEL_CAMPO'
export type StaffPersonality = 'RESPONSABLE' | 'CERCANO' | 'EXIGENTE' | 'SERVICIAL' | 'TRANQUILO' | 'ENTUSIASTA' | 'AUTORITARIO' | 'DESPISTADO'
export type AssistantProfile = 'FUTBOLERO' | 'METODICO' | 'MOTIVADOR' | 'CONOCE_LA_CATEGORIA' | 'JOVEN_CON_IDEAS' | 'VETERANO_PRACTICO'
export type PersonalityKnowledge = 'UNKNOWN' | 'CLUES' | 'KNOWN'
export type AvailabilityLevel = 'VERY_HIGH' | 'HIGH' | 'MEDIUM' | 'LOW'
export type CompensationType = 'MONTHLY' | 'FREE' | 'PRESIDENT_FAVOR' | 'PRESIDENT_PAYS' | 'PAY_PER_ATTENDANCE'
export type PresidentProtection = 'NONE' | 'RECOMMENDED' | 'PROTECTED' | 'INITIALLY_IMPOSED'
export type CandidateSource = 'PRESIDENT_CONTACT' | 'PLAYER_RECOMMENDATION' | 'STAFF_RECOMMENDATION' | 'FORMER_CLUB_MEMBER' | 'SPONTANEOUS'
export type StaffSearchRole = Exclude<StaffRole, 'PRIMER_ENTRENADOR'> | 'ANY_HELP'

export type StaffCapabilities = {
  training: number
  footballKnowledge: number
  groupManagement: number
  authority: number
  observation: number
  organization: number
  fitnessRecovery: number
  goalkeeping: number
  commitment: number
  reliability: number
  availability: number
}

export type Compensation = { type: CompensationType; amount: number; presidentAgreement?: string }
export type StaffPerson = {
  id: string
  role: StaffRole
  name: string
  age?: number
  personality?: StaffPersonality
  personalityKnowledge: PersonalityKnowledge
  knownClues: string[]
  currentDescription: string
  capabilities?: StaffCapabilities
  assistantProfile?: AssistantProfile
  availability: AvailabilityLevel
  availabilityNotes: string[]
  compensation: Compensation
  presidentProtection: PresidentProtection
  arrivalStory: string
  currentSituation: string
  presidentContext?: string
  isUsuallyAvailable: boolean
  coachProfile?: { tacticalTendencies?: string[]; groupManagement?: string; discipline?: string; managementStyle?: string }
}

export type ClubPersonnel = Omit<StaffPerson, 'role' | 'compensation' | 'presidentProtection' | 'assistantProfile' | 'coachProfile'> & {
  role: ClubPersonnelRole
  groupRelationship: number
}
export type StaffCandidate = StaffPerson & { source: CandidateSource }
export type StaffBudget = { monthlyTotal: number; headCoachMonthlyCompensation: number }
export type StaffState = { members: StaffPerson[]; clubPersonnel: ClubPersonnel; budget: StaffBudget; candidates: StaffCandidate[] }

export type StaffImpact = {
  trainingQuality: number
  attributeDevelopment: number
  groupAtmosphere: number
  authority: number
  discipline: number
  fitnessRecovery: number
  tacticalPreparation: number
  rivalInformation: number
  goalkeeping: number
}

export type AssistantObservation<T> = { subject: T; observedSignal: string; confidence: number }
export type AssistantInterpretation<T> = { observation: AssistantObservation<T>; interpretation: string; confidence: number; biases: string[] }
export type AssistantAdvice<T> = { interpretation: AssistantInterpretation<T>; recommendation: string; confidence: number }

export const STAFF_ROLE_LABELS: Record<StaffRole | ClubPersonnelRole, string> = {
  PRIMER_ENTRENADOR: 'Primer entrenador', SEGUNDO_ENTRENADOR: '2º entrenador', DELEGADO: 'Delegado',
  FISIO: 'Fisio', ENTRENADOR_PORTEROS: 'Entrenador de porteros', ENCARGADO_DEL_CAMPO: 'Encargado del campo',
}
export const PERSONALITY_LABELS: Record<StaffPersonality, string> = {
  RESPONSABLE: 'Responsable', CERCANO: 'Cercano', EXIGENTE: 'Exigente', SERVICIAL: 'Servicial',
  TRANQUILO: 'Tranquilo', ENTUSIASTA: 'Entusiasta', AUTORITARIO: 'Autoritario', DESPISTADO: 'Despistado',
}
export const AVAILABILITY_LABELS: Record<AvailabilityLevel, string> = { VERY_HIGH: 'Muy alta', HIGH: 'Alta', MEDIUM: 'Media', LOW: 'Baja' }

const clamp = (value: number, minimum = 0, maximum = 100) => Math.max(minimum, Math.min(maximum, value))
const mean = (values: number[]) => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0
const personalityEffects: Record<StaffPersonality, Partial<Record<keyof StaffImpact, number>>> = {
  RESPONSABLE: { trainingQuality: 2, discipline: 2 }, CERCANO: { groupAtmosphere: 5 },
  EXIGENTE: { trainingQuality: 5, discipline: 4, groupAtmosphere: -2 }, SERVICIAL: { trainingQuality: 2, groupAtmosphere: 2, fitnessRecovery: 2, tacticalPreparation: 2 },
  TRANQUILO: { groupAtmosphere: 4, discipline: -2 }, ENTUSIASTA: { trainingQuality: 3, groupAtmosphere: 4 },
  AUTORITARIO: { authority: 6, discipline: 5, groupAtmosphere: -3 }, DESPISTADO: { discipline: -3, trainingQuality: -1 },
}

export function monthlyBudgetCost(person: StaffPerson): number {
  return person.compensation.type === 'MONTHLY' ? person.compensation.amount : 0
}
export function calculateStaffBudget(state: Pick<StaffState, 'members' | 'budget'>) {
  const headCoach = state.members.find((person) => person.role === 'PRIMER_ENTRENADOR')
  const headCoachCost = headCoach ? monthlyBudgetCost(headCoach) : state.budget.headCoachMonthlyCompensation
  const committed = state.members.reduce((sum, person) => sum + monthlyBudgetCost(person), 0)
  return { total: state.budget.monthlyTotal, headCoach: headCoachCost, committed, available: Math.max(0, state.budget.monthlyTotal - committed) }
}
export function ensureHeadCoach(members: StaffPerson[], headCoach: StaffPerson): StaffPerson[] {
  return members.some((person) => person.role === 'PRIMER_ENTRENADOR') ? members : [headCoach, ...members]
}
export const canDismissStaffMember = (person: StaffPerson) => {
  if (person.role === 'PRIMER_ENTRENADOR') return { allowed: false, reason: 'Eres el primer entrenador.' }
  if (person.presidentProtection === 'PROTECTED' || person.presidentProtection === 'INITIALLY_IMPOSED') return { allowed: false, reason: 'El presidente no autoriza este cambio sin hablarlo antes.' }
  return { allowed: true }
}
export function canHireCandidate(state: StaffState, candidate: StaffCandidate) {
  const cost = monthlyBudgetCost(candidate)
  return cost <= calculateStaffBudget(state).available
    ? { allowed: true }
    : { allowed: false, reason: 'No queda suficiente presupuesto mensual para este acuerdo.' }
}

function availableStaff(members: StaffPerson[]) {
  return members.filter((person) => person.role !== 'PRIMER_ENTRENADOR' && person.isUsuallyAvailable && person.capabilities)
}
function contribution(person: StaffPerson, keys: (keyof StaffCapabilities)[]) {
  if (!person.capabilities) return 0
  const skill = mean(keys.map((key) => person.capabilities![key]))
  const presence = mean([person.capabilities.commitment, person.capabilities.reliability, person.capabilities.availability]) / 100
  return skill * (.55 + presence * .45)
}
function personalityEffect(person: StaffPerson, key: keyof StaffImpact) { return person.personality ? personalityEffects[person.personality][key] ?? 0 : 0 }
function calculateImpact(members: StaffPerson[]): StaffImpact {
  const staff = availableStaff(members)
  const score = (keys: (keyof StaffCapabilities)[], impact: keyof StaffImpact) => {
    const contributions = staff.map((person) => contribution(person, keys) + personalityEffect(person, impact))
    if (!contributions.length) return 0
    return clamp(contributions[0] + contributions.slice(1).reduce((sum, value, index) => sum + value * Math.max(.35, .7 - index * .12), 0))
  }
  return {
    trainingQuality: score(['training', 'organization'], 'trainingQuality'),
    attributeDevelopment: score(['training', 'footballKnowledge'], 'attributeDevelopment'),
    groupAtmosphere: score(['groupManagement', 'commitment'], 'groupAtmosphere'),
    authority: score(['authority', 'groupManagement'], 'authority'), discipline: score(['authority', 'reliability'], 'discipline'),
    fitnessRecovery: score(['fitnessRecovery', 'organization'], 'fitnessRecovery'),
    tacticalPreparation: score(['footballKnowledge', 'observation'], 'tacticalPreparation'),
    rivalInformation: score(['observation', 'footballKnowledge'], 'rivalInformation'), goalkeeping: score(['goalkeeping', 'training'], 'goalkeeping'),
  }
}
export const calculateTrainingStaffImpact = (members: StaffPerson[]) => { const impact = calculateImpact(members); return { quality: impact.trainingQuality, attributeDevelopment: impact.attributeDevelopment, goalkeeping: impact.goalkeeping } }
export const calculateGroupStaffImpact = (members: StaffPerson[]) => { const impact = calculateImpact(members); return { atmosphere: impact.groupAtmosphere, authority: impact.authority, discipline: impact.discipline } }
export const calculateFitnessStaffImpact = (members: StaffPerson[]) => calculateImpact(members).fitnessRecovery
export const calculateTacticalStaffImpact = (members: StaffPerson[]) => { const impact = calculateImpact(members); return { preparation: impact.tacticalPreparation, rivalInformation: impact.rivalInformation } }

export function describePersonality(person: Pick<StaffPerson, 'personalityKnowledge' | 'personality'>) {
  return person.personalityKnowledge === 'KNOWN' && person.personality ? PERSONALITY_LABELS[person.personality] : 'Por conocer'
}
export function formatCompensation(compensation: Compensation) {
  if (compensation.type === 'FREE') return 'Ayuda sin cobrar'
  if (compensation.type === 'PRESIDENT_FAVOR') return 'Acuerdo del presidente'
  if (compensation.type === 'PRESIDENT_PAYS') return 'Lo paga el presidente'
  if (compensation.type === 'PAY_PER_ATTENDANCE') return `${compensation.amount} €/asistencia`
  return `${compensation.amount} €/mes`
}
