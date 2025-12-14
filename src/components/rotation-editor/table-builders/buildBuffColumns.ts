import type { Character } from "../../../types/character"
import type { ColumnGroup, ColumnDef } from "../../../types/tableDefinitions"
import type { Snapshot } from "../../../types/snapshot"
import { createOptionalGroup } from "../../../utils/tableBuilders"

export function buildBuffColumns(selectedCharacters: Character[]): ColumnGroup | null {
  const activeBuffs = Array.from(
    new Set(selectedCharacters.flatMap(c => c.buffs))
  )

  const columns: ColumnDef[] = activeBuffs.map(buff => {
    const key = buff.replace(/\s+/g, "")
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

  return createOptionalGroup({label: "Buffs", icon: "assets/buffs.png"}, columns)
}
