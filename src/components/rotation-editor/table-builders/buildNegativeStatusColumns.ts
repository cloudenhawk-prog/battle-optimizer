import type { Character } from "../../../types/characters"
import type { ColumnGroup, ColumnDef } from "../../../types/tableDefinitions"

export function buildNegativeStatusColumns(selectedCharacters: Character[]): ColumnGroup {
  const activeStatuses = Array.from(
    new Set(selectedCharacters.flatMap(c => c.negativeStatuses))
  )

  const columns: ColumnDef[] = activeStatuses.map(status => {
    const key = status.replace(/\s+/g, "")
    return {
      key,
      label: status,
      render: (snapshot: Record<string, number | string | Record<string, Record<string, number>> | Record<string, number>>) => {
        const negativeStatuses = snapshot.negativeStatuses as Record<string, number> | undefined
        return negativeStatuses?.[key]
      },
    }
  })

  return {
    label: "Negative Statuses",
    columns
  }
}
