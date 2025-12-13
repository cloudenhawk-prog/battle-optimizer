import React from "react"
import "../../styles/sidebar/SidebarButton.css"

interface SidebarButtonProps {
  collapsed: boolean
  onClick: () => void
  icon: string
  label?: string
}

export default function SidebarButton({ collapsed, onClick, icon, label }: SidebarButtonProps) {
  return (
    <button
      className={`sidebar-ghost ${collapsed ? "collapsed" : "expanded"}`}
      onClick={onClick}
      aria-label={label || (collapsed ? "Open menu" : "Close menu")}
      aria-expanded={!collapsed}
      title={label || (collapsed ? "Open menu" : "Close menu")}
    >
      <img src={icon} alt="menu icon" />
    </button>
  )
}
