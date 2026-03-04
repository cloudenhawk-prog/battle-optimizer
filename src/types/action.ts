import type { EnergyGeneration, EnergyCost } from './energy'
import type { ScalingType, ElementType, Position, DamageType } from './baseTypes'
import type { DamageModifier } from './modifiers'
import type { SideEffect, StatusModification } from './sideEffect'

// ========== Type: Action =====================================================================================================

export type ActionCategory = 'Basics' | 'Skills' | 'Other' | 'Testing'

export type Action = {
  name: string
  displayName?: string
  category: ActionCategory
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

  // For grouping related action variants in the UI
  groupName?: string // The base action name that groups related actions together
  variantName?: string // The specific variant (e.g., "Default", "Swap Cancel")
}

export type CastConditions = {
  startState: Position
  previousActions?: Action[]
  endState: Position
}
