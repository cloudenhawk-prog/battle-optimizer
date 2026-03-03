import '../../styles/rotation-editor/BodyRows.css'
import type { Character } from '../../types/character'
import type { ColumnDef, TableConfig, ColumnVisibility } from '../../types/tableDefinitions'
import type { Snapshot } from '../../types/snapshot'
import { CharacterSelect } from './CharacterSelect'
import { ActionSelect } from './ActionSelect'

// ========== Component: Body Row ==============================================================================================

type BodyRowProps = {
  snapshot: Snapshot
  charactersInBattle: Character[]
  tableConfig: TableConfig
  onSelectCharacter: (snapshotId: number, characterName: string) => void
  onSelectAction: (snapshotId: number, actionName: string) => void
  isLastRow?: boolean
  isNewRow?: boolean
  columnVisibility: ColumnVisibility
  onRowClick?: (snapshot: Snapshot) => void
}

export function BodyRow({ snapshot, charactersInBattle, tableConfig, onSelectCharacter, onSelectAction, isLastRow = false, isNewRow = false, columnVisibility, onRowClick }: BodyRowProps) {
  const snapshotId = Number(snapshot.id)
  const character = snapshot.character ?? ''
  const action = snapshot.action ?? ''

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
        <CharacterSelect
          value={character}
          characters={charactersInBattle}
          onChange={characterName => {
            console.log('📍 BodyRow - CharacterSelect onChange:', { snapshotId, characterName })
            onSelectCharacter(snapshotId, characterName)
          }}
        />
      </td>

      {/* Action select */}
      <td className="tableCellBody">
        <ActionSelect
          value={action}
          actions={charactersInBattle.find(c => c.name === character)?.actions ?? []}
          character={charactersInBattle.find(c => c.name === character)}
          currentEnergies={snapshot.charactersEnergies[character]}
          snapshot={snapshot}
          onChange={actionName => {
            console.log('📍 BodyRow - ActionSelect onChange:', { snapshotId, actionName })
            onSelectAction(snapshotId, actionName)
          }}
          disabled={!character}
        />
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

      {/* Character-specific columns */}
      {tableConfig.characters.flatMap(group => renderBodyColumns(group.columns, columnVisibility, snapshot, character, action))}

      {/* Negative status columns */}
      {tableConfig.negativeStatuses && renderBodyColumns(tableConfig.negativeStatuses.columns, columnVisibility, snapshot, character, action)}

      {/* Buff columns */}
      {tableConfig.buffs && renderBodyColumns(tableConfig.buffs.columns, columnVisibility, snapshot, character, action)}

      {/* Debuff columns */}
      {tableConfig.debuffs && renderBodyColumns(tableConfig.debuffs.columns, columnVisibility, snapshot, character, action)}
    </tr>
  )
}

// ========== Helper Functions =================================================================================================

function renderBodyColumns(columns: ColumnDef[], columnVisibility: ColumnVisibility, snapshot: Snapshot, character: string, action: string) {
  let firstVisible = true
  return columns
    .filter(col => columnVisibility[col.key])
    .filter(col => !(col as any).isPermanent) // Hide permanent modifiers from body rows
    .map(col => {
      const className = firstVisible ? 'tableCellBody charGroupBody' : 'tableCellBody'
      firstVisible = false
      return (
        <td key={col.key} className={className}>
          {character && action ? col.render(snapshot) : ''}
        </td>
      )
    })
}
