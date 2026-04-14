import { useLocation } from 'react-router-dom'
import NavItem from './NavItem'
import '../../styles/sidebar/Sidebar.css'
import { useRotationPageContext } from '../../contexts/RotationPageContext'

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

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : 'expanded'}`}>
      {/* Top Image */}
      <div className="sidebar-top" />

      {/* Horizontal lines */}
      <span className="line line-left" />
      <span className="line line-right" />

      {/* Navigation Items */}
      <div className="sidebar-section">
        <nav className="nav">
          {navItems.map(item => (
            <NavItem key={item.path} path={item.path} label={item.label} isActive={location.pathname === item.path} collapsed={collapsed} />
          ))}
        </nav>
      </div>

      {/* Topbar toggle */}
      {isRotationPage && rotationCtx && (
        <div className="sidebar-section">
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
          <div className="sidebar-actions">
            <button
              className="sidebar-action-btn"
              onClick={rotationCtx.openRotations}
              title="Save / load rotations"
            >
              <span className="sidebar-action-label">Rotations</span>
            </button>
            <button
              className={`sidebar-action-btn ${!rotationCtx.hasData ? 'disabled' : ''}`}
              onClick={rotationCtx.openFieldReport}
              disabled={!rotationCtx.hasData}
              title={rotationCtx.hasData ? 'Open full team summary' : 'No rotation data yet'}
            >
              <span className="sidebar-action-label">Field Report</span>
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="sidebar-footer">v0.3.2</div>
    </aside>
  )
}
