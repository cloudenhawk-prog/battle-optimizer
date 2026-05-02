import type { EnergyGeneration, EnergyCost } from './energy'
import type { ScalingType, ElementType, Position, DamageType } from './baseTypes'
import type { DamageModifier, InherentModifier } from './modifiers'
import type { SideEffect, StatusModification, CooldownReduction } from './sideEffect'
import type { CoordinatedAttack } from './coordinatedAttack'
import type { Snapshot } from './snapshot'
import type { CharacterStats } from './stats'

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
  | 'HEAL_PROC'           // Action/CoordinatedAttack provides HP restoration (direct, on-cast, or periodic-tick).
                          // Tag both actions that heal on cast AND CoordinatedAttacks used as periodic heal fields
                          // (e.g. a Syntony Field CA with frequency:3, multiplier:0). Gear targeting { tag:'HEAL_PROC' }
                          // will inject modifiers that are activated whenever a tagged action is cast or a tagged CA ticks.
  | 'AERO_EROSION_APPLIER'     // Action applies Aero Erosion stacks
  | 'SPECTRO_FRAZZLE_APPLIER'  // Action applies Spectro Frazzle stacks
  | 'GLACIO_CHAFE_APPLIER'     // Action applies Glacio Chafe stacks

/**
 * Minimal character view passed to resolveVariant. Deliberately kept separate from the full
 * Character type to avoid a circular import (character.ts → action.ts). Add fields here as
 * new resolveVariant implementations require them.
 */
export type ResolveVariantOwner = {
  name: string
  sequence: 0 | 1 | 2 | 3 | 4 | 5 | 6
  stats: Partial<CharacterStats>
}

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
  /** When set, this action uses a charges/stacks system instead of a single-use cooldown.
   *  All variants sharing the same groupName share both the cooldown timer and the stack pool.
   *  - An action is castable as long as stacks > 0 (the timer does not block it).
   *  - Each use consumes 1 stack and (re)starts the cooldown timer for regeneration.
   *  - Each time the timer expires a stack is restored; the timer restarts unless stacks reach maxStacks.
   *  - When stacks reach maxStacks the timer stops (no cooldown entry in the snapshot). */
  maxStacks?: number

  energyGenerated: EnergyGeneration[]
  energyCost: EnergyCost[]

  statusModifications: StatusModification[]
  damageModifiers: DamageModifier[]
  /** Conditional stat amplifiers that only affect this action's own damage calculation.
   *  Never dispatched as buffs/debuffs — evaluated once at calculation time and discarded. */
  inherentModifiers?: InherentModifier[]
  sideEffects: SideEffect[]
  coordinatedAttacks?: CoordinatedAttack[]
  cooldownReductions?: CooldownReduction[]

  castConditions: CastConditions
  offtune: number
  /** Semantic tags describing what role this action plays. Used for tag-based gear injection. */
  tags?: ActionTag[]
  /** Tags describing this action's position/state in a combo chain. Stored in the snapshot after cast.
   *  Other actions can require these tags via `castConditions.requiredComboTags` to enforce ordering. */
  comboChainTags?: string[]

  toolTip?: string

  groupName?: string
  variantName?: string

  /** If specified, casting this action changes the character's form to the specified form name.
   *  The form must exist in the character's forms array. */
  formChange?: string

  /** When present, the system calls this before executing the action to dynamically
   *  select the actual variant to run (e.g. picking the right plunge tier based on forte).
   *  The returned Action is used in place of this one for all resolvers.
   *
   *  Receives the character whose action list contains this action, giving access to
   *  `owner.sequence`, `owner.stats`, etc. for sequence-gated or stat-scaled variants.
   *  Existing implementations that only declare (prevSnapshot, characterName) still work
   *  because TypeScript allows functions to declare fewer parameters than their type. */
  resolveVariant?: (prevSnapshot: Snapshot | undefined, characterName: string, owner: ResolveVariantOwner) => Action

  /** When true, this action is hidden from the action selector when it is not castable.
   *  Does not affect form-based hiding — actions outside the current form are always hidden. */
  hideWhenNotCastable?: boolean

  /** When specified, the system will attempt to auto-cast a specific follow-up action
   *  in the immediately following row.
   *
   *  Without `must` (default): the follow-up is attempted automatically if castable,
   *  but the user remains free to choose any action. No locking occurs.
   *
   *  `must: true`: the follow-up MUST happen. All other actions are locked until the
   *  follow-up is cast. The parent action is only castable when the entire MUST chain
   *  can be satisfied — position, form, and energy are validated through the chain. */
  attemptFollowUp?: {
    actionName: string // Name of the action to follow up with
    must?: boolean     // When true: MUST follow up or the chain is blocked; omitted/false: attempt only, no locking
  }

  /** When set, the character's next action must be one of the listed action names
   *  (matched by exact name OR groupName). All other actions for this character are
   *  blocked until one of the allowed actions is cast. Other characters are also
   *  locked out for the immediately following row (same semantics as attemptFollowUp
   *  with must: true, but letting the user choose among multiple valid options).
   *
   *  Can also be a function returning the list (or undefined for no restriction),
   *  evaluated at resolve time against the snapshot before this action was cast. */
  restrictNextTo?: string[] | ((prevSnapshot: Snapshot | undefined, characterName: string) => string[] | undefined)
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
  /** When true, the character cannot swap out after this action — the next action must
   *  also be from this character. Use on non-swap-cancel variants when a swap-cancel
   *  sibling exists: selecting this variant means the animation completes in full and
   *  a swap is not involved. A swap would require picking the (swap cancel) variant instead. */
  preventsSwapOut?: boolean
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
  /** Requires that the character's most recent personal action (within the persistence window)
   *  had ALL of these combo chain tags set via `Action.comboChainTags`.
   *  Use this to enforce sequential combo ordering (e.g. BA3 after BA2 after BA1). */
  requiredComboTags?: string[]  /** Blocks this action if the character's most recent personal action (within the persistence window)
   *  had ANY of these combo chain tags. Combined with `requiredComboTags` this enforces strict
   *  ordering in both directions (e.g. BA1 is blocked after BA1 or BA2 are already active). */
  blockedComboTags?: string[]}
