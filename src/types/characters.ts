
export type Action = {
  name: string
  time: number
  damage: number

  energy: number
  concerto: number
  forte: number
  specialEnergyGenerated: Record<string, number>

  negativeStatusesApplied: string[] // TODO
  buffsApplied: string[] // TODO
  debuffsApplied: string[] // TODO
}

export type Character = {
  name: string
  actions: Action[]
  negativeStatuses: string[]
  buffs: string[]
  debuffs: string[]
  specialEnergy: string[]
}
