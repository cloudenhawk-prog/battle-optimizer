/**
 * Cartethyia Stat Resolution Test
 *
 * Verifies that Cartethyia's gear and stats resolve to the expected in-game values
 * after resolveCharacter() runs at startup.
 *
 * Passive self/always/permanent modifiers (e.g. Windward Pilgrimage set bonus injected modifier)
 * are now flattened into character.stats at resolution time.
 *
 * NOTE: The gear file currently uses uniform placeholder subs (critRate/critDMG/bonusHP).
 * These expectations reflect the PLACEHOLDER build, not the final in-game values.
 * Update the gear data in src/data/gear/cartethyia.ts with real sub stats to restore
 * the intended values (ATK 1131, DEF 738, EnergyRegen 1.268, etc.).
 *
 * Current resolved stats (placeholder subs):
 *   HP:              ~51851
 *   ATK:             1024.5
 *   DEF:             611    (base only — no DEF subs yet)
 *   Energy Regen:    100%   (no energy regen subs yet)
 *   Crit Rate:       82.5%  (+10% from Windward Pilgrimage flattened modifier)
 *   Crit DMG:        269%
 *   Skill DMG Bonus: 0      (no skill DMG subs yet)
 *   Basic ATK Bonus: 0      (no basic ATK subs yet)
 *   Aero DMG Bonus:  60%    (+30% from Windward Pilgrimage flattened modifier)
 */

import { calculateScalingStat } from '../src/utils/calculators/damageCalculator'
import { cartethyia } from '../src/data/characters/cartethyia'
import { resolveCharacter } from '../src/utils/gear/resolveCharacter'

const resolved = resolveCharacter(cartethyia)

const expectWithin01Percent = (actual: number, expected: number) => {
  const tolerance = expected * 0.001
  expect(actual).toBeGreaterThanOrEqual(expected - tolerance)
  expect(actual).toBeLessThanOrEqual(expected + tolerance)
}

describe('Cartethyia stat resolution', () => {
  it('HP should resolve to ~51851 (placeholder subs)', () => {
    const hp = calculateScalingStat(resolved.stats, 'HP')
    expectWithin01Percent(hp, 51851.24)
  })

  it('ATK should resolve to 1024.5 (placeholder subs)', () => {
    const atk = calculateScalingStat(resolved.stats, 'ATK')
    expectWithin01Percent(atk, 1024.5)
  })

  it('DEF should resolve to 611 (base only, no DEF subs yet)', () => {
    const def = calculateScalingStat(resolved.stats, 'DEF')
    expectWithin01Percent(def, 611)
  })

  it('Energy Regen should resolve to 100% (1.0) — no regen subs yet', () => {
    expectWithin01Percent(resolved.stats.energyPercent, 1.0)
  })

  it('Crit Rate should resolve to 82.5% (0.825) — includes Windward Pilgrimage flattened passive +10%', () => {
    expectWithin01Percent(resolved.stats.critRate, 0.825)
  })

  it('Crit DMG should resolve to 269% (2.69) — placeholder subs all crit DMG', () => {
    expectWithin01Percent(resolved.stats.critDamage, 2.69)
  })

  it('Skill DMG Bonus should resolve to 0 — no skill DMG subs yet', () => {
    expect(resolved.stats.skillBonusDMG).toBe(0)
  })

  it('Basic ATK DMG Bonus should resolve to 0 — no basic ATK subs yet', () => {
    expect(resolved.stats.basicBonusDMG).toBe(0)
  })

  it('Aero DMG Bonus should resolve to 60% (0.60) — includes Windward Pilgrimage flattened passive +30%', () => {
    expectWithin01Percent(resolved.stats.aeroBonusDMG, 0.60)
  })
})
