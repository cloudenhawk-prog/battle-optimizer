import "../../styles/rotation-editor/BodyRows.css"
import type { Character } from "../../types/character"
import type { ColumnGroup, ColumnVisibility } from "../../types/tableDefinitions"
import type { Snapshot } from "../../types/snapshot"
import { buildActionOptions } from "../../utils/optionBuilders"

type BodyRowProps = {
  snapshot: Snapshot
  charactersInBattle: Character[]
  tableConfig: {
    basic: ColumnGroup
    characters: ColumnGroup[]
    negativeStatuses: ColumnGroup
    buffs: ColumnGroup
    debuffs: ColumnGroup
  }
  onSelectCharacter: (snapshotId: number, characterName: string) => void
  onSelectAction: (snapshotId: number, actionName: string) => void
  isLastRow?: boolean
  isNewRow?: boolean
  columnVisibility: ColumnVisibility
  setColumnVisibility: React.Dispatch<React.SetStateAction<ColumnVisibility>>
}

export function BodyRow({
  snapshot,
  charactersInBattle,
  tableConfig,
  onSelectCharacter,
  onSelectAction,
  isLastRow = false,
  isNewRow = false,
  columnVisibility,
  setColumnVisibility
}: BodyRowProps) {
  const snapshotId = Number(snapshot.id)
  const character = snapshot.character ?? ""
  const action = snapshot.action ?? ""

  function renderBodyColumns(
    columns: typeof tableConfig.basic.columns,
    columnVisibility: ColumnVisibility,
    snapshot: Snapshot,
    character: string,
    action: string
  ) {
    let firstVisible = true
    return columns
      .filter(col => columnVisibility[col.key])
      .map(col => {
        const className = firstVisible ? "tableCellBody charGroupBody" : "tableCellBody"
        firstVisible = false
        return (
          <td key={col.key} className={className}>
            {character && action ? col.render(snapshot) : ""}
          </td>
        )
      })
  }

  return (
    <tr className={`tableBody ${isLastRow ? "lastRowClass" : ""} ${isNewRow ? "rowHighlight" : ""}`}>
      {/* Character select */}
      <td className="tableCellBody">
        <select
        className="selectInput"
        value={character}
        onChange={e =>
        onSelectCharacter(snapshotId, e.target.value)}
        >
          <option value="">-- Select Character --</option>
          {charactersInBattle.map(c => (
            <option key={c.name} value={c.name}>{c.name}</option>
          ))}
        </select>
      </td>

      {/* Action select */}
      <td className="tableCellBody">
        <select
          className="selectInput"
          value={action}
          onChange={e => onSelectAction(snapshotId, e.target.value)}
          disabled={!character}
        >
          <option value="">-- Select Action --</option>
          {buildActionOptions(
            charactersInBattle.find(c => c.name === character)?.actions ?? [],
            action,
            charactersInBattle.find(c => c.name === character),
            snapshot.charactersEnergies[character]
          )}
        </select>
      </td>

      {/* Basic columns */}
      {tableConfig.basic.columns.map(col => {
        if (!columnVisibility[col.key]) return null;
        return (
          <td key={col.key} className="tableCellBody">
            {character && action ? col.render(snapshot) : ""}
          </td>
        );
      })}

      {/* Character-specific columns */}
      {tableConfig.characters.flatMap(group =>
        renderBodyColumns(group.columns, columnVisibility, snapshot, character, action)
      )}

      {/* Negative status columns */}
      {tableConfig.negativeStatuses && renderBodyColumns(tableConfig.negativeStatuses.columns, columnVisibility, snapshot, character, action)}

      {/* Buff columns */}
      {tableConfig.buffs && renderBodyColumns(tableConfig.buffs.columns, columnVisibility, snapshot, character, action)}

      {/* Debuff columns */}
      {tableConfig.debuffs && renderBodyColumns(tableConfig.debuffs.columns, columnVisibility, snapshot, character, action)}
    </tr>
  )
}
