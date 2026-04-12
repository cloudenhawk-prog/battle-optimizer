import '../../styles/rotation-editor/CurrentStateRow.css'
import type { Snapshot } from '../../types/snapshot'
import type { TableConfig, ColumnVisibility } from '../../types/tableDefinitions'
import { StatusTagGroup } from './StatusTagGroup'

// ========== Helper Functions =================================================================================================

function formatNumber(value: number): string {
  // Handle values >= 1 million
  if (value >= 1_000_000) {
    const millions = value / 1_000_000
    // Format to fit 6 characters max (including 'M')
    if (millions >= 100) {
      return `${millions.toFixed(0)}M`
    } else if (millions >= 10) {
      return `${millions.toFixed(1)}M`
    } else {
      return `${millions.toFixed(3)}M`
    }
  }

  // Handle values >= 1 thousand
  if (value >= 1_000) {
    const thousands = value / 1_000
    // Format to fit 6 characters max (including 'k')
    if (thousands >= 100) {
      return `${thousands.toFixed(0)}k`
    } else if (thousands >= 10) {
      return `${thousands.toFixed(1)}k`
    } else {
      return `${thousands.toFixed(3)}k`
    }
  }

  // Handle values < 1000
  return value.toFixed(0)
}

// ========== Component: Current State Row =====================================================================================

type CurrentStateRowProps = {
  snapshot: Snapshot | null
  firstFromTime: number
  tableConfig: TableConfig
  columnVisibility: ColumnVisibility
}

export function CurrentStateRow({ snapshot, firstFromTime, tableConfig, columnVisibility }: CurrentStateRowProps) {
  // Create initial snapshot if none exists or character not selected
  const displaySnapshot = snapshot || createInitialSnapshot()
  const hasCharacter = displaySnapshot.character && displaySnapshot.character !== ''

  return (
    <tr className="currentStateRow">
        {/* Character */}
        <td className="currentStateCell"></td>

        {/* Action */}
        <td className="currentStateCell"></td>

        {/* Basic columns */}
        {tableConfig.basic.columns.map(col => {
          if (!columnVisibility[col.key]) return null

          // From time
          if (col.key === 'fromTime') {
            return (
              <td key={col.key} className="currentStateCell">
                <div className="currentStateValue">{hasCharacter ? firstFromTime.toFixed(2) : '-'}</div>
              </td>
            )
          }

          // To time
          if (col.key === 'toTime') {
            return (
              <td key={col.key} className="currentStateCell">
                <div className="currentStateValue">{hasCharacter ? displaySnapshot.toTime.toFixed(2) : '-'}</div>
              </td>
            )
          }

          // Damage
          if (col.key === 'damage') {
            return (
              <td key={col.key} className="currentStateCell">
                <div className="currentStateValue">{hasCharacter ? formatNumber(displaySnapshot.damage) : '-'}</div>
              </td>
            )
          }

          // DPS
          if (col.key === 'dps') {
            return (
              <td key={col.key} className="currentStateCell">
                <div className="currentStateValue">{hasCharacter ? formatNumber(displaySnapshot.dps) : '-'}</div>
              </td>
            )
          }

          return <td key={col.key} className="currentStateCell"></td>
        })}

        {/* Status Effects columns (Negative Statuses, Buffs, Debuffs) */}
        {tableConfig.statusEffects && renderStatusColumns(tableConfig.statusEffects.columns, columnVisibility, displaySnapshot)}

        {/* Other columns (Coordinated Attacks, etc.) */}
        {tableConfig.other && renderStatusColumns(tableConfig.other.columns, columnVisibility, displaySnapshot)}
      </tr>
  )
}

function createInitialSnapshot(): Snapshot {
  return {
    id: '0',
    character: '',
    action: '',
    fromTime: 0,
    toTime: 0,
    damage: 0,
    dps: 0,
    charactersEnergies: {},
    buffs: {},
    buffsTimeLeft: {},
    buffsSwapsLeft: {},
    buffsMaxStacks: {},
    buffsActivationStats: {},
    buffsTargetCharacter: {},
    debuffs: {},
    debuffsTimeLeft: {},
    debuffsSwapsLeft: {},
    debuffsMaxStacks: {},
    negativeStatuses: {},
    negativeStatusesTimeLeft: {},
    negativeStatusesMaxStacks: {},
    charactersCooldowns: {},
    charactersActionStacks: {},
    charactersActionStacksConfig: {},
    coordinatedAttacks: {},
    coordinatedAttacksTimeLeft: {},
    coordinatedAttacksSwapRequired: {},
    charactersPositions: {},
    charactersPersistentUntil: {},
    charactersLastAction: {},
    charactersRequiresSwapOut: {},
    charactersForms: {},
    charactersSwapCooldownUntil: {},
    charactersAttemptFollowUp: {},
    charactersComboWindows: {},
    charactersForteGrants: {},
    charactersComboChainTags: {},
    charactersOffFieldSince: {},
    offFieldTriggerEvents: {},
  }
}

function renderStatusColumns(columns: any[], columnVisibility: ColumnVisibility, snapshot: Snapshot) {
  let firstVisible = true
  return columns
    .filter((col: any) => columnVisibility[col.key])
    .map((col: any) => {
      const className = firstVisible ? 'currentStateCell charGroupCell' : 'currentStateCell'
      firstVisible = false

      // If the column has statusMetadata, render tags
      if (col.statusMetadata) {
        // Access snapshot data directly based on column key
        let statusData: Record<string, number> | undefined
        let timeLeftData: Record<string, number> | undefined
        let activationStatsData: Record<string, object> | undefined
        let statusType: 'buff' | 'debuff' | 'negativeStatus' = 'buff'

        if (col.key === 'negativeStatuses') {
          statusData = snapshot.negativeStatuses as Record<string, number> | undefined
          timeLeftData = snapshot.negativeStatusesTimeLeft as Record<string, number> | undefined
          statusType = 'negativeStatus'
        } else if (col.key === 'buffs') {
          statusData = snapshot.buffs as Record<string, number> | undefined
          timeLeftData = snapshot.buffsTimeLeft as Record<string, number> | undefined
          activationStatsData = snapshot.buffsActivationStats as Record<string, object> | undefined
          statusType = 'buff'
        } else if (col.key === 'debuffs') {
          statusData = snapshot.debuffs as Record<string, number> | undefined
          timeLeftData = snapshot.debuffsTimeLeft as Record<string, number> | undefined
          statusType = 'debuff'
        } else if (col.key === 'coordinatedAttacks') {
          statusData = snapshot.coordinatedAttacks as Record<string, number> | undefined
          timeLeftData = snapshot.coordinatedAttacksTimeLeft as Record<string, number> | undefined
          statusType = 'buff'
        }

        const negativeStatusesMaxStacksData = col.key === 'negativeStatuses'
          ? snapshot.negativeStatusesMaxStacks as Record<string, number> | undefined
          : undefined

        const statuses =
          col.statusMetadata?.map((meta: any) => ({
            key: meta.key,
            label: meta.label,
            icon: meta.icon,
            value: statusData?.[meta.key] ?? 0,
            maxStacks: negativeStatusesMaxStacksData?.[meta.key] ?? meta.maxStacks,
            type: statusType,
            color: meta.color,
            timeLeft: timeLeftData?.[meta.key],
            description: meta.description,
            showStats: meta.showStats,
            stats: activationStatsData?.[meta.key] as object | undefined,
          })) ?? []

        return (
          <td key={col.key} className={className}>
            <StatusTagGroup statuses={statuses} />
          </td>
        )
      }

      // Otherwise, render empty (shouldn't happen with new structure)
      return <td key={col.key} className={className}></td>
    })
}
