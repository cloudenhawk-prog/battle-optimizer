import type { Character } from "../../../types/characters"
import type { ColumnGroup, ColumnDef } from "../../../types/tableDefinitions"

export function buildBuffColumns(selectedCharacters: Character[]): ColumnGroup {
  const activeBuffs = Array.from(
    new Set(selectedCharacters.flatMap(c => c.buffs))
  )

  const columns: ColumnDef[] = activeBuffs.map(buff => {
    const key = buff.replace(/\s+/g, "")
    return {
      key,
      label: buff,
      render: (snapshot: Record<string, number | string | Record<string, Record<string, number>> | Record<string, number>>) => {
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
