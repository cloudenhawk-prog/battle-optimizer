// Echo catalog entry type: static echo data (everything except the rolled main/sub stats).
import type { Action } from '../../../types/action'
import type { EchoConditionalStats, InjectedModifier, InjectedSideEffect } from '../../../types/gear'
import type { CharacterStats } from '../../../types/stats'

export type EchoCatalogEntry = {
  name: string
  setName: string
  cost: 1 | 3 | 4 // 4 costs always have 150 flat attack, 3 costs always have 100 flat attack, 1 costs always have 2280 flat HP
  icon: string
  info_icon: string
  info: string
  /**
   * Stats applied only when this echo occupies slot 1 (the main echo slot).
   * Populated from the echo's passive description (e.g. "gains 10.00% Aero DMG Bonus").
   * Used by the picker to assemble a correct Echo object when building a custom echo for slot 1.
   */
  firstSlotStats?: Partial<CharacterStats>
  echoSkill?: Action
  injectedModifiers?: InjectedModifier[]
  injectedSideEffects?: InjectedSideEffect[]
  conditionalStats?: EchoConditionalStats
}
