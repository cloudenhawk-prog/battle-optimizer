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


export function calculateDamageNegativeStatus(damage: number): number {
  // Placeholder – returns unchanged damage
  return damage * 0.5
}

function convertLevelToDefense(level: number): number {
  // Placeholder conversion formula
  return level * 5
}

// When a damage calculator returns damage dealt, the value should be logged: Character / Damage Type / Element / Source / timestamp
// ... so that we can do statistics, show graphic timeline with "action icons"
// For negative statuses, it's harder to associate it with a character - might be best to put it as "null" or some default value
