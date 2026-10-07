// Renders a body row's status-effect / "other" cells (status tags from the previous row, plain columns otherwise).
import type { ColumnDef, ColumnVisibility } from '../../../types/tableDefinitions'
import type { Snapshot } from '../../../types/snapshot'
import { StatusTagGroup } from '../StatusTagGroup'
import { parseCoordinatedAttackKey } from '../../../engine/coordinatedAttacks/coordinatedAttackHelpers'

// ========== Helper Functions =================================================================================================

export function renderBodyColumnsWithTags(columns: ColumnDef[], columnVisibility: ColumnVisibility, snapshot: Snapshot, previousSnapshot: Snapshot | null, character: string, action: string) {
  // The first visible cell of a group gets the group divider class
  let firstVisible = true
  return columns
    .filter(col => columnVisibility[col.key])
    .map(col => {
      const className = firstVisible ? 'tableCellBody charGroupBody' : 'tableCellBody'
      firstVisible = false

      // If the column has statusMetadata, render tags
      if (col.statusMetadata) {
        // Use PREVIOUS snapshot's status data, since statuses are applied AFTER the action
        // completes, not during. If no previous snapshot exists, show empty (0 stacks).
        const sourceSnapshot = previousSnapshot
        let statusData: Record<string, number> | undefined
        let activationStatsData: Record<string, object> | undefined
        let statusType: 'buff' | 'debuff' | 'negativeStatus' = 'buff'

        let negativeStatusesMaxStacksData: Record<string, number> | undefined
        if (col.key === 'negativeStatuses') {
          statusData = sourceSnapshot?.negativeStatuses as Record<string, number> | undefined
          negativeStatusesMaxStacksData = sourceSnapshot?.negativeStatusesMaxStacks as Record<string, number> | undefined
          statusType = 'negativeStatus'
        } else if (col.key === 'buffs') {
          statusData = sourceSnapshot?.buffs as Record<string, number> | undefined
          activationStatsData = sourceSnapshot?.buffsActivationStats as Record<string, object> | undefined
          statusType = 'buff'
        } else if (col.key === 'debuffs') {
          statusData = sourceSnapshot?.debuffs as Record<string, number> | undefined
          statusType = 'debuff'
        } else if (col.key === 'coordinatedAttacks') {
          // Use previous snapshot, but cancel any swapRequired attack owned by the current
          // character since isReturnToOwner expires it at fromTime (before this row's effects).
          const prevData = sourceSnapshot?.coordinatedAttacks
          const swapReqFlags = sourceSnapshot?.coordinatedAttacksSwapRequired
          if (prevData) {
            const merged: Record<string, number> = {}
            for (const [key, active] of Object.entries(prevData)) {
              if ((swapReqFlags?.[key] ?? false) && parseCoordinatedAttackKey(key).owner === character) {
                merged[key] = 0
              } else {
                merged[key] = active
              }
            }
            statusData = merged
          }
          statusType = 'buff'
        }

        const statuses =
          col.statusMetadata?.map(meta => ({
            key: meta.key,
            label: meta.label,
            icon: meta.icon,
            value: statusData?.[meta.key] ?? 0,
            maxStacks: negativeStatusesMaxStacksData?.[meta.key] ?? meta.maxStacks,
            type: statusType,
            color: meta.color,
            description: meta.description,
            showStats: meta.showStats,
            stats: activationStatsData?.[meta.key] as object | undefined,
          })) ?? []

        return (
          <td key={col.key} className={className}>
            {character && action ? <StatusTagGroup statuses={statuses} clickable={false} /> : ''}
          </td>
        )
      }

      // Otherwise, render normally
      return (
        <td key={col.key} className={className}>
          {character && action ? col.render(snapshot) : ''}
        </td>
      )
    })
}
