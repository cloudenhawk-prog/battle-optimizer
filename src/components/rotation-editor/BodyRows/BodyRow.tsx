// One timeline row of the rotation table: character/action pickers (or locked labels) plus data cells.
import '../../../styles/rotation-editor/BodyRows.css'
import type { Character } from '../../../types/character'
import type { TableConfig, ColumnVisibility } from '../../../types/tableDefinitions'
import type { Snapshot } from '../../../types/snapshot'
import { getTeamAccent } from '../../shared/elementColors'
import { PortraitRing } from '../../shared/ui'
import { CharacterSelect } from '../CharacterSelect'
import { ActionSelect } from '../ActionSelect'
import { getLockedCharacters } from './lockedCharacters'
import { renderBodyColumnsWithTags } from './bodyStatusColumns'

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
  sandboxMode?: boolean
  rowDeletionMode?: boolean
  onDeleteRow?: (snapshotId: number) => void
}

export function BodyRow({ snapshot, previousSnapshot, charactersInBattle, tableConfig, onSelectCharacter, onSelectAction, isLastRow = false, isNewRow = false, columnVisibility, onRowClick, sandboxMode = false, rowDeletionMode = false, onDeleteRow }: BodyRowProps) {
  const snapshotId = Number(snapshot.id)
  const character = snapshot.character ?? ''
  const action = snapshot.action ?? ''
  // Only the last row is editable once a row has both a character and an action
  const isLocked = !isLastRow && !!character && !!action

  // Elemental theming: the character's team accent, exposed as CSS custom props for the row tint
  const charData = character ? charactersInBattle.find(c => c.name === character) : undefined
  const elStyle = charData
    ? ({ '--el-primary': getTeamAccent(charactersInBattle, character), '--ui-accent-raw': getTeamAccent(charactersInBattle, character) } as React.CSSProperties)
    : undefined

  const lockedCharacters = getLockedCharacters(previousSnapshot, charactersInBattle, sandboxMode)

  return (
    <tr
      className={`tableBody ${isLastRow ? 'lastRowClass' : ''} ${isNewRow ? 'rowHighlight' : ''}`}
      style={elStyle}
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
      <td className={`tableCellBody${rowDeletionMode ? ' tableCellHasDeleteBtn' : ''}`}>
        {rowDeletionMode && character && action && (
          <button
            type="button"
            className="deleteRowButton"
            title="Delete this row and everything after it"
            onClick={e => {
              e.stopPropagation()
              onDeleteRow?.(snapshotId)
            }}
          >
            <img alt="Delete" src="/assets/ui/close.png" />
          </button>
        )}
        {isLocked ? (
          <div className="rowCharacter">
            <PortraitRing name={character} src={charData?.image} size={26} />
            <span className="rowCharacterName">{character}</span>
          </div>
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
          <div className="rowAction">{snapshot.resolvedDisplayName ?? charData?.actions.find(a => a.name === action)?.displayName ?? action}</div>
        ) : (
          <ActionSelect
            value={action}
            actions={(charactersInBattle.find(c => c.name === character)?.actions ?? []).filter(a => !a.tags?.includes('INTRO_ACTION') && !a.tags?.includes('OUTRO_ACTION'))}
            character={charactersInBattle.find(c => c.name === character)}
            currentEnergies={snapshot.charactersEnergies[character]}
            previousSnapshot={previousSnapshot}
            onChange={actionName => {
              onSelectAction(snapshotId, actionName)
            }}
            disabled={!character}
            sandboxMode={sandboxMode}
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
