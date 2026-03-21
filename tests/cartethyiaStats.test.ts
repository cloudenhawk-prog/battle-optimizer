/**
 * Cartethyia Stat Resolution Test
 *
 * Verifies that Cartethyia's gear and stats resolve to the expected in-game values
 * after resolveCharacter() runs at startup.
 *
 * Expected final stats (excluding conditional modifiers):
 *   HP:              52738
 *   ATK:             1131
 *   DEF:             738
 *   Energy Regen:    126.8%
 *   Crit Rate:       76.1%
 *   Crit DMG:        251.6%
 *   Skill DMG Bonus: 9.4%
 *   Basic ATK Bonus: 18.7%
 *   Aero DMG Bonus:  30%
 */

import { calculateScalingStat } from '../src/utils/calculators/damageCalculator'
import { characters } from '../src/data/characters'

const cartethyia = characters.find(c => c.name === 'Cartethyia')

const expectWithin01Percent = (actual: number, expected: number) => {
  const tolerance = expected * 0.001
  expect(actual).toBeGreaterThanOrEqual(expected - tolerance)
  expect(actual).toBeLessThanOrEqual(expected + tolerance)
}

describe('Cartethyia stat resolution', () => {
  it('should find Cartethyia in the characters list', () => {
    expect(cartethyia).toBeDefined()
  })

  it('HP should resolve to 52738', () => {
    const hp = calculateScalingStat(cartethyia!.stats, 'HP')
    expectWithin01Percent(hp, 52738)
  })

  it('ATK should resolve to 1131', () => {
    const atk = calculateScalingStat(cartethyia!.stats, 'ATK')
    expectWithin01Percent(atk, 1131)
  })

  it('DEF should resolve to 738', () => {
    const def = calculateScalingStat(cartethyia!.stats, 'DEF')
    expectWithin01Percent(def, 738)
  })

  it('Energy Regen should resolve to 126.8% (1.268)', () => {
    expectWithin01Percent(cartethyia!.stats.energyPercent, 1.268)
  })

  it('Crit Rate should resolve to 76.1% (0.761)', () => {
    expectWithin01Percent(cartethyia!.stats.critRate, 0.761)
  })

  it('Crit DMG should resolve to 251.6% (2.516)', () => {
    expectWithin01Percent(cartethyia!.stats.critDamage, 2.516)
  })

  it('Skill DMG Bonus should resolve to 9.4% (0.094)', () => {
    expectWithin01Percent(cartethyia!.stats.skillBonusDMG, 0.094)
  })

  it('Basic ATK DMG Bonus should resolve to 18.7% (0.187)', () => {
    expectWithin01Percent(cartethyia!.stats.basicBonusDMG, 0.187)
  })

  it('Aero DMG Bonus should resolve to 30% (0.30)', () => {
    expectWithin01Percent(cartethyia!.stats.aeroBonusDMG, 0.30)
  })
})
