import { useState } from 'react'
import { AppShell } from './components/AppShell'
import type { ScreenId } from './domain/models'
import { ClubPanelScreen } from './screens/ClubPanelScreen'
import { TeamScreen } from './screens/TeamScreen'
import './App.css'

const navItems: { id: ScreenId; label: string }[] = [
  { id: 'club-panel', label: 'Panel del club' },
  { id: 'squad', label: 'Equipo' },
]

function App() {
  const [activeScreen, setActiveScreen] = useState<ScreenId>('club-panel')

  return (
    <AppShell
      activeScreen={activeScreen}
      navItems={navItems}
      onNavigate={setActiveScreen}
    >
      {activeScreen === 'club-panel' && <ClubPanelScreen />}
      {activeScreen === 'squad' && <TeamScreen />}
    </AppShell>
  )
}

export default App
