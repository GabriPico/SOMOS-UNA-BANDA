import { useState } from 'react'
import { AppShell } from './components/AppShell'
import type { ScreenId } from './domain/models'
import { ClubPanelScreen } from './screens/ClubPanelScreen'
import { StaffScreen } from './screens/StaffScreen'
import { TeamScreen } from './screens/TeamScreen'
import './App.css'

const navItems: { id: ScreenId; label: string }[] = [
  { id: 'club-panel', label: 'Panel del club' },
  { id: 'squad', label: 'Equipo' },
  { id: 'staff', label: 'Staff' },
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
        <ClubPanelScreen onOpenStaff={() => setActiveScreen('staff')} />
      )}
      {activeScreen === 'squad' && <TeamScreen />}
      {activeScreen === 'staff' && <StaffScreen />}
    </AppShell>
  )
}

export default App
