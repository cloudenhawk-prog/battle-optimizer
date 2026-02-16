import { buildStepContext, resolveDamageModifiers, aggregateStat } from '../src/utils/hooks/resolvers'
import { createMockSnapshot, createMockCharacter, createMockAction, createMockEnemy, createMockNegativeStatus, createMockActiveNegativeStatus } from './testUtils'

/**
 * This resolver findes existing damage modifiers sources: character, action, negative statuses and adds up the stats.
 */
describe('resolveDamageModifiers', () => {
  describe('Modifier Source Collection', () => {
    it('should collect and aggregate from all sources (character + action + negative statuses)', () => {
      const character = createMockCharacter('TestChar', {
        damageModifiers: [{ source: 'character', characterStats: { bonusATK: 100 } }],
      })
      const action = createMockAction('Action', {
        damageModifiers: [{ source: 'action', characterStats: { bonusATK: 50 } }],
      })
      const burnStatus = createMockNegativeStatus('Burn', {
        element: 'FUSION',
        damageModifiers: [{ source: 'negStatus', characterStats: { bonusATK: 25 } }],
      })
      const negativeStatuses = [createMockActiveNegativeStatus(burnStatus)]

      const context = buildStepContext(1, createMockSnapshot({ id: '1' }), createMockSnapshot({ id: '0', toTime: 0 }), character, action, createMockEnemy(), negativeStatuses, { TestChar: character })

      resolveDamageModifiers(context)

      expect(context.aggregatedCharacterModifiers.bonusATK).toBe(175) // 100 + 50 + 25
      expect(context.damageModifiers).toHaveLength(3)
      expect(context.damageModifiers[0].source).toBe('character')
      expect(context.damageModifiers[1].source).toBe('action')
      expect(context.damageModifiers[2].source).toBe('negStatus')
    })

    it('should handle multiple modifiers from same source', () => {
      const character = createMockCharacter('TestChar', {
        damageModifiers: [
          { source: 'passive1', characterStats: { bonusATK: 100 } },
          { source: 'passive2', characterStats: { bonusATK: 50 } },
          { source: 'passive3', characterStats: { bonusATK: 30 } },
        ],
      })

      const context = buildStepContext(1, createMockSnapshot({ id: '1' }), createMockSnapshot({ id: '0', toTime: 0 }), character, createMockAction('Action'), createMockEnemy(), [], { TestChar: character })

      resolveDamageModifiers(context)

      expect(context.aggregatedCharacterModifiers.bonusATK).toBe(180) // 100 + 50 + 30
    })

    it('should handle multiple negative statuses with modifiers', () => {
      const status1 = createMockNegativeStatus('Status1', {
        element: 'FUSION',
        duration: 10,
        damageModifiers: [{ source: 'status1', characterStats: { bonusATK: 30 } }],
      })
      const status2 = createMockNegativeStatus('Status2', {
        element: 'GLACIO',
        duration: 5,
        damageModifiers: [{ source: 'status2', characterStats: { bonusATK: 20 } }],
      })
      const negativeStatuses = [createMockActiveNegativeStatus(status1), createMockActiveNegativeStatus(status2)]

      const context = buildStepContext(1, createMockSnapshot({ id: '1' }), createMockSnapshot({ id: '0', toTime: 0 }), createMockCharacter('TestChar'), createMockAction('Action'), createMockEnemy(), negativeStatuses, { TestChar: createMockCharacter('TestChar') })

      resolveDamageModifiers(context)

      expect(context.aggregatedCharacterModifiers.bonusATK).toBe(50) // 30 + 20
    })

    it('should aggregate both character and enemy stats from same modifier', () => {
      const character = createMockCharacter('TestChar', {
        damageModifiers: [
          {
            source: 'mixed',
            characterStats: { bonusATK: 100 },
            enemyStats: { glacioRES: -0.2 },
          },
        ],
      })

      const context = buildStepContext(1, createMockSnapshot({ id: '1' }), createMockSnapshot({ id: '0', toTime: 0 }), character, createMockAction('Action'), createMockEnemy(), [], { TestChar: character })

      resolveDamageModifiers(context)

      expect(context.aggregatedCharacterModifiers.bonusATK).toBe(100)
      expect(context.aggregatedEnemyModifiers.glacioRES).toBeCloseTo(-0.2, 3)
    })
  })

  describe('Stat Type Aggregation', () => {
    it('should correctly aggregate additive stats', () => {
      const character = createMockCharacter('TestChar', {
        damageModifiers: [
          { source: 'mod1', characterStats: { bonusATK: 100, critRate: 0.2, energyPercent: 1.5 } },
          { source: 'mod2', characterStats: { bonusATK: 50, critRate: 0.15, energyPercent: 0.3 } },
        ],
      })

      const context = buildStepContext(1, createMockSnapshot({ id: '1' }), createMockSnapshot({ id: '0', toTime: 0 }), character, createMockAction('Action'), createMockEnemy(), [], { TestChar: character })

      resolveDamageModifiers(context)

      expect(context.aggregatedCharacterModifiers.bonusATK).toBe(150)
      expect(context.aggregatedCharacterModifiers.critRate).toBeCloseTo(0.35, 3)
      expect(context.aggregatedCharacterModifiers.energyPercent).toBeCloseTo(1.8, 3)
    })

    it('should correctly aggregate multiplicative stats', () => {
      const character = createMockCharacter('TestChar', {
        damageModifiers: [
          { source: 'mod1', characterStats: { totalMultiplierATK: 1.2, totalMultiplierDMG: 1.15 } },
          { source: 'mod2', characterStats: { totalMultiplierATK: 1.1, totalMultiplierDMG: 1.1 } },
        ],
      })

      const context = buildStepContext(1, createMockSnapshot({ id: '1' }), createMockSnapshot({ id: '0', toTime: 0 }), character, createMockAction('Action'), createMockEnemy(), [], { TestChar: character })

      resolveDamageModifiers(context)

      expect(context.aggregatedCharacterModifiers.totalMultiplierATK).toBeCloseTo(1.32, 3)
      expect(context.aggregatedCharacterModifiers.totalMultiplierDMG).toBeCloseTo(1.265, 3)
    })

    it('should handle additive and multiplicative stats independently', () => {
      const character = createMockCharacter('TestChar', {
        damageModifiers: [
          {
            source: 'mixed',
            characterStats: {
              bonusATK: 100,
              totalMultiplierATK: 1.2,
              critRate: 0.2,
              totalMultiplierDMG: 1.15,
            },
          },
          {
            source: 'mixed2',
            characterStats: {
              bonusATK: 50,
              totalMultiplierATK: 1.1,
              critRate: 0.1,
              totalMultiplierDMG: 1.1,
            },
          },
        ],
      })

      const context = buildStepContext(1, createMockSnapshot({ id: '1' }), createMockSnapshot({ id: '0', toTime: 0 }), character, createMockAction('Action'), createMockEnemy(), [], { TestChar: character })

      resolveDamageModifiers(context)

      // Additive
      expect(context.aggregatedCharacterModifiers.bonusATK).toBe(150)
      expect(context.aggregatedCharacterModifiers.critRate).toBeCloseTo(0.3, 3)

      // Multiplicative
      expect(context.aggregatedCharacterModifiers.totalMultiplierATK).toBeCloseTo(1.32, 3)
      expect(context.aggregatedCharacterModifiers.totalMultiplierDMG).toBeCloseTo(1.265, 3)
    })

    it('should initialize totalMultiplier stats to 1 and others to 0', () => {
      const character = createMockCharacter('TestChar')
      const action = createMockAction('Action')

      const context = buildStepContext(1, createMockSnapshot({ id: '1' }), createMockSnapshot({ id: '0', toTime: 0 }), character, action, createMockEnemy(), [], { TestChar: character })

      resolveDamageModifiers(context)

      // All totalMultipliers should start at 1
      expect(context.aggregatedCharacterModifiers.totalMultiplierATK).toBe(1)
      expect(context.aggregatedCharacterModifiers.totalMultiplierHP).toBe(1)
      expect(context.aggregatedCharacterModifiers.totalMultiplierDEF).toBe(1)
      expect(context.aggregatedCharacterModifiers.totalMultiplierDMG).toBe(1)
      expect(context.aggregatedCharacterModifiers.basicTotalMultiplierDMG).toBe(1)

      // All additive stats should start at 0
      expect(context.aggregatedCharacterModifiers.flatATK).toBe(0)
      expect(context.aggregatedCharacterModifiers.bonusATK).toBe(0)
      expect(context.aggregatedCharacterModifiers.critRate).toBe(0)
      expect(context.aggregatedCharacterModifiers.energyPercent).toBe(0)
    })
  })

  describe('Enemy Stat Aggregation', () => {
    it('should aggregate enemy resistance stats (additive)', () => {
      const character = createMockCharacter('TestChar', {
        damageModifiers: [{ source: 'weapon', enemyStats: { glacioRES: -0.2 } }],
      })
      const action = createMockAction('Action', {
        damageModifiers: [{ source: 'action', enemyStats: { glacioRES: -0.15 } }],
      })

      const context = buildStepContext(1, createMockSnapshot({ id: '1' }), createMockSnapshot({ id: '0', toTime: 0 }), character, action, createMockEnemy(), [], { TestChar: character })

      resolveDamageModifiers(context)

      expect(context.aggregatedEnemyModifiers.glacioRES).toBeCloseTo(-0.35, 3) // -0.20 + -0.15
    })

    it('should use reverse multiplicative formula for damageReduction: 1 - (1-a) * (1-b)', () => {
      const character = createMockCharacter('TestChar', {
        damageModifiers: [{ source: 'buff1', enemyStats: { damageReduction: 0.5 } }],
      })
      const action = createMockAction('Action', {
        damageModifiers: [{ source: 'buff2', enemyStats: { damageReduction: 0.5 } }],
      })

      const context = buildStepContext(1, createMockSnapshot({ id: '1' }), createMockSnapshot({ id: '0', toTime: 0 }), character, action, createMockEnemy(), [], { TestChar: character })

      resolveDamageModifiers(context)

      // Two 50% reductions should result in 75% total reduction
      // Formula: 1 - (1-0.5) * (1-0.5) = 1 - 0.25 = 0.75
      expect(context.aggregatedEnemyModifiers.damageReduction).toBeCloseTo(0.75, 3)
    })

    it('should handle zero damageReduction as identity (leave unchanged)', () => {
      const character = createMockCharacter('TestChar', {
        damageModifiers: [{ source: 'buff1', enemyStats: { damageReduction: 0.3 } }],
      })
      const action = createMockAction('Action', {
        damageModifiers: [{ source: 'buff2', enemyStats: { damageReduction: 0 } }],
      })

      const context = buildStepContext(1, createMockSnapshot({ id: '1' }), createMockSnapshot({ id: '0', toTime: 0 }), character, action, createMockEnemy(), [], { TestChar: character })

      resolveDamageModifiers(context)

      // Adding 0 should leave the value unchanged at 0.3
      expect(context.aggregatedEnemyModifiers.damageReduction).toBeCloseTo(0.3, 3)
    })

    it('should handle negative damageReduction (damage amplification)', () => {
      const character = createMockCharacter('TestChar', {
        damageModifiers: [{ source: 'buff1', enemyStats: { damageReduction: 0.3 } }],
      })
      const action = createMockAction('Action', {
        damageModifiers: [{ source: 'debuff', enemyStats: { damageReduction: -0.2 } }],
      })

      const context = buildStepContext(1, createMockSnapshot({ id: '1' }), createMockSnapshot({ id: '0', toTime: 0 }), character, action, createMockEnemy(), [], { TestChar: character })

      resolveDamageModifiers(context)

      // 30% reduction + 20% amplification
      // 1 - (1-0.3) * (1-(-0.2)) = 1 - 0.7 * 1.2 = 0.16 (16% reduction)
      expect(context.aggregatedEnemyModifiers.damageReduction).toBeCloseTo(0.16, 3)
    })

    it('should initialize all enemy stats to 0', () => {
      const context = buildStepContext(1, createMockSnapshot({ id: '1' }), createMockSnapshot({ id: '0', toTime: 0 }), createMockCharacter('TestChar'), createMockAction('Action'), createMockEnemy(), [], { TestChar: createMockCharacter('TestChar') })

      resolveDamageModifiers(context)

      expect(context.aggregatedEnemyModifiers.level).toBe(0)
      expect(context.aggregatedEnemyModifiers.aeroRES).toBe(0)
      expect(context.aggregatedEnemyModifiers.spectroRES).toBe(0)
      expect(context.aggregatedEnemyModifiers.havocRES).toBe(0)
      expect(context.aggregatedEnemyModifiers.glacioRES).toBe(0)
      expect(context.aggregatedEnemyModifiers.fusionRES).toBe(0)
      expect(context.aggregatedEnemyModifiers.electroRES).toBe(0)
      expect(context.aggregatedEnemyModifiers.resistance).toBe(0)
      expect(context.aggregatedEnemyModifiers.damageReduction).toBe(0)
    })
  })

  describe('Conditional Modifiers', () => {
    it('should apply condition multiplier to all stats in modifier', () => {
      const character = createMockCharacter('TestChar', {
        damageModifiers: [
          {
            source: 'conditional',
            characterStats: { bonusATK: 100, critRate: 0.2 },
            condition: () => 2,
          },
        ],
      })

      const context = buildStepContext(1, createMockSnapshot({ id: '1' }), createMockSnapshot({ id: '0', toTime: 0 }), character, createMockAction('Action'), createMockEnemy(), [], { TestChar: character })

      resolveDamageModifiers(context)

      expect(context.aggregatedCharacterModifiers.bonusATK).toBe(200) // 100 * 2
      expect(context.aggregatedCharacterModifiers.critRate).toBeCloseTo(0.4, 3) // 0.20 * 2
    })

    it('should treat missing condition as multiplier of 1', () => {
      const character = createMockCharacter('TestChar', {
        damageModifiers: [
          { source: 'noCondition', characterStats: { bonusATK: 100 } },
          { source: 'withCondition', characterStats: { bonusATK: 50 }, condition: () => 1 },
        ],
      })

      const context = buildStepContext(1, createMockSnapshot({ id: '1' }), createMockSnapshot({ id: '0', toTime: 0 }), character, createMockAction('Action'), createMockEnemy(), [], { TestChar: character })

      resolveDamageModifiers(context)

      expect(context.aggregatedCharacterModifiers.bonusATK).toBe(150) // Both effectively 1x
    })

    it('should handle condition returning 0 (disabled modifier)', () => {
      const character = createMockCharacter('TestChar', {
        damageModifiers: [
          { source: 'active', characterStats: { bonusATK: 100 } },
          { source: 'disabled', characterStats: { bonusATK: 500 }, condition: () => 0 },
        ],
      })

      const context = buildStepContext(1, createMockSnapshot({ id: '1' }), createMockSnapshot({ id: '0', toTime: 0 }), character, createMockAction('Action'), createMockEnemy(), [], { TestChar: character })

      resolveDamageModifiers(context)

      expect(context.aggregatedCharacterModifiers.bonusATK).toBe(100) // 500 * 0 = 0, so only 100
    })

    it('should handle fractional condition multipliers', () => {
      const character = createMockCharacter('TestChar', {
        damageModifiers: [
          {
            source: 'partial',
            characterStats: { bonusATK: 100 },
            condition: () => 0.5,
          },
        ],
      })

      const context = buildStepContext(1, createMockSnapshot({ id: '1' }), createMockSnapshot({ id: '0', toTime: 0 }), character, createMockAction('Action'), createMockEnemy(), [], { TestChar: character })

      resolveDamageModifiers(context)

      expect(context.aggregatedCharacterModifiers.bonusATK).toBe(50) // 100 * 0.5
    })

    it('should pass full context to condition function', () => {
      let capturedContext: any = null
      const character = createMockCharacter('TestChar', {
        damageModifiers: [
          {
            source: 'contextCheck',
            characterStats: { bonusATK: 100 },
            condition: ctx => {
              capturedContext = ctx
              return 1
            },
          },
        ],
      })

      const context = buildStepContext(1, createMockSnapshot({ id: '1' }), createMockSnapshot({ id: '0', toTime: 0 }), character, createMockAction('TestAction'), createMockEnemy(), [], { TestChar: character })

      resolveDamageModifiers(context)

      expect(capturedContext).toBeTruthy()
      expect(capturedContext.character.name).toBe('TestChar')
      expect(capturedContext.action.name).toBe('TestAction')
      expect(capturedContext.snapshotId).toBe(1)
    })
  })

  describe('Context State Management', () => {
    it('should collect all modifiers into context.damageModifiers for damage calculator', () => {
      const charMod = { source: 'passive', characterStats: { bonusATK: 50 } }
      const actionMod = { source: 'skillBonus', characterStats: { bonusATK: 30 } }
      const statusMod = { source: 'burn', enemyStats: { fusionRES: -0.1 } }

      const character = createMockCharacter('TestChar', {
        damageModifiers: [charMod],
      })
      const action = createMockAction('Action', {
        damageModifiers: [actionMod],
      })
      const burnStatus = createMockNegativeStatus('Burn', {
        element: 'FUSION',
        damageModifiers: [statusMod],
      })
      const negativeStatuses = [createMockActiveNegativeStatus(burnStatus)]

      const context = buildStepContext(1, createMockSnapshot({ id: '1' }), createMockSnapshot({ id: '0', toTime: 0 }), character, action, createMockEnemy(), negativeStatuses, { TestChar: character })

      resolveDamageModifiers(context)

      // Verify all modifiers are collected
      expect(context.damageModifiers).toHaveLength(3)
      expect(context.damageModifiers).toContainEqual(charMod)
      expect(context.damageModifiers).toContainEqual(actionMod)
      expect(context.damageModifiers).toContainEqual(statusMod)

      // Verify they're in the correct order (character -> action -> negative statuses)
      expect(context.damageModifiers[0]).toBe(charMod)
      expect(context.damageModifiers[1]).toBe(actionMod)
      expect(context.damageModifiers[2]).toBe(statusMod)
    })

    it('should write aggregated modifiers to context', () => {
      const character = createMockCharacter('TestChar', {
        damageModifiers: [{ source: 'test', characterStats: { bonusATK: 100 } }],
      })

      const context = buildStepContext(
        1,
        createMockSnapshot({ id: '1' }),
        createMockSnapshot({ id: '0', toTime: 0 }),
        character,
        createMockAction('Action', {
          damageModifiers: [{ source: 'action', enemyStats: { glacioRES: -0.1 } }],
        }),
        createMockEnemy(),
        [],
        { TestChar: character },
      )

      resolveDamageModifiers(context)

      expect(context.aggregatedCharacterModifiers).toBeDefined()
      expect(context.aggregatedEnemyModifiers).toBeDefined()
      expect(context.aggregatedCharacterModifiers.bonusATK).toBe(100)
      expect(context.aggregatedEnemyModifiers.glacioRES).toBeCloseTo(-0.1, 3)
    })

    it('should append log entry', () => {
      const context = buildStepContext(1, createMockSnapshot({ id: '1' }), createMockSnapshot({ id: '0', toTime: 0 }), createMockCharacter('TestChar'), createMockAction('Action'), createMockEnemy(), [], { TestChar: createMockCharacter('TestChar') })

      const initialLogCount = context.logs.length
      resolveDamageModifiers(context)

      expect(context.logs.length).toBe(initialLogCount + 1)
      expect(context.logs[context.logs.length - 1].resolver).toBe('resolveDamageModifiers')
    })

    it('should not mutate any snapshots', () => {
      const current = createMockSnapshot({ id: '1', damage: 100 })
      const prev = createMockSnapshot({ id: '0', toTime: 5, damage: 50 })
      const currentSnapshot = JSON.parse(JSON.stringify(current))
      const prevSnapshot = JSON.parse(JSON.stringify(prev))

      const context = buildStepContext(
        1,
        current,
        prev,
        createMockCharacter('TestChar', {
          damageModifiers: [{ source: 'test', characterStats: { bonusATK: 100 } }],
        }),
        createMockAction('Action'),
        createMockEnemy(),
        [],
        { TestChar: createMockCharacter('TestChar') },
      )

      resolveDamageModifiers(context)

      // Only action should have changed in current from buildStepContext
      currentSnapshot.action = current.action
      expect(current).toEqual(currentSnapshot)
      expect(prev).toEqual(prevSnapshot)
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty modifier arrays gracefully', () => {
      const character = createMockCharacter('TestChar', { damageModifiers: [] })
      const action = createMockAction('Action', { damageModifiers: [] })

      const context = buildStepContext(1, createMockSnapshot({ id: '1' }), createMockSnapshot({ id: '0', toTime: 0 }), character, action, createMockEnemy(), [], { TestChar: character })

      resolveDamageModifiers(context)

      // Should initialize all stats with defaults (0 for additive, 1 for multiplicative)
      expect(context.aggregatedCharacterModifiers.bonusATK).toBe(0)
      expect(context.aggregatedCharacterModifiers.totalMultiplierATK).toBe(1)
      expect(context.damageModifiers).toEqual([])
    })

    it('should handle undefined modifier arrays', () => {
      const character = createMockCharacter('TestChar', { damageModifiers: undefined })
      const action = createMockAction('Action', { damageModifiers: undefined })

      const context = buildStepContext(1, createMockSnapshot({ id: '1' }), createMockSnapshot({ id: '0', toTime: 0 }), character, action, createMockEnemy(), [], { TestChar: character })

      resolveDamageModifiers(context)

      expect(context.aggregatedCharacterModifiers.bonusATK).toBe(0)
      expect(context.aggregatedCharacterModifiers.totalMultiplierATK).toBe(1)
    })

    it('should handle modifiers with only characterStats', () => {
      const character = createMockCharacter('TestChar', {
        damageModifiers: [{ source: 'charOnly', characterStats: { bonusATK: 100 } }],
      })

      const context = buildStepContext(1, createMockSnapshot({ id: '1' }), createMockSnapshot({ id: '0', toTime: 0 }), character, createMockAction('Action'), createMockEnemy(), [], { TestChar: character })

      resolveDamageModifiers(context)

      expect(context.aggregatedCharacterModifiers.bonusATK).toBe(100)
      expect(context.aggregatedEnemyModifiers.damageReduction).toBe(0)
    })

    it('should handle modifiers with only enemyStats', () => {
      const character = createMockCharacter('TestChar', {
        damageModifiers: [{ source: 'enemyOnly', enemyStats: { glacioRES: -0.2 } }],
      })

      const context = buildStepContext(1, createMockSnapshot({ id: '1' }), createMockSnapshot({ id: '0', toTime: 0 }), character, createMockAction('Action'), createMockEnemy(), [], { TestChar: character })

      resolveDamageModifiers(context)

      expect(context.aggregatedCharacterModifiers.bonusATK).toBe(0)
      expect(context.aggregatedEnemyModifiers.glacioRES).toBeCloseTo(-0.2, 3)
    })

    it('should handle negative values in additive stats', () => {
      const character = createMockCharacter('TestChar', {
        damageModifiers: [
          { source: 'buff', characterStats: { bonusATK: 100 } },
          { source: 'debuff', characterStats: { bonusATK: -50 } },
        ],
      })

      const context = buildStepContext(1, createMockSnapshot({ id: '1' }), createMockSnapshot({ id: '0', toTime: 0 }), character, createMockAction('Action'), createMockEnemy(), [], { TestChar: character })

      resolveDamageModifiers(context)

      expect(context.aggregatedCharacterModifiers.bonusATK).toBe(50) // 100 + (-50)
    })

    it('should handle multipliers less than 1 (reduction effects)', () => {
      const character = createMockCharacter('TestChar', {
        damageModifiers: [
          { source: 'buff', characterStats: { totalMultiplierATK: 1.5 } },
          { source: 'debuff', characterStats: { totalMultiplierATK: 0.8 } }, // 20% reduction
        ],
      })

      const context = buildStepContext(1, createMockSnapshot({ id: '1' }), createMockSnapshot({ id: '0', toTime: 0 }), character, createMockAction('Action'), createMockEnemy(), [], { TestChar: character })

      resolveDamageModifiers(context)

      expect(context.aggregatedCharacterModifiers.totalMultiplierATK).toBeCloseTo(1.2, 3) // 1.5 * 0.8
    })
  })
})

// ========== Helper: aggregateStat ============================================================================================

describe('aggregateStat', () => {
  describe('Additive Stats', () => {
    it('should add values for non-multiplier stats', () => {
      expect(aggregateStat(undefined, 100, 'bonusATK')).toBe(100)
      expect(aggregateStat(100, 50, 'bonusATK')).toBe(150)
      expect(aggregateStat(150, 30, 'flatHP')).toBe(180)
    })

    it('should initialize undefined additive stats to 0', () => {
      expect(aggregateStat(undefined, 50, 'critRate')).toBe(50)
      expect(aggregateStat(undefined, 0.2, 'amplifyDMG')).toBe(0.2)
    })

    it('should handle negative values correctly', () => {
      expect(aggregateStat(100, -50, 'bonusATK')).toBe(50)
      expect(aggregateStat(0, -0.15, 'glacioRES')).toBe(-0.15)
    })

    it('should treat all non-totalMultiplier stats as additive', () => {
      const additiveStats = ['baseATK', 'flatATK', 'bonusATK', 'amplifyATK', 'baseHP', 'flatHP', 'bonusHP', 'amplifyHP', 'baseDEF', 'flatDEF', 'bonusDEF', 'amplifyDEF', 'critRate', 'critDamage', 'bonusDMG', 'amplifyDMG', 'defIgnore', 'elementalResPEN', 'resistancePEN', 'energyPercent', 'basicBonusDMG', 'heavyBonusDMG', 'skillBonusDMG', 'spectroBonusDMG', 'fusionBonusDMG', 'aeroErosionBonusDMG', 'spectroFrazzleBonusDMG', 'aeroRES', 'spectroRES', 'havocRES', 'glacioRES', 'fusionRES', 'electroRES', 'resistance', 'level']

      additiveStats.forEach(stat => {
        expect(aggregateStat(100, 50, stat)).toBe(150)
      })
    })
  })

  describe('Multiplicative Stats', () => {
    it('should multiply values for totalMultiplier stats', () => {
      expect(aggregateStat(undefined, 1.2, 'totalMultiplierATK')).toBe(1.2)
      expect(aggregateStat(1.2, 1.15, 'totalMultiplierATK')).toBeCloseTo(1.38, 5)
      expect(aggregateStat(1.38, 1.1, 'totalMultiplierATK')).toBeCloseTo(1.518, 5)
    })

    it('should initialize undefined totalMultiplier stats to 1', () => {
      expect(aggregateStat(undefined, 1.5, 'totalMultiplierHP')).toBe(1.5)
      expect(aggregateStat(undefined, 1.0, 'totalMultiplierDMG')).toBe(1.0)
    })

    it('should handle multipliers less than 1 (reductions)', () => {
      expect(aggregateStat(1.5, 0.8, 'totalMultiplierATK')).toBeCloseTo(1.2, 5)
      expect(aggregateStat(1.0, 0.5, 'totalMultiplierDEF')).toBe(0.5)
    })

    it('should treat all totalMultiplier* stats as multiplicative', () => {
      const multiplicativeStats = ['totalMultiplierATK', 'totalMultiplierHP', 'totalMultiplierDEF', 'totalMultiplierDMG', 'basicTotalMultiplierDMG', 'heavyTotalMultiplierDMG', 'skillTotalMultiplierDMG', 'liberationTotalMultiplierDMG', 'coordinatedTotalMultiplierDMG', 'echoTotalMultiplierDMG', 'introTotalMultiplierDMG', 'outroTotalMultiplierDMG', 'aeroErosionTotalMultiplierDMG', 'spectroFrazzleTotalMultiplierDMG', 'havocBaneTotalMultiplierDMG', 'glacioChafeToTotalMultiplierDMG', 'fusionBurstTotalMultiplierDMG', 'electroFlareTotalMultiplierDMG', 'spectroTotalMultiplierDMG', 'fusionTotalMultiplierDMG', 'aeroTotalMultiplierDMG', 'glacioTotalMultiplierDMG', 'electroTotalMultiplierDMG', 'havocTotalMultiplierDMG']

      multiplicativeStats.forEach(stat => {
        expect(aggregateStat(1.2, 1.5, stat)).toBeCloseTo(1.8, 5)
      })
    })
  })

  describe('Case Insensitivity', () => {
    it('should handle different casings of totalMultiplier', () => {
      expect(aggregateStat(1.5, 2.0, 'TOTALMULTIPLIERATK')).toBe(3.0)
      expect(aggregateStat(1.5, 2.0, 'TotalMultiplierATK')).toBe(3.0)
      expect(aggregateStat(1.5, 2.0, 'totalmultiplieratk')).toBe(3.0)
    })

    it('should handle mixed case for additive stats', () => {
      expect(aggregateStat(100, 50, 'BONUSATK')).toBe(150)
      expect(aggregateStat(100, 50, 'BonusATK')).toBe(150)
    })
  })

  describe('damageReduction (Reverse Multiplicative)', () => {
    it('should use reverse multiplicative formula: 1 - (1-a) * (1-b)', () => {
      expect(aggregateStat(0.5, 0.5, 'damageReduction')).toBeCloseTo(0.75, 5)
      expect(aggregateStat(0.5, 0.4, 'damageReduction')).toBeCloseTo(0.7, 5)
      expect(aggregateStat(undefined, 0.3, 'damageReduction')).toBeCloseTo(0.3, 5)
      expect(aggregateStat(0.3, 0.25, 'damageReduction')).toBeCloseTo(0.475, 5)
    })

    it('should handle zero as identity (leave value unchanged)', () => {
      expect(aggregateStat(0.5, 0, 'damageReduction')).toBeCloseTo(0.5, 5)
      expect(aggregateStat(0.3, 0, 'damageReduction')).toBeCloseTo(0.3, 5)
      expect(aggregateStat(0, 0.4, 'damageReduction')).toBeCloseTo(0.4, 5)
      expect(aggregateStat(0, 0, 'damageReduction')).toBeCloseTo(0, 5)
      expect(aggregateStat(0, 0.33, 'damageReduction')).toBeCloseTo(0.33, 5)
      expect(aggregateStat(undefined, 0, 'damageReduction')).toBeCloseTo(0, 5)
    })

    it('should handle negative values (damage amplification)', () => {
      expect(aggregateStat(0.3, -0.2, 'damageReduction')).toBeCloseTo(0.16, 5)
      expect(aggregateStat(-0.2, -0.2, 'damageReduction')).toBeCloseTo(-0.44, 5)
      expect(aggregateStat(0.5, -1, 'damageReduction')).toBeCloseTo(0, 5)
    })
  })
})
