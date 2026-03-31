import '../../styles/rotation-editor/StatusTagGroup.css'
import { StatusTag } from './StatusTag'
import type { CharacterStats } from '../../types/stats'

// ========== Component: Status Tag Group ======================================================================================

type StatusInfo = {
  key: string
  label: string
  icon: string
  value: number
  maxStacks?: number
  type?: 'buff' | 'debuff' | 'negativeStatus'
  color?: string
  timeLeft?: number
  description?: string
  showStats?: boolean
  stats?: Partial<CharacterStats>
}

type StatusTagGroupProps = {
  statuses: StatusInfo[]
}

export function StatusTagGroup({ statuses }: StatusTagGroupProps) {
  // Filter out statuses with 0 or undefined values
  const activeStatuses = statuses.filter(s => s.value && s.value > 0)

  if (activeStatuses.length === 0) {
    return <div className="statusTagGroup empty">-</div>
  }

  return (
    <div className="statusTagGroup">
      {activeStatuses.map(status => (
        <StatusTag key={status.key} statusKey={status.key} icon={status.icon} label={status.label} value={status.value} maxStacks={status.maxStacks} type={status.type} color={status.color} timeLeft={status.timeLeft} description={status.description} showStats={status.showStats} stats={status.stats} />
      ))}
    </div>
  )
}
