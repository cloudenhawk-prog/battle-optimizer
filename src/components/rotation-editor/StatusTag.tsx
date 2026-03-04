import type { CSSProperties } from 'react'
import '../../styles/rotation-editor/StatusTag.css'

// ========== Component: Status Tag ============================================================================================

type StatusTagProps = {
  icon: string
  label: string
  value: number
  maxStacks?: number
  type?: 'buff' | 'debuff' | 'negativeStatus'
  color?: string
}

export function StatusTag({ icon, label, value, maxStacks, type, color }: StatusTagProps) {
  // Don't render if value is 0 or undefined
  if (!value || value === 0) return null

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
    <div className={`statusTag ${typeClass} ${color ? 'statusTag-custom' : ''}`} style={{ ...customStyle, ...customHoverStyle } as CSSProperties}>
      <div className="statusTagContent">
        <img src={icon} alt={label} className="statusTagIcon" />
        {displayValue !== undefined && <span className="statusTagValue">{displayValue}</span>}
      </div>
      <div className="statusTagTooltip">
        <div className="statusTagTooltipHeader">
          <img src={icon} alt={label} className="statusTagTooltipIcon" />
          <span className="statusTagTooltipLabel">{label}</span>
        </div>
        <div className="statusTagTooltipValue">
          Stacks: {value}
          {maxStacks && maxStacks > 1 && ` / ${maxStacks}`}
        </div>
      </div>
    </div>
  )
}
