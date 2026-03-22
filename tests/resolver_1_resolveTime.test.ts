import { buildStepContext, resolveTime } from '../src/utils/hooks/resolvers'
import type { StepContext } from '../src/types/stepContext'
import { createMockSnapshot, createMockCharacter, createMockAction, createMockEnemy } from './testUtils'

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

        const context = buildStepContext(1, current, prev, character, action, createMockEnemy(), [], [], characterMap)
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

      const context = buildStepContext(5, current, prev, character, action, createMockEnemy(), [], [], characterMap)

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
        charactersEnergies: { Char: { concerto: 80 } },
        buffs: { buff1: 5 },
        debuffs: { debuff1: 3 },
        negativeStatuses: { burn: 2 },
        negativeStatusesTimeLeft: { burn: 10 },
      })
      const character = createMockCharacter('Char')
      const action = createMockAction('Action', { castTime: 2.5 })
      const characterMap = { Char: character }

      const context = buildStepContext(5, current, prev, character, action, createMockEnemy(), [], [], characterMap)

      // Act
      resolveTime(context)

      // Assert - ONLY time fields change
      expect(current.fromTime).toBe(10.0)
      expect(current.toTime).toBe(12.5)
      expect(current.damage).toBe(500)
      expect(current.dps).toBe(25)
      expect(current.charactersEnergies).toEqual({ Char: { concerto: 80 } })
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

      const context = buildStepContext(5, createMockSnapshot({ id: '5' }), prev, createMockCharacter('Char'), createMockAction('Action', { castTime: 1.5 }), createMockEnemy(), [], [], { Char: createMockCharacter('Char') })

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

      const context = buildStepContext(5, current, prev, character, action, createMockEnemy(), [], [], characterMap)

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
      const prev = createMockSnapshot({ id: '4', toTime: 10 })
      const current = createMockSnapshot({ id: '5' })
      const character = createMockCharacter('Char')
      const action = createMockAction('Action')

      const validationCases: Array<{
        label: string
        modify: (ctx: StepContext) => void
      }> = [
        {
          label: 'null fromTime',
          modify: ctx => {
            ;(ctx as any).fromTime = null
          },
        },
        {
          label: 'null toTime',
          modify: ctx => {
            ;(ctx as any).toTime = null
          },
        },
        {
          label: 'fromTime > toTime',
          modify: ctx => {
            ctx.fromTime = 15
            ctx.toTime = 10
          },
        },
        {
          label: 'snapshotId mismatch',
          modify: ctx => {
            ctx.snapshotId = 999
          },
        },
      ]

      validationCases.forEach(({ modify }) => {
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
          coordinatedAttacksInAction: [],
          damageModifiers: [],
          modifiersInAction: [],
          permanentModifiers: [],
          aggregatedCharacterModifiers: {},
          aggregatedEnemyModifiers: {},
          logs: [],
        }

        modify(context)

        expect(() => resolveTime(context)).toThrow()
      })
    })
  })
})
