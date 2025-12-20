import RotationEditor from "../components/rotation-editor/RotationEditor"
import { characters } from "../data/characters"
import { enemies } from "../data/enemies.ts"
import { buildTableConfig } from "../components/rotation-editor/table-builders/buildTableConfig"
import { flattenTableColumns } from "../utils/tableBuilders.tsx"
import { useState } from "react"
import Topbar from "../components/topbar/Topbar.tsx"

export default function RotationEditorPage() {
  const tableConfig = buildTableConfig(characters)

  const allColumns = flattenTableColumns(tableConfig)
  const [columnVisibility, setColumnVisibility] = useState(
    () => Object.fromEntries(allColumns.map(col => [col.key, true]))
  )

  return (
    <div>
      <Topbar
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
