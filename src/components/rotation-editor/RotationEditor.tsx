import "../../styles/rotation-editor/RotationEditor.css"
import { useRotationEditor } from "../../hooks/rotation-editor/useRotationEditor"
import { RotationTable } from "./RotationTable"
import type { Character } from "../../types/character"
import type { Enemy } from "../../types/enemy"
import type { TableConfig, ColumnVisibility } from "../../types/tableDefinitions"

// ========== Component: Rotation Editor =======================================================================================

type RotationEditorProps = {
  charactersInBattle: Character[]
  enemy: Enemy
  tableConfig: TableConfig
  columnVisibility: ColumnVisibility
  setColumnVisibility: React.Dispatch<React.SetStateAction<ColumnVisibility>>
}

export default function RotationEditor({ charactersInBattle, enemy, tableConfig, columnVisibility, setColumnVisibility }: RotationEditorProps) {
  const { snapshots, damageEvents, handleCharacterSelect, handleActionSelect } = useRotationEditor({ charactersInBattle, tableConfig, enemy })

  return (
    <div className="pageWrapper">
      <h1 className="heading"></h1>
      <RotationTable
        snapshots={snapshots}
        charactersInBattle={charactersInBattle}
        tableConfig={tableConfig}
        onSelectCharacter={handleCharacterSelect}
        onSelectAction={handleActionSelect}
        columnVisibility={columnVisibility}
        setColumnVisibility={setColumnVisibility}
      />
    </div>
  )
}
