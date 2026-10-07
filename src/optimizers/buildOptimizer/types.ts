// Build optimizer types: per-slot echo configuration and leaderboard result rows.
import type { CharacterStats } from '../../types/stats'

// ========== Types ============================================================================================================

export type BuildResult = {
  /** One-line compact label for the leaderboard, e.g. "CR×4, CD×3, ATK%×2". */
  label: string
  /** Unused legacy field kept for backward compat. Always equals label. */
  buildDesc: string
  dps: number
  delta: number
  deltaPct: number
  isCurrent: boolean
  /** Per-slot breakdown shown on expand, e.g. ["E1 [ATK%] · CR, CD", "E3 [Glacio] · CR, CD"]. */
  details?: string[]
}

// ========== Echo Optimizer Config ============================================================================================

/**
 * Per-slot optimizer configuration.
 *
 * `enabledMainStats` — main-stat options to test; each is its own candidate (no combinations).
 * `enabledSubstats` / `pinnedSubstats` — flexible pool vs. always-included substats.
 * `substatGroupSize` — how many FLEXIBLE substats to pick per candidate (k in C(flexible, k));
 *   pinned substats are added on top. Capped at the flexible pool size.
 */
export type EchoSlotConfig = {
  enabledMainStats: Set<keyof CharacterStats>
  /** Flexible substats: included in the pool but drawn via C(flexible, k). */
  enabledSubstats: Set<keyof CharacterStats>
  /** Pinned substats: always present in every combination for this slot. */
  pinnedSubstats: Set<keyof CharacterStats>
  substatGroupSize: number
}

export type EchoOptConfig = Partial<Record<1 | 2 | 3 | 4 | 5, EchoSlotConfig>>
