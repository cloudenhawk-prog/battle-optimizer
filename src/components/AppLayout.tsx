import { useState, type ReactNode } from "react"
import Sidebar from "./sidebar/Sidebar"
import SidebarButton from "./sidebar/SidebarButton"
import "../styles/AppLayout.css"

interface AppLayoutProps {
  children: ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [collapsed, setCollapsed] = useState(false)
  const toggleSidebar = () => setCollapsed((s) => !s)

  return (
    <div className="app-container">
      {/* Sidebar */}
      <Sidebar collapsed={collapsed} />

      {/* Ghost toggle button outside sidebar */}
      <SidebarButton
        collapsed={collapsed}
        onClick={toggleSidebar}
        icon="/assets/circle-icon.svg"
      />

      {/* Main content */}
      <div className="content-column">  
        <main className="main-content">{children}</main>
      </div>
    </div>
  )
}
