import type { Snapshot } from "../../types/snapshot"
import type { TableConfig } from "../../types/tableDefinitions"

export function useTableUpdates(
  snapshots: Snapshot[],
  tableConfig: TableConfig
) {
  // Placeholder: here you could later implement memoized renderers,
  // virtualized rows, or other table updates.
  const tableConfigWithRenderers = tableConfig

  return { tableConfigWithRenderers }
}
