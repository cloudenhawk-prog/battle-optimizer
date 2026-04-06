import type { SideEffect } from '../../types/sideEffect'
import { calculateAeroErosionSideEffectDamage, calculateGlacioChafeProcDamage } from '../../utils/calculators/sideEffectCalculators'
import { removeNegativeStatusStacks } from '../../utils/modifications/statusModificationHelpers'

// ========== Side Effects =====================================================================================================

export const aeroErosionExplosion: SideEffect = {
  name: 'Aero Erosion Explosion',
  damageDealt: calculateAeroErosionSideEffectDamage,
  statusModifications: [removeNegativeStatusStacks('Aero Erosion', 1)]
}

export const nightmareKelpieOutroTrigger: SideEffect = {
  name: 'Nightmare: Kelpie Outro Trigger',
  damageDealt: calculateAeroErosionSideEffectDamage, // TODO: Any way to simply make it a damage event that scales with the character's stats? This is almost like an action: 405.00 % multiplier, aero element, echo dmg type, generates 2.81 energy with 0.50 share, 0 cast time (it's simply a side effect that happens outside of the characters acting so it doesnt take up field time)
  // https://encore.moe/echo/6000113?lang=en
  statusModifications: []
}

// ========== Hiyuki ==========================================================================================================

// Glacio Bite proc triggered by Hiyuki's Fine Snow passive at 2+ Snow Rust.
// Fires via actionTriggers (see hiyuki.ts) on every GLACIO_CHAFE_APPLIER cast — no need to
// attach it to individual actions. The trigger condition gates it on snow_rust >= 2.
// Damage type LIBERATION and element GLACIO; scales with 102% ATK + all active modifiers.
export const hiyuki_glacio_chafe_proc: SideEffect = {
  name: 'Glacio Bite Trigger',
  damageDealt: calculateGlacioChafeProcDamage,
  statusModifications: [],
}
