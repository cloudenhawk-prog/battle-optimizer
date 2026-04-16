import { Routes, Route, useLocation } from 'react-router-dom'
import { useState, useCallback } from 'react'
import AppLayout from './components/AppLayout'
import HomePage from './pages/HomePage'
import RotationEditorPage from './pages/RotationEditorPage'
import AnalyticsPage from './pages/AnalyticsPage'
import SettingsPage from './pages/SettingsPage'
import NotFoundPage from './pages/NotFoundPage'
import { RotationPageContext } from './contexts/RotationPageContext'

// ========== Component: App ===================================================================================================

export default function App() {
  const [topbarVisible, setTopbarVisible] = useState(false)
  const [rotationsOpen, setRotationsOpen] = useState(false)
  const [summaryOpen, setSummaryOpen] = useState(false)
  const [hasData, setHasData] = useState(false)
  const [selectedCharacterName, setSelectedCharacterName] = useState<string | null>(null)
  const [optimizerEditMode, setOptimizerEditMode] = useState(false)

  const toggleTopbar = useCallback(() => setTopbarVisible(v => !v), [])
  const openRotations = useCallback(() => setRotationsOpen(true), [])
  const openFieldReport = useCallback(() => { if (hasData) setSummaryOpen(true) }, [hasData])
  const toggleOptimizerEditMode = useCallback(() => setOptimizerEditMode(v => !v), [])

  return (
    <RotationPageContext.Provider value={{ topbarVisible, toggleTopbar, openRotations, openFieldReport, hasData, optimizerEditMode, toggleOptimizerEditMode, rotationsOpen, setRotationsOpen, summaryOpen, setSummaryOpen, onHasDataChange: setHasData, selectedCharacterName, setSelectedCharacterName }}>
      <AppLayout>
        <AppRoutes />
      </AppLayout>
    </RotationPageContext.Provider>
  )
}

// ========== Component: AppRoutes =============================================================================================

// RotationEditorPage is always mounted so rotation state (snapshots, character setup, gear) survives
// navigation to other pages. CSS hides it instead of unmounting it.
function AppRoutes() {
  const location = useLocation()
  const isRotations = location.pathname === '/rotations'

  return (
    <>
      {/* Always mounted — display:contents is a transparent wrapper when active, display:none hides without unmounting */}
      <div style={{ display: isRotations ? 'contents' : 'none' }}>
        <RotationEditorPage />
      </div>

      {!isRotations && (
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      )}
    </>
  )
}
