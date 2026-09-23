import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import './styles/themeTokens.css'
import './styles/gameUi.css'
import './styles/clubMaterials.css'
import './styles/clubSquad.css'
import './styles/clubPlayerFile.css'
import './screens/InboxScreen.css'
import './screens/DressingRoomScreen.css'
import './styles/screenHeaders.css'
import './styles/clubScenes.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
