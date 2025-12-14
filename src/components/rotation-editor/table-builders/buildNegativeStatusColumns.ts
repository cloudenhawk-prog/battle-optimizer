import type { Character } from "../../../types/character"
import type { ColumnGroup, ColumnDef } from "../../../types/tableDefinitions"
import type { Snapshot } from "../../../types/snapshot"
import { createOptionalGroup } from "../../../utils/tableBuilders"

export function buildNegativeStatusColumns(selectedCharacters: Character[]): ColumnGroup | null {
  const activeStatuses = Array.from(
    new Set(
      selectedCharacters.flatMap(c => 
        c.actions.flatMap(action => Object.keys(action.negativeStatusesApplied))
      )
    )
  )

  const columns: ColumnDef[] = activeStatuses.map(status => {
    const key = status
    return {
      key,
      label: status,
      icon: `/assets/${key.toLowerCase().replace(/\s+/g, "_")}.png`,
      render: (snapshot: Snapshot) => {
        const negativeStatuses = snapshot.negativeStatuses as Record<string, number> | undefined
        return negativeStatuses?.[key]
      },
    }
  })
  return createOptionalGroup({ label: "Negative Statuses", icon: "assets/negativeStatuses.png" }, columns)
}
