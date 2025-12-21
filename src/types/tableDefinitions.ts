import type { Snapshot } from "./snapshot"

// ========== Type: Table Config ===============================================================================================

export type TableConfig = {
  basic: ColumnGroup
  characters: ColumnGroup[]
  negativeStatuses: ColumnGroup | null
  buffs: ColumnGroup | null
  debuffs: ColumnGroup | null
}

// ========== Type: Column Group ===============================================================================================

export type ColumnGroup = {
  label: string
  icon: string
  columns: ColumnDef[]
}

// ========== Type: Column Def =================================================================================================

export type ColumnDef = {
  key: string
  label: string
  icon: string
  render: (snapshot: Snapshot) => React.ReactNode
}

// ========== Type: Columns Visibility =========================================================================================

export type ColumnVisibility = Record<string, boolean>

// ========== Type: Global Columns =============================================================================================

export type GlobalColumns = {
  basic: string[]
  buffs: string[]
  debuffs: string[]
  negativeStatuses: string[]
}
