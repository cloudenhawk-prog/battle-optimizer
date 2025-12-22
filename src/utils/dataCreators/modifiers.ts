import type { CharacterStats, CharacterStatKey, EnemyStats, EnemyStatKey } from "../../types/stats"
import type { DamageModifier, ModifierMode, ModifierTarget } from "../../types/modifiers"
import type { StepContext } from "../../types/stepContext"

// ========== Character Stat Modifiers =========================================================================================

export function addCharStats(
  stats: Partial<CharacterStats>,
  source: string,
  condition?: (ctx: StepContext) => number
): DamageModifier {
  return statModifier("character", stats, "add", source, condition)
}

export function multCharStats(
  stats: Partial<CharacterStats>,
  source: string,
  condition?: (ctx: StepContext) => number
): DamageModifier {
  return statModifier("character", stats, "multiply", source, condition)
}

// ========== Enemy Stat Modifiers =============================================================================================

export function addEnemyStats(
  stats: Partial<EnemyStats>,
  source: string,
  condition?: (ctx: StepContext) => number
): DamageModifier {
  return statModifier("enemy", stats, "add", source, condition)
}

export function multEnemyStats(
  stats: Partial<EnemyStats>,
  source: string,
  condition?: (ctx: StepContext) => number
): DamageModifier {
  return statModifier("enemy", stats, "multiply", source, condition)
}

// ========== Internal Helper Functions ========================================================================================

function statModifier<
  T extends ModifierTarget,
  S extends Partial<T extends "character" ? CharacterStats : EnemyStats>
>(
  target: T,
  stats: S,
  mode: ModifierMode,
  source: string,
  condition?: (ctx: StepContext) => number
): DamageModifier {
  if (target === "character") {
    return {
      characterStats: { [mode]: stats as Partial<CharacterStats> },
      source,
      condition,
    }
  }

  return {
    enemyStats: { [mode]: stats as Partial<EnemyStats> },
    source,
    condition,
  }
}

// ========== Internal Helper Type =============================================================================================

type TargetKey<T extends ModifierTarget> = T extends "character" ? CharacterStatKey : EnemyStatKey
