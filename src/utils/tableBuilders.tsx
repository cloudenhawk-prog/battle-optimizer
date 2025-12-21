import type { ColumnGroup, ColumnDef, TableConfig } from "../types/tableDefinitions"

export function createOptionalGroup(
  group: Omit<ColumnGroup, "columns">,
  columns: ColumnDef[]
): ColumnGroup | null {
  return columns.length > 0
    ? { ...group, columns }
    : null
}

export function flattenTableColumns(tableConfig: TableConfig): ColumnDef[] {
  const allColumns: ColumnDef[] = []

  allColumns.push(...tableConfig.basic.columns)

  tableConfig.characters.forEach(group => {
    allColumns.push(...group.columns)
  })

  if (tableConfig.negativeStatuses) allColumns.push(...tableConfig.negativeStatuses.columns)
  if (tableConfig.buffs) allColumns.push(...tableConfig.buffs.columns)
  if (tableConfig.debuffs) allColumns.push(...tableConfig.debuffs.columns)

  return allColumns
}