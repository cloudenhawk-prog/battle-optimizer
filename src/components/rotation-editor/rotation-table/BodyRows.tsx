import type { Character } from "../../../types/character"
import type { ColumnGroup } from "../../../types/tableDefinitions"
import type { Snapshot } from "../../../types/snapshot"
import { buildActionOptions } from "../../../utils/optionBuilders"

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
}

export function BodyRow({
  snapshot,
  charactersInBattle,
  tableConfig,
  onSelectCharacter,
  onSelectAction,
  isLastRow = false,
  isNewRow = false
}: BodyRowProps) {
  const snapshotId = Number(snapshot.id)
  const character = snapshot.character ?? ""
  const action = snapshot.action ?? ""

  console.log(`BodyRow render: ${snapshotId} isNewRow = ${isNewRow}`)

  return (
    <tr className={`${isLastRow ? "lastRowClass" : ""} ${isNewRow ? "rowHighlight" : ""}`}>
      {/* Character select */}
      <td className="tableCellBody">
        <select value={character} onChange={e => onSelectCharacter(snapshotId, e.target.value)}>
          <option value="">-- Select Character --</option>
          {charactersInBattle.map(c => (
            <option key={c.name} value={c.name}>{c.name}</option>
          ))}
        </select>
      </td>

      {/* Action select */}
      <td className="tableCellBody">
        <select
          value={action}
          onChange={e => onSelectAction(snapshotId, e.target.value)}
          disabled={!character}
        >
          <option value="">-- Select Action --</option>
          {buildActionOptions(
            charactersInBattle.find(c => c.name === character)?.actions ?? [],
            action
          )}
        </select>
      </td>

      {/* Basic columns */}
      {tableConfig.basic.columns.map(col => (
        <td key={col.key} className="tableCellBody">
          {character && action ? col.render(snapshot) : ""}
        </td>
      ))}

      {/* Character-specific columns (dynamic energies included) */}
      {tableConfig.characters.flatMap(group =>
        group.columns.map((col, idx) => (
          <td key={col.key} className={`tableCellBody ${idx === 0 ? "charGroupBody" : ""}`}>
            {character && action ? col.render(snapshot) : ""}
          </td>
        ))
      )}

      {/* Negative status columns */}
      {tableConfig.negativeStatuses.columns.map((col, idx) => (
        <td key={col.key} className={`tableCellBody ${idx === 0 ? "charGroupBody" : ""}`}>
          {character && action ? col.render(snapshot) : ""}
        </td>
      ))}

      {/* Buff columns */}
      {tableConfig.buffs.columns.map((col, idx) => (
        <td key={col.key} className={`tableCellBody ${idx === 0 ? "charGroupBody" : ""}`}>
          {character && action ? col.render(snapshot) : ""}
        </td>
      ))}

      {/* Debuff columns */}
      {tableConfig.debuffs.columns.map((col, idx) => (
        <td key={col.key} className={`tableCellBody ${idx === 0 ? "charGroupBody" : ""}`}>
          {character && action ? col.render(snapshot) : ""}
        </td>
      ))}
    </tr>
  )
}
