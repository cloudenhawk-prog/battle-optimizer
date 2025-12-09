import type { Character } from "../../../types/character"
import type { ColumnGroup, ColumnDef } from "../../../types/tableDefinitions"
import type { Snapshot } from "../../../types/snapshot"

export function buildBuffColumns(selectedCharacters: Character[]): ColumnGroup {
  const activeBuffs = Array.from(
    new Set(selectedCharacters.flatMap(c => c.buffs))
  )

  const columns: ColumnDef[] = activeBuffs.map(buff => {
    const key = buff.replace(/\s+/g, "")
    return {
      key,
      label: buff,
      render: (snapshot: Snapshot) => {
        const buffs = snapshot.buffs as Record<string, number> | undefined
        return buffs?.[key]
      },
    }
  })

  return {
    label: "Buffs",
    columns,
  }
}
