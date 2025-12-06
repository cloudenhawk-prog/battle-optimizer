import type { Character } from "../../../types/characters"
import type { ColumnGroup, ColumnDef } from "../../../types/tableDefinitions"

export function buildDebuffColumns(selectedCharacters: Character[]): ColumnGroup {
  const activeDebuffs = Array.from(
    new Set(selectedCharacters.flatMap(c => c.debuffs))
  )

  const columns: ColumnDef[] = activeDebuffs.map(debuff => {
    const key = debuff.replace(/\s+/g, "")
    return {
      key,
      label: debuff,
      render: (snapshot: Record<string, number | string | Record<string, Record<string, number>> | Record<string, number>>) => {
        const debuffs = snapshot.debuffs as Record<string, number> | undefined
        return debuffs?.[key]
      },
    }
  })

  return {
    label: "Debuffs",
    columns,
  }
}
