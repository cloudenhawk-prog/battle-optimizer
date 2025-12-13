import { useLocation } from "react-router-dom"
import SidebarButton from "./SidebarButton"
import NavItem from "./NavItem"
import "../../styles/sidebar/Sidebar.css"

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

const navItems = [
  { path: "/", label: "Home" },
  { path: "/rotations", label: "Rotations" },
  { path: "/analytics", label: "Analytics" },
  { path: "/settings", label: "Settings" },
]

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation()

  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : "expanded"}`}>
      {/* Ghost toggle button */}
      <SidebarButton collapsed={collapsed} onClick={onToggle} icon="/assets/circle-icon.svg" />

      {/* Top section / future image */}
      <div className="sidebar-top" />

      {/* Navigation */}
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
      <div className="sidebar-footer">v0.0.1</div>
    </aside>
  )
}
