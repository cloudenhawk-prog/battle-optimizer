import type { Character } from "../../types/character"
import type { ColumnGroup, ColumnDef } from "../../types/tableDefinitions"
import type { Snapshot } from "../../types/snapshot"
import { createOptionalGroup } from "./helpers"

// ========== Build Buff Column Group ==========================================================================================

export function buildBuffColumns(selectedCharacters: Character[]): ColumnGroup | null {
  const actionBuffs = selectedCharacters.flatMap(character =>
    character.actions.flatMap(action =>
      action.buffsApplied.map(buff => buff.name)
    )
  )

  const activeBuffs = Array.from(new Set(actionBuffs))

  const columns: ColumnDef[] = activeBuffs.map(buff => {
    const key = buff.toLowerCase().replace(/\s+/g, "_")
    return {
      key,
      label: buff,
      icon: `/assets/${key}.png`,
      render: (snapshot: Snapshot) => {
        const buffs = snapshot.buffs as Record<string, number> | undefined
        return buffs?.[key]
      },
    }
  })

  return createOptionalGroup({ label: "Buffs", icon: "assets/buffs.png" }, columns)
}
