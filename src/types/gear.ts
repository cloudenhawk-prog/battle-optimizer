import type { Action } from './action'
import type { CoordinatedAttack } from './coordinatedAttack'
import type { DamageModifier } from './modifiers'
import type { SideEffect } from './sideEffect'
import type { CharacterStats } from './stats'
import type { ActionTag } from './action'
import type { EnergyGeneration } from './energy'

// ========== Type: WeaponType =================================================================================================
/** The five weapon categories in Wuthering Waves. A character can only equip weapons matching their weaponType. */
export type WeaponType = 'Sword' | 'Broadblade' | 'Pistol' | 'Gauntlets' | 'Rectifier'

// ========== Type: Gear =======================================================================================================
export type Gear = {
  weapon: Weapon
  echoSlots: EchoSlots
  /** Character-specific injected modifiers for set effects (e.g. 5-piece). Stats come from the global EchoSet registry. */
  setBonus?: EchoSetBonus
}

// ========== Type: Weapon =====================================================================================================
export type Weapon = {
  name: string
  weaponType: WeaponType
  stats: Partial<CharacterStats>
  injectedModifiers?: InjectedModifier[]
  rank: 1 | 2 | 3 | 4 | 5
  info: string
  icon: string
}

// ========== Type: Echo =======================================================================================================
export type Echo = {
  name: string
  /** The echo set this piece belongs to. Used to compute set milestone bonuses. */
  setName: string
  cost: number
  baseStats: Partial<CharacterStats>
  subStats: Partial<CharacterStats>
  firstSlotStats?: Partial<CharacterStats>
  conditionalStats?: EchoConditionalStats
  echoSkill?: Action
  injectedModifiers?: InjectedModifier[]
  injectedSideEffects?: InjectedSideEffect[]
  icon: string
  info?: string
  info_icon: string
}

export type EchoSlots = {
  1: Echo | null
  2: Echo | null
  3: Echo | null
  4: Echo | null
  5: Echo | null
}

export type EchoConditionalStats = {
  condition: (characterName: string) => boolean
  stats: Partial<CharacterStats>
}
// ========== Type: Echo Set ==================================================================================================
/** Stats (and optional modifiers) unlocked when the milestone echo count is reached for a set. */
export type EchoSetMilestone = {
  stats?: Partial<CharacterStats>
}

/** Global echo set definition. Milestone bonuses are resolved automatically based on echo count. */
export type EchoSet = {
  name: string
  icon: string
  info: Partial<Record<'2' | '5', string>>
  milestones: Partial<Record<2 | 5, EchoSetMilestone>>
}

// ========== Type: Set Bonus (character-specific) ===========================================================================
/**
 * Character-specific set bonus entry on Gear. Used only for injectedModifiers that
 * reference character-specific actions (e.g. 5-piece effects). Set bonus stats are
 * resolved from the global EchoSet registry instead — stats here is kept for reference only.
 */
export type EchoSetBonus = {
  name: string
  /** @deprecated Stats are now resolved from the global EchoSet registry. Kept for reference. */
  stats?: Partial<CharacterStats>
  injectedModifiers?: InjectedModifier[]
  info: { [key: string]: string }
  icon: string
}

// ========== Type: Shared =====================================================================================================

/**
 * A target for injected gear modifiers or side effects.
 *
 *  - `'character'`                        — injected into the character's global modifier list
 *  - `Action` / `CoordinatedAttack`       — direct object-reference injection (requires original reference)
 *  - `{ tag: ActionTag }`                 — inject into all actions/CAs that carry the given tag
 *  - `{ tags: ActionTag[]; match }`       — inject into all actions/CAs matching any/all of the given tags
 */
export type InjectedTarget =
  | 'character'
  | Action
  | CoordinatedAttack
  | { tag: ActionTag }
  | { tags: ActionTag[]; match: 'any' | 'all' }

export type InjectedModifier = {
  targets: Array<InjectedTarget>
  modifiers: DamageModifier[]
  /** Energy generation entries to inject into targeted actions' energyGenerated arrays. Not applicable for 'character' targets. */
  energyGeneration?: EnergyGeneration[]
}

export type InjectedSideEffect = {
  targets: Array<Action | { tag: ActionTag } | { tags: ActionTag[]; match: 'any' | 'all' }>
  sideEffects: SideEffect[]
}
