import { useState } from 'react'
import { AppShell } from './components/AppShell'
import type { ScreenId } from './domain/models'
import { ClubPanelScreen } from './screens/ClubPanelScreen'
import './App.css'

const navItems: { id: ScreenId; label: string }[] = [
  { id: 'club-panel', label: 'Panel del club' },
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
    </AppShell>
  )
}

export default App
