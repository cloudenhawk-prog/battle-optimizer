import type { EnergyGeneration, EnergyCost } from './energy'
import type { ScalingType, ElementType, Position, DamageType } from './baseTypes'
import type { DamageModifier } from './modifiers'
import type { SideEffect, StatusModification, CooldownReduction } from './sideEffect'
import type { CoordinatedAttack } from './coordinatedAttack'
import type { Snapshot } from './snapshot'

// ========== Type: ActionTag ===================================================================================================

/**
 * Semantic keyword attached to an action to describe what it represents.
 * Used for tag-based gear injection so weapon/echo/set effects can target actions
 * by category (e.g. "buff all heals") without importing specific action objects.
 *
 * BASIC_ATTACK and SKILL refer to the action role (triggers effects that say
 * "when using a basic attack/skill"), not the damage type — use `dmgTypes` for that.
 */
export type ActionTag =
  | 'BASIC_ATTACK'        // Action belongs to the basic attack combo chain
  | 'HEAVY_ATTACK'        // Action is a heavy/charged attack
  | 'SKILL'               // Action is a Resonance Skill cast
  | 'LIBERATION'          // Action is a Resonance Liberation cast
  | 'INTRO_ACTION'        // Action is the character's Intro skill
  | 'OUTRO_ACTION'        // Action is the character's Outro skill
  | 'HEAL_PROC'           // Action provides HP restoration (direct or periodic-tick trigger)
  | 'AERO_EROSION_APPLIER'     // Action applies Aero Erosion stacks
  | 'SPECTRO_FRAZZLE_APPLIER'  // Action applies Spectro Frazzle stacks

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
  cooldownReductions?: CooldownReduction[]

  castConditions: CastConditions
  offtune: number
  /** Semantic tags describing what role this action plays. Used for tag-based gear injection. */
  tags?: ActionTag[]

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

  /** When specified, this action requires a specific follow-up action to be cast
   *  by the same character in the immediately following row. The follow-up action
   *  must be off cooldown by the time this action completes.
   *  All other actions/characters will be locked. */
  requiredFollowUp?: {
    actionName: string // Name of the action that must be cast next
  }
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
  /** Time-based combo window: allows this action to be cast within a time window after
   *  one of the specified previous actions, even if other actions happen in between.
   *  Unlike previousActions which requires immediate follow-up, this allows flexibility. */
  comboWindow?: {
    /** Actions that start the combo window */
    previousActions: Action[]
    /** Maximum time in seconds to cast this action after one of previousActions */
    maxTimeSincePrevious: number
    /** When the timer starts counting */
    timerStartsAt: 'cast' | 'afterCast'
    /** If true, swapping to a different character breaks the combo */
    crashesOnSwap: boolean
    /** If true, changing form breaks the combo */
    crashesOnFormChange: boolean
  }
}
