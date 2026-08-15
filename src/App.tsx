import { useState } from 'react'
import { AppShell } from './components/AppShell'
import type { ScreenId, TacticalPlan } from './domain/models'
import { initialTacticalPlan, players } from './data/mockData'
import { createInitialTrainingState } from './domain/trainingEngine'
import { ClubPanelScreen } from './screens/ClubPanelScreen'
import { StaffScreen } from './screens/StaffScreen'
import { TacticsScreen } from './screens/TacticsScreen'
import { TeamScreen } from './screens/TeamScreen'
import { TrainingScreen } from './screens/TrainingScreen'
import './App.css'

const navItems: { id: ScreenId; label: string }[] = [
  { id: 'club-panel', label: 'Panel del club' },
  { id: 'squad', label: 'Equipo' },
  { id: 'staff', label: 'Staff' },
  { id: 'tactics', label: 'Táctica' },
  { id: 'training', label: 'Entrenamiento' },
]

function App() {
  const [activeScreen, setActiveScreen] = useState<ScreenId>('club-panel')
  const [tacticalPlan, setTacticalPlan] = useState<TacticalPlan>(initialTacticalPlan)
  const [trainingState, setTrainingState] = useState(() => createInitialTrainingState(players))

  return (
    <AppShell
      activeScreen={activeScreen}
      navItems={navItems}
      onNavigate={setActiveScreen}
    >
      {activeScreen === 'club-panel' && (
        <ClubPanelScreen
          onOpenStaff={() => setActiveScreen('staff')}
          onOpenTeam={() => setActiveScreen('squad')}
          onOpenTactics={() => setActiveScreen('tactics')}
          onOpenTraining={() => setActiveScreen('training')}
        />
      )}
      {activeScreen === 'squad' && (
        <TeamScreen onBack={() => setActiveScreen('club-panel')} />
      )}
      {activeScreen === 'staff' && (
        <StaffScreen onBack={() => setActiveScreen('club-panel')} />
      )}
      {activeScreen === 'tactics' && (
        <TacticsScreen tacticalPlan={tacticalPlan} onTacticalPlanChange={setTacticalPlan} onBack={() => setActiveScreen('club-panel')} />
      )}
      {activeScreen === 'training' && (
        <TrainingScreen tacticalPlan={tacticalPlan} trainingState={trainingState} onTrainingStateChange={setTrainingState} onBack={() => setActiveScreen('club-panel')} onOpenTactics={() => setActiveScreen('tactics')} />
      )}
    </AppShell>
  )
}

export default App
