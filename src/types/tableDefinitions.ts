import type { Snapshot } from './snapshot'

// ========== Type: Table Config ===============================================================================================

export type TableConfig = {
  basic: ColumnGroup
  characters: ColumnGroup[]
  statusEffects: ColumnGroup | null
  other: ColumnGroup | null
}

// ========== Type: Column Group ===============================================================================================

export type ColumnGroup = {
  label: string
  icon: string
  nametag?: string
  columns: ColumnDef[]
}

// ========== Type: Column Def =================================================================================================

export type StatusMetadata = {
  key: string
  label: string
  icon: string
  maxStacks?: number
  color?: string // Optional color override
}

export type EnergyMetadata = {
  key: string
  label: string
  icon: string
}

export type ColumnDef = {
  key: string
  label: string
  icon: string
  render: (snapshot: Snapshot) => React.ReactNode
  statusMetadata?: StatusMetadata[] // For grouped status columns (buffs, debuffs, negativeStatuses)
  energyMetadata?: EnergyMetadata[] // For grouped energy columns (mandatory energies in one column)
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
