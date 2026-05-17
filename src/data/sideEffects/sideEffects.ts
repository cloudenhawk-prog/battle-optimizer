import type { SideEffect } from '../../types/sideEffect'
import { calculateAeroErosionSideEffectDamage, calculateGlacioChafeProcDamage, calculateGlacioChafeDominionDamage, calculateLucilaOblivionDamage } from '../../utils/calculators/sideEffectCalculators'
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
// Uses the negative status damage pipeline (not the action pipeline); dmgTypes
// includes GLACIO_CHAFE so that Glacio Chafe-specific stat bonuses apply.
export const hiyuki_glacio_chafe_proc: SideEffect = {
  name: 'Snow Rust 2: Glacio Bite',
  damageDealt: calculateGlacioChafeProcDamage,
  statusModifications: [],
}

// Hiyuki S6 Everfrost Dominion — fires a Glacio Chafe negative-status damage hit at the
// current max Glacio Chafe stacks whenever any Resonator on the team applies Glacio Chafe.
// Damage scales off the Glacio Chafe stack damage table, NOT off ATK.
// Fires via teamActionTriggers (see hiyuki.ts); ctx.character is always Hiyuki regardless
// of who cast the triggering action, ensuring correct dealer attribution.
export const hiyuki_everfrost_dominion_glacio_bite: SideEffect = {
  name: 'Everfrost Dominion: Glacio Bite',
  damageDealt: calculateGlacioChafeDominionDamage,
  statusModifications: [],
}

// ========== Lucila ==========================================================================================================

// Oblivion — fires once per Photo (50 Traces) consumed by Basic Attack - Tracing Forms Stage 3.
// In Glacio Chafe mode, considered as Basic Attack DMG. Also inflicts 1 stack of Glacio Chafe.
// Concerto (+5) and Film Roll (+2) generation per photo is handled in the action's resolveVariant
// via energyGenerated, since SideEffect cannot generate energy.
export const lucila_oblivion: SideEffect = {
  name: 'Oblivion',
  damageDealt: calculateLucilaOblivionDamage,
  statusModifications: [{ type: 'negativeStatus', targetName: 'Glacio Chafe', stackChange: 1 }],
}

// Film Roll proc — fires via teamActionTriggers when a teammate applies Glacio Chafe
// and Lucila has ≥ 1 Film Roll stack. Inflicts 2 stacks of Glacio Chafe on the target.
// 1 Film Roll is consumed via TeamActionTrigger.energyCost on the trigger definition.
export const lucila_film_roll_proc: SideEffect = {
  name: 'Film Roll: Glacio Chafe',
  damageDealt: (_ctx, sideEffectName, timeStamp) => ({
    snapshotId: _ctx.snapshotId,
    dealer: `${_ctx.character.name}: ${sideEffectName}`,
    target: _ctx.enemy.name,
    elements: [],
    dmgTypes: [],
    scaling: 'FLAT',
    actionName: sideEffectName,
    normalStrike: 0,
    criticalStrike: 0,
    average: 0,
    contributions: {},
    timeStamp,
  }),
  statusModifications: [{ type: 'negativeStatus', targetName: 'Glacio Chafe', stackChange: 2, applicationCount: 2 }],
}
