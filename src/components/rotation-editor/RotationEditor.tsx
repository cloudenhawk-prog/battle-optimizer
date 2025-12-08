import "../../styles/components/RotationEditor.css"
import { useRotationEditor } from "../../hooks/rotation-editor/useRotationEditor"
import { buildTableConfig } from "./table-builders/buildTableConfig"
import { RotationTable } from "./rotation-table/RotationTable"
import type { Character } from "../../types/characters"

type RotationEditorPageProps = {
  charactersInBattle: Character[]
}

export default function RotationEditorPage({ charactersInBattle }: RotationEditorPageProps) {
  const tableConfig = buildTableConfig(charactersInBattle)
  const { snapshots, handleCharacterSelect, handleActionSelect } = useRotationEditor({ charactersInBattle, tableConfig })

  return (
    <div className="pageWrapper">
      <h1 className="heading">Rotation Editor</h1>
      <RotationTable
        snapshots={snapshots}
        charactersInBattle={charactersInBattle}
        tableConfig={tableConfig}
        onSelectCharacter={handleCharacterSelect}
        onSelectAction={handleActionSelect}
      />
    </div>
  )
}