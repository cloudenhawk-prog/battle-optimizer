// src/engine/damageCalculator.ts

/**
 * For now this calculator does nothing except return the same damage value.
 *
 * In the future this function may receive:
 * - character stats
 * - damage type (Skill, Heavy, Outro, etc)
 * - enemy defense / resistance
 * - buffs, debuffs, modifiers
 * - character level, weapon, echoes…
 * - timeline context
 * and produce the final damage number.
 */
export function calculateDamage(damage: number): number {
  // Placeholder – returns unchanged damage
  return damage
}
