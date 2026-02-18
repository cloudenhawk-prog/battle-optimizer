import '../../styles/rotation-editor/CurrentStateRow.css'
import type { Snapshot } from '../../types/snapshot'
import type { Character } from '../../types/character'
import type { TableConfig, ColumnVisibility } from '../../types/tableDefinitions'
import { negativeStatuses } from '../../data/negativeStatuses'

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
  charactersInBattle: Character[]
  tableConfig: TableConfig
  columnVisibility: ColumnVisibility
}

export function CurrentStateRow({ snapshot, charactersInBattle, tableConfig, columnVisibility }: CurrentStateRowProps) {
  // Create initial snapshot if none exists or character not selected
  const displaySnapshot = snapshot || createInitialSnapshot()
  const hasCharacter = displaySnapshot.character && displaySnapshot.character !== ''

  return (
    <tbody className="currentStateBody">
      <tr className="currentStateRow">
        {/* Character */}
        <td className="currentStateCell"></td>

        {/* Action */}
        <td className="currentStateCell"></td>

        {/* Basic columns */}
        {tableConfig.basic.columns.map(col => {
          if (!columnVisibility[col.key]) return null

          // From time - empty
          if (col.key === 'fromTime') {
            return <td key={col.key} className="currentStateCell"></td>
          }

          // To time - empty
          if (col.key === 'toTime') {
            return <td key={col.key} className="currentStateCell"></td>
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

        {/* Character-specific columns (energies) */}
        {tableConfig.characters.flatMap(group => renderStateColumns(group, columnVisibility, displaySnapshot, charactersInBattle))}

        {/* Negative status columns */}
        {tableConfig.negativeStatuses && renderNegativeStatusColumns(tableConfig.negativeStatuses.columns, columnVisibility, displaySnapshot.negativeStatuses, displaySnapshot.negativeStatusesTimeLeft)}

        {/* Buff columns - empty for now */}
        {tableConfig.buffs &&
          tableConfig.buffs.columns.map(col => {
            if (!columnVisibility[col.key]) return null
            return <td key={col.key} className="currentStateCell"></td>
          })}

        {/* Debuff columns - empty for now */}
        {tableConfig.debuffs &&
          tableConfig.debuffs.columns.map(col => {
            if (!columnVisibility[col.key]) return null
            return <td key={col.key} className="currentStateCell"></td>
          })}
      </tr>
    </tbody>
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
    debuffs: {},
    negativeStatuses: {},
    negativeStatusesTimeLeft: {},
  }
}

function renderStateColumns(group: any, columnVisibility: ColumnVisibility, snapshot: Snapshot, charactersInBattle: Character[]) {
  // Extract character name from the group label
  const characterName = group.label
  const character = charactersInBattle.find(c => c.name === characterName)
  const energies = (snapshot.charactersEnergies as any)?.[characterName] || {}

  let firstVisible = true
  return group.columns
    .filter((col: any) => columnVisibility[col.key])
    .map((col: any) => {
      const className = firstVisible ? 'currentStateCell charGroupCell' : 'currentStateCell'
      firstVisible = false

      // Extract energy type from column key (format: "CharacterName_energyType")
      const energyType = col.key.split('_')[1]
      const current = energies[energyType] || 0
      const max = character?.maxEnergies[energyType as keyof typeof character.maxEnergies] || 100
      const percentage = Math.min((current / max) * 100, 100)

      return (
        <td key={col.key} className={className}>
          <div className="energyStateDisplay">
            <div className="energyStateBar" style={{ width: `${percentage}%` }} data-energy-type={energyType.toLowerCase()} />
            <span className="energyStateText">
              {current}/{max}
            </span>
          </div>
        </td>
      )
    })
}

function renderNegativeStatusColumns(columns: any[], columnVisibility: ColumnVisibility, negativeStatusesRecord: Record<string, number>, negativeStatusesTimeLeft: Record<string, number>) {
  let firstVisible = true
  return columns
    .filter((col: any) => columnVisibility[col.key])
    .map((col: any) => {
      const className = firstVisible ? 'currentStateCell charGroupCell' : 'currentStateCell'
      firstVisible = false

      const currentStacks = negativeStatusesRecord[col.key] || 0
      // Find the negative status by matching the name property (col.key is the display name like "Aero Erosion")
      const negativeStatusData = Object.values(negativeStatuses).find(ns => ns.name === col.key)
      const maxStacks = negativeStatusData?.maxStacksDefault || 0
      const timeLeft = negativeStatusesTimeLeft[col.key] || 0

      return (
        <td key={col.key} className={className}>
          <div className="statusStateDisplay">
            <div className="statusStateContent">
              <div className="statusStateStacks">
                {currentStacks}/{maxStacks}
              </div>
              <div className="statusStateTime">{timeLeft.toFixed(1)}s</div>
            </div>
          </div>
        </td>
      )
    })
}
