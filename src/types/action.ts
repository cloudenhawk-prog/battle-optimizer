import type { EnergyGeneration, EnergyCost } from './energy'
import type { ScalingType, ElementType, Position, DamageType } from './baseTypes'
import type { DamageModifier } from './modifiers'
import type { SideEffect, StatusModification } from './sideEffect'

// ========== Type: Action =====================================================================================================

export type Action = {
  name: string
  displayName?: string
  castTime: number
  multiplier: number
  scaling: ScalingType
  elements: ElementType[]
  dmgTypes: DamageType[]
  cooldown: number

  energyGenerated: EnergyGeneration[]
  energyCost: EnergyCost[]

  statusModifications: StatusModification[]
  damageModifiers: DamageModifier[]
  sideEffects: SideEffect[]

  castConditions: CastConditions
  offtune: number

  toolTip?: string
}

export type CastConditions = {
  startState: Position
  previousActions?: Action[]
  endState: Position
}
