import type { ColumnGroup, ColumnDef } from "../types/tableDefinitions"

export function createOptionalGroup(
  group: Omit<ColumnGroup, "columns">,
  columns: ColumnDef[]
): ColumnGroup | null {
  return columns.length > 0
    ? { ...group, columns }
    : null
}
