import type { Action } from './action'
import type { CoordinatedAttack } from './coordinatedAttack'
import type { DamageModifier } from './modifiers'
import type { SideEffect } from './sideEffect'
import type { CharacterStats } from './stats'

// ========== Type: Gear =======================================================================================================
export type Gear = {
  weapon: Weapon
  echoSlots: EchoSlots
  setBonus?: EchoSetBonus
}

// ========== Type: Weapon =====================================================================================================
export type Weapon = {
  name: string
  stats: Partial<CharacterStats>
  injectedModifiers?: InjectedModifier[]
  rank: 1 | 2 | 3 | 4 | 5
  info: string
  icon: string
}

// ========== Type: Echo =======================================================================================================
export type Echo = {
  name: string
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
  info_icon?: string
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
// ========== Type: Set Bonus ==================================================================================================
export type EchoSetBonus = {
  name: string
  stats: Partial<CharacterStats>
  injectedModifiers?: InjectedModifier[]
  info: { [key: string]: string }
}

// ========== Type: Shared =====================================================================================================
export type InjectedModifier = {
  targets: Array<'character' | Action | CoordinatedAttack>
  modifiers: DamageModifier[]
}

export type InjectedSideEffect = {
  targets: Action[]
  sideEffects: SideEffect[]
}
