interface Snapshot {
  // Shared
  id: number
  character: string
  action: string
  fromTime: number
  toTime: number
  damage: number
  dps: number

  // Negative statuses
  aeroErosion?: number
  spectroFrazzle?: number
  electroDischarge?: number
  fusionBurn?: number
  glacioFreeze?: number
  havocCorrosion?: number
  
  // Character-specific
  energy: number
  concerto: number
  forte: number
  specialEnergy?: Record<string, number>
}

export type {
   Snapshot
}
