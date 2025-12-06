import type { Snapshot } from "./snapshot"

export type TableConfig = {
  basic: ColumnGroup
  characters: ColumnGroup[]
  negativeStatuses: ColumnGroup
  buffs: ColumnGroup
  debuffs: ColumnGroup
}

export type ColumnGroup = {
  label: string
  columns: ColumnDef[]
}

export type ColumnDef = {
  key: string
  label: string
  render: (snapshot: Snapshot) => React.ReactNode
}

