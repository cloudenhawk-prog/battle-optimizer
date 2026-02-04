import { 
  mergeStats, 
  mergeEnemyStats,
  calculateScalingStat,
  calculateBonusMultiplier,
  calculateAmplifyMultiplier,
  calculateTotalMultiplier
} from '../src/utils/calculators/damageCalculator'
import type { CharacterStats, EnemyStats } from '../src/types/stats'
import { createMockCharacterStats, createMockEnemyStats } from './testUtils'

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
        bonusATK: 0.20,
        bonusDMG: 0.15,
        skillBonusDMG: 0.10
      }
      
      const result = mergeStats(baseStats, modifiers)
      
      expect(result.bonusATK).toBe(0.20)
      expect(result.bonusDMG).toBe(0.15)
      expect(result.skillBonusDMG).toBe(0.10)
    })

    it('should stack multiple bonus modifiers additively', () => {
      const baseStats = createBaseStats()
      baseStats.bonusATK = 0.10
      baseStats.spectroBonusDMG = 0.05
      
      const modifiers: Partial<CharacterStats> = {
        bonusATK: 0.20,
        spectroBonusDMG: 0.15
      }
      
      const result = mergeStats(baseStats, modifiers)
      
      expect(result.bonusATK).toBeCloseTo(0.30, 5) // 0.10 + 0.20
      expect(result.spectroBonusDMG).toBeCloseTo(0.20, 5) // 0.05 + 0.15
    })

    it('should stack amplify stats additively', () => {
      const baseStats = createBaseStats()
      baseStats.amplifyDMG = 0.08
      
      const modifiers: Partial<CharacterStats> = {
        amplifyDMG: 0.12,
        skillAmplifyDMG: 0.25
      }
      
      const result = mergeStats(baseStats, modifiers)
      
      expect(result.amplifyDMG).toBe(0.20) // 0.08 + 0.12
      expect(result.skillAmplifyDMG).toBe(0.25)
    })

    it('should stack totalMultiplier stats multiplicatively', () => {
      const baseStats = createBaseStats()
      baseStats.totalMultiplierATK = 1.15
      baseStats.totalMultiplierDMG = 1.10
      
      const modifiers: Partial<CharacterStats> = {
        totalMultiplierATK: 1.20,
        totalMultiplierDMG: 1.30
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
        flatDEF: 100
      }
      
      const result = mergeStats(baseStats, modifiers)
      
      expect(result.flatATK).toBe(200) // 0 + 200
      expect(result.flatHP).toBe(1000) // 0 + 1000
      expect(result.flatDEF).toBe(100) // 0 + 100
    })

    it('should handle crit stats additively', () => {
      const baseStats = createBaseStats()
      const modifiers: Partial<CharacterStats> = {
        critRate: 0.30,
        critDamage: 0.50
      }
      
      const result = mergeStats(baseStats, modifiers)
      
      expect(result.critRate).toBe(0.35) // 0.05 + 0.30
      expect(result.critDamage).toBe(2.00) // 1.50 + 0.50
    })

    it('should handle penetration stats additively', () => {
      const baseStats = createBaseStats()
      const modifiers: Partial<CharacterStats> = {
        defIgnore: 0.15,
        elementalResPEN: 0.10,
        resistancePEN: 0.20
      }
      
      const result = mergeStats(baseStats, modifiers)
      
      expect(result.defIgnore).toBe(0.15)
      expect(result.elementalResPEN).toBe(0.10)
      expect(result.resistancePEN).toBe(0.20)
    })

    it('should merge multiple stat types correctly', () => {
      const baseStats = createBaseStats()
      baseStats.bonusATK = 0.10
      baseStats.totalMultiplierATK = 1.20
      baseStats.skillBonusDMG = 0.05
      
      const modifiers: Partial<CharacterStats> = {
        bonusATK: 0.15, // additive: 0.10 + 0.15 = 0.25
        totalMultiplierATK: 1.10, // multiplicative: 1.20 * 1.10 = 1.32
        flatATK: 50, // additive: 0 + 50 = 50
        skillBonusDMG: 0.20, // additive: 0.05 + 0.20 = 0.25
        liberationTotalMultiplierDMG: 1.15 // multiplicative: 1 * 1.15 = 1.15
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
        spectroRES: -0.10
      }
      
      const result = mergeEnemyStats(baseStats, modifiers)
      
      expect(result.aeroRES).toBe(0.25) // 0.10 + 0.15
      expect(result.spectroRES).toBe(0.00) // 0.10 + (-0.10)
    })

    it('should add resistance additively', () => {
      const baseStats = createBaseEnemyStats()
      baseStats.resistance = 0.20
      
      const modifiers: Partial<EnemyStats> = {
        resistance: 0.15
      }
      
      const result = mergeEnemyStats(baseStats, modifiers)
      
      expect(result.resistance).toBe(0.35) // 0.20 + 0.15
    })

    it('should stack damage reduction multiplicatively', () => {
      const baseStats = createBaseEnemyStats()
      baseStats.damageReduction = 0.30
      
      const modifiers: Partial<EnemyStats> = {
        damageReduction: 0.20
      }
      
      const result = mergeEnemyStats(baseStats, modifiers)
      
      // Formula: 1 - (1 - 0.30) * (1 - 0.20) = 1 - 0.70 * 0.80 = 1 - 0.56 = 0.44
      expect(result.damageReduction).toBeCloseTo(0.44, 5)
    })

    it('should handle multiple damage reduction stacks', () => {
      const baseStats = createBaseEnemyStats()
      baseStats.damageReduction = 0
      
      // First merge
      let modifiers: Partial<EnemyStats> = { damageReduction: 0.20 }
      let result = mergeEnemyStats(baseStats, modifiers)
      expect(result.damageReduction).toBeCloseTo(0.20, 5)
      
      // Second merge - stacking on the result
      modifiers = { damageReduction: 0.30 }
      result = mergeEnemyStats(result, modifiers)
      
      // Formula: 1 - (1 - 0.20) * (1 - 0.30) = 1 - 0.80 * 0.70 = 1 - 0.56 = 0.44
      expect(result.damageReduction).toBeCloseTo(0.44, 5)
    })

    it('should merge multiple stat types correctly', () => {
      const baseStats = createBaseEnemyStats()
      baseStats.glacioRES = 0.20
      baseStats.resistance = 0.10
      baseStats.damageReduction = 0.15
      
      const modifiers: Partial<EnemyStats> = {
        glacioRES: 0.15, // additive: 0.20 + 0.15 = 0.35
        fusionRES: -0.05, // additive: 0.10 + (-0.05) = 0.05
        resistance: 0.25, // additive: 0.10 + 0.25 = 0.35
        damageReduction: 0.20 // multiplicative: 1 - (1-0.15)*(1-0.20) = 0.32
      }
      
      const result = mergeEnemyStats(baseStats, modifiers)
      
      expect(result.glacioRES).toBe(0.35)
      expect(result.fusionRES).toBe(0.05)
      expect(result.resistance).toBe(0.35)
      expect(result.damageReduction).toBeCloseTo(0.32, 5) // 1 - 0.85 * 0.80
    })

    it('should handle negative resistances correctly', () => {
      const baseStats = createBaseEnemyStats()
      baseStats.spectroRES = -0.10
      
      const modifiers: Partial<EnemyStats> = {
        spectroRES: -0.15
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
        totalMultiplierATK: 1
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
        totalMultiplierATK: 1
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
        totalMultiplierATK: 1
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
        totalMultiplierATK: 1.20
      })

      const result = calculateScalingStat(stats, 'ATK')
      
      // Formula: 1000 * (1 + 0) * (1 + 0) * 1.20 + 0 = 1200
      expect(result).toBe(1200)
    })

    it('should calculate ATK with all multipliers', () => {
      const stats = createMockCharacterStats({
        baseATK: 1000,
        flatATK: 150,
        bonusATK: 0.30, // +30%
        amplifyATK: 0.20, // +20%
        totalMultiplierATK: 1.10
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
        amplifyHP: 0.10,
        totalMultiplierHP: 1.05
      })

      const result = calculateScalingStat(stats, 'HP')
      
      // Formula: 10000 * (1 + 0.15) * (1 + 0.10) * 1.05 + 500 = 10000 * 1.15 * 1.10 * 1.05 + 500 = 13282.5 + 500 = 13782.5
      expect(result).toBeCloseTo(13782.5, 5)
    })

    it('should calculate DEF scaling', () => {
      const stats = createMockCharacterStats({
        baseDEF: 800,
        flatDEF: 100,
        bonusDEF: 0.20,
        amplifyDEF: 0,
        totalMultiplierDEF: 1
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
      
      const result = calculateBonusMultiplier(stats, 'GLACIO', 'BASIC')
      
      expect(result).toBe(1)
    })

    it('should apply base bonus DMG', () => {
      const stats = createMockCharacterStats({
        bonusDMG: 0.25
      })
      
      const result = calculateBonusMultiplier(stats, 'GLACIO', 'BASIC')
      
      // Formula: 1 + 0.25 = 1.25
      expect(result).toBe(1.25)
    })

    it('should apply element bonus DMG', () => {
      const stats = createMockCharacterStats({
        glacioBonusDMG: 0.30
      })
      
      const result = calculateBonusMultiplier(stats, 'GLACIO', 'BASIC')
      
      // Formula: 1 + 0 + 0.30 = 1.30
      expect(result).toBe(1.30)
    })

    it('should apply damage type bonus DMG', () => {
      const stats = createMockCharacterStats({
        skillBonusDMG: 0.20
      })
      
      const result = calculateBonusMultiplier(stats, 'GLACIO', 'SKILL')
      
      // Formula: 1 + 0 + 0 + 0.20 = 1.20
      expect(result).toBe(1.20)
    })

    it('should apply status bonus DMG', () => {
      const stats = createMockCharacterStats({
        aeroErosionBonusDMG: 0.15
      })
      
      const result = calculateBonusMultiplier(stats, 'AERO', 'BASIC')
      
      // Formula: 1 + 0 + 0 + 0 + 0.15 = 1.15
      expect(result).toBe(1.15)
    })

    it('should stack all bonus types additively', () => {
      const stats = createMockCharacterStats({
        bonusDMG: 0.10,
        spectroBonusDMG: 0.25,
        liberationBonusDMG: 0.15,
        spectroFrazzleBonusDMG: 0.20
      })
      
      const result = calculateBonusMultiplier(stats, 'SPECTRO', 'LIBERATION')
      
      // Formula: 1 + 0.10 + 0.25 + 0.15 + 0.20 = 1.70
      expect(result).toBeCloseTo(1.70, 5)
    })

    it('should only apply relevant element bonus', () => {
      const stats = createMockCharacterStats({
        bonusDMG: 0.10,
        glacioBonusDMG: 0.30,
        fusionBonusDMG: 0.40 // Should not be applied
      })
      
      const result = calculateBonusMultiplier(stats, 'GLACIO', 'BASIC')
      
      // Formula: 1 + 0.10 + 0.30 = 1.40 (fusionBonusDMG ignored)
      expect(result).toBeCloseTo(1.40, 5)
    })

    it('should only apply relevant damage type bonus', () => {
      const stats = createMockCharacterStats({
        bonusDMG: 0.15,
        skillBonusDMG: 0.25,
        liberationBonusDMG: 0.35 // Should not be applied
      })
      
      const result = calculateBonusMultiplier(stats, 'HAVOC', 'SKILL')
      
      // Formula: 1 + 0.15 + 0 + 0.25 = 1.40 (liberationBonusDMG ignored)
      expect(result).toBe(1.40)
    })
  })

// ========== Calculate Amplify Multiplier =====================================================================================

  describe('calculateAmplifyMultiplier', () => {
    it('should return 1 with no amplifications', () => {
      const stats = createMockCharacterStats()
      
      const result = calculateAmplifyMultiplier(stats, 'ELECTRO', 'HEAVY')
      
      expect(result).toBe(1)
    })

    it('should apply base amplify DMG', () => {
      const stats = createMockCharacterStats({
        amplifyDMG: 0.18
      })
      
      const result = calculateAmplifyMultiplier(stats, 'ELECTRO', 'HEAVY')
      
      // Formula: 1 + 0.18 = 1.18
      expect(result).toBe(1.18)
    })

    it('should apply element amplify DMG', () => {
      const stats = createMockCharacterStats({
        electroAmplifyDMG: 0.22
      })
      
      const result = calculateAmplifyMultiplier(stats, 'ELECTRO', 'HEAVY')
      
      // Formula: 1 + 0 + 0.22 = 1.22
      expect(result).toBe(1.22)
    })

    it('should apply damage type amplify DMG', () => {
      const stats = createMockCharacterStats({
        heavyAmplifyDMG: 0.30
      })
      
      const result = calculateAmplifyMultiplier(stats, 'ELECTRO', 'HEAVY')
      
      // Formula: 1 + 0 + 0 + 0.30 = 1.30
      expect(result).toBe(1.30)
    })

    it('should apply status amplify DMG', () => {
      const stats = createMockCharacterStats({
        electroFlareAmplifyDMG: 0.25
      })
      
      const result = calculateAmplifyMultiplier(stats, 'ELECTRO', 'HEAVY')
      
      // Formula: 1 + 0 + 0 + 0 + 0.25 = 1.25
      expect(result).toBe(1.25)
    })

    it('should stack all amplify types additively', () => {
      const stats = createMockCharacterStats({
        amplifyDMG: 0.08,
        fusionAmplifyDMG: 0.12,
        coordinatedAmplifyDMG: 0.20,
        fusionBurstAmplifyDMG: 0.15
      })
      
      const result = calculateAmplifyMultiplier(stats, 'FUSION', 'COORDINATED')
      
      // Formula: 1 + 0.08 + 0.12 + 0.20 + 0.15 = 1.55
      expect(result).toBeCloseTo(1.55, 5)
    })

    it('should only apply relevant element amplify', () => {
      const stats = createMockCharacterStats({
        amplifyDMG: 0.10,
        havocAmplifyDMG: 0.20,
        aeroAmplifyDMG: 0.30 // Should not be applied
      })
      
      const result = calculateAmplifyMultiplier(stats, 'HAVOC', 'ECHO')
      
      // Formula: 1 + 0.10 + 0.20 = 1.30 (aeroAmplifyDMG ignored)
      expect(result).toBe(1.30)
    })
  })

// ========== Calculate Total Multiplier =======================================================================================

  describe('calculateTotalMultiplier', () => {
    it('should return 1 with no multipliers', () => {
      const stats = createMockCharacterStats()
      
      const result = calculateTotalMultiplier(stats, 'FUSION', 'INTRO')
      
      expect(result).toBe(1)
    })

    it('should apply base total multiplier DMG', () => {
      const stats = createMockCharacterStats({
        totalMultiplierDMG: 1.15
      })
      
      const result = calculateTotalMultiplier(stats, 'FUSION', 'INTRO')
      
      // Formula: 1.15 * 1 * 1 * 1 = 1.15
      expect(result).toBe(1.15)
    })

    it('should apply element total multiplier DMG', () => {
      const stats = createMockCharacterStats({
        fusionTotalMultiplierDMG: 1.20
      })
      
      const result = calculateTotalMultiplier(stats, 'FUSION', 'INTRO')
      
      // Formula: 1 * 1.20 * 1 * 1 = 1.20
      expect(result).toBe(1.20)
    })

    it('should apply damage type total multiplier DMG', () => {
      const stats = createMockCharacterStats({
        introTotalMultiplierDMG: 1.25
      })
      
      const result = calculateTotalMultiplier(stats, 'FUSION', 'INTRO')
      
      // Formula: 1 * 1 * 1.25 * 1 = 1.25
      expect(result).toBe(1.25)
    })

    it('should apply status total multiplier DMG', () => {
      const stats = createMockCharacterStats({
        fusionBurstTotalMultiplierDMG: 1.30
      })
      
      const result = calculateTotalMultiplier(stats, 'FUSION', 'INTRO')
      
      // Formula: 1 * 1 * 1 * 1.30 = 1.30
      expect(result).toBe(1.30)
    })

    it('should multiply all total multipliers together', () => {
      const stats = createMockCharacterStats({
        totalMultiplierDMG: 1.10,
        aeroTotalMultiplierDMG: 1.15,
        outroTotalMultiplierDMG: 1.20,
        aeroErosionTotalMultiplierDMG: 1.25
      })
      
      const result = calculateTotalMultiplier(stats, 'AERO', 'OUTRO')
      
      // Formula: 1.10 * 1.15 * 1.20 * 1.25 = 1.89750
      expect(result).toBeCloseTo(1.89750, 5)
    })

    it('should only apply relevant element total multiplier', () => {
      const stats = createMockCharacterStats({
        totalMultiplierDMG: 1.10,
        spectroTotalMultiplierDMG: 1.25,
        glacioTotalMultiplierDMG: 1.40 // Should not be applied
      })
      
      const result = calculateTotalMultiplier(stats, 'SPECTRO', 'BASIC')
      
      // Formula: 1.10 * 1.25 * 1 * 1 = 1.375 (glacioTotalMultiplierDMG ignored)
      expect(result).toBeCloseTo(1.375, 5)
    })

    it('should only apply relevant damage type total multiplier', () => {
      const stats = createMockCharacterStats({
        totalMultiplierDMG: 1.08,
        basicTotalMultiplierDMG: 1.12,
        skillTotalMultiplierDMG: 1.30 // Should not be applied
      })
      
      const result = calculateTotalMultiplier(stats, 'HAVOC', 'BASIC')
      
      // Formula: 1.08 * 1 * 1.12 * 1 = 1.2096 (skillTotalMultiplierDMG ignored)
      expect(result).toBeCloseTo(1.2096, 5)
    })
  })
})
