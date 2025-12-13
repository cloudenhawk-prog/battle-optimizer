import type { ReactNode } from "react"
import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import roverIconUrl from "../assets/rover-region.svg"
import "../styles/components/AppLayout.css"

interface AppLayoutProps {
  children: ReactNode
}

const navItems = [
  { path: "/", label: "Home" },
  { path: "/rotations", label: "Rotations" },
  { path: "/analytics", label: "Analytics" },
  { path: "/settings", label: "Settings" },
]

export default function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)

  function toggleSidebar() {
    setCollapsed((s) => !s)
  }

  return (
    <div className="app-container">
      {/* floating ghost button (shows when sidebar is collapsed) */}
      <button
  className={`sidebar-ghost ${collapsed ? "collapsed" : ""}`}
  onClick={toggleSidebar}
  aria-label={collapsed ? "Open menu" : "Close menu"}
  aria-expanded={!collapsed}
  title={collapsed ? "Open menu" : "Close menu"}
>
  <img src={roverIconUrl} alt="menu" />
</button>

      <aside className={"sidebar " + (collapsed ? "collapsed" : "expanded")}>
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

      <main className="main-content">{children}</main>
    </div>
  )
}
