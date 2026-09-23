import type { SportsBudget } from '../domain/economy'
import type { AssistantArchetype, ClubPersonnel, StaffCandidate, StaffCapabilities, StaffPerson, StaffState } from '../domain/staff'
import { SITO } from './characters'

const skills = (values: Partial<StaffCapabilities>): StaffCapabilities => ({
  training: 40, footballKnowledge: 40, groupManagement: 40, authority: 40, observation: 40,
  organization: 40, fitnessRecovery: 25, goalkeeping: 25, commitment: 60, reliability: 60, availability: 60, ...values,
})

export const headCoach: StaffPerson = {
  id: 'coach-player', role: 'PRIMER_ENTRENADOR', name: 'Miquel Ferrer', personalityKnowledge: 'UNKNOWN', knownClues: [],
  currentDescription: 'Acabas de asumir el equipo. Tu manera de entrenar y gestionar el grupo se irá definiendo con tus decisiones.',
  availability: 'VERY_HIGH', availabilityNotes: ['Eres quien organiza el trabajo del equipo.'], compensation: { type: 'MONTHLY', amount: 150 },
  presidentProtection: 'NONE', arrivalStory: 'El club te ha dado la oportunidad de dirigir al primer equipo.', currentSituation: 'Preparando su primera temporada completa.', isUsuallyAvailable: true,
  coachProfile: { tacticalTendencies: [], groupManagement: 'Por definir', discipline: 'Por definir', managementStyle: 'Por definir' },
}

const youngAssistant: StaffPerson = {
  id: 'staff-toni', role: 'SEGUNDO_ENTRENADOR', name: 'Toni Casals', personality: 'ENTUSIASTA', personalityKnowledge: 'CLUES',
  knownClues: ['Tiene ganas de probar ejercicios nuevos y pregunta mucho.'], currentDescription: 'Dejó de jugar hace poco y quiere empezar a entrenar sin alejarse del fútbol.',
  capabilities: skills({ training: 64, footballKnowledge: 59, observation: 55, groupManagement: 51, organization: 48, commitment: 75, reliability: 63, availability: 78 }),
  assistantProfile: 'JOVEN_CON_IDEAS', availability: 'HIGH', availabilityNotes: ['Normalmente puede venir entre semana.', 'Algunos domingos ayuda en el negocio familiar.'],
  compensation: { type: 'PRESIDENT_FAVOR', amount: 0, presidentAgreement: 'El presidente ha arreglado su incorporación por un favor personal.' },
  presidentProtection: 'INITIALLY_IMPOSED', arrivalStory: 'El presidente pidió que se le diera una oportunidad: es hijo de un socio al que conoce desde hace años.',
  currentSituation: 'Está aprendiendo el oficio y ayuda en casi cualquier tarea.', presidentContext: '“A este dale una oportunidad. Ya hablaremos más adelante.”', isUsuallyAvailable: true,
  assistantArchetype: 'CONNECTED_YOUNGSTER', relationshipWithManager: 58, satisfaction: 62, groupRelationship: 50,
}

const clubVeteranAssistant: StaffPerson = {
  id: 'staff-toni', role: 'SEGUNDO_ENTRENADOR', name: 'Ramon Vidal', personality: 'DESPISTADO', personalityKnowledge: 'CLUES',
  knownClues: ['Conoce cada rincón del campo y saluda a todo el mundo por su nombre.'], currentDescription: 'Lleva media vida haciendo de todo en el club y sigue viniendo porque esta es su casa.',
  capabilities: skills({ training: 51, footballKnowledge: 61, observation: 48, groupManagement: 67, authority: 43, organization: 55, commitment: 86, reliability: 57, availability: 82 }),
  assistantProfile: 'VETERANO_PRACTICO', availability: 'HIGH', availabilityNotes: ['Rara vez falta, aunque alguna vez se despista con los horarios.'], compensation: { type: 'FREE', amount: 0 },
  presidentProtection: 'PROTECTED', arrivalStory: 'Ha sido jugador, ayudante y entrenador de base; Manolo le tiene un cariño enorme.', currentSituation: 'Ayuda por experiencia y mantiene unido al grupo.', isUsuallyAvailable: true,
  assistantArchetype: 'CLUB_VETERAN', relationshipWithManager: 62, satisfaction: 68, groupRelationship: 74,
}

const formerCaptainAssistant: StaffPerson = {
  id: 'staff-toni', role: 'SEGUNDO_ENTRENADOR', name: 'Hugo Navarro', personality: 'EXIGENTE', personalityKnowledge: 'CLUES',
  knownClues: ['Fue capitán y todavía habla con sus antiguos compañeros como uno de ellos.'], currentDescription: 'Una lesión le apartó del campo el curso pasado. Ya entrenaba fútbol base y ha decidido seguir junto al equipo.',
  capabilities: skills({ training: 73, footballKnowledge: 77, observation: 75, groupManagement: 82, authority: 84, organization: 69, commitment: 85, reliability: 78, availability: 83 }),
  assistantProfile: 'FUTBOLERO', availability: 'VERY_HIGH', availabilityNotes: ['Está plenamente implicado en su nueva función.'], compensation: { type: 'FREE', amount: 0 },
  presidentProtection: 'RECOMMENDED', arrivalStory: 'Era uno de los líderes del vestuario hasta que una lesión le obligó a dejar de competir.', currentSituation: 'Aprende el oficio sin perder su enorme ascendencia sobre la plantilla.', isUsuallyAvailable: true,
  assistantArchetype: 'FORMER_CAPTAIN', relationshipWithManager: 60, satisfaction: 66, groupRelationship: 90,
}

const trustedAssistant: StaffPerson = {
  id: 'staff-toni', role: 'SEGUNDO_ENTRENADOR', name: 'Dani Serra', personality: 'RESPONSABLE', personalityKnowledge: 'KNOWN',
  knownClues: ['Ya habéis trabajado juntos y os entendéis con pocas palabras.'], currentDescription: 'Tu persona de máxima confianza profesional. Ha llegado antes para conocer el club y preparar vuestra entrada.',
  capabilities: skills({ training: 87, footballKnowledge: 88, observation: 86, groupManagement: 80, authority: 78, organization: 88, commitment: 94, reliability: 91, availability: 90 }),
  assistantProfile: 'METODICO', availability: 'VERY_HIGH', availabilityNotes: ['Ha venido contigo y prioriza el proyecto.'], compensation: { type: 'FREE', amount: 0 },
  presidentProtection: 'NONE', arrivalStory: 'Habéis entrenado juntos anteriormente y aceptó acompañarte.', currentSituation: 'Se ha adelantado para hablar con la gente y estudiar la plantilla.', isUsuallyAvailable: true,
  assistantArchetype: 'TRUSTED_ASSISTANT', relationshipWithManager: 100, satisfaction: 100, relationshipLocked: true, groupRelationship: 72,
}

const ASSISTANTS: Record<AssistantArchetype, StaffPerson> = { CONNECTED_YOUNGSTER: youngAssistant, CLUB_VETERAN: clubVeteranAssistant, FORMER_CAPTAIN: formerCaptainAssistant, TRUSTED_ASSISTANT: trustedAssistant }
export function selectAssistantArchetype(seed: number): AssistantArchetype {
  const chance = (((seed >>> 0) * 1103515245 + 12345) >>> 0) % 100
  return chance < 45 ? 'CONNECTED_YOUNGSTER' : chance < 75 ? 'CLUB_VETERAN' : chance < 93 ? 'FORMER_CAPTAIN' : 'TRUSTED_ASSISTANT'
}

export type InitialStaffOverrides = {
  assistantArchetype?: AssistantArchetype
  delegate?: 'DEFAULT' | 'PRESENT' | 'ABSENT'
}

export const veteranDelegate: StaffPerson = {
  id: 'staff-manel', role: 'DELEGADO', name: 'Manel Roca', personality: 'RESPONSABLE', personalityKnowledge: 'KNOWN', knownClues: ['Siempre aparece con las fichas, las llaves y una solución práctica.'],
  currentDescription: 'Lleva toda la vida alrededor del equipo y el club lo considera parte de la casa.', capabilities: skills({ organization: 79, groupManagement: 67, commitment: 88, reliability: 84, authority: 58, training: 43, availability: 73 }),
  availability: 'HIGH', availabilityNotes: ['Se organiza para estar en entrenamientos y partidos.'], compensation: { type: 'FREE', amount: 0 }, presidentProtection: 'PROTECTED',
  arrivalStory: 'Ya estaba en el club mucho antes de que llegaras.', currentSituation: 'Hace de delegado y termina ayudando donde haga falta.', presidentContext: '“Con el Manel no hagas nada sin hablar conmigo.”', isUsuallyAvailable: true,
}

export const permanentPhysio: StaffCandidate = {
  id: 'staff-marta-physio', role: 'FISIO', name: 'Marta Solé', personality: 'RESPONSABLE', personalityKnowledge: 'CLUES', knownClues: ['Puede acompañar al equipo de forma habitual y coordinar recuperaciones.'],
  currentDescription: 'Una fisioterapeuta vinculada de forma estable al club; un lujo poco habitual en la categoría.', capabilities: skills({ fitnessRecovery: 82, groupManagement: 61, organization: 70, reliability: 78, availability: 72, commitment: 76 }),
  availability: 'HIGH', availabilityNotes: ['Puede acudir habitualmente a entrenamientos y partidos.'], compensation: { type: 'MONTHLY', amount: 120 }, presidentProtection: 'NONE',
  arrivalStory: 'Manolo ha encontrado una opción excepcional para incorporar una fisio al club.', currentSituation: 'Valora incorporarse de manera estable.', isUsuallyAvailable: true, source: 'PRESIDENT_CONTACT',
}

export const externalCandidate: StaffCandidate = {
  id: 'candidate-sergi', role: 'SEGUNDO_ENTRENADOR', name: 'Sergi Batlle', personality: 'EXIGENTE', personalityKnowledge: 'CLUES', knownClues: ['Durante la conversación ha insistido bastante en que los jugadores se tomen en serio los entrenamientos.'],
  currentDescription: 'Lleva años viniendo a ver partidos de la zona y todavía juega algún torneo de veteranos.', capabilities: skills({ training: 74, footballKnowledge: 70, observation: 66, organization: 69, authority: 68, reliability: 76, availability: 70 }), assistantProfile: 'METODICO',
  availability: 'HIGH', availabilityNotes: ['Puede venir habitualmente entre semana, aunque algunos domingos trabaja.'], compensation: { type: 'MONTHLY', amount: 70 }, presidentProtection: 'RECOMMENDED',
  arrivalStory: 'El presidente lo conoce de coincidir con él en partidos de la zona.', currentSituation: 'Busca volver a estar cerca de un equipo sin asumirlo él solo.', presidentContext: 'El presidente dice que parece serio, aunque no ha trabajado directamente con él.', isUsuallyAvailable: true, source: 'PRESIDENT_CONTACT',
}

const fieldManager: ClubPersonnel = {
  id: SITO.id, role: 'ENCARGADO_DEL_CAMPO', name: SITO.name, personality: 'SERVICIAL', personalityKnowledge: 'KNOWN', knownClues: ['Normalmente sabe dónde está todo… o quién lo tiene.'],
  currentDescription: 'Lleva años encargándose del campo, las llaves, el material y los apaños que nunca llegan a hacerse del todo.', capabilities: skills({ organization: 63, groupManagement: 56, commitment: 82, reliability: 68 }),
  availability: 'HIGH', availabilityNotes: ['Suele estar por el campo por las tardes.'], arrivalStory: 'Es personal del club y no forma parte del cuerpo técnico.', currentSituation: 'Se ocupa del campo y echa una mano con el material.', isUsuallyAvailable: true, groupRelationship: 66,
}

export const initialStaffState: StaffState = { members: [headCoach, youngAssistant, veteranDelegate], clubPersonnel: fieldManager, candidates: [externalCandidate] }

const SPORTS_BUDGET_VALUES = [400, 450, 500, 550, 600, 650, 700] as const
const SPORTS_BUDGET_THRESHOLDS = [5, 17, 37, 63, 83, 95, 100] as const

export function createSportsBudget(seed: number): SportsBudget {
  const roll = ((seed >>> 0) * 1664525 + 1013904223) >>> 0
  const chance = roll % 100
  const index = SPORTS_BUDGET_THRESHOLDS.findIndex((threshold) => chance < threshold)
  const monthlyTotal = SPORTS_BUDGET_VALUES[index]
  return { monthlyTotal, minimumCoachCompensation: monthlyTotal >= 650 ? 200 : 150 }
}

/** Composición inicial reproducible. Los umbrales son provisionales y fáciles de rebalancear. */
export function createInitialStaffState(seed: number, overrides: InitialStaffOverrides = {}): StaffState {
  const sportsBudget = createSportsBudget(seed)
  const generatedHeadCoach = { ...headCoach, compensation: { type: 'MONTHLY' as const, amount: sportsBudget.minimumCoachCompensation } }
  const archetype = overrides.assistantArchetype ?? selectAssistantArchetype(seed)
  const includeDelegate = overrides.delegate !== 'ABSENT'
  const members: StaffPerson[] = [generatedHeadCoach, structuredClone(ASSISTANTS[archetype]), ...(includeDelegate ? [structuredClone(veteranDelegate)] : [])]
  return { ...structuredClone(initialStaffState), members, candidates: [structuredClone(externalCandidate)] }
}
