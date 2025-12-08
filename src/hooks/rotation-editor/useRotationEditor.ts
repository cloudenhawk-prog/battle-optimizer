import { useSnapshots } from "./useSnapshots"
import { useCharacterActions } from "./useCharacterActions"
import { useTableUpdates } from "./useTableUpdates"
import type { Character } from "../../types/characters"
import type { TableConfig } from "../../types/tableDefinitions"

type UseRotationEditorProps = {
  charactersInBattle: Character[]
  tableConfig: TableConfig
}

export function useRotationEditor({ charactersInBattle, tableConfig }: UseRotationEditorProps) {
  const { snapshots, setSnapshots, createEmptySnapshot } = useSnapshots(charactersInBattle, tableConfig)
  const { handleCharacterSelect, handleActionSelect } = useCharacterActions(snapshots, setSnapshots, charactersInBattle, tableConfig)
  const { tableConfigWithRenderers } = useTableUpdates(snapshots, tableConfig)

  return {
    snapshots,
    handleCharacterSelect,
    handleActionSelect,
    tableConfig: tableConfigWithRenderers
  }
}
