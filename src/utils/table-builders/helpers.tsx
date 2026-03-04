import type { ColumnGroup, ColumnDef, TableConfig } from '../../types/tableDefinitions'

// ========== Create Optional Group ============================================================================================

export function createOptionalGroup(group: Omit<ColumnGroup, 'columns'>, columns: ColumnDef[]): ColumnGroup | null {
  return columns.length > 0 ? { ...group, columns } : null
}

// ========== Flatten Table Columns ============================================================================================

export function flattenTableColumns(tableConfig: TableConfig): ColumnDef[] {
  const allColumns: ColumnDef[] = []

  allColumns.push(...tableConfig.basic.columns)

  tableConfig.characters.forEach(group => {
    allColumns.push(...group.columns)
  })

  if (tableConfig.statusEffects) allColumns.push(...tableConfig.statusEffects.columns)

  return allColumns
}
