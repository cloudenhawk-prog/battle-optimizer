import { buildStepContext } from '../src/utils/hooks/resolvers'
import { createMockSnapshot, createMockCharacter, createMockAction, createMockEnemy, createMockNegativeStatuses } from './testUtils'

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
      const negativeStatuses = createMockNegativeStatuses()
      const modifiersInAction: any[] = []
      const characterMap = { TestChar: character }

      // Act
      const context = buildStepContext(snapshotId, current, prev, character, action, enemy, negativeStatuses, modifiersInAction, characterMap)

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

        const context = buildStepContext(1, current, prev, character, action, createMockEnemy(), [], [], characterMap)

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

      const context = buildStepContext(1, current, prev, character, createMockAction('BasicAttack'), createMockEnemy(), [], [], characterMap)

      expect(context.allies).toHaveLength(2)
      expect(context.allies).toContain(ally1)
      expect(context.allies).toContain(ally2)
      expect(context.allies).not.toContain(character)
    })

    it('should handle edge cases: solo character and empty map', () => {
      const solo = createMockCharacter('Solo')
      const ctx1 = buildStepContext(1, createMockSnapshot({ id: '1' }), createMockSnapshot({ id: '0', toTime: 0 }), solo, createMockAction('Action'), createMockEnemy(), [], [], { Solo: solo })
      expect(ctx1.allies).toEqual([])

      // Empty map
      const ctx2 = buildStepContext(1, createMockSnapshot({ id: '1' }), createMockSnapshot({ id: '0', toTime: 0 }), solo, createMockAction('Action'), createMockEnemy(), [], [], {})
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
        negativeStatusesTimeLeft: { burn: 15 },
      })
      const prev = createMockSnapshot({ id: '4', toTime: 10 })
      const character = createMockCharacter('TestChar')
      const action = createMockAction('NewAction', { castTime: 2.0 })
      const characterMap = { TestChar: character }

      // Act
      buildStepContext(5, current, prev, character, action, createMockEnemy(), [], [], characterMap)

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
        damage: 500,
        action: 'PrevAction',
      })
      const prevSnapshot = JSON.parse(JSON.stringify(prev))

      buildStepContext(5, createMockSnapshot({ id: '5' }), prev, createMockCharacter('Char'), createMockAction('Action'), createMockEnemy(), [], [], { Char: createMockCharacter('Char') })

      expect(prev).toEqual(prevSnapshot)
    })
  })
})
