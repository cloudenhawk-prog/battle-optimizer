import { useState } from 'react'
import type { CSSProperties } from 'react'
import '../../styles/rotation-editor/StatusTag.css'
import { StatusDetailPanel } from './StatusDetailPanel'
import type { StatusDetailInfo } from './StatusDetailPanel'
import type { CharacterStats } from '../../types/stats'

// ========== Component: Status Tag ============================================================================================

type StatusTagProps = {
  icon: string
  label: string
  value: number
  maxStacks?: number
  type?: 'buff' | 'debuff' | 'negativeStatus'
  color?: string
  statusKey?: string
  timeLeft?: number
  description?: string
  showStats?: boolean
  stats?: Partial<CharacterStats>
}

export function StatusTag({ icon, label, value, maxStacks, type, color, statusKey, timeLeft, description, showStats, stats }: StatusTagProps) {
  const [panelOpen, setPanelOpen] = useState(false)

  // Don't render if value is 0 or undefined
  if (!value || value === 0) return null

  const detail: StatusDetailInfo = {
    key: statusKey ?? label,
    label,
    icon,
    value,
    maxStacks,
    type,
    color,
    timeLeft,
    description,
    showStats,
    stats,
  }

  const displayValue = maxStacks && maxStacks > 1 ? value : undefined
  const typeClass = type ? `statusTag-${type}` : ''

  // If a custom color is provided, use inline styles to override
  const customStyle = color
    ? {
        backgroundColor: `${color}26`, // 15% opacity (26 in hex)
        borderColor: `${color}4D`, // 30% opacity (4D in hex)
      }
    : undefined

  const customHoverStyle = color
    ? {
        '--custom-hover-bg': `${color}40`, // 25% opacity for hover
        '--custom-hover-border': `${color}80`, // 50% opacity for hover
      }
    : undefined

  return (
    <>
    <div
      className={`statusTag ${typeClass} ${color ? 'statusTag-custom' : ''}`}
      style={{ ...customStyle, ...customHoverStyle } as CSSProperties}
      onClick={() => setPanelOpen(true)}
    >
      <div className="statusTagContent">
        <img src={icon} alt={label} className="statusTagIcon" />
      </div>
      <div className="statusTagTooltip">
        <div className="statusTagTooltipHeader">
          <img src={icon} alt={label} className="statusTagTooltipIcon" />
          <span className="statusTagTooltipLabel">{label}</span>
        </div>
        <div className="statusTagTooltipValue">
          {(value === 1 && (!maxStacks || maxStacks === 1))
            ? <span className="statusTagTooltipValue--active">Active</span>
            : `Stacks ${value} / ${maxStacks}`}
        </div>
      </div>
    </div>
    <StatusDetailPanel status={panelOpen ? detail : null} onClose={() => setPanelOpen(false)} />
    </>
  )
}
