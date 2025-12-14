import type { Snapshot } from "./snapshot"

export type TableConfig = {
  basic: ColumnGroup
  characters: ColumnGroup[]
  negativeStatuses: ColumnGroup | null
  buffs: ColumnGroup | null
  debuffs: ColumnGroup | null
}

export type ColumnGroup = {
  label: string
  icon:string
  columns: ColumnDef[]
}

export type ColumnDef = {
  key: string
  label: string
  icon: string
  render: (snapshot: Snapshot) => React.ReactNode
}
