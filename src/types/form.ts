import type { Action } from './action'
import type { EnergyType } from './baseTypes'

// ========== Type: Form =======================================================================================================

export type Form = {
  name: string
  displayName?: string
  introAction?: Action
  outroAction?: Action
  /** When true, swapping away from this character resets them back to their default form. */
  resetFormOnSwapOut?: boolean
  /** Energies to reset to 0 when the character is swapped out while in this form. */
  resetEnergiesOnSwapOut?: EnergyType[]
}
