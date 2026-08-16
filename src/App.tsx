import { useState } from 'react'
import { AppShell } from './components/AppShell'
import type { ScreenId, TacticalPlan } from './domain/models'
import { initialTacticalPlan, leagueSeason, players } from './data/mockData'
import { createNewGameState } from './data/gameState'
import { newGameIntroduction } from './data/introScene'
import { createInitialTrainingState } from './domain/trainingEngine'
import { ClubPanelScreen } from './screens/ClubPanelScreen'
import { StaffScreen } from './screens/StaffScreen'
import { TacticsScreen } from './screens/TacticsScreen'
import { TeamScreen } from './screens/TeamScreen'
import { TrainingScreen } from './screens/TrainingScreen'
import { StandingsScreen } from './screens/StandingsScreen'
import { ResultsScreen } from './screens/ResultsScreen'
import { ScorersScreen } from './screens/ScorersScreen'
import { SanctionsScreen } from './screens/SanctionsScreen'
import { NextMatchScreen } from './screens/NextMatchScreen'
import { DressingRoomScreen } from './screens/DressingRoomScreen'
import { InboxScreen } from './screens/InboxScreen'
import { ConversationScreen } from './screens/ConversationScreen'
import './App.css'

const navItems: { id: ScreenId; label: string }[] = [
  { id: 'club-panel', label: 'Panel del club' },
  { id: 'squad', label: 'Equipo' },
  { id: 'staff', label: 'Staff' },
  { id: 'tactics', label: 'Táctica' },
  { id: 'training', label: 'Entrenamiento' },
]

function App() {
  const [gameState, setGameState] = useState(() => createNewGameState(84731))
  const [activeScreen, setActiveScreen] = useState<ScreenId>('club-panel')
  const [tacticalPlan, setTacticalPlan] = useState<TacticalPlan>(initialTacticalPlan)
  const [trainingState, setTrainingState] = useState(() => createInitialTrainingState(players))
  const [selectedLeagueMatchday, setSelectedLeagueMatchday] = useState(leagueSeason.currentMatchday)

  if (!gameState.completedScenes.includes(newGameIntroduction.id)) {
    return <ConversationScreen scene={newGameIntroduction} gameState={gameState} onGameStateChange={setGameState} onComplete={(completedState) => { setGameState(completedState); setActiveScreen('club-panel') }} />
  }

  return (
    <AppShell
      activeScreen={activeScreen}
      navItems={navItems}
      onNavigate={setActiveScreen}
    >
      {activeScreen === 'club-panel' && (
        <ClubPanelScreen
          tacticalPlan={tacticalPlan}
          trainingState={trainingState}
          expectations={gameState.expectations}
          onOpenStaff={() => setActiveScreen('staff')}
          onOpenTeam={() => setActiveScreen('squad')}
          onOpenTactics={() => setActiveScreen('tactics')}
          onOpenTraining={() => setActiveScreen('training')}
          onOpenLeague={() => setActiveScreen('standings')}
          onOpenNextMatch={() => setActiveScreen('next-match')}
          onOpenDressingRoom={() => setActiveScreen('dressing-room')}
          onOpenInbox={() => setActiveScreen('inbox')}
        />
      )}
      {activeScreen === 'next-match' && (
        <NextMatchScreen onBack={() => setActiveScreen('club-panel')} onOpenTactics={() => setActiveScreen('tactics')} />
      )}
      {activeScreen === 'dressing-room' && (
        <DressingRoomScreen trainingState={trainingState} expectations={gameState.expectations} onBack={() => setActiveScreen('club-panel')} />
      )}
      {activeScreen === 'inbox' && (
        <InboxScreen onBack={() => setActiveScreen('club-panel')} />
      )}
      {activeScreen === 'squad' && (
        <TeamScreen onBack={() => setActiveScreen('club-panel')} />
      )}
      {activeScreen === 'staff' && (
        <StaffScreen staffState={gameState.staff} onStaffStateChange={(staff) => setGameState((current) => ({ ...current, staff }))} onBack={() => setActiveScreen('club-panel')} />
      )}
      {activeScreen === 'tactics' && (
        <TacticsScreen tacticalPlan={tacticalPlan} onTacticalPlanChange={setTacticalPlan} onBack={() => setActiveScreen('club-panel')} />
      )}
      {activeScreen === 'training' && (
        <TrainingScreen tacticalPlan={tacticalPlan} trainingState={trainingState} onTrainingStateChange={setTrainingState} onBack={() => setActiveScreen('club-panel')} onOpenTactics={() => setActiveScreen('tactics')} />
      )}
      {activeScreen === 'standings' && (
        <StandingsScreen onBack={() => setActiveScreen('club-panel')} onOpenResults={() => setActiveScreen('league-results')} onOpenSanctions={() => setActiveScreen('league-sanctions')} onOpenScorers={() => setActiveScreen('league-scorers')} selectedMatchday={selectedLeagueMatchday} onMatchdayChange={setSelectedLeagueMatchday} />
      )}
      {activeScreen === 'league-results' && (
        <ResultsScreen onBack={() => setActiveScreen('club-panel')} onOpenStandings={() => setActiveScreen('standings')} onOpenSanctions={() => setActiveScreen('league-sanctions')} onOpenScorers={() => setActiveScreen('league-scorers')} selectedMatchday={selectedLeagueMatchday} onMatchdayChange={setSelectedLeagueMatchday} />
      )}
      {activeScreen === 'league-scorers' && (
        <ScorersScreen onBack={() => setActiveScreen('club-panel')} onOpenResults={() => setActiveScreen('league-results')} onOpenStandings={() => setActiveScreen('standings')} onOpenSanctions={() => setActiveScreen('league-sanctions')} selectedMatchday={selectedLeagueMatchday} onMatchdayChange={setSelectedLeagueMatchday} />
      )}
      {activeScreen === 'league-sanctions' && (
        <SanctionsScreen onBack={() => setActiveScreen('club-panel')} onOpenResults={() => setActiveScreen('league-results')} onOpenStandings={() => setActiveScreen('standings')} onOpenScorers={() => setActiveScreen('league-scorers')} selectedMatchday={selectedLeagueMatchday} onMatchdayChange={setSelectedLeagueMatchday} />
      )}
    </AppShell>
  )
}

export default App
