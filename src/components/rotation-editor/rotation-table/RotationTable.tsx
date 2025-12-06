import { HeaderRow } from "./HeaderRow"
import { BodyRow } from "./BodyRows"
import type { TableConfig } from "../../../types/tableDefinitions"
import type { Character } from "../../../types/characters"

type RotationTableProps = {
  snapshots: Array<Record<string, number | string | Record<string, Record<string, number>> | Record<string, number>>>
  charactersInBattle: Character[]
  tableConfig: TableConfig
  onSelectCharacter: (snapshotId: number, characterName: string) => void
  onSelectAction: (snapshotId: number, actionName: string) => void
}

export function RotationTable({
  snapshots,
  charactersInBattle,
  tableConfig,
  onSelectCharacter,
  onSelectAction,
}: RotationTableProps) {
  return (
    <div className="tableWrapper">
      <table className="tableBase">
        <HeaderRow tableConfig={tableConfig} />
        <tbody className="tableBody">
          {snapshots.map((s, idx) => (
            <BodyRow
              key={s.id as number}
              snapshot={s}
              charactersInBattle={charactersInBattle}
              tableConfig={tableConfig}
              onSelectCharacter={onSelectCharacter}
              onSelectAction={onSelectAction}
              isLastRow={idx === snapshots.length - 1}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}
