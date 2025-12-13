import { useLocation, Link } from "react-router-dom"
import roverIconUrl from "../assets/rover-region.svg"
import "../styles/components/Sidebar.css"

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
    <>
      {/* Ghost button to toggle sidebar */}
      <button
        className={`sidebar-ghost ${collapsed ? "collapsed" : ""}`}
        onClick={onToggle}
        aria-label={collapsed ? "Open menu" : "Close menu"}
        aria-expanded={!collapsed}
        title={collapsed ? "Open menu" : "Close menu"}
      >
        <img src={roverIconUrl} alt="menu" />
      </button>

      <aside className={`sidebar ${collapsed ? "collapsed" : "expanded"}`}>
        <div className="sidebar-top" />

        <nav className="nav">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              title={item.label}
              className={location.pathname === item.path ? "active" : ""}
            >
              <span className="label">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">v0.0.1</div>
      </aside>
    </>
  )
}
