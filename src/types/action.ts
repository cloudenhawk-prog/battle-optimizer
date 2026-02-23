import type { EnergyGeneration, EnergyCost } from './energy'
import type { ScalingType, ElementType, Position, DamageType } from './baseTypes'
import type { DamageModifier } from './modifiers'
import type { SideEffect, StatusModification } from './sideEffect'

// ========== Type: Action =====================================================================================================

export type Action = {
  name: string
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
}

export type ActionExpanded = {
  // TODO: this should become the new action type, and update resolvers accordingly
  name: string
  displayName: string
  castTime: number
  multipliers: number[]
  scaling: ScalingType
  elements: ElementType[]
  dmgTypes: DamageType[]
  cooldown: number

  castConditions: CastConditions

  energiesGenerated: EnergyGeneration[][]
  energiesCost: EnergyCost[]

  statusModifications: StatusModification[]
  damageModifiers: DamageModifier[]
  sideEffects: SideEffect[]

  other: Other
}

export type CastConditions = {
  // TODO: redo resolvers flow and use new types - put into own types files
  position: Position
  previousAction: string
  endState: Position
}

export type Other = {
  // TODO: doesnt require any logic yet, just keep it as a type in its own file for now
  hardness: number[]
  toughness: number[]
  offtune: number[]
}

type BasicsStage = {
  multipliers: number[]
  energiesGenerated: EnergyGeneration[][]
  statusModifications: StatusModification[]
  damageModifiers: DamageModifier[]
  sideEffects: SideEffect[]
  other: {
    hardness: number[]
    toughness: number[]
    offtune: number[]
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
