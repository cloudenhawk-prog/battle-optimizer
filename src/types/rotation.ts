// Rotation as a portable list of user choices (what gets saved, exported, imported and replayed).
import type { Snapshot } from './snapshot'
import type { DamageEvent } from './events'

// ========== Types ============================================================================================================

/** One user decision: "this character casts this action". Autocast rows are never stored. */
export type RotationStep = {
  character: string
  action: string
}

export type SavedRotation = {
  name: string
  createdAt: string // ISO date string
  steps: RotationStep[]
}

/** Why a replayed rotation stopped: the failing step and a human-readable reason. */
export type ImportError = {
  stepIndex: number
  character: string
  action: string
  reason: string
}

export type ImportRunResult = {
  snapshots: Snapshot[]
  damageEvents: DamageEvent[]
  completedSteps: number
  error: ImportError | null
}
