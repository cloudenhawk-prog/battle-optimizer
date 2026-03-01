import type { StepContext } from './stepContext'
import type { DamageEvent } from './events'

// ========== Type: SideEffect =================================================================================================

export type SideEffect = {
  name: string
  damageDealt: (context: StepContext, sideEffectName: string, timeStamp: number) => DamageEvent
  statusModifications: StatusModification[]
}

// ========== Type: StatusModification =========================================================================================

export type StatusModification = {
  type: 'buff' | 'debuff' | 'negativeStatus' // TODO - is buff/Debuff ever used here? Can side effect actually trigger buffs? Would they need to use Damage Modifiers (since these represet buffs/debuffs)
  targetName: string
  stackChange?: number
  durationChange?: number
  refreshDuration?: boolean
}
