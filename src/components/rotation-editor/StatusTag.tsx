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
  const isSingleStack = maxStacks === 1
  const isActive = value > 0

  // For multi-stack modifiers: don't render when value is 0
  // For single-stack modifiers: always render (showing ACTIVE or INACTIVE)
  if (!isSingleStack && (!value || value === 0)) return null

  // Single-stack → ACTIVE / INACTIVE label; multi-stack → numeric count
  const displayValue = maxStacks !== undefined && maxStacks > 1 ? value : undefined
  const displayStatus = isSingleStack ? (isActive ? 'ACTIVE' : 'INACTIVE') : undefined

  const typeClass = type ? `statusTag-${type}` : ''
  const inactiveClass = isSingleStack && !isActive ? 'statusTag-inactive' : ''

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

  const tagClasses = ['statusTag', typeClass, inactiveClass, color ? 'statusTag-custom' : ''].filter(Boolean).join(' ')
  const iconClasses = ['statusTagIcon', isSingleStack && !isActive ? 'statusTagIcon-inactive' : ''].filter(Boolean).join(' ')

  return (
    <div className={tagClasses} style={{ ...customStyle, ...customHoverStyle } as CSSProperties}>
      <div className="statusTagContent">
        <img src={icon} alt={label} className={iconClasses} />
        {displayValue !== undefined && <span className="statusTagValue">{displayValue}</span>}
        {displayStatus !== undefined && (
          <span className={`statusTagStatus ${isActive ? 'statusTagStatus-active' : 'statusTagStatus-inactive'}`}>{displayStatus}</span>
        )}
      </div>
      <div className="statusTagTooltip">
        <div className="statusTagTooltipHeader">
          <img src={icon} alt={label} className="statusTagTooltipIcon" />
          <span className="statusTagTooltipLabel">{label}</span>
        </div>
        <div className="statusTagTooltipValue">
          {isSingleStack ? (isActive ? 'ACTIVE' : 'INACTIVE') : `Stacks: ${value}${maxStacks && maxStacks > 1 ? ` / ${maxStacks}` : ''}`}
        </div>
      </div>
    </div>
  )
}
