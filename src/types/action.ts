import type { EnergyGeneration, EnergyCost } from './energy'
import type { ScalingType, ElementType, Position, DamageType } from './baseTypes'
import type { DamageModifier } from './modifiers'
import type { SideEffect, StatusModification } from './sideEffect'
import type { CoordinatedAttack } from './coordinatedAttack'
import type { Snapshot } from './snapshot'

// ========== Type: Action =====================================================================================================

export type ActionCategory = 'Basics' | 'Skills' | 'Echo Skill' | 'Other' | 'Testing'

export type Action = {
  name: string
  displayName: string
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

  /** If specified, casting this action changes the character's form to the specified form name.
   *  The form must exist in the character's forms array. */
  formChange?: string

  /** When present, the system calls this before executing the action to dynamically
   *  select the actual variant to run (e.g. picking the right plunge tier based on forte).
   *  The returned Action is used in place of this one for all resolvers. */
  resolveVariant?: (prevSnapshot: Snapshot | undefined, characterName: string) => Action
}

export type CastConditions = {
  previousActions?: Action[]
  startState: Position
  /** Position stored for this character after they are swapped out mid-action.
   *  Required for 'Cancel With Swap' variants; must not be set on any other action.
   *  Note: endState is NOT used as a fallback — it describes where the character ends up
   *  if they finish the action normally (or are swapped back in during persistenceTime). */
  swapOutState?: Position
  endState: Position
  persistenceTime?: number // When a character starts casting an action, even if swapped out, their position is saved/persist for X amount of time, to allow combo chaining/swapping
  /** When true, the action can only be cast if either:
   *  - The last action in the timeline was cast by a different character, OR
   *  - This character's last personal action was their Intro skill. */
  requiresSwapIn?: boolean
  /** When true, the character must swap out after this action — they will be locked from
   *  being selected as the active character in the immediately following row. */
  requiresSwapOut?: boolean
  /** Forms required to cast this action. If undefined, action is available in all forms.
   *  If empty array, action can't be cast (typically used with customCanCast function). */
  requiredForms?: string[]
  /** Custom function to determine if the action can be cast.
   *  Used for complex conditions (e.g., checking if a specific buff is active).
   *  Return true if castable, false otherwise. */
  customCanCast?: (prevSnapshot: Snapshot | undefined, characterName: string) => boolean
}
