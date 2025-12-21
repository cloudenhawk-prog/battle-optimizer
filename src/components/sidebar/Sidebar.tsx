import { useLocation } from "react-router-dom"
import NavItem from "./NavItem"
import "../../styles/sidebar/Sidebar.css"

// ========== Component: Sidebar ===============================================================================================

interface SidebarProps {
  collapsed: boolean
}

const navItems = [
  { path: "/", label: "Home" },
  { path: "/rotations", label: "Rotations" },
  { path: "/analytics", label: "Analytics" },
  { path: "/settings", label: "Settings" },
]

export default function Sidebar({ collapsed }: SidebarProps) {
  const location = useLocation()

  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : "expanded"}`}>
      {/* Top Image */}
      <div className="sidebar-top" />

      {/* Horizontal lines */}
      <span className="line line-left" />
      <span className="line line-right" />

      {/* Navigation Items */}
      <nav className="nav">
        {navItems.map((item) => (
          <NavItem
            key={item.path}
            path={item.path}
            label={item.label}
            isActive={location.pathname === item.path}
            collapsed={collapsed}
          />
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">v0.3.2</div>
    </aside>
  )
}
