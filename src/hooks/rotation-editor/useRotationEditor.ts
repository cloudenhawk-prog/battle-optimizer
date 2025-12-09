import { useSnapshots } from "./useSnapshots"
import { useCharacterActions } from "./useCharacterActions"
import { useTableUpdates } from "./useTableUpdates"
import type { Character } from "../../types/character"
import type { TableConfig } from "../../types/tableDefinitions"
import type { Enemy } from "../../types/enemy"

type UseRotationEditorProps = {
  charactersInBattle: Character[]
  tableConfig: TableConfig
  enemy: Enemy
}

export function useRotationEditor({ charactersInBattle, tableConfig, enemy }: UseRotationEditorProps) {
  const { snapshots, setSnapshots } = useSnapshots({ charactersInBattle, tableConfig })
  const { handleCharacterSelect, handleActionSelect } = useCharacterActions({ snapshots, setSnapshots, charactersInBattle, enemy, tableConfig })
  const { tableConfigWithRenderers } = useTableUpdates(snapshots, tableConfig) // TODO: we dont use this yet for anything - just a skeleton. Ask LLM/GPT about possible future uses

  return {
    snapshots,
    handleCharacterSelect,
    handleActionSelect,
    tableConfig: tableConfigWithRenderers
  }
}
