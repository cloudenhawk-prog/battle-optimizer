import '../../styles/rotation-editor/BodyRows.css'
import type { Character } from '../../types/character'
import type { ColumnDef, TableConfig, ColumnVisibility } from '../../types/tableDefinitions'
import type { Snapshot } from '../../types/snapshot'
import { CharacterSelect } from './CharacterSelect'
import { ActionSelect } from './ActionSelect'
import { StatusTagGroup } from './StatusTagGroup'
import { parseCoordinatedAttackKey } from '../../utils/hooks/coordinatedAttackHelpers'
import { isSwapRequiredLocked } from '../../utils/hooks/snapshotHelpers'
import { isFollowUpCastableNow, validateMustChain } from '../../utils/conditions/mustChainValidator'

// ========== Component: Body Row ==============================================================================================

type BodyRowProps = {
  snapshot: Snapshot
  previousSnapshot: Snapshot | null
  charactersInBattle: Character[]
  tableConfig: TableConfig
  onSelectCharacter: (snapshotId: number, characterName: string) => void
  onSelectAction: (snapshotId: number, actionName: string) => void
  isLastRow?: boolean
  isNewRow?: boolean
  columnVisibility: ColumnVisibility
  onRowClick?: (snapshot: Snapshot) => void
}

export function BodyRow({ snapshot, previousSnapshot, charactersInBattle, tableConfig, onSelectCharacter, onSelectAction, isLastRow = false, isNewRow = false, columnVisibility, onRowClick }: BodyRowProps) {
  const snapshotId = Number(snapshot.id)
  const character = snapshot.character ?? ''
  const action = snapshot.action ?? ''
  const isLocked = !isLastRow && !!character && !!action

  const lockedCharacters = new Set<string>()
  if (previousSnapshot) {
    const prevChar = previousSnapshot.character ?? ''
    if (prevChar && isSwapRequiredLocked(previousSnapshot, prevChar)) {
      lockedCharacters.add(prevChar)
    }
    // Lock characters that are still within their 1-second swap cooldown
    const swapCooldowns = previousSnapshot.charactersSwapCooldownUntil ?? {}
    const prevToTime = previousSnapshot.toTime
    for (const [charName, cooldownUntil] of Object.entries(swapCooldowns)) {
      if (cooldownUntil - prevToTime > 0) {
        lockedCharacters.add(charName)
      }
    }
    // Lock all characters except the one with a follow-up (combo system)
    const attemptFollowUps = previousSnapshot.charactersAttemptFollowUp ?? {}
    const charactersWithFollowUp = Object.keys(attemptFollowUps).filter(char => {
      const entry = attemptFollowUps[char]
      if (!entry) return false
      if (entry.must) return true
      // "if possible": only lock the character when the follow-up is castable AND its own MUST chain can be satisfied
      const charObj = charactersInBattle.find(c => c.name === char)
      if (!charObj) return false
      const followUpAction = charObj.actions.find(a => a.name === entry.actionName || a.groupName === entry.actionName)
      return !!followUpAction && isFollowUpCastableNow(followUpAction, previousSnapshot, charObj) && validateMustChain(followUpAction, previousSnapshot, charObj, charObj.actions)
    })
    if (charactersWithFollowUp.length > 0) {
      // Lock all characters that don't have a required follow-up
      for (const char of charactersInBattle) {
        if (!charactersWithFollowUp.includes(char.name)) {
          lockedCharacters.add(char.name)
        }
      }
    }
  }

  return (
    <tr
      className={`tableBody ${isLastRow ? 'lastRowClass' : ''} ${isNewRow ? 'rowHighlight' : ''}`}
      role="button"
      tabIndex={0}
      onClick={e => {
        // avoid opening overlay when interacting with form controls inside the row
        const el = e.target as HTMLElement
        if (el.closest('select') || el.closest('button') || el.closest('input')) return
        // Also avoid opening when clicking on ActionSelect dropdown elements (which are portaled)
        if (el.closest('.actionSelectDropdown') || el.closest('.actionSelectWrapper')) return
        onRowClick?.(snapshot)
      }}>
      {/* Character select */}
      <td className="tableCellBody">
        {isLocked ? (
          <div className="lockedSelectorText">{character}</div>
        ) : (
          <CharacterSelect
            value={character}
            characters={charactersInBattle}
            onChange={characterName => {
              onSelectCharacter(snapshotId, characterName)
            }}
            lockedCharacters={lockedCharacters}
          />
        )}
      </td>

      {/* Action select */}
      <td className="tableCellBody">
        {isLocked ? (
          <div className="lockedSelectorText">{snapshot.resolvedDisplayName ?? charactersInBattle.find(c => c.name === character)?.actions.find(a => a.name === action)?.displayName ?? action}</div>
        ) : (
          <ActionSelect
            value={action}
            actions={charactersInBattle.find(c => c.name === character)?.actions ?? []}
            character={charactersInBattle.find(c => c.name === character)}
            currentEnergies={snapshot.charactersEnergies[character]}
            previousSnapshot={previousSnapshot}
            onChange={actionName => {
              onSelectAction(snapshotId, actionName)
            }}
            disabled={!character}
          />
        )}
      </td>

      {/* Basic columns */}
      {tableConfig.basic.columns.map(col => {
        if (!columnVisibility[col.key]) return null
        return (
          <td key={col.key} className="tableCellBody">
            {character && action ? col.render(snapshot) : ''}
          </td>
        )
      })}

      {/* Status effects columns (negative statuses, buffs, debuffs) */}
      {tableConfig.statusEffects && renderBodyColumnsWithTags(tableConfig.statusEffects.columns, columnVisibility, snapshot, previousSnapshot, character, action)}

      {/* Other columns (coordinated attacks, etc.) */}
      {tableConfig.other && renderBodyColumnsWithTags(tableConfig.other.columns, columnVisibility, snapshot, previousSnapshot, character, action)}
    </tr>
  )
}

// ========== Helper Functions =================================================================================================

function renderBodyColumnsWithTags(columns: ColumnDef[], columnVisibility: ColumnVisibility, snapshot: Snapshot, previousSnapshot: Snapshot | null, character: string, action: string) {
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

        if (col.key === 'negativeStatuses') {
          statusData = sourceSnapshot?.negativeStatuses as Record<string, number> | undefined
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
            maxStacks: meta.maxStacks,
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
