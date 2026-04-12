import { Routes, Route, useLocation } from 'react-router-dom'
import AppLayout from './components/AppLayout'
import HomePage from './pages/HomePage'
import RotationEditorPage from './pages/RotationEditorPage'
import AnalyticsPage from './pages/AnalyticsPage'
import SettingsPage from './pages/SettingsPage'
import NotFoundPage from './pages/NotFoundPage'

// ========== Component: App ===================================================================================================

export default function App() {
  return (
    <AppLayout>
      <AppRoutes />
    </AppLayout>
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
