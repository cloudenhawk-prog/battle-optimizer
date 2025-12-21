import { Link } from "react-router-dom"
import React from "react"
import "../../styles/sidebar/NavItem.css"

// ========== Component: Nav Item ==============================================================================================

interface NavItemProps {
  path: string
  label: string
  icon?: React.ReactNode
  isActive: boolean
  collapsed: boolean
}

export default function NavItem({ path, label, icon, isActive, collapsed }: NavItemProps) {
  return (
    <Link
      to={path}
      className={`nav-item ${isActive ? "active" : ""}`}
      title={label}
    >
      {icon && <span className="icon">{icon}</span>}
      {!collapsed && <span className="label">{label}</span>}
    </Link>
  )
}
