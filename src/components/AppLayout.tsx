import { useState, type ReactNode } from "react"
import Sidebar from "./sidebar"
import "../styles/components/AppLayout.css"

interface AppLayoutProps {
  children: ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [collapsed, setCollapsed] = useState(false)

  const toggleSidebar = () => setCollapsed((s) => !s)

  return (
    <div className="app-container">
      <Sidebar collapsed={collapsed} onToggle={toggleSidebar} />
      <main className="main-content">{children}</main>
    </div>
  )
}
