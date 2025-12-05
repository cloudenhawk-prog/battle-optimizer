import type { ColumnDef } from "./tables"

export type Action = {
  name: string
  duration: number
  damage: number
}

export type Character = {
  name: string
  actions: Action[]
  negativeStatuses: string[]
  dynamicColumns?: ColumnDef[]
}
