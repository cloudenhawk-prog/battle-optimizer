import type { ReactNode } from "react"
import { Link, useLocation } from "react-router-dom"

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

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div>[Icon_01]</div>

        <nav className="nav">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={location.pathname === item.path ? "active" : ""}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">v0.0.1</div>
      </aside>

      <main className="main-content">{children}</main>
    </div>
  )
}
