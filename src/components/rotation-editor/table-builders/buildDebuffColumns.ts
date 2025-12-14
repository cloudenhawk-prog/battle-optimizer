import type { Character } from "../../../types/character"
import type { ColumnGroup, ColumnDef } from "../../../types/tableDefinitions"
import type { Snapshot } from "../../../types/snapshot"
import { createOptionalGroup } from "../../../utils/tableBuilders"

export function buildDebuffColumns(selectedCharacters: Character[]): ColumnGroup | null {
  const activeDebuffs = Array.from(
    new Set(selectedCharacters.flatMap(c => c.debuffs))
  )

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
