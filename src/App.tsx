import { useState } from 'react'
import { AppShell } from './components/AppShell'
import type { ScreenId } from './domain/models'
import { ClubPanelScreen } from './screens/ClubPanelScreen'
import { StaffScreen } from './screens/StaffScreen'
import { TacticsScreen } from './screens/TacticsScreen'
import { TeamScreen } from './screens/TeamScreen'
import './App.css'

const navItems: { id: ScreenId; label: string }[] = [
  { id: 'club-panel', label: 'Panel del club' },
  { id: 'squad', label: 'Equipo' },
  { id: 'staff', label: 'Staff' },
  { id: 'tactics', label: 'Táctica' },
]

function App() {
  const [activeScreen, setActiveScreen] = useState<ScreenId>('club-panel')

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
        />
      )}
      {activeScreen === 'squad' && (
        <TeamScreen onBack={() => setActiveScreen('club-panel')} />
      )}
      {activeScreen === 'staff' && (
        <StaffScreen onBack={() => setActiveScreen('club-panel')} />
      )}
      {activeScreen === 'tactics' && (
        <TacticsScreen onBack={() => setActiveScreen('club-panel')} />
      )}
    </AppShell>
  )
}

export default App
