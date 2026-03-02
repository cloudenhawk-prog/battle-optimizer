import { calculateDamage, mergeStats, mergeEnemyStats, calculateScalingStat, calculateBonusMultiplier, calculateAmplifyMultiplier, calculateTotalMultiplier } from '../src/utils/calculators/damageCalculator'
import type { CharacterStats, EnemyStats } from '../src/types/stats'
import { createMockCharacterStats, createMockEnemyStats, createMockAction, createMockEnemy, createMockDamageModifier, createMockDamageModifierList, buildAggregatedFromModifiers, buildAggregatedWithoutModifier, assertContributionMatches } from './testUtils'

// ========== Damage Calculator ================================================================================================

describe('damageCalculator', () => {
  // ========== Merge Character Stats ============================================================================================

  describe('mergeStats', () => {
    const createBaseStats = (): CharacterStats => createMockCharacterStats()

    it('should merge empty modifiers without changing base stats', () => {
      const baseStats = createBaseStats()
      const result = mergeStats(baseStats, {})

      expect(result).toEqual(baseStats)
    })

    it('should add bonus stats additively', () => {
      const baseStats = createBaseStats()
      const modifiers: Partial<CharacterStats> = {
        bonusATK: 0.2,
        bonusDMG: 0.15,
        skillBonusDMG: 0.1,
      }

      const result = mergeStats(baseStats, modifiers)

      expect(result.bonusATK).toBe(0.2)
      expect(result.bonusDMG).toBe(0.15)
      expect(result.skillBonusDMG).toBe(0.1)
    })

    it('should stack multiple bonus modifiers additively', () => {
      const baseStats = createBaseStats()
      baseStats.bonusATK = 0.1
      baseStats.spectroBonusDMG = 0.05

      const modifiers: Partial<CharacterStats> = {
        bonusATK: 0.2,
        spectroBonusDMG: 0.15,
      }

      const result = mergeStats(baseStats, modifiers)

      expect(result.bonusATK).toBeCloseTo(0.3, 5) // 0.10 + 0.20
      expect(result.spectroBonusDMG).toBeCloseTo(0.2, 5) // 0.05 + 0.15
    })

    it('should stack amplify stats additively', () => {
      const baseStats = createBaseStats()
      baseStats.amplifyDMG = 0.08

      const modifiers: Partial<CharacterStats> = {
        amplifyDMG: 0.12,
        skillAmplifyDMG: 0.25,
      }

      const result = mergeStats(baseStats, modifiers)

      expect(result.amplifyDMG).toBe(0.2) // 0.08 + 0.12
      expect(result.skillAmplifyDMG).toBe(0.25)
    })

    it('should stack totalMultiplier stats multiplicatively', () => {
      const baseStats = createBaseStats()
      baseStats.totalMultiplierATK = 1.15
      baseStats.totalMultiplierDMG = 1.1

      const modifiers: Partial<CharacterStats> = {
        totalMultiplierATK: 1.2,
        totalMultiplierDMG: 1.3,
      }

      const result = mergeStats(baseStats, modifiers)

      expect(result.totalMultiplierATK).toBeCloseTo(1.38, 5) // 1.15 * 1.20
      expect(result.totalMultiplierDMG).toBeCloseTo(1.43, 5) // 1.10 * 1.30
    })

    it('should handle flat stats additively', () => {
      const baseStats = createBaseStats()
      const modifiers: Partial<CharacterStats> = {
        flatATK: 200,
        flatHP: 1000,
        flatDEF: 100,
      }

      const result = mergeStats(baseStats, modifiers)

      expect(result.flatATK).toBe(200) // 0 + 200
      expect(result.flatHP).toBe(1000) // 0 + 1000
      expect(result.flatDEF).toBe(100) // 0 + 100
    })

    it('should handle crit stats additively', () => {
      const baseStats = createBaseStats()
      const modifiers: Partial<CharacterStats> = {
        critRate: 0.3,
        critDamage: 0.5,
      }

      const result = mergeStats(baseStats, modifiers)

      expect(result.critRate).toBe(0.35) // 0.05 + 0.30
      expect(result.critDamage).toBe(2.0) // 1.50 + 0.50
    })

    it('should handle penetration stats additively', () => {
      const baseStats = createBaseStats()
      const modifiers: Partial<CharacterStats> = {
        defIgnore: 0.15,
        elementalResPEN: 0.1,
        resistancePEN: 0.2,
      }

      const result = mergeStats(baseStats, modifiers)

      expect(result.defIgnore).toBe(0.15)
      expect(result.elementalResPEN).toBe(0.1)
      expect(result.resistancePEN).toBe(0.2)
    })

    it('should merge multiple stat types correctly', () => {
      const baseStats = createBaseStats()
      baseStats.bonusATK = 0.1
      baseStats.totalMultiplierATK = 1.2
      baseStats.skillBonusDMG = 0.05

      const modifiers: Partial<CharacterStats> = {
        bonusATK: 0.15, // additive: 0.10 + 0.15 = 0.25
        totalMultiplierATK: 1.1, // multiplicative: 1.20 * 1.10 = 1.32
        flatATK: 50, // additive: 0 + 50 = 50
        skillBonusDMG: 0.2, // additive: 0.05 + 0.20 = 0.25
        liberationTotalMultiplierDMG: 1.15, // multiplicative: 1 * 1.15 = 1.15
      }

      const result = mergeStats(baseStats, modifiers)

      expect(result.bonusATK).toBe(0.25)
      expect(result.totalMultiplierATK).toBeCloseTo(1.32, 5)
      expect(result.flatATK).toBe(50)
      expect(result.skillBonusDMG).toBe(0.25)
      expect(result.liberationTotalMultiplierDMG).toBeCloseTo(1.15, 5)
    })
  })

  // ========== Merge Enemy Stats ================================================================================================

  describe('mergeEnemyStats', () => {
    const createBaseEnemyStats = (): EnemyStats => createMockEnemyStats()

    it('should merge empty modifiers without changing base stats', () => {
      const baseStats = createBaseEnemyStats()
      const result = mergeEnemyStats(baseStats, {})

      expect(result).toEqual(baseStats)
    })

    it('should add elemental resistance additively', () => {
      const baseStats = createBaseEnemyStats()
      const modifiers: Partial<EnemyStats> = {
        aeroRES: 0.15,
        spectroRES: -0.1,
      }

      const result = mergeEnemyStats(baseStats, modifiers)

      expect(result.aeroRES).toBe(0.25) // 0.10 + 0.15
      expect(result.spectroRES).toBe(0.0) // 0.10 + (-0.10)
    })

    it('should add resistance additively', () => {
      const baseStats = createBaseEnemyStats()
      baseStats.resistance = 0.2

      const modifiers: Partial<EnemyStats> = {
        resistance: 0.15,
      }

      const result = mergeEnemyStats(baseStats, modifiers)

      expect(result.resistance).toBe(0.35) // 0.20 + 0.15
    })

    it('should stack damage reduction multiplicatively', () => {
      const baseStats = createBaseEnemyStats()
      baseStats.damageReduction = 0.3

      const modifiers: Partial<EnemyStats> = {
        damageReduction: 0.2,
      }

      const result = mergeEnemyStats(baseStats, modifiers)

      // Formula: 1 - (1 - 0.30) * (1 - 0.20) = 1 - 0.70 * 0.80 = 1 - 0.56 = 0.44
      expect(result.damageReduction).toBeCloseTo(0.44, 5)
    })

    it('should handle multiple damage reduction stacks', () => {
      const baseStats = createBaseEnemyStats()
      baseStats.damageReduction = 0

      // First merge
      let modifiers: Partial<EnemyStats> = { damageReduction: 0.2 }
      let result = mergeEnemyStats(baseStats, modifiers)
      expect(result.damageReduction).toBeCloseTo(0.2, 5)

      // Second merge - stacking on the result
      modifiers = { damageReduction: 0.3 }
      result = mergeEnemyStats(result, modifiers)

      // Formula: 1 - (1 - 0.20) * (1 - 0.30) = 1 - 0.80 * 0.70 = 1 - 0.56 = 0.44
      expect(result.damageReduction).toBeCloseTo(0.44, 5)
    })

    it('should merge multiple stat types correctly', () => {
      const baseStats = createBaseEnemyStats()
      baseStats.glacioRES = 0.2
      baseStats.resistance = 0.1
      baseStats.damageReduction = 0.15

      const modifiers: Partial<EnemyStats> = {
        glacioRES: 0.15, // additive: 0.20 + 0.15 = 0.35
        fusionRES: -0.05, // additive: 0.10 + (-0.05) = 0.05
        resistance: 0.25, // additive: 0.10 + 0.25 = 0.35
        damageReduction: 0.2, // multiplicative: 1 - (1-0.15)*(1-0.20) = 0.32
      }

      const result = mergeEnemyStats(baseStats, modifiers)

      expect(result.glacioRES).toBe(0.35)
      expect(result.fusionRES).toBe(0.05)
      expect(result.resistance).toBe(0.35)
      expect(result.damageReduction).toBeCloseTo(0.32, 5) // 1 - 0.85 * 0.80
    })

    it('should handle negative resistances correctly', () => {
      const baseStats = createBaseEnemyStats()
      baseStats.spectroRES = -0.1

      const modifiers: Partial<EnemyStats> = {
        spectroRES: -0.15,
      }

      const result = mergeEnemyStats(baseStats, modifiers)

      expect(result.spectroRES).toBe(-0.25) // -0.10 + (-0.15)
    })
  })

  // ========== Calculate Scaling Stat ===========================================================================================

  describe('calculateScalingStat', () => {
    it('should calculate ATK with base and flat only', () => {
      const stats = createMockCharacterStats({
        baseATK: 1000,
        flatATK: 200,
        bonusATK: 0,
        amplifyATK: 0,
        totalMultiplierATK: 1,
      })

      const result = calculateScalingStat(stats, 'ATK')

      // Formula: 1000 * (1 + 0) * (1 + 0) * 1 + 200 = 1200
      expect(result).toBe(1200)
    })

    it('should calculate ATK with bonus', () => {
      const stats = createMockCharacterStats({
        baseATK: 1000,
        flatATK: 0,
        bonusATK: 0.25, // +25%
        amplifyATK: 0,
        totalMultiplierATK: 1,
      })

      const result = calculateScalingStat(stats, 'ATK')

      // Formula: 1000 * (1 + 0.25) * (1 + 0) * 1 + 0 = 1250
      expect(result).toBe(1250)
    })

    it('should calculate ATK with amplify', () => {
      const stats = createMockCharacterStats({
        baseATK: 1000,
        flatATK: 0,
        bonusATK: 0,
        amplifyATK: 0.15, // +15%
        totalMultiplierATK: 1,
      })

      const result = calculateScalingStat(stats, 'ATK')

      // Formula: 1000 * (1 + 0) * (1 + 0.15) * 1 + 0 = 1150
      expect(result).toBe(1150)
    })

    it('should calculate ATK with totalMultiplier', () => {
      const stats = createMockCharacterStats({
        baseATK: 1000,
        flatATK: 0,
        bonusATK: 0,
        amplifyATK: 0,
        totalMultiplierATK: 1.2,
      })

      const result = calculateScalingStat(stats, 'ATK')

      // Formula: 1000 * (1 + 0) * (1 + 0) * 1.20 + 0 = 1200
      expect(result).toBe(1200)
    })

    it('should calculate ATK with all multipliers', () => {
      const stats = createMockCharacterStats({
        baseATK: 1000,
        flatATK: 150,
        bonusATK: 0.3, // +30%
        amplifyATK: 0.2, // +20%
        totalMultiplierATK: 1.1,
      })

      const result = calculateScalingStat(stats, 'ATK')

      // Formula: 1000 * (1 + 0.30) * (1 + 0.20) * 1.10 + 150 = 1000 * 1.30 * 1.20 * 1.10 + 150 = 1716 + 150 = 1866
      expect(result).toBeCloseTo(1866, 5)
    })

    it('should calculate HP scaling', () => {
      const stats = createMockCharacterStats({
        baseHP: 10000,
        flatHP: 500,
        bonusHP: 0.15,
        amplifyHP: 0.1,
        totalMultiplierHP: 1.05,
      })

      const result = calculateScalingStat(stats, 'HP')

      // Formula: 10000 * (1 + 0.15) * (1 + 0.10) * 1.05 + 500 = 13782.5
      expect(result).toBeCloseTo(13782.5, 5)
    })

    it('should calculate DEF scaling', () => {
      const stats = createMockCharacterStats({
        baseDEF: 800,
        flatDEF: 100,
        bonusDEF: 0.2,
        amplifyDEF: 0,
        totalMultiplierDEF: 1,
      })

      const result = calculateScalingStat(stats, 'DEF')

      // Formula: 800 * (1 + 0.20) * (1 + 0) * 1 + 100 = 960 + 100 = 1060
      expect(result).toBe(1060)
    })
  })

  // ========== Calculate Bonus Multiplier =======================================================================================

  describe('calculateBonusMultiplier', () => {
    it('should return 1 with no bonuses', () => {
      const stats = createMockCharacterStats()

      const result = calculateBonusMultiplier(stats, ['GLACIO'], ['BASIC'])

      expect(result).toBe(1)
    })

    it('should apply base bonus DMG', () => {
      const stats = createMockCharacterStats({
        bonusDMG: 0.25,
      })

      const result = calculateBonusMultiplier(stats, ['GLACIO'], ['BASIC'])

      // Formula: 1 + 0.25 = 1.25
      expect(result).toBe(1.25)
    })

    it('should apply element bonus DMG', () => {
      const stats = createMockCharacterStats({
        glacioBonusDMG: 0.3,
      })

      const result = calculateBonusMultiplier(stats, ['GLACIO'], ['BASIC'])

      // Formula: 1 + 0 + 0.30 = 1.30
      expect(result).toBe(1.3)
    })

    it('should apply damage type bonus DMG', () => {
      const stats = createMockCharacterStats({
        skillBonusDMG: 0.2,
      })

      const result = calculateBonusMultiplier(stats, ['GLACIO'], ['SKILL'])

      // Formula: 1 + 0 + 0 + 0.20 = 1.20
      expect(result).toBe(1.2)
    })

    it('should NOT apply status bonus DMG without NEGATIVE_STATUS dmgType', () => {
      const stats = createMockCharacterStats({
        aeroErosionBonusDMG: 0.15,
      })

      const result = calculateBonusMultiplier(stats, ['AERO'], ['BASIC'])

      // Formula: 1 + 0 + 0 + 0 + 0 = 1.0 (status bonus not applied without NEGATIVE_STATUS)
      expect(result).toBe(1.0)
    })

    it('should stack all bonus types additively', () => {
      const stats = createMockCharacterStats({
        bonusDMG: 0.1,
        spectroBonusDMG: 0.25,
        liberationBonusDMG: 0.15,
        spectroFrazzleBonusDMG: 0.2,
      })

      const result = calculateBonusMultiplier(stats, ['SPECTRO'], ['LIBERATION'])

      // Formula: 1 + 0.10 + 0.25 + 0.15 + 0 = 1.50 (status bonus not applied without NEGATIVE_STATUS)
      expect(result).toBeCloseTo(1.5, 5)
    })

    it('should only apply relevant element bonus', () => {
      const stats = createMockCharacterStats({
        bonusDMG: 0.1,
        glacioBonusDMG: 0.3,
        fusionBonusDMG: 0.4, // Should not be applied
      })

      const result = calculateBonusMultiplier(stats, ['GLACIO'], ['BASIC'])

      // Formula: 1 + 0.10 + 0.30 = 1.40 (fusionBonusDMG ignored)
      expect(result).toBeCloseTo(1.4, 5)
    })

    it('should only apply relevant damage type bonus', () => {
      const stats = createMockCharacterStats({
        bonusDMG: 0.15,
        skillBonusDMG: 0.25,
        liberationBonusDMG: 0.35, // Should not be applied
      })

      const result = calculateBonusMultiplier(stats, ['HAVOC'], ['SKILL'])

      // Formula: 1 + 0.15 + 0 + 0.25 = 1.40 (liberationBonusDMG ignored)
      expect(result).toBe(1.4)
    })

    it('should sum bonuses for multiple elements', () => {
      const stats = createMockCharacterStats({
        bonusDMG: 0.1,
        aeroBonusDMG: 0.2,
        spectroBonusDMG: 0.15,
      })

      const result = calculateBonusMultiplier(stats, ['AERO', 'SPECTRO'], ['SKILL'])

      // Formula: 1 + 0.10 + (0.20 + 0.15) + 0 = 1.45
      expect(result).toBeCloseTo(1.45, 5)
    })

    it('should sum bonuses for multiple damage types', () => {
      const stats = createMockCharacterStats({
        bonusDMG: 0.1,
        skillBonusDMG: 0.2,
        echoBonusDMG: 0.15,
      })

      const result = calculateBonusMultiplier(stats, ['FUSION'], ['SKILL', 'ECHO'])

      // Formula: 1 + 0.10 + 0 + (0.20 + 0.15) = 1.45
      expect(result).toBeCloseTo(1.45, 5)
    })

    it('should apply status bonuses when NEGATIVE_STATUS damage type is present', () => {
      const stats = createMockCharacterStats({
        bonusDMG: 0.12,
        havocBonusDMG: 0.18,
        havocBaneBonusDMG: 0.3,
      })

      const result = calculateBonusMultiplier(stats, ['HAVOC'], ['LIBERATION', 'NEGATIVE_STATUS'])

      // Formula: 1 + 0.12 + 0.18 + 0 + 0.30 = 1.60
      // Status bonus (havocBaneBonusDMG) is applied based on HAVOC element
      expect(result).toBeCloseTo(1.6, 5)
    })
  })

  // ========== Calculate Amplify Multiplier =====================================================================================

  describe('calculateAmplifyMultiplier', () => {
    it('should return 1 with no amplifications', () => {
      const stats = createMockCharacterStats()

      const result = calculateAmplifyMultiplier(stats, ['ELECTRO'], ['HEAVY'])

      expect(result).toBe(1)
    })

    it('should apply base amplify DMG', () => {
      const stats = createMockCharacterStats({
        amplifyDMG: 0.18,
      })

      const result = calculateAmplifyMultiplier(stats, ['ELECTRO'], ['HEAVY'])

      // Formula: 1 + 0.18 = 1.18
      expect(result).toBe(1.18)
    })

    it('should apply element amplify DMG', () => {
      const stats = createMockCharacterStats({
        electroAmplifyDMG: 0.22,
      })

      const result = calculateAmplifyMultiplier(stats, ['ELECTRO'], ['HEAVY'])

      // Formula: 1 + 0 + 0.22 = 1.22
      expect(result).toBe(1.22)
    })

    it('should apply damage type amplify DMG', () => {
      const stats = createMockCharacterStats({
        heavyAmplifyDMG: 0.3,
      })

      const result = calculateAmplifyMultiplier(stats, ['ELECTRO'], ['HEAVY'])

      // Formula: 1 + 0 + 0 + 0.30 = 1.30
      expect(result).toBe(1.3)
    })

    it('should apply status amplify DMG', () => {
      const stats = createMockCharacterStats({
        electroFlareAmplifyDMG: 0.25,
      })

      const result = calculateAmplifyMultiplier(stats, ['ELECTRO'], ['HEAVY'])

      // Formula: 1 + 0 + 0 + 0 + 0 = 1.0 (status amplify not applied without NEGATIVE_STATUS)
      expect(result).toBe(1.0)
    })

    it('should stack all amplify types additively', () => {
      const stats = createMockCharacterStats({
        amplifyDMG: 0.08,
        fusionAmplifyDMG: 0.12,
        coordinatedAmplifyDMG: 0.2,
        fusionBurstAmplifyDMG: 0.15,
      })

      const result = calculateAmplifyMultiplier(stats, ['FUSION'], ['COORDINATED'])

      // Formula: 1 + 0.08 + 0.12 + 0.20 + 0 = 1.40 (status amplify not applied without NEGATIVE_STATUS)
      expect(result).toBeCloseTo(1.4, 5)
    })

    it('should only apply relevant element amplify', () => {
      const stats = createMockCharacterStats({
        amplifyDMG: 0.1,
        havocAmplifyDMG: 0.2,
        aeroAmplifyDMG: 0.3, // Should not be applied
      })

      const result = calculateAmplifyMultiplier(stats, ['HAVOC'], ['ECHO'])

      // Formula: 1 + 0.10 + 0.20 = 1.30 (aeroAmplifyDMG ignored)
      expect(result).toBe(1.3)
    })

    it('should sum amplifications for multiple elements', () => {
      const stats = createMockCharacterStats({
        amplifyDMG: 0.08,
        glacioAmplifyDMG: 0.12,
        havocAmplifyDMG: 0.15,
      })

      const result = calculateAmplifyMultiplier(stats, ['GLACIO', 'HAVOC'], ['BASIC'])

      // Formula: 1 + 0.08 + (0.12 + 0.15) + 0 = 1.35
      expect(result).toBeCloseTo(1.35, 5)
    })

    it('should sum amplifications for multiple damage types', () => {
      const stats = createMockCharacterStats({
        amplifyDMG: 0.05,
        skillAmplifyDMG: 0.1,
        introAmplifyDMG: 0.2,
      })

      const result = calculateAmplifyMultiplier(stats, ['SPECTRO'], ['SKILL', 'INTRO'])

      // Formula: 1 + 0.05 + 0 + (0.10 + 0.20) = 1.35
      expect(result).toBeCloseTo(1.35, 5)
    })

    it('should apply status amplifications when NEGATIVE_STATUS damage type is present', () => {
      const stats = createMockCharacterStats({
        amplifyDMG: 0.1,
        aeroAmplifyDMG: 0.15,
        aeroErosionAmplifyDMG: 0.25,
      })

      const result = calculateAmplifyMultiplier(stats, ['AERO'], ['SKILL', 'NEGATIVE_STATUS'])

      // Formula: 1 + 0.10 + 0.15 + 0 + 0.25 = 1.50
      // Status amplifier (aeroErosionAmplifyDMG) is applied based on AERO element
      expect(result).toBeCloseTo(1.5, 5)
    })

    it('should apply multiple status amplifications for multiple elements with NEGATIVE_STATUS', () => {
      const stats = createMockCharacterStats({
        amplifyDMG: 0.05,
        spectroAmplifyDMG: 0.1,
        fusionAmplifyDMG: 0.12,
        spectroFrazzleAmplifyDMG: 0.2,
        fusionBurstAmplifyDMG: 0.18,
      })

      const result = calculateAmplifyMultiplier(stats, ['SPECTRO', 'FUSION'], ['NEGATIVE_STATUS'])

      // Formula: 1 + 0.05 + (0.10 + 0.12) + 0 + (0.20 + 0.18) = 1.65
      // Both status amplifiers are applied based on the elements present
      expect(result).toBeCloseTo(1.65, 5)
    })

    it('should not apply status amplifications when NEGATIVE_STATUS is absent', () => {
      const stats = createMockCharacterStats({
        amplifyDMG: 0.1,
        electroAmplifyDMG: 0.15,
        electroFlareAmplifyDMG: 0.25,
      })

      const result = calculateAmplifyMultiplier(stats, ['ELECTRO'], ['SKILL'])

      // Formula: 1 + 0.10 + 0.15 + 0 + 0 = 1.25
      // Status amplifier is NOT applied without NEGATIVE_STATUS dmgType
      // This is the CORRECT behavior - status modifiers only apply to status damage
      expect(result).toBeCloseTo(1.25, 5)
    })
  })

  // ========== Calculate Total Multiplier =======================================================================================

  describe('calculateTotalMultiplier', () => {
    it('should return 1 with no multipliers', () => {
      const stats = createMockCharacterStats()

      const result = calculateTotalMultiplier(stats, ['FUSION'], ['INTRO'])

      expect(result).toBe(1)
    })

    it('should apply base total multiplier DMG', () => {
      const stats = createMockCharacterStats({
        totalMultiplierDMG: 1.15,
      })

      const result = calculateTotalMultiplier(stats, ['FUSION'], ['INTRO'])

      // Formula: 1.15 * 1 * 1 * 1 = 1.15
      expect(result).toBe(1.15)
    })

    it('should apply element total multiplier DMG', () => {
      const stats = createMockCharacterStats({
        fusionTotalMultiplierDMG: 1.2,
      })

      const result = calculateTotalMultiplier(stats, ['FUSION'], ['INTRO'])

      // Formula: 1 * 1.20 * 1 * 1 = 1.20
      expect(result).toBe(1.2)
    })

    it('should apply damage type total multiplier DMG', () => {
      const stats = createMockCharacterStats({
        introTotalMultiplierDMG: 1.25,
      })

      const result = calculateTotalMultiplier(stats, ['FUSION'], ['INTRO'])

      // Formula: 1 * 1 * 1.25 * 1 = 1.25
      expect(result).toBe(1.25)
    })

    it('should apply status total multiplier DMG', () => {
      const stats = createMockCharacterStats({
        fusionBurstTotalMultiplierDMG: 1.3,
      })

      const result = calculateTotalMultiplier(stats, ['FUSION'], ['INTRO'])

      // Formula: 1 * 1 * 1 * 1 = 1.0 (status multiplier not applied without NEGATIVE_STATUS)
      expect(result).toBe(1.0)
    })

    it('should multiply all total multipliers together', () => {
      const stats = createMockCharacterStats({
        totalMultiplierDMG: 1.1,
        aeroTotalMultiplierDMG: 1.15,
        outroTotalMultiplierDMG: 1.2,
        aeroErosionTotalMultiplierDMG: 1.25,
      })

      const result = calculateTotalMultiplier(stats, ['AERO'], ['OUTRO'])

      // Formula: 1.10 * 1.15 * 1.20 * 1 = 1.518 (status multiplier not applied without NEGATIVE_STATUS)
      expect(result).toBeCloseTo(1.518, 5)
    })

    it('should only apply relevant element total multiplier', () => {
      const stats = createMockCharacterStats({
        totalMultiplierDMG: 1.1,
        spectroTotalMultiplierDMG: 1.25,
        glacioTotalMultiplierDMG: 1.4, // Should not be applied
      })

      const result = calculateTotalMultiplier(stats, ['SPECTRO'], ['BASIC'])

      // Formula: 1.10 * 1.25 * 1 * 1 = 1.375 (glacioTotalMultiplierDMG ignored)
      expect(result).toBeCloseTo(1.375, 5)
    })

    it('should only apply relevant damage type total multiplier', () => {
      const stats = createMockCharacterStats({
        totalMultiplierDMG: 1.08,
        basicTotalMultiplierDMG: 1.12,
        skillTotalMultiplierDMG: 1.3, // Should not be applied
      })

      const result = calculateTotalMultiplier(stats, ['HAVOC'], ['BASIC'])

      // Formula: 1.08 * 1 * 1.12 * 1 = 1.2096 (skillTotalMultiplierDMG ignored)
      expect(result).toBeCloseTo(1.2096, 5)
    })

    it('should multiply all multipliers for multiple elements', () => {
      const stats = createMockCharacterStats({
        totalMultiplierDMG: 1.1,
        fusionTotalMultiplierDMG: 1.15,
        electroTotalMultiplierDMG: 1.2,
      })

      const result = calculateTotalMultiplier(stats, ['FUSION', 'ELECTRO'], ['SKILL'])

      // Formula: 1.10 * 1.15 * 1.20 * 1 = 1.518
      expect(result).toBeCloseTo(1.518, 5)
    })

    it('should multiply all multipliers for multiple damage types', () => {
      const stats = createMockCharacterStats({
        totalMultiplierDMG: 1.05,
        liberationTotalMultiplierDMG: 1.1,
        outroTotalMultiplierDMG: 1.15,
      })

      const result = calculateTotalMultiplier(stats, ['AERO'], ['LIBERATION', 'OUTRO'])

      // Formula: 1.05 * 1 * 1.10 * 1.15 * 1 = 1.32825
      expect(result).toBeCloseTo(1.32825, 5)
    })

    it('should apply status total multipliers when NEGATIVE_STATUS damage type is present', () => {
      const stats = createMockCharacterStats({
        totalMultiplierDMG: 1.08,
        glacioTotalMultiplierDMG: 1.12,
        glacioChafeTotalMultiplierDMG: 1.25,
      })

      const result = calculateTotalMultiplier(stats, ['GLACIO'], ['SKILL', 'NEGATIVE_STATUS'])

      // Formula: 1.08 * 1.12 * 1 * 1.25 = 1.512
      // Status multiplier (glacioChafeTotalMultiplierDMG) is applied based on GLACIO element
      expect(result).toBeCloseTo(1.512, 5)
    })
  })

  // ========== Damage Contributions =============================================================================================

  describe('damage contributions helper', () => {
    const baseStats = createMockCharacterStats()
    const enemy = createMockEnemy()
    const TOL = 1e-6
    const assertContribution = (actual: any, fullEvent: any, withoutEvent: any) => assertContributionMatches(actual, { normalStrike: fullEvent.normalStrike, criticalStrike: fullEvent.criticalStrike, average: fullEvent.average }, { normalStrike: withoutEvent.normalStrike, criticalStrike: withoutEvent.criticalStrike, average: withoutEvent.average }, TOL)

    it('bonusDMG modifier numeric contribution matches removal diff', () => {
      const mod = createMockDamageModifier('bonusMod', { characterStats: { bonusDMG: 0.2 } })
      const mods = [mod]

      const aggregated: any = buildAggregatedFromModifiers(mods)

      const action = createMockAction('Test', { multiplier: 1, scaling: 'ATK', elements: ['GLACIO'], dmgTypes: ['BASIC'] })
      const full = calculateDamage({ action, name: 'X', stats: baseStats, damageModifiers: mods, modifierCharacterStats: aggregated, modifierEnemyStats: {}, enemy, snapshotId: 1, timeStamp: 0 })

      const withoutAgg: any = buildAggregatedWithoutModifier(mod, aggregated)

      const without = calculateDamage({ action, name: 'X', stats: baseStats, damageModifiers: [], modifierCharacterStats: withoutAgg, modifierEnemyStats: {}, enemy, snapshotId: 1, timeStamp: 0 })

      expect(full.damageEvent.contributions).toHaveProperty('bonusMod')
      const contrib = full.damageEvent.contributions['bonusMod']
      assertContribution(contrib, full.damageEvent, without.damageEvent)
    })

    it('amplifyDMG and totalMultiplierDMG numeric correctness', () => {
      const m1 = createMockDamageModifier('amp', { characterStats: { amplifyDMG: 0.25 } })
      const m2 = createMockDamageModifier('total', { characterStats: { totalMultiplierDMG: 1.2 } })
      const mods = [m1, m2]

      const aggregated: any = buildAggregatedFromModifiers(mods)

      const action = createMockAction('Test', { multiplier: 1, scaling: 'ATK', elements: ['GLACIO'], dmgTypes: ['BASIC'] })
      const full = calculateDamage({ action, name: 'X', stats: baseStats, damageModifiers: mods, modifierCharacterStats: aggregated, modifierEnemyStats: {}, enemy, snapshotId: 1, timeStamp: 0 })

      // amp
      const withoutAmp: any = buildAggregatedWithoutModifier(m1, aggregated)
      const resWithoutAmp = calculateDamage({ action, name: 'X', stats: baseStats, damageModifiers: [], modifierCharacterStats: withoutAmp, modifierEnemyStats: {}, enemy, snapshotId: 1, timeStamp: 0 })
      assertContribution(full.damageEvent.contributions['amp'], full.damageEvent, resWithoutAmp.damageEvent)

      // total
      const withoutTotal: any = buildAggregatedWithoutModifier(m2, aggregated)
      const resWithoutTotal = calculateDamage({ action, name: 'X', stats: baseStats, damageModifiers: [], modifierCharacterStats: withoutTotal, modifierEnemyStats: {}, enemy, snapshotId: 1, timeStamp: 0 })
      assertContribution(full.damageEvent.contributions['total'], full.damageEvent, resWithoutTotal.damageEvent)
    })

    it('elemental and crit stats numeric match removal', () => {
      const m1 = createMockDamageModifier('glacioBonus', { characterStats: { glacioBonusDMG: 0.5 } })
      const m2 = createMockDamageModifier('critStuff', { characterStats: { critRate: 0.3, critDamage: 0.5 } })
      const mods = [m1, m2]

      const aggregated: any = buildAggregatedFromModifiers(mods)

      const action = createMockAction('Test', { multiplier: 1, scaling: 'ATK', elements: ['GLACIO'], dmgTypes: ['BASIC'] })
      const full = calculateDamage({ action, name: 'X', stats: baseStats, damageModifiers: mods, modifierCharacterStats: aggregated, modifierEnemyStats: {}, enemy, snapshotId: 1, timeStamp: 0 })

      const withoutG: any = buildAggregatedWithoutModifier(m1, aggregated)
      const resWithoutG = calculateDamage({ action, name: 'X', stats: baseStats, damageModifiers: [], modifierCharacterStats: withoutG, modifierEnemyStats: {}, enemy, snapshotId: 1, timeStamp: 0 })
      assertContribution(full.damageEvent.contributions['glacioBonus'], full.damageEvent, resWithoutG.damageEvent)

      // critStuff
      const withoutC: any = buildAggregatedWithoutModifier(m2, aggregated)
      const resWithoutC = calculateDamage({ action, name: 'X', stats: baseStats, damageModifiers: [], modifierCharacterStats: withoutC, modifierEnemyStats: {}, enemy, snapshotId: 1, timeStamp: 0 })
      assertContribution(full.damageEvent.contributions['critStuff'], full.damageEvent, resWithoutC.damageEvent)
      // crit contribution should be present
      expect(full.damageEvent.contributions['critStuff'].crit_damage_contributed).toBeGreaterThanOrEqual(0)
    })

    it('flat ATK numeric match removal', () => {
      const m = createMockDamageModifier('flatATK', { characterStats: { flatATK: 200 } })
      const mods = [m]

      const aggregated: any = buildAggregatedFromModifiers(mods)
      const action = createMockAction('Test', { multiplier: 1, scaling: 'ATK', elements: ['GLACIO'], dmgTypes: ['BASIC'] })
      const full = calculateDamage({ action, name: 'X', stats: baseStats, damageModifiers: mods, modifierCharacterStats: aggregated, modifierEnemyStats: {}, enemy, snapshotId: 1, timeStamp: 0 })

      const without: any = buildAggregatedWithoutModifier(m, aggregated)
      const resWithout = calculateDamage({ action, name: 'X', stats: baseStats, damageModifiers: [], modifierCharacterStats: without, modifierEnemyStats: {}, enemy, snapshotId: 1, timeStamp: 0 })
      assertContribution(full.damageEvent.contributions['flatATK'], full.damageEvent, resWithout.damageEvent)
    })

    it('multiple modifiers produce numerically-correct contributions', () => {
      const mods = [createMockDamageModifier('b', { characterStats: { bonusDMG: 0.1 } }), createMockDamageModifier('a', { characterStats: { amplifyDMG: 0.15 } }), createMockDamageModifier('t', { characterStats: { totalMultiplierDMG: 1.1 } })]

      const aggregated: any = buildAggregatedFromModifiers(mods)

      const action = createMockAction('Test', { multiplier: 1, scaling: 'ATK', elements: ['GLACIO'], dmgTypes: ['BASIC'] })
      const full = calculateDamage({ action, name: 'X', stats: baseStats, damageModifiers: mods, modifierCharacterStats: aggregated, modifierEnemyStats: {}, enemy, snapshotId: 1, timeStamp: 0 })

      for (const m of mods) {
        const withoutAgg: any = buildAggregatedWithoutModifier(m, aggregated)
        const resWithout = calculateDamage({ action, name: 'X', stats: baseStats, damageModifiers: [], modifierCharacterStats: withoutAgg, modifierEnemyStats: {}, enemy, snapshotId: 1, timeStamp: 0 })
        expect(full.damageEvent.contributions).toHaveProperty(m.source)
        assertContribution(full.damageEvent.contributions[m.source], full.damageEvent, resWithout.damageEvent)
      }
    })
  })

  // ========== Damage Calculator ================================================================================================

  describe('damageCalculator (integration)', () => {
    it('basic calculateDamage returns a valid result with defaults', () => {
      const action = createMockAction('Test Action')
      const name = 'Test Character Dealer'
      const stats = createMockCharacterStats()
      const damageModifiers = createMockDamageModifierList(3)
      const modifierCharacterStats = createMockCharacterStats()
      const modifierEnemyStats = createMockEnemyStats()
      const enemy = createMockEnemy('Test Enemy')
      const snapshotId = 1

      const result = calculateDamage({ action, name, stats, damageModifiers, modifierCharacterStats, modifierEnemyStats, enemy, snapshotId, timeStamp: 0 })

      expect(result.average).toBeGreaterThanOrEqual(0)
      expect(result.damageEvent).toHaveProperty('actionName', action.name)
    })

    it('should work for carlotta case 1', () => {
      const action = createMockAction('Test Action Basic 1', { multiplier: 0.5408, scaling: 'ATK', elements: ['GLACIO'] })
      const name = 'Test Dealer: Carlotta'
      const stats = createMockCharacterStats({ baseATK: 0, flatATK: 2409, critRate: 0, critDamage: 2.678, basicBonusDMG: 0.064, glacioBonusDMG: 0.72 })

      const damageModifiers = createMockDamageModifierList(3)
      const modifierCharacterStats = {}
      const modifierEnemyStats = {}
      const enemy = createMockEnemy('Test Enemy')
      const snapshotId = 1

      const { average } = calculateDamage({ action, name, stats, damageModifiers, modifierCharacterStats, modifierEnemyStats, enemy, snapshotId, timeStamp: 0 })

      expect(average).toBeGreaterThanOrEqual(1063 - 1)
      expect(average).toBeLessThanOrEqual(1063 + 1)
    })

    it('should work for carlotta case 2', () => {
      const action = createMockAction('Test Action Basic 1', { multiplier: 0.5408, scaling: 'ATK', elements: ['GLACIO'] })
      const name = 'Test Dealer: Carlotta'
      const stats = createMockCharacterStats({ baseATK: 0, flatATK: 2409, critRate: 1.0, critDamage: 2.678, basicBonusDMG: 0.064, glacioBonusDMG: 0.72 })

      const damageModifiers = createMockDamageModifierList(3)
      const modifierCharacterStats = { flatATK: 262, amplifyDMG: 0.25, bonusDMG: 0.4, critDamage: 0.52 }
      const modifierEnemyStats = {}
      const enemy = createMockEnemy('Test Enemy')
      const snapshotId = 1

      const { average } = calculateDamage({ action, name, stats, damageModifiers, modifierCharacterStats, modifierEnemyStats, enemy, snapshotId, timeStamp: 0 })

      expect(average).toBeGreaterThanOrEqual(5767 - 1)
      expect(average).toBeLessThanOrEqual(5767 + 1)
    })

    it('should work for cartethyia case 1', () => {
      const action = createMockAction('Test Action Basic 1', { multiplier: 0.0717, scaling: 'HP', elements: ['AERO'] })
      const name = 'Test Dealer: Cartethyia'
      const stats = createMockCharacterStats({ baseHP: 0, flatHP: 45120, critRate: 1.0, critDamage: 2.226, basicBonusDMG: 0.33, aeroBonusDMG: 0.9, defIgnore: 0.08 })

      const damageModifiers = createMockDamageModifierList(3)
      const modifierCharacterStats = {}
      const modifierEnemyStats = {}
      const enemy = createMockEnemy('Test Enemy')
      const snapshotId = 1

      const { average } = calculateDamage({ action, name, stats, damageModifiers, modifierCharacterStats, modifierEnemyStats, enemy, snapshotId, timeStamp: 0 })

      expect(average).toBeGreaterThanOrEqual(7644 - 1)
      expect(average).toBeLessThanOrEqual(7644 + 1)
    })

    it('should work for cartethyia case 2', () => {
      const action = createMockAction('Test Action Basic 1', { multiplier: 0.0717, scaling: 'HP', elements: ['AERO'] })
      const name = 'Test Dealer: Cartethyia'
      const stats = createMockCharacterStats({ baseHP: 0, flatHP: 45120, critRate: 1.0, critDamage: 2.226, basicBonusDMG: 0.33, aeroBonusDMG: 0.9, defIgnore: 0.08 })

      const damageModifiers = createMockDamageModifierList(3)
      const modifierCharacterStats = { bonusDMG: 0.3, aeroBonusDMG: 0.3, amplifyDMG: 0.2 }
      const modifierEnemyStats = {}
      const enemy = createMockEnemy('Test Enemy')
      const snapshotId = 1

      const { average } = calculateDamage({ action, name, stats, damageModifiers, modifierCharacterStats, modifierEnemyStats, enemy, snapshotId, timeStamp: 0 })

      expect(average).toBeGreaterThanOrEqual(11641 - 1)
      expect(average).toBeLessThanOrEqual(11641 + 1)
    })

    it('should correctly apply everything at once', () => {
      const action = createMockAction('Test Action Everything', {
        castTime: 1.0,
        multiplier: 0.5,
        scaling: 'ATK',
        elements: ['AERO', 'GLACIO'],
        dmgTypes: ['SKILL', 'NEGATIVE_STATUS'],
        cooldown: 10,
      })

      const name = 'Test Dealer: Cartethyia'

      const stats = createMockCharacterStats({
        baseATK: 1000,
        flatATK: 100,
        bonusATK: 0.5,
        amplifyATK: 0.2,
        totalMultiplierATK: 1.1,

        baseHP: 0,
        flatHP: 0,
        bonusHP: 0,
        amplifyHP: 0,
        totalMultiplierHP: 1.0,

        baseDEF: 0,
        flatDEF: 0,
        bonusDEF: 0,
        amplifyDEF: 0,
        totalMultiplierDEF: 1.0,

        critRate: 1.0,
        critDamage: 2.0,

        bonusDMG: 0.15,
        amplifyDMG: 0.15,
        totalMultiplierDMG: 1.05,

        defIgnore: 0.1,
        elementalResPEN: 0,
        resistancePEN: 0,

        basicBonusDMG: 0.35,
        basicAmplifyDMG: 0.25,
        basicTotalMultiplierDMG: 1.07,

        heavyBonusDMG: 0.08,
        heavyAmplifyDMG: 0.16,
        heavyTotalMultiplierDMG: 1.03,

        skillBonusDMG: 0.55,
        skillAmplifyDMG: 0.35,
        skillTotalMultiplierDMG: 1.04,

        liberationBonusDMG: 0.09,
        liberationAmplifyDMG: 0.13,
        liberationTotalMultiplierDMG: 1.24,

        coordinatedBonusDMG: 0.21,
        coordinatedAmplifyDMG: 0.22,
        coordinatedTotalMultiplierDMG: 1.13,

        echoBonusDMG: 0.4,
        echoAmplifyDMG: 0.3,
        echoTotalMultiplierDMG: 1.16,

        introBonusDMG: 0.8,
        introAmplifyDMG: 0.31,
        introTotalMultiplierDMG: 1.19,

        outroBonusDMG: 0.42,
        outroAmplifyDMG: 0.15,
        outroTotalMultiplierDMG: 1.91,

        aeroErosionBonusDMG: 0.25,
        aeroErosionAmplifyDMG: 0.26,
        aeroErosionTotalMultiplierDMG: 1.27,

        spectroFrazzleBonusDMG: 0.28,
        spectroFrazzleAmplifyDMG: 0.29,
        spectroFrazzleTotalMultiplierDMG: 1.3,

        havocBaneBonusDMG: 0.31,
        havocBaneAmplifyDMG: 0.32,
        havocBaneTotalMultiplierDMG: 1.33,

        glacioChafeBonusDMG: 0.34,
        glacioChafeAmplifyDMG: 0.35,
        glacioChafeTotalMultiplierDMG: 1.36,

        fusionBurstBonusDMG: 0.37,
        fusionBurstAmplifyDMG: 0.38,
        fusionBurstTotalMultiplierDMG: 1.39,

        electroFlareBonusDMG: 0.4,
        electroFlareAmplifyDMG: 0.41,
        electroFlareTotalMultiplierDMG: 1.42,

        spectroBonusDMG: 0.43,
        spectroAmplifyDMG: 0.44,
        spectroTotalMultiplierDMG: 1.45,

        fusionBonusDMG: 0.46,
        fusionAmplifyDMG: 0.47,
        fusionTotalMultiplierDMG: 1.48,

        aeroBonusDMG: 0.49,
        aeroAmplifyDMG: 0.5,
        aeroTotalMultiplierDMG: 1.51,

        glacioBonusDMG: 0.52,
        glacioAmplifyDMG: 0.53,
        glacioTotalMultiplierDMG: 1.54,

        electroBonusDMG: 0.55,
        electroAmplifyDMG: 0.56,
        electroTotalMultiplierDMG: 1.57,

        havocBonusDMG: 0.58,
        havocAmplifyDMG: 0.59,
        havocTotalMultiplierDMG: 1.6,

        energyPercent: 1.5,
      })

      const damageModifiers = createMockDamageModifierList(3)

      const modifierCharacterStats = {}

      const modifierEnemyStats = {}

      const enemy = createMockEnemy('Test Enemy')

      const snapshotId = 1

      const { average } = calculateDamage({ action, name, stats, damageModifiers, modifierCharacterStats, modifierEnemyStats, enemy, snapshotId, timeStamp: 0 })

      // ATK x actionMultiplier x (1 + bonus%) x critdmg x (1 + amp%) x (1 - RES) x (DEF multiplier) x (Product of all total multipliers)
      // 2080 x 0.50 x 3.3 x 2 x 3.14 x 0.90 x 0.5343082115 x 4.385942521 = 45459
      expect(average).toBeGreaterThanOrEqual(45459 - 1)
      expect(average).toBeLessThanOrEqual(45459 + 1)
    })
  })
})
