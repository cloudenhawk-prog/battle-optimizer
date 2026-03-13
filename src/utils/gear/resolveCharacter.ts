import type { Character } from '../../types/character'
import { mergeStats } from '../calculators/damageCalculator'
import { resolveGear } from './resolveGear'

// ========== Character Resolution ============================================================================================

/**
 * Resolves a character's total stats and injects gear contributions at program startup.
 * Mutates `character` in place — call once per character before using it in any calculation.
 *
 * Resolution order:
 *  1. Base stats (`character.stats`)
 *  2. Inherent stats (`character.inherentStats`)
 *  3. Weapon stats (`character.gear.weapon.stats`)
 *  4. Per-slot echo stats:
 *       - baseStats + subStats for every filled slot
 *       - firstSlotStats only for slot 1
 *       - conditionalStats when the echo's condition returns true for this character
 *  5. Set bonus stats (only when all 5 slots are filled)
 *  6. Echo skill from slot 1 — replaces the placeholder ECHO action in character.actions
 *  7. Modifier injection via resolveGear (slot-1 injectedModifiers/injectedSideEffects + set bonus injectedModifiers)
 */
export function resolveCharacter(character: Character): void {
  const { name, actions, gear, inherentStats, damageModifiers } = character
  const slots = gear.echoSlots

  // ---- 1 & 2: Base stats + inherent stats ----
  let resolved = mergeStats(character.stats, inherentStats)

  // ---- 3: Weapon stats ----
  resolved = mergeStats(resolved, gear.weapon.stats)

  // ---- 4: Echo stats per slot ----
  for (const slotNum of [1, 2, 3, 4, 5] as const) {
    const echo = slots[slotNum]
    if (!echo) continue

    resolved = mergeStats(resolved, echo.baseStats)
    resolved = mergeStats(resolved, echo.subStats)

    if (slotNum === 1 && echo.firstSlotStats) {
      resolved = mergeStats(resolved, echo.firstSlotStats)
    }

    if (echo.conditionalStats?.condition(name)) {
      resolved = mergeStats(resolved, echo.conditionalStats.stats)
    }
  }

  // ---- 5: Set bonus stats (all 5 slots must be filled) ----
  const allFilled = slots[1] && slots[2] && slots[3] && slots[4] && slots[5]
  if (allFilled && gear.setBonus?.stats) {
    resolved = mergeStats(resolved, gear.setBonus.stats)
  }

  // ---- 6: Overwrite character.stats with the fully resolved totals (base + inherent + weapon + echoes + set bonus) ----
  character.stats = resolved

  // ---- 7: Inject echo skill from slot 1 ----
  // Replaces the placeholder ECHO action (identified by dmgTypes containing 'ECHO').
  // If no placeholder exists, the echo skill is appended.
  const slot1Echo = slots[1]
  if (slot1Echo?.echoSkill) {
    const placeholderIndex = actions.findIndex(a => (a.dmgTypes as string[]).includes('ECHO'))
    if (placeholderIndex !== -1) {
      actions[placeholderIndex] = slot1Echo.echoSkill
    } else {
      actions.push(slot1Echo.echoSkill)
    }
  }

  // ---- 8: Inject gear modifiers ----
  resolveGear(actions, damageModifiers, gear)
}
