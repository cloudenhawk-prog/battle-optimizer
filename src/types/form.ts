import type { Action } from './action'

// ========== Type: Form =======================================================================================================

export type Form = {
  name: string
  displayName?: string
  introAction?: Action
  outroAction?: Action
  icon: string
}
