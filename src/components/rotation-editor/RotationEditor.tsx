import "../../styles/components/RotationEditor.css"
import { useRotationEditor } from "../../hooks/rotation-editor/useRotationEditor"
import { buildTableConfig } from "./table-builders/buildTableConfig"
import { RotationTable } from "./rotation-table/RotationTable"
import type { Character } from "../../types/character"
import type { Enemy } from "../../types/enemy"

type RotationEditorPageProps = {
  charactersInBattle: Character[]
  enemy: Enemy
}

export default function RotationEditorPage({ charactersInBattle, enemy }: RotationEditorPageProps) {
  const tableConfig = buildTableConfig(charactersInBattle)
  const { snapshots, damageEvents, handleCharacterSelect, handleActionSelect } = useRotationEditor({ charactersInBattle, tableConfig, enemy })
  // TODO: pass damageEvents to table so we can implement rows on-click overlay data breakdown

  return (
    <div className="pageWrapper">
      <h1 className="heading">Rotation Editor</h1>
      <RotationTable
        snapshots={snapshots} // TODO: send damageEvents to Table
        charactersInBattle={charactersInBattle}
        tableConfig={tableConfig}
        onSelectCharacter={handleCharacterSelect}
        onSelectAction={handleActionSelect}
      />
    </div>
  )
}