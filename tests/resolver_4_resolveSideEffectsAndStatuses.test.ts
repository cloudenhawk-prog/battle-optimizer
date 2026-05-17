import type { ModifierInAction } from '../src/types/modifiers'
import type { DamageModifier } from '../src/types/modifiers'
import type { SideEffect } from '../src/types/sideEffect'
import { buildStepContext, resolveSideEffectsAndStatuses, resolveModifierState, resolveDamageModifiers } from '../src/utils/hooks/resolvers'
import { calculateGlacioChafeProcDamage, calculateGlacioChafeDominionDamage } from '../src/utils/calculators/sideEffectCalculators'
import { createMockSnapshot, createMockCharacter, createMockCharacterStats, createMockAction, createMockEnemy, createMockDamageModifier } from './testUtils'

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

// ========== teamActionTrigger — off-field owner stat isolation ============================================================

/**
 * Builds a context where Lucila is the active character and Hiyuki sits off-field.
 * Lucila's action carries the GLACIO_CHAFE_APPLIER tag, which triggers Hiyuki's
 * teamActionTrigger. After resolveDamageModifiers runs, ctx.aggregatedCharacterModifiers
 * reflects Lucila's modifiers (no Hiyuki self-modifiers). The fix in buildOwnerStepContext
 * must re-collect Hiyuki's own modifiers so the side-effect calculator sees them.
 */
function buildOffFieldCtx(options: {
  hiyukiATK: number
  hiyukiSelfGlacioChafeAmplify: number
  sideEffect: SideEffect
}) {
  const { hiyukiATK, hiyukiSelfGlacioChafeAmplify, sideEffect } = options

  // Self-targeting modifier — only applies when Hiyuki is the active character.
  // Lucila's resolveDamageModifiers pass will NOT pick this up (ally 'all' filter).
  const hiyukiModifiers: DamageModifier[] = hiyukiSelfGlacioChafeAmplify > 0
    ? [createMockDamageModifier('Hiyuki: Fine Snow', {
        characterStats: { glacioChafeAmplifyDMG: hiyukiSelfGlacioChafeAmplify },
        targetStrategy: 'self',
        ownerCharacter: 'Hiyuki',
        condition: () => 1,
      })]
    : []

  const hiyuki = createMockCharacter('Hiyuki', {
    sequence: 6,
    stats: createMockCharacterStats({ baseATK: hiyukiATK }),
    damageModifiers: hiyukiModifiers,
    teamActionTriggers: [{ requiredTags: ['GLACIO_CHAFE_APPLIER'], sideEffect }],
  })

  const lucila = createMockCharacter('Lucila', {
    stats: createMockCharacterStats({ baseATK: 1000 }),
  })

  const action = createMockAction('Lucila Skill', { tags: ['GLACIO_CHAFE_APPLIER'] })
  const current = createMockSnapshot({ id: '1' })
  const prev = createMockSnapshot({ id: '0', toTime: 0 })

  const ctx = buildStepContext(1, current, prev, lucila, action, createMockEnemy(), [], [], {
    Lucila: lucila,
    Hiyuki: hiyuki,
  })

  // Set up Lucila's aggregated modifiers (the state before Hiyuki's teamTrigger fires).
  // This intentionally does NOT include Hiyuki's self-targeting modifier.
  resolveDamageModifiers(ctx)

  return ctx
}

describe('teamActionTrigger — off-field owner stat isolation', () => {
  const procSideEffect: SideEffect = {
    name: 'Snow Rust 2: Glacio Bite',
    damageDealt: calculateGlacioChafeProcDamage,
    statusModifications: [],
  }

  const dominionSideEffect: SideEffect = {
    name: 'Everfrost Dominion: Glacio Bite',
    damageDealt: calculateGlacioChafeDominionDamage,
    statusModifications: [],
  }

  it('attributes the event to the trigger-owning character (Hiyuki), not the active character (Lucila)', () => {
    const ctx = buildOffFieldCtx({ hiyukiATK: 2000, hiyukiSelfGlacioChafeAmplify: 0, sideEffect: procSideEffect })

    resolveSideEffectsAndStatuses(ctx)

    const event = ctx.damageEvents.find(e => e.dealer === 'Hiyuki: Snow Rust 2: Glacio Bite')
    expect(event).toBeDefined()
    expect(event!.dealer).not.toContain('Lucila')
  })

  it('Snow Rust 2: Glacio Bite — damage scales off the owner (Hiyuki) ATK, not the active character (Lucila) ATK', () => {
    // Hiyuki ATK=3000 vs Lucila ATK=1000 (3× difference).
    // sequence=6 ≥ 3 → multiplier = 1.02 + 4.88 = 5.90
    const hiyukiATK = 3000
    const ctx = buildOffFieldCtx({ hiyukiATK, hiyukiSelfGlacioChafeAmplify: 0, sideEffect: procSideEffect })

    resolveSideEffectsAndStatuses(ctx)

    const event = ctx.damageEvents.find(e => e.dealer === 'Hiyuki: Snow Rust 2: Glacio Bite')
    expect(event).toBeDefined()

    const multiplier = 1.02 + 4.88 // sequence=6 ≥ 3
    const defenseMultiplier = (800 + 8 * 90) / (800 + 8 * 90 + (8 * 85 + 792))
    const glacioResMultiplier = 1 - 0.1 // mock enemy glacioRES
    const damageRES = defenseMultiplier * glacioResMultiplier

    const expectedFromHiyukiATK = hiyukiATK * multiplier * damageRES
    const wrongFromLucilaATK = 1000 * multiplier * damageRES // what the buggy path would produce if char swapped back

    expect(event!.average).toBeCloseTo(expectedFromHiyukiATK, 0)
    expect(event!.average).not.toBeCloseTo(wrongFromLucilaATK, 0)
  })

  it('Snow Rust 2: Glacio Bite — Hiyuki\'s self-targeting glacioChafeAmplifyDMG modifier is included in damage', () => {
    // This modifier has targetStrategy:'self', ownerCharacter:'Hiyuki'.
    // Lucila's resolveDamageModifiers pass will NOT include it (only ally 'all'-targeted permanents
    // are picked up by collectAllModifiers). buildOwnerStepContext must re-collect it for Hiyuki.
    const amplify = 0.30
    const ctxWith = buildOffFieldCtx({ hiyukiATK: 2000, hiyukiSelfGlacioChafeAmplify: amplify, sideEffect: procSideEffect })
    const ctxWithout = buildOffFieldCtx({ hiyukiATK: 2000, hiyukiSelfGlacioChafeAmplify: 0, sideEffect: procSideEffect })

    resolveSideEffectsAndStatuses(ctxWith)
    resolveSideEffectsAndStatuses(ctxWithout)

    const eventWith = ctxWith.damageEvents.find(e => e.dealer === 'Hiyuki: Snow Rust 2: Glacio Bite')
    const eventWithout = ctxWithout.damageEvents.find(e => e.dealer === 'Hiyuki: Snow Rust 2: Glacio Bite')
    expect(eventWith).toBeDefined()
    expect(eventWithout).toBeDefined()

    // statusMultiplier = (1 + glacioChafeAmplifyDMG) → 1.30x when amplify = 0.30
    expect(eventWith!.average).toBeCloseTo(eventWithout!.average * (1 + amplify), 1)
  })

  it('Everfrost Dominion: Glacio Bite — uses flat stack-table scaling, not character ATK', () => {
    // calculateGlacioChafeDominionDamage passes no baseDMGScaling → flat table path.
    // Changing ATK should not change the damage at all.
    const ctxHighATK = buildOffFieldCtx({ hiyukiATK: 5000, hiyukiSelfGlacioChafeAmplify: 0, sideEffect: dominionSideEffect })
    const ctxLowATK = buildOffFieldCtx({ hiyukiATK: 500, hiyukiSelfGlacioChafeAmplify: 0, sideEffect: dominionSideEffect })

    resolveSideEffectsAndStatuses(ctxHighATK)
    resolveSideEffectsAndStatuses(ctxLowATK)

    const evHigh = ctxHighATK.damageEvents.find(e => e.dealer === 'Hiyuki: Everfrost Dominion: Glacio Bite')
    const evLow = ctxLowATK.damageEvents.find(e => e.dealer === 'Hiyuki: Everfrost Dominion: Glacio Bite')
    expect(evHigh).toBeDefined()
    expect(evLow).toBeDefined()

    // Both events must carry FLAT scaling and produce identical damage regardless of ATK.
    expect(evHigh!.scaling).toBe('FLAT')
    expect(evLow!.scaling).toBe('FLAT')
    expect(evHigh!.average).toBeCloseTo(evLow!.average, 4)
  })
})
