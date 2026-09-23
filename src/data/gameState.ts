import type { GameState } from '../domain/gameState'
import { initialClubExpectations, initialInboxMessages } from './inboxData'
import { migrateLegacyInbox } from '../domain/messages'
import { MANOLO_ESCUDERO } from './characters'
import { createInitialStaffState, createSportsBudget, selectAssistantArchetype } from './staffData'
import type { InitialStaffOverrides } from './staffData'
import { BETA_SEASON_OBJECTIVE } from '../domain/season'
import { createPlayerCompensations, initialClubFinances } from './playerFinanceData'
import { initialPhysiotherapyContacts } from './medicalServicesData'
import { clubStatus, goalEvents, initialTacticalPlan, leagueMatches, players } from './mockData'
import { selectLineupForFormation } from '../domain/lineupSelection'
import { createInitialTrainingState } from '../domain/trainingEngine'
import { createInitialConsequenceState } from '../domain/consequences'

export type InitialGameOverrides = InitialStaffOverrides

export function createNewGameState(seed: number, overrides: InitialGameOverrides = {}): GameState {
  const preseasonFriendly = { id: 'friendly-1', matchday: 0, competitionType: 'FRIENDLY' as const, homeTeamId: 'fc-poblenou', awayTeamId: 'pujadas', homeGoals: 0, awayGoals: 0, status: 'scheduled' as const, date: '2026-08-30', time: '18:00', venue: 'Municipal del Poblenou', callUpTime: '16:45' }
  const freshLeagueCalendar = leagueMatches.map((match) => ({ ...match, competitionType: 'LEAGUE' as const, status: 'scheduled' as const, homeGoals: 0, awayGoals: 0 }))
  const assistantArchetype = overrides.assistantArchetype ?? selectAssistantArchetype(seed)
  const staff = createInitialStaffState(seed, overrides)
  const training = createInitialTrainingState(players, seed)
  training.seed = seed
  const plannedStaffIds = staff.members.filter((member) => member.role !== 'PRIMER_ENTRENADOR' && member.isUsuallyAvailable).map((member) => member.id)
  training.sessions = training.sessions.map((session) => ({ ...session, plannedStaffIds: [...plannedStaffIds] }))
  return {
    temporal: { startedAt: '2026-08-25T18:00:00', currentDateTime: '2026-08-25T18:00:00', phase: 'EVENING', seed, calendar: [preseasonFriendly, ...freshLeagueCalendar], events: [], pendingConversations: [], processedFeeMonths: [] },
    coachName: '', president: MANOLO_ESCUDERO, presidentRelationship: { relationshipWithManager: 60, satisfaction: 60 }, assistantArchetype, seasonObjective: BETA_SEASON_OBJECTIVE,
    expectations: { ...initialClubExpectations, expectations: initialClubExpectations.expectations.map((expectation) => ({ ...expectation })) },
    conversations: migrateLegacyInbox(initialInboxMessages),
    training,
    sportsBudget: createSportsBudget(seed),
    clubFinances: { playerFees: Object.fromEntries(Object.entries(initialClubFinances.playerFees).filter(([id]) => !['13', '19', '20'].includes(id)).map(([id, plan]) => [id, { ...plan, payments: plan.payments.map((payment) => ({ ...payment })), missingMonths: [...plan.missingMonths] }])), playerCompensations: Object.fromEntries(Object.entries(createPlayerCompensations(seed)).filter(([id]) => !['13', '19', '20'].includes(id))) },
    staff, staffSearchRequests: [],
    physiotherapyContacts: initialPhysiotherapyContacts.map((contact) => ({ ...contact, availabilityNotes: [...contact.availabilityNotes] })), physiotherapyPlans: [],
    completedScenes: [], coachEvidence: [], promises: [], narrativeFacts: [], teamChat: { unlocked: false, messages: [] }, favors: [], goalEvents: goalEvents.map((event) => ({ ...event })),
    playerSeasonStats: Object.fromEntries(players.map((player) => [player.id, { appearances: player.appearances, goals: player.goals, yellowCards: 0, redCards: 0, ratings: [] }])),
    manager: { generalAuthority: clubStatus.authority },
    team: { cohesion: clubStatus.dressingRoomCohesion, recentResultsMood: 50 },
    consequences: createInitialConsequenceState(),
    injuredPlayerIds: [],
    squadSelections: {}, squadSelectionHistory: [],
    preMatchPreparations: {},
    tacticalPlan: structuredClone(initialTacticalPlan),
    lineupIds: selectLineupForFormation(players, initialTacticalPlan.formation),
    onboarding: { completed: [], active: 'SECOND_COACH_INTRO', clubPanelTourCompleted: false, clubPanelTourStep: 0, trainingTutorialCompleted: false, trainingTutorialStep: 0 },
  }
}
