import { useSnapshots } from "./useSnapshots"
import { useCharacterActions } from "./useCharacterActions"
import type { Character } from "../../types/character"
import type { TableConfig } from "../../types/tableDefinitions"
import type { Enemy } from "../../types/enemy"
import type { DamageEvent } from "../../types/events"
import { useState } from "react"

// ========== Hook: useRotationEditor ==========================================================================================

type UseRotationEditorProps = {
  charactersInBattle: Character[]
  tableConfig: TableConfig
  enemy: Enemy
}

export function useRotationEditor({ charactersInBattle, tableConfig, enemy }: UseRotationEditorProps) {
  const [damageEvents, setDamageEvents] = useState<DamageEvent[]>([])
  const { snapshots, setSnapshots } = useSnapshots({ charactersInBattle, tableConfig })
  const { handleCharacterSelect, handleActionSelect } = useCharacterActions({ snapshots, setSnapshots, charactersInBattle, enemy, tableConfig, damageEvents, setDamageEvents })

  return {
    snapshots,
    damageEvents,
    handleCharacterSelect,
    handleActionSelect,
    tableConfig
  }
}
