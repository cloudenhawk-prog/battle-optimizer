import '../../styles/rotation-editor/StatusTagGroup.css'
import { StatusTag } from './StatusTag'

// ========== Component: Status Tag Group ======================================================================================

type StatusInfo = {
  key: string
  label: string
  icon: string
  value: number
  maxStacks?: number
  type?: 'buff' | 'debuff' | 'negativeStatus'
  color?: string
}

type StatusTagGroupProps = {
  statuses: StatusInfo[]
}

export function StatusTagGroup({ statuses }: StatusTagGroupProps) {
  // Single-stack modifiers (maxStacks === 1) are always shown so they can display
  // ACTIVE / INACTIVE. Multi-stack modifiers are only shown when value > 0.
  const visibleStatuses = statuses.filter(s => s.maxStacks === 1 || (s.value && s.value > 0))

  if (visibleStatuses.length === 0) {
    return <div className="statusTagGroup empty">-</div>
  }

  return (
    <div className="statusTagGroup">
      {visibleStatuses.map(status => (
        <StatusTag key={status.key} icon={status.icon} label={status.label} value={status.value} maxStacks={status.maxStacks} type={status.type} color={status.color} />
      ))}
    </div>
  )
}
