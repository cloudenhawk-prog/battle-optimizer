import type { EnergyGeneration, EnergyCost } from './energy'
import type { ScalingType, ElementType, Position, DamageType } from './baseTypes'
import type { DamageModifier } from './modifiers'
import type { SideEffect, StatusModification } from './sideEffect'
import type { CoordinatedAttack } from './coordinatedAttack'
import type { Snapshot } from './snapshot'

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

  /** When present, the system calls this before executing the action to dynamically
   *  select the actual variant to run (e.g. picking the right plunge tier based on forte).
   *  The returned Action is used in place of this one for all resolvers. */
  resolveVariant?: (prevSnapshot: Snapshot | undefined, characterName: string) => Action
}

export type CastConditions = {
  previousActions?: Action[]
  startState: Position
  /** Position stored for this character when they are swapped out. Defaults to endState if omitted. */
  swapOutState?: Position
  endState: Position
  persistenceTime?: number // When a character starts casting an action, even if swapped out, their position is saved/persist for X amount of time, to allow combo chaining/swapping
}
