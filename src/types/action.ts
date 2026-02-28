import type { EnergyGeneration, EnergyCost } from './energy'
import type { ScalingType, ElementType, Position, DamageType } from './baseTypes'
import type { DamageModifier } from './modifiers'
import type { SideEffect, StatusModification } from './sideEffect'

// ========== Type: Action =====================================================================================================

export type Action = {
  name: string
  displayName?: string // TODO: if displayName exists use it in certain places like: selectors, timeline - not in places with lots of space and details
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

  toolTip?: string // TODO : when hovered in selector, it shows tooltip - "Can only be used after Intro" "Assumes all 3 swords have been used"
}

export type CastConditions = {
  // TODO: redo resolvers flow and use new types - put into own types files
  startState: Position
  previousActions?: Action[]
  endState: Position
}

// ============================================================

// TODO: do we want/even need these?
type BasicsStage = {
  multipliers: number[]
  energiesGenerated: EnergyGeneration[][]
  statusModifications: StatusModification[]
  damageModifiers: DamageModifier[]
  sideEffects: SideEffect[]
  other: {
    hardness: number
    toughness: number
    offtune: number
  }
}

export type BasicsData = {
  scaling: ScalingType
  elements: ElementType[]
  dmgTypes: DamageType[]
  cooldown: number
  castConditions: CastConditions
  stages: Record<number, BasicsStage>
}
