import type { Character } from "../../types/character"
import type { ColumnGroup, ColumnDef } from "../../types/tableDefinitions"
import type { Snapshot } from "../../types/snapshot"
import { createOptionalGroup } from "./helpers"

// ========== Build Debuff Column Group ========================================================================================

export function buildDebuffColumns(selectedCharacters: Character[]): ColumnGroup | null {
  const actionDebuffs = selectedCharacters.flatMap(character =>
    character.actions.flatMap(action =>
      action.debuffsApplied.map(debuff => debuff.name)
    )
  )

  const activeDebuffs = Array.from(new Set(actionDebuffs))

  const columns: ColumnDef[] = activeDebuffs.map(debuff => {
    const key = debuff.replace(/\s+/g, "")
    return {
      key,
      label: debuff,
      icon: `/assets/${key}.png`,
      render: (snapshot: Snapshot) => {
        const debuffs = snapshot.debuffs as Record<string, number> | undefined
        return debuffs?.[key]
      },
    }
  })

  return createOptionalGroup({ label: "Debuffs", icon: "assets/debuffs.png" }, columns)
}
