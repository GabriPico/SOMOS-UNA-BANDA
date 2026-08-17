import type { GameState } from '../domain/gameState'
import { initialClubExpectations, initialInboxMessages } from './inboxData'
import { MANOLO_ESCUDERO } from './characters'
import { createInitialStaffState, createSportsBudget } from './staffData'
import { BETA_SEASON_OBJECTIVE } from '../domain/season'
import { createPlayerCompensations, initialClubFinances } from './playerFinanceData'
import { initialPhysiotherapyContacts } from './medicalServicesData'
import { clubStatus, goalEvents, leagueMatches, players } from './mockData'
import { createInitialTrainingState } from '../domain/trainingEngine'

export function createNewGameState(seed: number): GameState {
  const preseasonFriendly = { id: 'friendly-1', matchday: 0, competitionType: 'FRIENDLY' as const, homeTeamId: 'fc-poblenou', awayTeamId: 'pujadas', homeGoals: 0, awayGoals: 0, status: 'scheduled' as const, date: '2026-08-30', time: '18:00' }
  const freshLeagueCalendar = leagueMatches.map((match) => ({ ...match, competitionType: 'LEAGUE' as const, status: 'scheduled' as const, homeGoals: 0, awayGoals: 0 }))
  const staff = createInitialStaffState(seed)
  const training = createInitialTrainingState(players)
  training.seed = seed
  const plannedStaffIds = staff.members.filter((member) => member.role !== 'PRIMER_ENTRENADOR' && member.isUsuallyAvailable).map((member) => member.id)
  training.sessions = training.sessions.map((session) => ({ ...session, plannedStaffIds: [...plannedStaffIds] }))
  return {
    temporal: { startedAt: '2026-08-25T18:00:00', currentDateTime: '2026-08-25T18:00:00', phase: 'EVENING', seed, calendar: [preseasonFriendly, ...freshLeagueCalendar], events: [], pendingConversations: [], processedFeeMonths: [] },
    coachName: '', president: MANOLO_ESCUDERO, seasonObjective: BETA_SEASON_OBJECTIVE,
    expectations: { ...initialClubExpectations, expectations: initialClubExpectations.expectations.map((expectation) => ({ ...expectation })) },
    inboxMessages: initialInboxMessages.map((message) => ({ ...message, responseOptions: message.responseOptions?.map((option) => ({ ...option })) })),
    training,
    sportsBudget: createSportsBudget(seed),
    clubFinances: { playerFees: Object.fromEntries(Object.entries(initialClubFinances.playerFees).filter(([id]) => !['13', '19', '20'].includes(id)).map(([id, plan]) => [id, { ...plan, payments: plan.payments.map((payment) => ({ ...payment })), missingMonths: [...plan.missingMonths] }])), playerCompensations: Object.fromEntries(Object.entries(createPlayerCompensations(seed)).filter(([id]) => !['13', '19', '20'].includes(id))) },
    staff, staffSearchRequests: [],
    physiotherapyContacts: initialPhysiotherapyContacts.map((contact) => ({ ...contact, availabilityNotes: [...contact.availabilityNotes] })), physiotherapyPlans: [],
    completedScenes: [], coachEvidence: [], promises: [], favors: [], goalEvents: goalEvents.map((event) => ({ ...event })),
    playerSeasonStats: Object.fromEntries(players.map((player) => [player.id, { appearances: player.appearances, goals: player.goals, yellowCards: 0, redCards: 0, ratings: [] }])),
    dressingRoomCohesion: clubStatus.dressingRoomCohesion, injuredPlayerIds: [],
    squadSelections: {}, squadSelectionHistory: [],
    onboarding: { completed: [], active: 'STAFF' },
  }
}
