import { buildStepContext, resolveTime, aggregateStat } from '../src/utils/hooks/resolvers'
import type { StepContext } from '../src/types/stepContext'
import {
  createMockSnapshot,
  createMockCharacter,
  createMockAction,
  createMockEnemy,
  createMockNegativeStatus,
  createMockActiveNegativeStatus,
} from './testUtils'

// ========== Resolver 0: Build StepContext ====================================================================================

/**
 * This resolver creates a step context object and initializes its properties.
 */
describe('buildStepContext', () => {
  describe('Context Initialization', () => {
    it('should initialize context with all required references and calculated times', () => {
      // Arrange
      const snapshotId = 5
      const current = createMockSnapshot({ id: '5' })
      const prev = createMockSnapshot({ id: '4', toTime: 10 })
      const character = createMockCharacter('TestChar')
      const action = createMockAction('BasicAttack', { castTime: 2.5 })
      const enemy = createMockEnemy()
      const negativeStatuses = []
      const characterMap = { TestChar: character }

      // Act
      const context = buildStepContext(
        snapshotId,
        current,
        prev,
        character,
        action,
        enemy,
        negativeStatuses,
        characterMap
      );

      // Assert - context holds references (not copies)
      expect(context.snapshotId).toBe(snapshotId)
      expect(context.current).toBe(current)
      expect(context.prev).toBe(prev)
      expect(context.character).toBe(character)
      expect(context.enemy).toBe(enemy)
      expect(context.action).toBe(action)
      expect(context.negativeStatusesInAction).toBe(negativeStatuses)
      
      // Context times are calculated: prev.toTime + action.castTime
      expect(context.fromTime).toBe(10)
      expect(context.toTime).toBe(12.5)
      
      // Modifiers initialized empty
      expect(context.aggregatedCharacterModifiers).toBeDefined()
      expect(context.aggregatedEnemyModifiers).toBeDefined()
      expect(context.damageModifiers).toBeDefined()
      expect(context.damageModifiers).toEqual([])
      
      // Logs initialized with entry
      expect(context.logs.length).toBeGreaterThan(0)
      expect(context.logs[0].resolver).toBe('buildStepContext')
    })

    it('should calculate context times correctly for various cast times', () => {
      const testCases = [
        { prevToTime: 0, castTime: 1.5, expectedFrom: 0, expectedTo: 1.5 },
        { prevToTime: 10.5, castTime: 2.25, expectedFrom: 10.5, expectedTo: 12.75 },
        { prevToTime: 5, castTime: 0, expectedFrom: 5, expectedTo: 5 },
      ]

      testCases.forEach(({ prevToTime, castTime, expectedFrom, expectedTo }) => {
        const prev = createMockSnapshot({ id: '0', toTime: prevToTime })
        const current = createMockSnapshot({ id: '1' })
        const character = createMockCharacter('TestChar')
        const action = createMockAction('Action', { castTime })
        const characterMap = { TestChar: character }

        const context = buildStepContext(
          1,
          current,
          prev,
          character,
          action,
          createMockEnemy(),
          [],
          characterMap
        )

        expect(context.fromTime).toBe(expectedFrom)
        expect(context.toTime).toBe(expectedTo)
      })
    })
  })

  describe('Allies Filtering', () => {
    it('should exclude current character and include all others from character map', () => {
      const current = createMockSnapshot({ id: '1' })
      const prev = createMockSnapshot({ id: '0', toTime: 0 })
      const character = createMockCharacter('MainChar')
      const ally1 = createMockCharacter('Ally1')
      const ally2 = createMockCharacter('Ally2')
      const characterMap = { MainChar: character, Ally1: ally1, Ally2: ally2 }

      const context = buildStepContext(
        1,
        current,
        prev,
        character,
        createMockAction('BasicAttack'),
        createMockEnemy(),
        [],
        characterMap
      )

      expect(context.allies).toHaveLength(2)
      expect(context.allies).toContain(ally1)
      expect(context.allies).toContain(ally2)
      expect(context.allies).not.toContain(character)
    })

    it('should handle edge cases: solo character and empty map', () => {
      const solo = createMockCharacter('Solo')
      const ctx1 = buildStepContext(
        1,
        createMockSnapshot({ id: '1' }),
        createMockSnapshot({ id: '0', toTime: 0 }),
        solo,
        createMockAction('Action'),
        createMockEnemy(),
        [],
        { Solo: solo }
      )
      expect(ctx1.allies).toEqual([])

      // Empty map
      const ctx2 = buildStepContext(
        1,
        createMockSnapshot({ id: '1' }),
        createMockSnapshot({ id: '0', toTime: 0 }),
        solo,
        createMockAction('Action'),
        createMockEnemy(),
        [],
        {}
      )
      expect(ctx2.allies).toEqual([])
    })
  })

  describe('Snapshot Mutation Contract', () => {
    it('should ONLY mutate current.action, leaving all other snapshot fields untouched', () => {
      // Arrange - snapshot with various pre-existing values
      const current = createMockSnapshot({
        id: '5',
        action: 'OldAction',
        fromTime: 999,
        toTime: 888,
        damage: 1234,
        dps: 567,
        charactersEnergies: { concerto: 50 },
        buffs: { testBuff: 10 },
        debuffs: { testDebuff: 5 },
        negativeStatuses: { burn: 3 },
      })
      const prev = createMockSnapshot({ id: '4', toTime: 10 })
      const character = createMockCharacter('TestChar')
      const action = createMockAction('NewAction', { castTime: 2.0 })
      const characterMap = { TestChar: character }

      // Act
      buildStepContext(5, current, prev, character, action, createMockEnemy(), [], characterMap)

      // Assert - ONLY action changes
      expect(current.action).toBe('NewAction')
      expect(current.fromTime).toBe(999)
      expect(current.toTime).toBe(888)
      expect(current.damage).toBe(1234)
      expect(current.dps).toBe(567)
      expect(current.charactersEnergies).toEqual({ concerto: 50 })
      expect(current.buffs).toEqual({ testBuff: 10 })
      expect(current.debuffs).toEqual({ testDebuff: 5 })
      expect(current.negativeStatuses).toEqual({ burn: 3 })
    })

    it('should never mutate previous snapshot', () => {
      const prev = createMockSnapshot({
        id: '4',
        toTime: 10,
        damage: 500,;
        action: 'PrevAction',
      })
      const prevSnapshot = JSON.parse(JSON.stringify(prev))

      buildStepContext(
        5,
        createMockSnapshot({ id: '5' }),
        prev,
        createMockCharacter('Char'),
        createMockAction('Action'),
        createMockEnemy(),
        [],
        { Char: createMockCharacter('Char') }
      );

      expect(prev).toEqual(prevSnapshot)
    })
  })
})

// ========== Resolver 1: Resolve Time =========================================================================================

describe('resolveTime', () => {
  describe('Snapshot Time Resolution', () => {
    it('should write calculated times to snapshot from prev.toTime and action.castTime', () => {
      const testCases = [
        { prevToTime: 10, castTime: 2.5, expectedFrom: 10, expectedTo: 12.5 },
        { prevToTime: 0, castTime: 1.5, expectedFrom: 0, expectedTo: 1.5 },
        { prevToTime: 5.125, castTime: 0.375, expectedFrom: 5.125, expectedTo: 5.5 },
        { prevToTime: 10, castTime: 0, expectedFrom: 10, expectedTo: 10 },
      ]

      testCases.forEach(({ prevToTime, castTime, expectedFrom, expectedTo }) => {
        const prev = createMockSnapshot({ id: '0', toTime: prevToTime })
        const current = createMockSnapshot({ id: '1' })
        const character = createMockCharacter('Char')
        const action = createMockAction('Action', { castTime })
        const characterMap = { Char: character }

        const context = buildStepContext(1, current, prev, character, action, createMockEnemy(), [], characterMap);
        resolveTime(context)

        expect(current.fromTime).toBe(expectedFrom)
        expect(current.toTime).toBe(expectedTo)
      })
    })

    it('should recalculate times from source data, not trust existing snapshot values', () => {
      // Arrange - snapshot has wrong pre-existing values
      const prev = createMockSnapshot({ id: '4', toTime: 10.0 })
      const current = createMockSnapshot({ id: '5', fromTime: 999, toTime: 888 })
      const character = createMockCharacter('Char')
      const action = createMockAction('Action', { castTime: 2.0 })
      const characterMap = { Char: character }

      const context = buildStepContext(5, current, prev, character, action, createMockEnemy(), [], characterMap)

      // Act
      resolveTime(context)

      // Assert - wrong values overwritten with correct calculation
      expect(current.fromTime).toBe(10.0)
      expect(current.toTime).toBe(12.0)
    })
  })

  describe('Snapshot Mutation Contract', () => {
    it('should ONLY mutate fromTime and toTime, leaving all other snapshot fields untouched', () => {
      // Arrange
      const prev = createMockSnapshot({ id: '4', toTime: 10.0 })
      const current = createMockSnapshot({
        id: '5',
        fromTime: 0,
        toTime: 0,
        damage: 500,
        dps: 25,
        charactersEnergies: { concerto: 80 },
        buffs: { buff1: 5 },
        debuffs: { debuff1: 3 },
        negativeStatuses: { burn: 2 },
      })
      const character = createMockCharacter('Char')
      const action = createMockAction('Action', { castTime: 2.5 })
      const characterMap = { Char: character }

      const context = buildStepContext(5, current, prev, character, action, createMockEnemy(), [], characterMap)

      // Act
      resolveTime(context)

      // Assert - ONLY time fields change
      expect(current.fromTime).toBe(10.0)
      expect(current.toTime).toBe(12.5)
      expect(current.damage).toBe(500)
      expect(current.dps).toBe(25)
      expect(current.charactersEnergies).toEqual({ concerto: 80 })
      expect(current.buffs).toEqual({ buff1: 5 })
      expect(current.debuffs).toEqual({ debuff1: 3 })
      expect(current.negativeStatuses).toEqual({ burn: 2 })
    })

    it('should never mutate previous snapshot', () => {
      const prev = createMockSnapshot({
        id: '4',
        toTime: 10.0,
        fromTime: 8.0,
        damage: 1000,
      })
      const prevSnapshot = JSON.parse(JSON.stringify(prev))

      const context = buildStepContext(
        5,
        createMockSnapshot({ id: '5' }),
        prev,
        createMockCharacter('Char'),
        createMockAction('Action', { castTime: 1.5 }),
        createMockEnemy(),
        [],
        { Char: createMockCharacter('Char') }
      )

      resolveTime(context)

      expect(prev).toEqual(prevSnapshot)
    })
  })

  describe('Context Behavior', () => {
    it('should append log entry without mutating context time values', () => {
      const prev = createMockSnapshot({ id: '4', toTime: 10 })
      const current = createMockSnapshot({ id: '5' })
      const character = createMockCharacter('Char')
      const action = createMockAction('Action', { castTime: 2.0 })
      const characterMap = { Char: character }

      const context = buildStepContext(5, current, prev, character, action, createMockEnemy(), [], characterMap);

      const initialLogCount = context.logs.length
      const contextFromBefore = context.fromTime
      const contextToBefore = context.toTime

      resolveTime(context)

      // Log appended
      expect(context.logs.length).toBe(initialLogCount + 1)
      expect(context.logs[context.logs.length - 1].resolver).toBe('resolveTime')

      // Context times unchanged
      expect(context.fromTime).toBe(contextFromBefore)
      expect(context.toTime).toBe(contextToBefore)
    })
  })

  describe('Validation', () => {
    it('should throw when context is invalid', () => {
        const prev = createMockSnapshot({ id: '4', toTime: 10 });
        const current = createMockSnapshot({ id: '5' });
        const character = createMockCharacter('Char');
        const action = createMockAction('Action');

        const validationCases: Array<{
        label: string;
        modify: (ctx: StepContext) => void;
        }> = [
        {
            label: 'null fromTime',
            modify: (ctx) => {
            (ctx as any).fromTime = null;
            },
        },
        {
            label: 'null toTime',
            modify: (ctx) => {
            (ctx as any).toTime = null;
            },
        },
        {
            label: 'fromTime > toTime',
            modify: (ctx) => {
            ctx.fromTime = 15;
            ctx.toTime = 10;
            },
        },
        {
            label: 'snapshotId mismatch',
            modify: (ctx) => {
            ctx.snapshotId = 999;
            },
        },
        ];

        validationCases.forEach(({ label, modify }) => {
        const context: StepContext = {
            snapshotId: 5,
            current,
            prev,
            character,
            allies: [],
            enemy: createMockEnemy(),
            action,
            fromTime: 10,
            toTime: 12,
            negativeStatusesInAction: [],
            logs: [],
        };

        modify(context)

        expect(() => resolveTime(context)).toThrow();
        });
    });
    });
});

// ========== Resolver 2: Damage Modifiers =====================================================================================

/**
 * This resolver findes existing damage modifiers sources: character, action, negative statuses and adds up the stats.
 */
describe('resolveDamageModifiers', () => {
  const { resolveDamageModifiers } = require('../src/utils/hooks/resolvers');

  describe('Modifier Source Collection', () => {
    it('should collect and aggregate from all sources (character + action + negative statuses)', () => {
      const character = createMockCharacter('TestChar', {
        damageModifiers: [{ source: 'character', characterStats: { bonusATK: 100 } }],
      });
      const action = createMockAction('Action', {
        damageModifiers: [{ source: 'action', characterStats: { bonusATK: 50 } }],
      });
      const burnStatus = createMockNegativeStatus('Burn', {
        element: 'FUSION',
        damageModifiers: [{ source: 'negStatus', characterStats: { bonusATK: 25 } }],
      });
      const negativeStatuses = [createMockActiveNegativeStatus(burnStatus)];

      const context = buildStepContext(
        1,
        createMockSnapshot({ id: '1' }),
        createMockSnapshot({ id: '0', toTime: 0 }),
        character,
        action,
        createMockEnemy(),
        negativeStatuses,
        { TestChar: character }
      );

      resolveDamageModifiers(context);

      expect(context.aggregatedCharacterModifiers.bonusATK).toBe(175); // 100 + 50 + 25
      expect(context.damageModifiers).toHaveLength(3);
      expect(context.damageModifiers[0].source).toBe('character');
      expect(context.damageModifiers[1].source).toBe('action');
      expect(context.damageModifiers[2].source).toBe('negStatus');
    });

    it('should handle multiple modifiers from same source', () => {
      const character = createMockCharacter('TestChar', {
        damageModifiers: [
          { source: 'passive1', characterStats: { bonusATK: 100 } },
          { source: 'passive2', characterStats: { bonusATK: 50 } },
          { source: 'passive3', characterStats: { bonusATK: 30 } },
        ],
      });

      const context = buildStepContext(
        1,
        createMockSnapshot({ id: '1' }),
        createMockSnapshot({ id: '0', toTime: 0 }),
        character,
        createMockAction('Action'),
        createMockEnemy(),
        [],
        { TestChar: character }
      );

      resolveDamageModifiers(context);

      expect(context.aggregatedCharacterModifiers.bonusATK).toBe(180); // 100 + 50 + 30
    });

    it('should handle multiple negative statuses with modifiers', () => {
      const status1 = createMockNegativeStatus('Status1', {
        element: 'FUSION',
        duration: 10,
        damageModifiers: [{ source: 'status1', characterStats: { bonusATK: 30 } }],
      });
      const status2 = createMockNegativeStatus('Status2', {
        element: 'GLACIO',
        duration: 5,
        damageModifiers: [{ source: 'status2', characterStats: { bonusATK: 20 } }],
      });
      const negativeStatuses = [
        createMockActiveNegativeStatus(status1),
        createMockActiveNegativeStatus(status2),
      ];

      const context = buildStepContext(
        1,
        createMockSnapshot({ id: '1' }),
        createMockSnapshot({ id: '0', toTime: 0 }),
        createMockCharacter('TestChar'),
        createMockAction('Action'),
        createMockEnemy(),
        negativeStatuses,
        { TestChar: createMockCharacter('TestChar') }
      );

      resolveDamageModifiers(context);

      expect(context.aggregatedCharacterModifiers.bonusATK).toBe(50); // 30 + 20
    });

    it('should aggregate both character and enemy stats from same modifier', () => {
      const character = createMockCharacter('TestChar', {
        damageModifiers: [
          {
            source: 'mixed',
            characterStats: { bonusATK: 100 },
            enemyStats: { glacioRES: -0.20 }
          }
        ],
      });

      const context = buildStepContext(
        1,
        createMockSnapshot({ id: '1' }),
        createMockSnapshot({ id: '0', toTime: 0 }),
        character,
        createMockAction('Action'),
        createMockEnemy(),
        [],
        { TestChar: character }
      );

      resolveDamageModifiers(context);

      expect(context.aggregatedCharacterModifiers.bonusATK).toBe(100);
      expect(context.aggregatedEnemyModifiers.glacioRES).toBeCloseTo(-0.20, 3);
    });
  });

  describe('Stat Type Aggregation', () => {
    it('should correctly aggregate additive stats', () => {
      const character = createMockCharacter('TestChar', {
        damageModifiers: [
          { source: 'mod1', characterStats: { bonusATK: 100, critRate: 0.20, energyPercent: 1.5 } },
          { source: 'mod2', characterStats: { bonusATK: 50, critRate: 0.15, energyPercent: 0.3 } },
        ],
      });

      const context = buildStepContext(
        1,
        createMockSnapshot({ id: '1' }),
        createMockSnapshot({ id: '0', toTime: 0 }),
        character,
        createMockAction('Action'),
        createMockEnemy(),
        [],
        { TestChar: character }
      );

      resolveDamageModifiers(context);

      expect(context.aggregatedCharacterModifiers.bonusATK).toBe(150);
      expect(context.aggregatedCharacterModifiers.critRate).toBeCloseTo(0.35, 3);
      expect(context.aggregatedCharacterModifiers.energyPercent).toBeCloseTo(1.8, 3);
    });

    it('should correctly aggregate multiplicative stats', () => {
      const character = createMockCharacter('TestChar', {
        damageModifiers: [
          { source: 'mod1', characterStats: { totalMultiplierATK: 1.2, totalMultiplierDMG: 1.15 } },
          { source: 'mod2', characterStats: { totalMultiplierATK: 1.1, totalMultiplierDMG: 1.10 } },
        ],
      });

      const context = buildStepContext(
        1,
        createMockSnapshot({ id: '1' }),
        createMockSnapshot({ id: '0', toTime: 0 }),
        character,
        createMockAction('Action'),
        createMockEnemy(),
        [],
        { TestChar: character }
      );

      resolveDamageModifiers(context);

      expect(context.aggregatedCharacterModifiers.totalMultiplierATK).toBeCloseTo(1.32, 3);
      expect(context.aggregatedCharacterModifiers.totalMultiplierDMG).toBeCloseTo(1.265, 3);
    });

    it('should handle additive and multiplicative stats independently', () => {
      const character = createMockCharacter('TestChar', {
        damageModifiers: [
          {
            source: 'mixed',
            characterStats: {
              bonusATK: 100,
              totalMultiplierATK: 1.2,
              critRate: 0.20,
              totalMultiplierDMG: 1.15,
            },
          },
          {
            source: 'mixed2',
            characterStats: {
              bonusATK: 50,
              totalMultiplierATK: 1.1,
              critRate: 0.10,
              totalMultiplierDMG: 1.10,
            },
          },
        ],
      });

      const context = buildStepContext(
        1,
        createMockSnapshot({ id: '1' }),
        createMockSnapshot({ id: '0', toTime: 0 }),
        character,
        createMockAction('Action'),
        createMockEnemy(),
        [],
        { TestChar: character }
      );

      resolveDamageModifiers(context);

      // Additive
      expect(context.aggregatedCharacterModifiers.bonusATK).toBe(150);
      expect(context.aggregatedCharacterModifiers.critRate).toBeCloseTo(0.30, 3);
      
      // Multiplicative
      expect(context.aggregatedCharacterModifiers.totalMultiplierATK).toBeCloseTo(1.32, 3);
      expect(context.aggregatedCharacterModifiers.totalMultiplierDMG).toBeCloseTo(1.265, 3);
    });

    it('should initialize totalMultiplier stats to 1 and others to 0', () => {
      const character = createMockCharacter('TestChar');
      const action = createMockAction('Action');

      const context = buildStepContext(
        1,
        createMockSnapshot({ id: '1' }),
        createMockSnapshot({ id: '0', toTime: 0 }),
        character,
        action,
        createMockEnemy(),
        [],
        { TestChar: character }
      );

      resolveDamageModifiers(context);

      // All totalMultipliers should start at 1
      expect(context.aggregatedCharacterModifiers.totalMultiplierATK).toBe(1);
      expect(context.aggregatedCharacterModifiers.totalMultiplierHP).toBe(1);
      expect(context.aggregatedCharacterModifiers.totalMultiplierDEF).toBe(1);
      expect(context.aggregatedCharacterModifiers.totalMultiplierDMG).toBe(1);
      expect(context.aggregatedCharacterModifiers.basicTotalMultiplierDMG).toBe(1);

      // All additive stats should start at 0
      expect(context.aggregatedCharacterModifiers.flatATK).toBe(0);
      expect(context.aggregatedCharacterModifiers.bonusATK).toBe(0);
      expect(context.aggregatedCharacterModifiers.critRate).toBe(0);
      expect(context.aggregatedCharacterModifiers.energyPercent).toBe(0);
    });
  });

  describe('Enemy Stat Aggregation', () => {
    it('should aggregate enemy resistance stats (additive)', () => {
      const character = createMockCharacter('TestChar', {
        damageModifiers: [{ source: 'weapon', enemyStats: { glacioRES: -0.20 } }],
      });
      const action = createMockAction('Action', {
        damageModifiers: [{ source: 'action', enemyStats: { glacioRES: -0.15 } }],
      });

      const context = buildStepContext(
        1,
        createMockSnapshot({ id: '1' }),
        createMockSnapshot({ id: '0', toTime: 0 }),
        character,
        action,
        createMockEnemy(),
        [],
        { TestChar: character }
      );

      resolveDamageModifiers(context);

      expect(context.aggregatedEnemyModifiers.glacioRES).toBeCloseTo(-0.35, 3); // -0.20 + -0.15
    });

    it('should use reverse multiplicative formula for damageReduction: 1 - (1-a) * (1-b)', () => {
      const character = createMockCharacter('TestChar', {
        damageModifiers: [{ source: 'buff1', enemyStats: { damageReduction: 0.5 } }],
      });
      const action = createMockAction('Action', {
        damageModifiers: [{ source: 'buff2', enemyStats: { damageReduction: 0.5 } }],
      });

      const context = buildStepContext(
        1,
        createMockSnapshot({ id: '1' }),
        createMockSnapshot({ id: '0', toTime: 0 }),
        character,
        action,
        createMockEnemy(),
        [],
        { TestChar: character }
      );

      resolveDamageModifiers(context);

      // Two 50% reductions should result in 75% total reduction
      // Formula: 1 - (1-0.5) * (1-0.5) = 1 - 0.25 = 0.75
      expect(context.aggregatedEnemyModifiers.damageReduction).toBeCloseTo(0.75, 3);
    });

    it('should handle zero damageReduction as identity (leave unchanged)', () => {
      const character = createMockCharacter('TestChar', {
        damageModifiers: [{ source: 'buff1', enemyStats: { damageReduction: 0.3 } }],
      });
      const action = createMockAction('Action', {
        damageModifiers: [{ source: 'buff2', enemyStats: { damageReduction: 0 } }],
      });

      const context = buildStepContext(
        1,
        createMockSnapshot({ id: '1' }),
        createMockSnapshot({ id: '0', toTime: 0 }),
        character,
        action,
        createMockEnemy(),
        [],
        { TestChar: character }
      );

      resolveDamageModifiers(context);

      // Adding 0 should leave the value unchanged at 0.3
      expect(context.aggregatedEnemyModifiers.damageReduction).toBeCloseTo(0.3, 3);
    });

    it('should handle negative damageReduction (damage amplification)', () => {
      const character = createMockCharacter('TestChar', {
        damageModifiers: [{ source: 'buff1', enemyStats: { damageReduction: 0.3 } }],
      });
      const action = createMockAction('Action', {
        damageModifiers: [{ source: 'debuff', enemyStats: { damageReduction: -0.2 } }],
      });

      const context = buildStepContext(
        1,
        createMockSnapshot({ id: '1' }),
        createMockSnapshot({ id: '0', toTime: 0 }),
        character,
        action,
        createMockEnemy(),
        [],
        { TestChar: character }
      );

      resolveDamageModifiers(context);

      // 30% reduction + 20% amplification
      // 1 - (1-0.3) * (1-(-0.2)) = 1 - 0.7 * 1.2 = 0.16 (16% reduction)
      expect(context.aggregatedEnemyModifiers.damageReduction).toBeCloseTo(0.16, 3);
    });

    it('should initialize all enemy stats to 0', () => {
      const context = buildStepContext(
        1,
        createMockSnapshot({ id: '1' }),
        createMockSnapshot({ id: '0', toTime: 0 }),
        createMockCharacter('TestChar'),
        createMockAction('Action'),
        createMockEnemy(),
        [],
        { TestChar: createMockCharacter('TestChar') }
      );

      resolveDamageModifiers(context);

      expect(context.aggregatedEnemyModifiers.level).toBe(0);
      expect(context.aggregatedEnemyModifiers.aeroRES).toBe(0);
      expect(context.aggregatedEnemyModifiers.spectroRES).toBe(0);
      expect(context.aggregatedEnemyModifiers.havocRES).toBe(0);
      expect(context.aggregatedEnemyModifiers.glacioRES).toBe(0);
      expect(context.aggregatedEnemyModifiers.fusionRES).toBe(0);
      expect(context.aggregatedEnemyModifiers.electroRES).toBe(0);
      expect(context.aggregatedEnemyModifiers.resistance).toBe(0);
      expect(context.aggregatedEnemyModifiers.damageReduction).toBe(0);
    });
  });

  describe('Conditional Modifiers', () => {
    it('should apply condition multiplier to all stats in modifier', () => {
      const character = createMockCharacter('TestChar', {
        damageModifiers: [
          {
            source: 'conditional',
            characterStats: { bonusATK: 100, critRate: 0.20 },
            condition: (ctx) => 2, // Double the effect
          },
        ],
      });

      const context = buildStepContext(
        1,
        createMockSnapshot({ id: '1' }),
        createMockSnapshot({ id: '0', toTime: 0 }),
        character,
        createMockAction('Action'),
        createMockEnemy(),
        [],
        { TestChar: character }
      );

      resolveDamageModifiers(context);

      expect(context.aggregatedCharacterModifiers.bonusATK).toBe(200); // 100 * 2
      expect(context.aggregatedCharacterModifiers.critRate).toBeCloseTo(0.40, 3); // 0.20 * 2
    });

    it('should treat missing condition as multiplier of 1', () => {
      const character = createMockCharacter('TestChar', {
        damageModifiers: [
          { source: 'noCondition', characterStats: { bonusATK: 100 } },
          { source: 'withCondition', characterStats: { bonusATK: 50 }, condition: () => 1 },
        ],
      });

      const context = buildStepContext(
        1,
        createMockSnapshot({ id: '1' }),
        createMockSnapshot({ id: '0', toTime: 0 }),
        character,
        createMockAction('Action'),
        createMockEnemy(),
        [],
        { TestChar: character }
      );

      resolveDamageModifiers(context);

      expect(context.aggregatedCharacterModifiers.bonusATK).toBe(150); // Both effectively 1x
    });

    it('should handle condition returning 0 (disabled modifier)', () => {
      const character = createMockCharacter('TestChar', {
        damageModifiers: [
          { source: 'active', characterStats: { bonusATK: 100 } },
          { source: 'disabled', characterStats: { bonusATK: 500 }, condition: () => 0 },
        ],
      });

      const context = buildStepContext(
        1,
        createMockSnapshot({ id: '1' }),
        createMockSnapshot({ id: '0', toTime: 0 }),
        character,
        createMockAction('Action'),
        createMockEnemy(),
        [],
        { TestChar: character }
      );

      resolveDamageModifiers(context);

      expect(context.aggregatedCharacterModifiers.bonusATK).toBe(100); // 500 * 0 = 0, so only 100
    });

    it('should handle fractional condition multipliers', () => {
      const character = createMockCharacter('TestChar', {
        damageModifiers: [
          {
            source: 'partial',
            characterStats: { bonusATK: 100 },
            condition: () => 0.5,
          },
        ],
      });

      const context = buildStepContext(
        1,
        createMockSnapshot({ id: '1' }),
        createMockSnapshot({ id: '0', toTime: 0 }),
        character,
        createMockAction('Action'),
        createMockEnemy(),
        [],
        { TestChar: character }
      );

      resolveDamageModifiers(context);

      expect(context.aggregatedCharacterModifiers.bonusATK).toBe(50); // 100 * 0.5
    });

    it('should pass full context to condition function', () => {
      let capturedContext: any = null;
      const character = createMockCharacter('TestChar', {
        damageModifiers: [
          {
            source: 'contextCheck',
            characterStats: { bonusATK: 100 },
            condition: (ctx) => {
              capturedContext = ctx;
              return 1;
            },
          },
        ],
      });

      const context = buildStepContext(
        1,
        createMockSnapshot({ id: '1' }),
        createMockSnapshot({ id: '0', toTime: 0 }),
        character,
        createMockAction('TestAction'),
        createMockEnemy(),
        [],
        { TestChar: character }
      );

      resolveDamageModifiers(context);

      expect(capturedContext).toBeTruthy();
      expect(capturedContext.character.name).toBe('TestChar');
      expect(capturedContext.action.name).toBe('TestAction');
      expect(capturedContext.snapshotId).toBe(1);
    });
  });

  describe('Context State Management', () => {
    it('should collect all modifiers into context.damageModifiers for damage calculator', () => {
      const charMod = { source: 'passive', characterStats: { bonusATK: 50 } };
      const actionMod = { source: 'skillBonus', characterStats: { bonusATK: 30 } };
      const statusMod = { source: 'burn', enemyStats: { fusionRES: -0.1 } };

      const character = createMockCharacter('TestChar', {
        damageModifiers: [charMod],
      });
      const action = createMockAction('Action', {
        damageModifiers: [actionMod],
      });
      const burnStatus = createMockNegativeStatus('Burn', {
        element: 'FUSION',
        damageModifiers: [statusMod],
      });
      const negativeStatuses = [createMockActiveNegativeStatus(burnStatus)];

      const context = buildStepContext(
        1,
        createMockSnapshot({ id: '1' }),
        createMockSnapshot({ id: '0', toTime: 0 }),
        character,
        action,
        createMockEnemy(),
        negativeStatuses,
        { TestChar: character }
      );

      resolveDamageModifiers(context);

      // Verify all modifiers are collected
      expect(context.damageModifiers).toHaveLength(3);
      expect(context.damageModifiers).toContainEqual(charMod);
      expect(context.damageModifiers).toContainEqual(actionMod);
      expect(context.damageModifiers).toContainEqual(statusMod);

      // Verify they're in the correct order (character -> action -> negative statuses)
      expect(context.damageModifiers[0]).toBe(charMod);
      expect(context.damageModifiers[1]).toBe(actionMod);
      expect(context.damageModifiers[2]).toBe(statusMod);
    });

    it('should write aggregated modifiers to context', () => {
      const character = createMockCharacter('TestChar', {
        damageModifiers: [{ source: 'test', characterStats: { bonusATK: 100 } }],
      });

      const context = buildStepContext(
        1,
        createMockSnapshot({ id: '1' }),
        createMockSnapshot({ id: '0', toTime: 0 }),
        character,
        createMockAction('Action', {
          damageModifiers: [{ source: 'action', enemyStats: { glacioRES: -0.10 } }],
        }),
        createMockEnemy(),
        [],
        { TestChar: character }
      );

      resolveDamageModifiers(context);

      expect(context.aggregatedCharacterModifiers).toBeDefined();
      expect(context.aggregatedEnemyModifiers).toBeDefined();
      expect(context.aggregatedCharacterModifiers.bonusATK).toBe(100);
      expect(context.aggregatedEnemyModifiers.glacioRES).toBeCloseTo(-0.10, 3);
    });

    it('should append log entry', () => {
      const context = buildStepContext(
        1,
        createMockSnapshot({ id: '1' }),
        createMockSnapshot({ id: '0', toTime: 0 }),
        createMockCharacter('TestChar'),
        createMockAction('Action'),
        createMockEnemy(),
        [],
        { TestChar: createMockCharacter('TestChar') }
      );

      const initialLogCount = context.logs.length;
      resolveDamageModifiers(context);

      expect(context.logs.length).toBe(initialLogCount + 1);
      expect(context.logs[context.logs.length - 1].resolver).toBe('resolveDamageModifiers');
    });

    it('should not mutate any snapshots', () => {
      const current = createMockSnapshot({ id: '1', damage: 100 });
      const prev = createMockSnapshot({ id: '0', toTime: 5, damage: 50 });
      const currentSnapshot = JSON.parse(JSON.stringify(current));
      const prevSnapshot = JSON.parse(JSON.stringify(prev));

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
        { TestChar: createMockCharacter('TestChar') }
      );

      resolveDamageModifiers(context);

      // Only action should have changed in current from buildStepContext
      currentSnapshot.action = current.action;
      expect(current).toEqual(currentSnapshot);
      expect(prev).toEqual(prevSnapshot);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty modifier arrays gracefully', () => {
      const character = createMockCharacter('TestChar', { damageModifiers: [] });
      const action = createMockAction('Action', { damageModifiers: [] });

      const context = buildStepContext(
        1,
        createMockSnapshot({ id: '1' }),
        createMockSnapshot({ id: '0', toTime: 0 }),
        character,
        action,
        createMockEnemy(),
        [],
        { TestChar: character }
      );

      resolveDamageModifiers(context);

      // Should initialize all stats with defaults (0 for additive, 1 for multiplicative)
      expect(context.aggregatedCharacterModifiers.bonusATK).toBe(0);
      expect(context.aggregatedCharacterModifiers.totalMultiplierATK).toBe(1);
      expect(context.damageModifiers).toEqual([]);
    });

    it('should handle undefined modifier arrays', () => {
      const character = createMockCharacter('TestChar', { damageModifiers: undefined });
      const action = createMockAction('Action', { damageModifiers: undefined });

      const context = buildStepContext(
        1,
        createMockSnapshot({ id: '1' }),
        createMockSnapshot({ id: '0', toTime: 0 }),
        character,
        action,
        createMockEnemy(),
        [],
        { TestChar: character }
      );

      resolveDamageModifiers(context);

      expect(context.aggregatedCharacterModifiers.bonusATK).toBe(0);
      expect(context.aggregatedCharacterModifiers.totalMultiplierATK).toBe(1);
    });

    it('should handle modifiers with only characterStats', () => {
      const character = createMockCharacter('TestChar', {
        damageModifiers: [{ source: 'charOnly', characterStats: { bonusATK: 100 } }],
      });

      const context = buildStepContext(
        1,
        createMockSnapshot({ id: '1' }),
        createMockSnapshot({ id: '0', toTime: 0 }),
        character,
        createMockAction('Action'),
        createMockEnemy(),
        [],
        { TestChar: character }
      );

      resolveDamageModifiers(context);

      expect(context.aggregatedCharacterModifiers.bonusATK).toBe(100);
      expect(context.aggregatedEnemyModifiers.damageReduction).toBe(0);
    });

    it('should handle modifiers with only enemyStats', () => {
      const character = createMockCharacter('TestChar', {
        damageModifiers: [{ source: 'enemyOnly', enemyStats: { glacioRES: -0.20 } }],
      });

      const context = buildStepContext(
        1,
        createMockSnapshot({ id: '1' }),
        createMockSnapshot({ id: '0', toTime: 0 }),
        character,
        createMockAction('Action'),
        createMockEnemy(),
        [],
        { TestChar: character }
      );

      resolveDamageModifiers(context);

      expect(context.aggregatedCharacterModifiers.bonusATK).toBe(0);
      expect(context.aggregatedEnemyModifiers.glacioRES).toBeCloseTo(-0.20, 3);
    });

    it('should handle negative values in additive stats', () => {
      const character = createMockCharacter('TestChar', {
        damageModifiers: [
          { source: 'buff', characterStats: { bonusATK: 100 } },
          { source: 'debuff', characterStats: { bonusATK: -50 } },
        ],
      });

      const context = buildStepContext(
        1,
        createMockSnapshot({ id: '1' }),
        createMockSnapshot({ id: '0', toTime: 0 }),
        character,
        createMockAction('Action'),
        createMockEnemy(),
        [],
        { TestChar: character }
      );

      resolveDamageModifiers(context);

      expect(context.aggregatedCharacterModifiers.bonusATK).toBe(50); // 100 + (-50)
    });

    it('should handle multipliers less than 1 (reduction effects)', () => {
      const character = createMockCharacter('TestChar', {
        damageModifiers: [
          { source: 'buff', characterStats: { totalMultiplierATK: 1.5 } },
          { source: 'debuff', characterStats: { totalMultiplierATK: 0.8 } }, // 20% reduction
        ],
      });

      const context = buildStepContext(
        1,
        createMockSnapshot({ id: '1' }),
        createMockSnapshot({ id: '0', toTime: 0 }),
        character,
        createMockAction('Action'),
        createMockEnemy(),
        [],
        { TestChar: character }
      );

      resolveDamageModifiers(context);

      expect(context.aggregatedCharacterModifiers.totalMultiplierATK).toBeCloseTo(1.2, 3); // 1.5 * 0.8
    });
  });
});

// ========== Helpers ==========================================================================================================

const resolversModule = require('../src/utils/hooks/resolvers');

describe('aggregateStat', () => {
  describe('Additive Stats', () => {
    it('should add values for non-multiplier stats', () => {
      expect(aggregateStat(undefined, 100, 'bonusATK')).toBe(100);
      expect(aggregateStat(100, 50, 'bonusATK')).toBe(150);
      expect(aggregateStat(150, 30, 'flatHP')).toBe(180);
    });

    it('should initialize undefined additive stats to 0', () => {
      expect(aggregateStat(undefined, 50, 'critRate')).toBe(50);
      expect(aggregateStat(undefined, 0.20, 'amplifyDMG')).toBe(0.20);
    });

    it('should handle negative values correctly', () => {
      expect(aggregateStat(100, -50, 'bonusATK')).toBe(50);
      expect(aggregateStat(0, -0.15, 'glacioRES')).toBe(-0.15);
    });

    it('should treat all non-totalMultiplier stats as additive', () => {
      const additiveStats = [
        'baseATK', 'flatATK', 'bonusATK', 'amplifyATK',
        'baseHP', 'flatHP', 'bonusHP', 'amplifyHP',
        'baseDEF', 'flatDEF', 'bonusDEF', 'amplifyDEF',
        'critRate', 'critDamage',
        'bonusDMG', 'amplifyDMG',
        'defIgnore', 'elementalResPEN', 'resistancePEN',
        'energyPercent',
        'basicBonusDMG', 'heavyBonusDMG', 'skillBonusDMG',
        'spectroBonusDMG', 'fusionBonusDMG',
        'aeroErosionBonusDMG', 'spectroFrazzleBonusDMG',
        'aeroRES', 'spectroRES', 'havocRES', 'glacioRES', 'fusionRES', 'electroRES',
        'resistance', 'level'
      ];

      additiveStats.forEach(stat => {
        expect(aggregateStat(100, 50, stat)).toBe(150);
      });
    });
  });

  describe('Multiplicative Stats', () => {
    it('should multiply values for totalMultiplier stats', () => {
      expect(aggregateStat(undefined, 1.2, 'totalMultiplierATK')).toBe(1.2);
      expect(aggregateStat(1.2, 1.15, 'totalMultiplierATK')).toBeCloseTo(1.38, 5);
      expect(aggregateStat(1.38, 1.1, 'totalMultiplierATK')).toBeCloseTo(1.518, 5);
    });

    it('should initialize undefined totalMultiplier stats to 1', () => {
      expect(aggregateStat(undefined, 1.5, 'totalMultiplierHP')).toBe(1.5);
      expect(aggregateStat(undefined, 1.0, 'totalMultiplierDMG')).toBe(1.0);
    });

    it('should handle multipliers less than 1 (reductions)', () => {
      expect(aggregateStat(1.5, 0.8, 'totalMultiplierATK')).toBeCloseTo(1.2, 5);
      expect(aggregateStat(1.0, 0.5, 'totalMultiplierDEF')).toBe(0.5);
    });

    it('should treat all totalMultiplier* stats as multiplicative', () => {
      const multiplicativeStats = [
        'totalMultiplierATK', 'totalMultiplierHP', 'totalMultiplierDEF', 'totalMultiplierDMG',
        'basicTotalMultiplierDMG', 'heavyTotalMultiplierDMG', 'skillTotalMultiplierDMG',
        'liberationTotalMultiplierDMG', 'coordinatedTotalMultiplierDMG', 'echoTotalMultiplierDMG',
        'introTotalMultiplierDMG', 'outroTotalMultiplierDMG',
        'aeroErosionTotalMultiplierDMG', 'spectroFrazzleTotalMultiplierDMG',
        'havocBaneTotalMultiplierDMG', 'glacioChafeToTotalMultiplierDMG',
        'fusionBurstTotalMultiplierDMG', 'electroFlareTotalMultiplierDMG',
        'spectroTotalMultiplierDMG', 'fusionTotalMultiplierDMG',
        'aeroTotalMultiplierDMG', 'glacioTotalMultiplierDMG',
        'electroTotalMultiplierDMG', 'havocTotalMultiplierDMG'
      ];

      multiplicativeStats.forEach(stat => {
        expect(aggregateStat(1.2, 1.5, stat)).toBeCloseTo(1.8, 5);
      });
    });
  });

  describe('Case Insensitivity', () => {
    it('should handle different casings of totalMultiplier', () => {
      expect(aggregateStat(1.5, 2.0, 'TOTALMULTIPLIERATK')).toBe(3.0);
      expect(aggregateStat(1.5, 2.0, 'TotalMultiplierATK')).toBe(3.0);
      expect(aggregateStat(1.5, 2.0, 'totalmultiplieratk')).toBe(3.0);
    });

    it('should handle mixed case for additive stats', () => {
      expect(aggregateStat(100, 50, 'BONUSATK')).toBe(150);
      expect(aggregateStat(100, 50, 'BonusATK')).toBe(150);
    });
  });

  describe('damageReduction (Reverse Multiplicative)', () => {
    it('should use reverse multiplicative formula: 1 - (1-a) * (1-b)', () => {
      expect(aggregateStat(0.5, 0.5, 'damageReduction')).toBeCloseTo(0.75, 5);
      expect(aggregateStat(0.5, 0.4, 'damageReduction')).toBeCloseTo(0.70, 5);
      expect(aggregateStat(undefined, 0.3, 'damageReduction')).toBeCloseTo(0.30, 5);
      expect(aggregateStat(0.3, 0.25, 'damageReduction')).toBeCloseTo(0.475, 5);
    });

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
