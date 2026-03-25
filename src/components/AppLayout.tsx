import { useState, type ReactNode } from 'react'
import Sidebar from './sidebar/Sidebar'
import SidebarButton from './sidebar/SidebarButton'
import TetherBackground from './TetherBackground'
import '../styles/AppLayout.css'

// ========== Component: App Layout ============================================================================================

interface AppLayoutProps {
  children: ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [collapsed, setCollapsed] = useState(false)
  const toggleSidebar = () => setCollapsed(s => !s)

  return (
    <div className="app-container">
      {/* Animated Background */}
      <div className="background-container">
        <div className="gradient-background" />
        <div className="floating-orbs">
          <div className="orb orb-1" />
          <div className="orb orb-2" />
          <div className="orb orb-3" />
        </div>
        <TetherBackground />
      </div>

      {/* Sidebar */}
      <Sidebar collapsed={collapsed} />

      {/* Ghost toggle button outside sidebar */}
      <SidebarButton collapsed={collapsed} onClick={toggleSidebar} icon="/assets/ui/circle-icon.svg" />

      {/* Main content */}
      <div className="content-column">
        <main className="main-content">{children}</main>
      </div>
    </div>
  )
}
