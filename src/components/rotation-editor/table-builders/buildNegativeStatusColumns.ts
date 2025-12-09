import type { Character } from "../../../types/character"
import type { ColumnGroup, ColumnDef } from "../../../types/tableDefinitions"
import type { Snapshot } from "../../../types/snapshot"

export function buildNegativeStatusColumns(selectedCharacters: Character[]): ColumnGroup {
  const activeStatuses = Array.from(
    new Set(selectedCharacters.flatMap(c => c.negativeStatuses))
  )

  const columns: ColumnDef[] = activeStatuses.map(status => {
    const key = status.replace(/\s+/g, "")
    return {
      key,
      label: status,
      render: (snapshot: Snapshot) => {
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
