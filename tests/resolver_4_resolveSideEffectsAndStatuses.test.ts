import type { ModifierInAction } from '../src/types/modifiers'
import type { DamageModifier } from '../src/types/modifiers'
import { buildStepContext, resolveSideEffectsAndStatuses, resolveModifierState } from '../src/utils/hooks/resolvers'
import { createMockSnapshot, createMockCharacter, createMockAction, createMockEnemy, createMockDamageModifier } from './testUtils'

// ========== Local Helpers ====================================================================================================

function makeLimitedModifier(displayName: string, type: 'buff' | 'debuff', maxStacks: number): DamageModifier {
  return createMockDamageModifier(displayName, {
    displayName,
    type,
    durationStrategy: { type: 'limited', timeDuration: 12 },
    stackingStrategy: { maxStacks, resetTimerOnApplication: false, stacksRemovedEachTime: 1 },
  })
}

function makeModifierInAction(displayName: string, currentStacks: number, maxStacks: number, type: 'buff' | 'debuff' = 'buff'): ModifierInAction {
  return {
    modifier: makeLimitedModifier(displayName, type, maxStacks),
    applicationTime: 0,
    timeLeft: 10,
    swapsLeft: Infinity,
    currentStacks,
    targetCharacter: null,
  }
}

function buildCtx(modifiersInAction: ModifierInAction[], statusModifications: Array<{ type: 'buff' | 'debuff' | 'negativeStatus'; targetName: string; stackChange?: number; durationChange?: number; refreshDuration?: boolean }>) {
  const character = createMockCharacter('TestChar')
  const action = createMockAction('TestAction', { statusModifications, sideEffects: [] })
  const current = createMockSnapshot({ id: '1' })
  const prev = createMockSnapshot({ id: '0', toTime: 0 })
  return buildStepContext(1, current, prev, character, action, createMockEnemy(), [], modifiersInAction, { TestChar: character })
}

// ========== Tests ============================================================================================================

describe('resolveSideEffectsAndStatuses — helpModifierStatusModifications', () => {
  describe('Stack removal', () => {
    it('removes a 1-stack buff from modifiersInAction when stackChange is -1', () => {
      const ctx = buildCtx([makeModifierInAction('Mandate', 1, 1)], [{ type: 'buff', targetName: 'Mandate', stackChange: -1 }])

      resolveSideEffectsAndStatuses(ctx)

      expect(ctx.modifiersInAction).toHaveLength(0)
    })

    it('reduces stacks without removing the modifier when remaining stacks > 0', () => {
      const ctx = buildCtx([makeModifierInAction('PowerBuff', 3, 3)], [{ type: 'buff', targetName: 'PowerBuff', stackChange: -2 }])

      resolveSideEffectsAndStatuses(ctx)

      expect(ctx.modifiersInAction).toHaveLength(1)
      expect(ctx.modifiersInAction[0].currentStacks).toBe(1)
    })

    it('removes a 1-stack debuff from modifiersInAction when stackChange is -1', () => {
      const ctx = buildCtx([makeModifierInAction('WeaknessDebuff', 1, 1, 'debuff')], [{ type: 'debuff', targetName: 'WeaknessDebuff', stackChange: -1 }])

      resolveSideEffectsAndStatuses(ctx)

      expect(ctx.modifiersInAction).toHaveLength(0)
    })
  })

  describe('Stack clamping', () => {
    it('clamps newly added stacks to maxStacks', () => {
      const ctx = buildCtx([makeModifierInAction('CappedBuff', 2, 2)], [{ type: 'buff', targetName: 'CappedBuff', stackChange: +5 }])

      resolveSideEffectsAndStatuses(ctx)

      expect(ctx.modifiersInAction[0].currentStacks).toBe(2)
    })

    it('removes modifier when stackChange drives stacks below 0', () => {
      const ctx = buildCtx([makeModifierInAction('WeakBuff', 1, 1)], [{ type: 'buff', targetName: 'WeakBuff', stackChange: -99 }])

      resolveSideEffectsAndStatuses(ctx)

      expect(ctx.modifiersInAction).toHaveLength(0)
    })
  })

  describe('No-op cases', () => {
    it('leaves modifier unchanged when stackChange is 0', () => {
      const ctx = buildCtx([makeModifierInAction('Mandate', 1, 1)], [{ type: 'buff', targetName: 'Mandate', stackChange: 0 }])

      resolveSideEffectsAndStatuses(ctx)

      expect(ctx.modifiersInAction).toHaveLength(1)
      expect(ctx.modifiersInAction[0].currentStacks).toBe(1)
    })

    it('leaves modifier unchanged when target name does not match', () => {
      const ctx = buildCtx([makeModifierInAction('Mandate', 1, 1)], [{ type: 'buff', targetName: 'SomeOtherBuff', stackChange: -1 }])

      resolveSideEffectsAndStatuses(ctx)

      expect(ctx.modifiersInAction).toHaveLength(1)
      expect(ctx.modifiersInAction[0].currentStacks).toBe(1)
    })

    it('does not remove a buff when the statusModification targets a debuff of the same name', () => {
      const ctx = buildCtx([makeModifierInAction('Mandate', 1, 1, 'buff')], [{ type: 'debuff', targetName: 'Mandate', stackChange: -1 }])

      resolveSideEffectsAndStatuses(ctx)

      expect(ctx.modifiersInAction).toHaveLength(1)
      expect(ctx.modifiersInAction[0].currentStacks).toBe(1)
    })

    it('leaves unrelated modifiers unaffected when one modifier is removed', () => {
      const ctx = buildCtx(
        [makeModifierInAction('Mandate', 1, 1), makeModifierInAction('UnrelatedBuff', 2, 3)],
        [{ type: 'buff', targetName: 'Mandate', stackChange: -1 }],
      )

      resolveSideEffectsAndStatuses(ctx)

      expect(ctx.modifiersInAction).toHaveLength(1)
      expect(ctx.modifiersInAction[0].modifier.displayName).toBe('UnrelatedBuff')
      expect(ctx.modifiersInAction[0].currentStacks).toBe(2)
    })
  })

  describe('Snapshot reflection', () => {
    it('snapshot buffs entry is absent after modifier is removed and resolveModifierState runs', () => {
      const ctx = buildCtx([makeModifierInAction('Mandate', 1, 1)], [{ type: 'buff', targetName: 'Mandate', stackChange: -1 }])
      ctx.permanentModifiers = []

      resolveSideEffectsAndStatuses(ctx)
      resolveModifierState(ctx)

      expect(ctx.current.buffs['Mandate']).toBeUndefined()
    })

    it('snapshot buffs entry reflects reduced stack count when modifier is partially decremented', () => {
      const ctx = buildCtx([makeModifierInAction('PowerBuff', 3, 3)], [{ type: 'buff', targetName: 'PowerBuff', stackChange: -2 }])
      ctx.permanentModifiers = []

      resolveSideEffectsAndStatuses(ctx)
      resolveModifierState(ctx)

      expect(ctx.current.buffs['PowerBuff']).toBe(1)
    })
  })

  describe('Logging', () => {
    it('logs a warning and does not change stacks when durationChange is non-zero', () => {
      const ctx = buildCtx([makeModifierInAction('Mandate', 1, 1)], [{ type: 'buff', targetName: 'Mandate', stackChange: 0, durationChange: 5 }])

      resolveSideEffectsAndStatuses(ctx)

      const warningLog = ctx.logs.find(l => l.resolver === 'helpModifierStatusModifications' && l.message.includes('not supported'))
      expect(warningLog).toBeDefined()
      expect(ctx.modifiersInAction).toHaveLength(1)
      expect(ctx.modifiersInAction[0].currentStacks).toBe(1)
    })

    it('logs a warning and does not change stacks when refreshDuration is true', () => {
      const ctx = buildCtx([makeModifierInAction('Mandate', 1, 1)], [{ type: 'buff', targetName: 'Mandate', stackChange: 0, refreshDuration: true }])

      resolveSideEffectsAndStatuses(ctx)

      const warningLog = ctx.logs.find(l => l.resolver === 'helpModifierStatusModifications' && l.message.includes('not supported'))
      expect(warningLog).toBeDefined()
    })

    it('logs the applied stack changes when modifications are made', () => {
      const ctx = buildCtx([makeModifierInAction('Mandate', 1, 1)], [{ type: 'buff', targetName: 'Mandate', stackChange: -1 }])

      resolveSideEffectsAndStatuses(ctx)

      const appliedLog = ctx.logs.find(l => l.resolver === 'helpModifierStatusModifications' && l.message.includes('applied'))
      expect(appliedLog).toBeDefined()
      expect((appliedLog!.details as any).applied).toEqual([{ type: 'buff', targetName: 'Mandate', requestedStackChange: -1, effectiveDelta: -1, stacksBefore: 1, stacksAfter: 0 }])
    })
  })
})
