import type { EnergyGeneration, EnergyCost } from './energy'
import type { ScalingType, ElementType, Position, DamageType } from './baseTypes'
import type { DamageModifier } from './modifiers'
import type { SideEffect, StatusModification } from './sideEffect'
import type { CoordinatedAttack } from './coordinatedAttack'

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
  coordinatedAttacks?: CoordinatedAttack[]

  castConditions: CastConditions
  offtune: number

  toolTip?: string

  groupName?: string
  variantName?: string
}

export type CastConditions = {
  startState: Position
  previousActions?: Action[]
  endState: Position
}
