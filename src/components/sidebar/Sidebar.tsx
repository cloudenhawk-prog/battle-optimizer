import { useLocation } from 'react-router-dom'
import NavItem from './NavItem'
import '../../styles/sidebar/Sidebar.css'
import { useRotationPageContext } from '../../contexts/RotationPageContext'
import { sidebarCharacterConfig } from './sidebarCharacterConfig'

// ========== Component: Sidebar ===============================================================================================

interface SidebarProps {
  collapsed: boolean
}

const navItems = [
  { path: '/', label: 'Home' },
  { path: '/rotations', label: 'Rotations' },
  { path: '/analytics', label: 'Analytics' },
  { path: '/settings', label: 'Settings' },
]

export default function Sidebar({ collapsed }: SidebarProps) {
  const location = useLocation()
  const rotationCtx = useRotationPageContext()
  const isRotationPage = location.pathname === '/rotations'

  const selectedCharacterName = rotationCtx?.selectedCharacterName ?? null
  const FALLBACK_IMAGE = '/assets/ui/phrolova.png'

  // A character has a sidebar image only if they appear in sidebarCharacterConfig.
  // Characters not in the config fall back to phrolova.
  const charConfig = selectedCharacterName ? (sidebarCharacterConfig[selectedCharacterName] ?? null) : null
  const hasCharacterImage = charConfig !== null

  const imageUrl = hasCharacterImage
    ? `/assets/ui/${selectedCharacterName!.toLowerCase()}.png`
    : FALLBACK_IMAGE

  const bgStyle: React.CSSProperties = {
    backgroundImage: `url('${imageUrl}')`,
    backgroundSize: `${charConfig?.width ?? 'var(--img-width)'} var(--img-height)`,
    backgroundPosition: `${charConfig?.x ?? 'var(--img-x)'} ${charConfig?.y ?? 'var(--img-y)'}`,
    backgroundRepeat: 'no-repeat',
  }

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : 'expanded'}`} style={bgStyle}>
      {/* Top Image */}
      <div className="sidebar-top" />

      {/* Horizontal lines */}
      <span className="line line-left" />
      <span className="line line-right" />

      {/* Navigation Items */}
      <div className="sidebar-section sidebar-section--nav">
        <span className="sidebar-section-label">Navigation</span>
        <nav className="nav">
          {navItems.map(item => (
            <NavItem key={item.path} path={item.path} label={item.label} isActive={location.pathname === item.path} collapsed={collapsed} />
          ))}
        </nav>
      </div>

      {/* Topbar toggle */}
      {isRotationPage && rotationCtx && (
        <div className="sidebar-section">
          <span className="sidebar-section-label">View</span>
          <div className="sidebar-actions">
            <button
              className="sidebar-action-btn"
              onClick={rotationCtx.toggleTopbar}
              title={rotationCtx.topbarVisible ? 'Hide column bar' : 'Show column bar'}
            >
              <span className="sidebar-action-label">{rotationCtx.topbarVisible ? 'Hide Bar' : 'Show Top Bar'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Rotation page actions */}
      {isRotationPage && rotationCtx && (
        <div className="sidebar-section">
          <span className="sidebar-section-label">Tools</span>
          <div className="sidebar-actions">
            <button
              className="sidebar-action-btn"
              onClick={rotationCtx.openRotations}
              title="Save / load rotations"
            >
              <span className="sidebar-action-label">Rotation Library</span>
            </button>
            <button
              className={`sidebar-action-btn ${!rotationCtx.hasData ? 'disabled' : ''}`}
              onClick={rotationCtx.openFieldReport}
              disabled={!rotationCtx.hasData}
              title={rotationCtx.hasData ? 'Open full team summary' : 'No rotation data yet'}
            >
              <span className="sidebar-action-label">Rotation Stats</span>
            </button>
            <button
              className={`sidebar-action-btn ${!rotationCtx.hasData ? 'disabled' : ''}`}
              onClick={rotationCtx.openBuildOptimizer}
              disabled={!rotationCtx.hasData}
              title={rotationCtx.hasData ? 'Find best weapon for each character' : 'No rotation data yet'}
            >
              <span className="sidebar-action-label">Build Optimizer</span>
            </button>
            <button
              className={`sidebar-action-btn${rotationCtx.optimizerEditMode ? ' active' : ''}`}
              onClick={rotationCtx.toggleOptimizerEditMode}
              title={rotationCtx.optimizerEditMode ? 'Exit rotation edit mode' : 'Edit rotation structure'}
            >
              <span className="sidebar-action-label">{rotationCtx.optimizerEditMode ? 'Exit Edit Mode' : 'Edit Rotation'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="sidebar-footer">v0.3.2</div>
    </aside>
  )
}
