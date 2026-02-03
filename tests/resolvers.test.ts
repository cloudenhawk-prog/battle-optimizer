import { buildStepContext, resolveTime } from '../src/utils/hooks/resolvers';
import type { StepContext } from '../src/types/stepContext';
import {
  createMockSnapshot,
  createMockCharacter,
  createMockAction,
  createMockEnemy,
  createMockNegativeStatuses,
} from './testUtils';

// ========== Tests for buildStepContext =======================================================================================

describe('buildStepContext', () => {
  describe('Context Initialization', () => {
    it('should initialize context with all required references and calculated times', () => {
      // Arrange
      const snapshotId = 5;
      const current = createMockSnapshot({ id: '5' });
      const prev = createMockSnapshot({ id: '4', toTime: 10 });
      const character = createMockCharacter('TestChar');
      const action = createMockAction('BasicAttack', { castTime: 2.5 });
      const enemy = createMockEnemy();
      const negativeStatuses = createMockNegativeStatuses();
      const characterMap = { TestChar: character };

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
      expect(context.snapshotId).toBe(snapshotId);
      expect(context.current).toBe(current);
      expect(context.prev).toBe(prev);
      expect(context.character).toBe(character);
      expect(context.enemy).toBe(enemy);
      expect(context.action).toBe(action);
      expect(context.negativeStatusesInAction).toBe(negativeStatuses);
      
      // Context times are calculated: prev.toTime + action.castTime
      expect(context.fromTime).toBe(10);
      expect(context.toTime).toBe(12.5);
      
      // Modifiers initialized empty
      expect(context.aggregatedCharacterModifiers).toBeDefined();
      expect(context.aggregatedEnemyModifiers).toBeDefined();
      
      // Logs initialized with entry
      expect(context.logs.length).toBeGreaterThan(0);
      expect(context.logs[0].resolver).toBe('buildStepContext');
    });

    it('should calculate context times correctly for various cast times', () => {
      const testCases = [
        { prevToTime: 0, castTime: 1.5, expectedFrom: 0, expectedTo: 1.5 },
        { prevToTime: 10.5, castTime: 2.25, expectedFrom: 10.5, expectedTo: 12.75 },
        { prevToTime: 5, castTime: 0, expectedFrom: 5, expectedTo: 5 }, // Instant action
      ];

      testCases.forEach(({ prevToTime, castTime, expectedFrom, expectedTo }) => {
        const prev = createMockSnapshot({ id: '0', toTime: prevToTime });
        const current = createMockSnapshot({ id: '1' });
        const character = createMockCharacter('TestChar');
        const action = createMockAction('Action', { castTime });
        const characterMap = { TestChar: character };

        const context = buildStepContext(
          1,
          current,
          prev,
          character,
          action,
          createMockEnemy(),
          [],
          characterMap
        );

        expect(context.fromTime).toBe(expectedFrom);
        expect(context.toTime).toBe(expectedTo);
      });
    });
  });

  describe('Allies Filtering', () => {
    it('should exclude current character and include all others from character map', () => {
      const current = createMockSnapshot({ id: '1' });
      const prev = createMockSnapshot({ id: '0', toTime: 0 });
      const character = createMockCharacter('MainChar');
      const ally1 = createMockCharacter('Ally1');
      const ally2 = createMockCharacter('Ally2');
      const characterMap = { MainChar: character, Ally1: ally1, Ally2: ally2 };

      const context = buildStepContext(
        1,
        current,
        prev,
        character,
        createMockAction('BasicAttack'),
        createMockEnemy(),
        [],
        characterMap
      );

      expect(context.allies).toHaveLength(2);
      expect(context.allies).toContain(ally1);
      expect(context.allies).toContain(ally2);
      expect(context.allies).not.toContain(character);
    });

    it('should handle edge cases: solo character and empty map', () => {
      // Solo character
      const solo = createMockCharacter('Solo');
      const ctx1 = buildStepContext(
        1,
        createMockSnapshot({ id: '1' }),
        createMockSnapshot({ id: '0', toTime: 0 }),
        solo,
        createMockAction('Action'),
        createMockEnemy(),
        [],
        { Solo: solo }
      );
      expect(ctx1.allies).toEqual([]);

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
      );
      expect(ctx2.allies).toEqual([]);
    });
  });

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
      });
      const prev = createMockSnapshot({ id: '4', toTime: 10 });
      const character = createMockCharacter('TestChar');
      const action = createMockAction('NewAction', { castTime: 2.0 });
      const characterMap = { TestChar: character };

      // Act
      buildStepContext(5, current, prev, character, action, createMockEnemy(), [], characterMap);

      // Assert - ONLY action changes
      expect(current.action).toBe('NewAction');
      expect(current.fromTime).toBe(999);
      expect(current.toTime).toBe(888);
      expect(current.damage).toBe(1234);
      expect(current.dps).toBe(567);
      expect(current.charactersEnergies).toEqual({ concerto: 50 });
      expect(current.buffs).toEqual({ testBuff: 10 });
      expect(current.debuffs).toEqual({ testDebuff: 5 });
      expect(current.negativeStatuses).toEqual({ burn: 3 });
    });

    it('should never mutate previous snapshot', () => {
      const prev = createMockSnapshot({
        id: '4',
        toTime: 10,
        damage: 500,
        action: 'PrevAction',
      });
      const prevSnapshot = JSON.parse(JSON.stringify(prev)); // Deep copy for comparison

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

      expect(prev).toEqual(prevSnapshot);
    });
  });
});

// ========== Tests for resolveTime ============================================================================================

describe('resolveTime', () => {
  describe('Snapshot Time Resolution', () => {
    it('should write calculated times to snapshot from prev.toTime and action.castTime', () => {
      const testCases = [
        { prevToTime: 10, castTime: 2.5, expectedFrom: 10, expectedTo: 12.5 },
        { prevToTime: 0, castTime: 1.5, expectedFrom: 0, expectedTo: 1.5 },
        { prevToTime: 5.125, castTime: 0.375, expectedFrom: 5.125, expectedTo: 5.5 },
        { prevToTime: 10, castTime: 0, expectedFrom: 10, expectedTo: 10 }, // Instant
      ];

      testCases.forEach(({ prevToTime, castTime, expectedFrom, expectedTo }) => {
        const prev = createMockSnapshot({ id: '0', toTime: prevToTime });
        const current = createMockSnapshot({ id: '1' });
        const character = createMockCharacter('Char');
        const action = createMockAction('Action', { castTime });
        const characterMap = { Char: character };

        const context = buildStepContext(1, current, prev, character, action, createMockEnemy(), [], characterMap);
        resolveTime(context);

        expect(current.fromTime).toBe(expectedFrom);
        expect(current.toTime).toBe(expectedTo);
      });
    });

    it('should recalculate times from source data, not trust existing snapshot values', () => {
      // Arrange - snapshot has wrong pre-existing values
      const prev = createMockSnapshot({ id: '4', toTime: 10.0 });
      const current = createMockSnapshot({ id: '5', fromTime: 999, toTime: 888 });
      const character = createMockCharacter('Char');
      const action = createMockAction('Action', { castTime: 2.0 });
      const characterMap = { Char: character };

      const context = buildStepContext(5, current, prev, character, action, createMockEnemy(), [], characterMap);

      // Act
      resolveTime(context);

      // Assert - wrong values overwritten with correct calculation
      expect(current.fromTime).toBe(10.0);
      expect(current.toTime).toBe(12.0);
    });
  });

  describe('Snapshot Mutation Contract', () => {
    it('should ONLY mutate fromTime and toTime, leaving all other snapshot fields untouched', () => {
      // Arrange
      const prev = createMockSnapshot({ id: '4', toTime: 10.0 });
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
      });
      const character = createMockCharacter('Char');
      const action = createMockAction('Action', { castTime: 2.5 });
      const characterMap = { Char: character };

      const context = buildStepContext(5, current, prev, character, action, createMockEnemy(), [], characterMap);

      // Act
      resolveTime(context);

      // Assert - ONLY time fields change
      expect(current.fromTime).toBe(10.0);
      expect(current.toTime).toBe(12.5);
      expect(current.damage).toBe(500);
      expect(current.dps).toBe(25);
      expect(current.charactersEnergies).toEqual({ concerto: 80 });
      expect(current.buffs).toEqual({ buff1: 5 });
      expect(current.debuffs).toEqual({ debuff1: 3 });
      expect(current.negativeStatuses).toEqual({ burn: 2 });
    });

    it('should never mutate previous snapshot', () => {
      const prev = createMockSnapshot({
        id: '4',
        toTime: 10.0,
        fromTime: 8.0,
        damage: 1000,
      });
      const prevSnapshot = JSON.parse(JSON.stringify(prev));

      const context = buildStepContext(
        5,
        createMockSnapshot({ id: '5' }),
        prev,
        createMockCharacter('Char'),
        createMockAction('Action', { castTime: 1.5 }),
        createMockEnemy(),
        [],
        { Char: createMockCharacter('Char') }
      );

      resolveTime(context);

      expect(prev).toEqual(prevSnapshot);
    });
  });

  describe('Context Behavior', () => {
    it('should append log entry without mutating context time values', () => {
      const prev = createMockSnapshot({ id: '4', toTime: 10 });
      const current = createMockSnapshot({ id: '5' });
      const character = createMockCharacter('Char');
      const action = createMockAction('Action', { castTime: 2.0 });
      const characterMap = { Char: character };

      const context = buildStepContext(5, current, prev, character, action, createMockEnemy(), [], characterMap);

      const initialLogCount = context.logs.length;
      const contextFromBefore = context.fromTime;
      const contextToBefore = context.toTime;

      resolveTime(context);

      // Log appended
      expect(context.logs.length).toBe(initialLogCount + 1);
      expect(context.logs[context.logs.length - 1].resolver).toBe('resolveTime');

      // Context times unchanged
      expect(context.fromTime).toBe(contextFromBefore);
      expect(context.toTime).toBe(contextToBefore);
    });
  });

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
