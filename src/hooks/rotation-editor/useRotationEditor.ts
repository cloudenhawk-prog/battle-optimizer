import { useSnapshots } from "./useSnapshots"
import { useCharacterActions } from "./useCharacterActions"
import { useTableUpdates } from "./useTableUpdates"
import type { Character } from "../../types/character"
import type { TableConfig } from "../../types/tableDefinitions"
import type { Enemy } from "../../types/enemy"
import type { DamageEvent } from "../../types/snapshot"
import { useState } from "react"

type UseRotationEditorProps = {
  charactersInBattle: Character[]
  tableConfig: TableConfig
  enemy: Enemy
}

export function useRotationEditor({ charactersInBattle, tableConfig, enemy }: UseRotationEditorProps) {
  const [damageEvents, setDamageEvents] = useState<DamageEvent[]>([])
  const { snapshots, setSnapshots } = useSnapshots({ charactersInBattle, tableConfig })
  const { handleCharacterSelect, handleActionSelect } = useCharacterActions({ snapshots, setSnapshots, charactersInBattle, enemy, tableConfig, damageEvents, setDamageEvents })
  const { tableConfigWithRenderers } = useTableUpdates(snapshots, tableConfig) // TODO: we dont use this yet for anything - just a skeleton. Ask LLM/GPT about possible future uses

  return {
    snapshots,
    damageEvents,
    handleCharacterSelect,
    handleActionSelect,
    tableConfig: tableConfigWithRenderers,
  }
}
