import RotationEditor from "../components/rotation-editor/RotationEditor"
import { characters } from "../data/characters"
import { enemies } from "../data/enemies.ts"
import { buildTableConfig } from "../utils/table-builders/buildTableConfig"
import { flattenTableColumns } from "../utils/table-builders/helpers.tsx"
import { useState } from "react"
import Topbar from "../components/topbar/Topbar.tsx"

// ========== Main Rotation Editor Page ========================================================================================

export default function RotationEditorPage() {
  const tableConfig = buildTableConfig(characters)

  const allColumns = flattenTableColumns(tableConfig)
  const [columnVisibility, setColumnVisibility] = useState(
    () => Object.fromEntries(allColumns.map(col => [col.key, true]))
  )

  return (
    <div>
      <Topbar
        tableConfig={tableConfig}
        allColumns={allColumns}
        columnVisibility={columnVisibility}
        setColumnVisibility={setColumnVisibility}
      />

      <RotationEditor
      charactersInBattle={characters}
      enemy={enemies[0]}
      tableConfig={tableConfig}
      columnVisibility={columnVisibility}
      setColumnVisibility={setColumnVisibility}
      />
    </div>
  )
}
