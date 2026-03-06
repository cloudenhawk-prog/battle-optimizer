import type { ModifierInAction } from '../src/types/modifiers'
import type { CoordinatedAttackInAction } from '../src/types/coordinatedAttack'
import { activateCoordinatedAttacks, processCoordinatedAttacks } from '../src/utils/hooks/coordinatedAttackHelpers'
import { buildStepContext } from '../src/utils/hooks/resolvers'
import {
  createMockSnapshot,
  createMockCharacter,
  createMockAction,
  createMockEnemy,
  createMockDamageModifier,
  createMockCoordinatedAttack,
  createMockCoordinatedAttackInAction,
} from './testUtils'

// ========== Local Helpers ====================================================================================================

const noopSetDamageEvents = () => {}

/**
 * Builds a minimal StepContext. By default: TestChar active, fromTime=0, toTime=1.
 * Pass prevCharacter to simulate a swap (prev.character !== current character).
 */
function buildCtx(
  options: {
    action?: ReturnType<typeof createMockAction>
    modifiersInAction?: ModifierInAction[]
    coordinatedAttacksInAction?: CoordinatedAttackInAction[]
    castTime?: number
    prevCharacter?: string
  } = {},
) {
  const character = createMockCharacter('TestChar')
  const action = options.action ?? createMockAction('TestAction', { castTime: options.castTime ?? 1.0 })
  const prev = createMockSnapshot({ id: '0', toTime: 0, character: options.prevCharacter ?? 'TestChar' })
  const current = createMockSnapshot({ id: '1' })
  return buildStepContext(
    1,
    current,
    prev,
    character,
    action,
    createMockEnemy(),
    [],
    options.modifiersInAction ?? [],
    { TestChar: character },
    options.coordinatedAttacksInAction ?? [],
  )
}

// ========== activateCoordinatedAttacks =======================================================================================

describe('activateCoordinatedAttacks', () => {
  describe('Attack lifecycle', () => {
    it('pushes a new entry when no matching attack exists', () => {
      const ca = createMockCoordinatedAttack('Phantom Slash', { duration: 8 })
      const ctx = buildCtx({ action: createMockAction('Lib', { coordinatedAttacks: [ca], castTime: 1 }) })

      activateCoordinatedAttacks(ctx)

      expect(ctx.coordinatedAttacksInAction).toHaveLength(1)
      const entry = ctx.coordinatedAttacksInAction[0]
      expect(entry.coordinatedAttack.name).toBe('Phantom Slash')
      expect(entry.ownerCharacter).toBe('TestChar')
      expect(entry.timeLeft).toBe(8)
      expect(entry.applicationTime).toBe(ctx.toTime)
      expect(entry.lastDamageTime).toBe(ctx.toTime)
    })

    it('refreshes an existing attack instead of duplicating it', () => {
      const ca = createMockCoordinatedAttack('Phantom Slash', { duration: 10 })
      const stale = createMockCoordinatedAttackInAction(ca, 'TestChar', { timeLeft: 2, applicationTime: 0 })
      const ctx = buildCtx({
        action: createMockAction('Lib', { coordinatedAttacks: [ca], castTime: 1 }),
        coordinatedAttacksInAction: [stale],
      })

      activateCoordinatedAttacks(ctx)

      expect(ctx.coordinatedAttacksInAction).toHaveLength(1)
      expect(ctx.coordinatedAttacksInAction[0].timeLeft).toBe(10)
      expect(ctx.coordinatedAttacksInAction[0].applicationTime).toBe(ctx.toTime)
    })
  })

  describe('linkedModifiers on activation', () => {
    it('injects linkedModifiers into modifiersInAction with Infinity timers', () => {
      const linkedMod = createMockDamageModifier('src-linked', { displayName: 'Active Buff' })
      const ca = createMockCoordinatedAttack('Slash', { linkedModifiers: [linkedMod] })
      const ctx = buildCtx({ action: createMockAction('Lib', { coordinatedAttacks: [ca], castTime: 1 }) })

      activateCoordinatedAttacks(ctx)

      expect(ctx.modifiersInAction).toHaveLength(1)
      const mia = ctx.modifiersInAction[0]
      expect(mia.modifier.source).toBe('src-linked')
      expect(mia.timeLeft).toBe(Infinity)
      expect(mia.swapsLeft).toBe(Infinity)
      expect(mia.currentStacks).toBe(1)
    })

    it('does not duplicate linkedModifiers when refreshing an already-active attack', () => {
      const linkedMod = createMockDamageModifier('src-linked', { displayName: 'Active Buff' })
      const ca = createMockCoordinatedAttack('Slash', { linkedModifiers: [linkedMod] })
      const existingAttack = createMockCoordinatedAttackInAction(ca, 'TestChar')
      const existingMia: ModifierInAction = {
        modifier: linkedMod,
        applicationTime: 0,
        timeLeft: Infinity,
        swapsLeft: Infinity,
        currentStacks: 1,
        targetCharacter: null,
      }
      const ctx = buildCtx({
        action: createMockAction('Lib', { coordinatedAttacks: [ca], castTime: 1 }),
        modifiersInAction: [existingMia],
        coordinatedAttacksInAction: [existingAttack],
      })

      activateCoordinatedAttacks(ctx)

      expect(ctx.modifiersInAction).toHaveLength(1) // not duplicated
    })

    it('does nothing to modifiersInAction if linkedModifiers is omitted', () => {
      const ca = createMockCoordinatedAttack('Slash') // no linkedModifiers
      const ctx = buildCtx({ action: createMockAction('Lib', { coordinatedAttacks: [ca], castTime: 1 }) })

      activateCoordinatedAttacks(ctx)

      expect(ctx.modifiersInAction).toHaveLength(0)
    })
  })
})

// ========== processCoordinatedAttacks — linkedModifiers expiry ============================================================

describe('processCoordinatedAttacks — linkedModifiers expiry', () => {
  it('removes linkedModifiers from modifiersInAction when attack expires by time', () => {
    const linkedMod = createMockDamageModifier('src-linked', { displayName: 'Active Buff' })
    // frequency=1, timeLeft=1 → one tick fires at t=1, timeLeft drops to 0 → expiry
    const ca = createMockCoordinatedAttack('Slash', { frequency: 1, duration: 1, linkedModifiers: [linkedMod] })
    const activeAttack = createMockCoordinatedAttackInAction(ca, 'TestChar', { timeLeft: 1, lastDamageTime: 0 })
    const linkedMia: ModifierInAction = {
      modifier: linkedMod,
      applicationTime: 0,
      timeLeft: Infinity,
      swapsLeft: Infinity,
      currentStacks: 1,
      targetCharacter: null,
    }
    // ctx.toTime=1: tick at t=1 fires, timeLeft→0, expiry triggered
    const ctx = buildCtx({
      modifiersInAction: [linkedMia],
      coordinatedAttacksInAction: [activeAttack],
      castTime: 1,
    })

    processCoordinatedAttacks(ctx, noopSetDamageEvents)

    expect(ctx.modifiersInAction).toHaveLength(0)
    expect(activeAttack.applicationTime).toBe(-1)
  })

  it('removes linkedModifiers when swapRequired attack is cancelled by owner returning', () => {
    const linkedMod = createMockDamageModifier('src-linked', { displayName: 'Active Buff' })
    // swapRequired=true; owner is 'TestChar'; prevCharacter='OtherChar' → isSwap=true → lastSwappedToCharacter='TestChar'
    const ca = createMockCoordinatedAttack('Slash', { swapRequired: true, linkedModifiers: [linkedMod], duration: Infinity })
    const activeAttack = createMockCoordinatedAttackInAction(ca, 'TestChar', { timeLeft: Infinity, lastDamageTime: 0 })
    const linkedMia: ModifierInAction = {
      modifier: linkedMod,
      applicationTime: 0,
      timeLeft: Infinity,
      swapsLeft: Infinity,
      currentStacks: 1,
      targetCharacter: null,
    }
    // Simulate owner swapping back in: prev.character='OtherChar', current character='TestChar'
    const ctx = buildCtx({
      modifiersInAction: [linkedMia],
      coordinatedAttacksInAction: [activeAttack],
      prevCharacter: 'OtherChar',
      castTime: 1,
    })

    processCoordinatedAttacks(ctx, noopSetDamageEvents)

    expect(ctx.modifiersInAction).toHaveLength(0)
    expect(activeAttack.applicationTime).toBe(-1)
  })

  it('keeps linkedModifiers while attack is still active', () => {
    const linkedMod = createMockDamageModifier('src-linked', { displayName: 'Active Buff' })
    // timeLeft=5 >> 1 tick; will not expire this step
    const ca = createMockCoordinatedAttack('Slash', { frequency: 1, duration: 5, linkedModifiers: [linkedMod] })
    const activeAttack = createMockCoordinatedAttackInAction(ca, 'TestChar', { timeLeft: 5, lastDamageTime: 0 })
    const linkedMia: ModifierInAction = {
      modifier: linkedMod,
      applicationTime: 0,
      timeLeft: Infinity,
      swapsLeft: Infinity,
      currentStacks: 1,
      targetCharacter: null,
    }
    const ctx = buildCtx({
      modifiersInAction: [linkedMia],
      coordinatedAttacksInAction: [activeAttack],
      castTime: 1,
    })

    processCoordinatedAttacks(ctx, noopSetDamageEvents)

    expect(ctx.modifiersInAction).toHaveLength(1) // still present
    expect(activeAttack.applicationTime).not.toBe(-1)
  })
})

// ========== processCoordinatedAttacks — per-tick buff/debuff mods =========================================================

describe('processCoordinatedAttacks — per-tick buff/debuff statusModifications', () => {
  it('adds stackChange * hitCount to a matching buff in modifiersInAction', () => {
    const targetMod = createMockDamageModifier('src-buff', {
      displayName: 'Power Up',
      type: 'buff',
      stackingStrategy: { maxStacks: 10, resetTimerOnApplication: false, stacksRemovedEachTime: 1 },
    })
    const existingMia: ModifierInAction = {
      modifier: targetMod,
      applicationTime: 0,
      timeLeft: 10,
      swapsLeft: Infinity,
      currentStacks: 1,
      targetCharacter: null,
    }
    // 2 ticks fire in [0, 2]: at t=1 and t=2 (frequency=1, lastDamageTime=0, castTime=2)
    const ca = createMockCoordinatedAttack('Slash', {
      frequency: 1,
      duration: 10,
      statusModifications: [{ type: 'buff', targetName: 'Power Up', stackChange: 1 }],
    })
    const activeAttack = createMockCoordinatedAttackInAction(ca, 'TestChar', { timeLeft: 10, lastDamageTime: 0 })
    const ctx = buildCtx({
      modifiersInAction: [existingMia],
      coordinatedAttacksInAction: [activeAttack],
      castTime: 2,
    })

    processCoordinatedAttacks(ctx, noopSetDamageEvents)

    // 2 ticks * stackChange 1 = +2 stacks on top of initial 1
    expect(ctx.modifiersInAction[0].currentStacks).toBe(3)
  })

  it('clamps buff stacks to maxStacks', () => {
    const targetMod = createMockDamageModifier('src-buff', {
      displayName: 'Capped Buff',
      type: 'buff',
      stackingStrategy: { maxStacks: 2, resetTimerOnApplication: false, stacksRemovedEachTime: 1 },
    })
    const existingMia: ModifierInAction = {
      modifier: targetMod,
      applicationTime: 0,
      timeLeft: 10,
      swapsLeft: Infinity,
      currentStacks: 1,
      targetCharacter: null,
    }
    // 3 ticks would add 3 stacks, but maxStacks=2
    const ca = createMockCoordinatedAttack('Slash', {
      frequency: 1,
      duration: 10,
      statusModifications: [{ type: 'buff', targetName: 'Capped Buff', stackChange: 1 }],
    })
    const activeAttack = createMockCoordinatedAttackInAction(ca, 'TestChar', { timeLeft: 10, lastDamageTime: 0 })
    const ctx = buildCtx({
      modifiersInAction: [existingMia],
      coordinatedAttacksInAction: [activeAttack],
      castTime: 3,
    })

    processCoordinatedAttacks(ctx, noopSetDamageEvents)

    expect(ctx.modifiersInAction[0].currentStacks).toBe(2) // clamped
  })

  it('removes buff from modifiersInAction when stackChange drives stacks to 0', () => {
    const targetMod = createMockDamageModifier('src-buff', {
      displayName: 'Expiring Buff',
      type: 'buff',
      stackingStrategy: { maxStacks: 1, resetTimerOnApplication: false, stacksRemovedEachTime: 1 },
    })
    const existingMia: ModifierInAction = {
      modifier: targetMod,
      applicationTime: 0,
      timeLeft: 10,
      swapsLeft: Infinity,
      currentStacks: 1,
      targetCharacter: null,
    }
    // 1 tick fires, stackChange=-1 → 0 stacks → removed
    const ca = createMockCoordinatedAttack('Slash', {
      frequency: 1,
      duration: 10,
      statusModifications: [{ type: 'buff', targetName: 'Expiring Buff', stackChange: -1 }],
    })
    const activeAttack = createMockCoordinatedAttackInAction(ca, 'TestChar', { timeLeft: 10, lastDamageTime: 0 })
    const ctx = buildCtx({
      modifiersInAction: [existingMia],
      coordinatedAttacksInAction: [activeAttack],
      castTime: 1,
    })

    processCoordinatedAttacks(ctx, noopSetDamageEvents)

    expect(ctx.modifiersInAction).toHaveLength(0)
  })

  it('applies per-tick debuff modifications identically to buffs', () => {
    const targetMod = createMockDamageModifier('src-debuff', {
      displayName: 'Weakness',
      type: 'debuff',
      stackingStrategy: { maxStacks: 5, resetTimerOnApplication: false, stacksRemovedEachTime: 1 },
    })
    const existingMia: ModifierInAction = {
      modifier: targetMod,
      applicationTime: 0,
      timeLeft: 10,
      swapsLeft: Infinity,
      currentStacks: 1,
      targetCharacter: null,
    }
    const ca = createMockCoordinatedAttack('Slash', {
      frequency: 1,
      duration: 10,
      statusModifications: [{ type: 'debuff', targetName: 'Weakness', stackChange: 2 }],
    })
    const activeAttack = createMockCoordinatedAttackInAction(ca, 'TestChar', { timeLeft: 10, lastDamageTime: 0 })
    const ctx = buildCtx({
      modifiersInAction: [existingMia],
      coordinatedAttacksInAction: [activeAttack],
      castTime: 1,
    })

    processCoordinatedAttacks(ctx, noopSetDamageEvents)

    // 1 tick * stackChange 2 = +2 stacks → 3 total
    expect(ctx.modifiersInAction[0].currentStacks).toBe(3)
  })

  it('resets timeLeft to timeDuration when stacks are added and resetTimerOnApplication is true', () => {
    const targetMod = createMockDamageModifier('src-buff', {
      displayName: 'Resetting Buff',
      type: 'buff',
      durationStrategy: { type: 'limited', timeDuration: 10 },
      stackingStrategy: { maxStacks: 5, resetTimerOnApplication: true, stacksRemovedEachTime: 1 },
    })
    const existingMia: ModifierInAction = {
      modifier: targetMod,
      applicationTime: 0,
      timeLeft: 2, // almost expired
      swapsLeft: Infinity,
      currentStacks: 1,
      targetCharacter: null,
    }
    const ca = createMockCoordinatedAttack('Slash', {
      frequency: 1,
      duration: 10,
      statusModifications: [{ type: 'buff', targetName: 'Resetting Buff', stackChange: 1 }],
    })
    const activeAttack = createMockCoordinatedAttackInAction(ca, 'TestChar', { timeLeft: 10, lastDamageTime: 0 })
    const ctx = buildCtx({
      modifiersInAction: [existingMia],
      coordinatedAttacksInAction: [activeAttack],
      castTime: 1,
    })

    processCoordinatedAttacks(ctx, noopSetDamageEvents)

    // 1 tick fires, stacks go 1→2, resetTimerOnApplication resets timeLeft to timeDuration
    expect(ctx.modifiersInAction[0].currentStacks).toBe(2)
    expect(ctx.modifiersInAction[0].timeLeft).toBe(10)
  })

  it('does NOT reset timeLeft when resetTimerOnApplication is false', () => {
    const targetMod = createMockDamageModifier('src-buff', {
      displayName: 'Non-Resetting Buff',
      type: 'buff',
      durationStrategy: { type: 'limited', timeDuration: 10 },
      stackingStrategy: { maxStacks: 5, resetTimerOnApplication: false, stacksRemovedEachTime: 1 },
    })
    const existingMia: ModifierInAction = {
      modifier: targetMod,
      applicationTime: 0,
      timeLeft: 2,
      swapsLeft: Infinity,
      currentStacks: 1,
      targetCharacter: null,
    }
    const ca = createMockCoordinatedAttack('Slash', {
      frequency: 1,
      duration: 10,
      statusModifications: [{ type: 'buff', targetName: 'Non-Resetting Buff', stackChange: 1 }],
    })
    const activeAttack = createMockCoordinatedAttackInAction(ca, 'TestChar', { timeLeft: 10, lastDamageTime: 0 })
    const ctx = buildCtx({
      modifiersInAction: [existingMia],
      coordinatedAttacksInAction: [activeAttack],
      castTime: 1,
    })

    processCoordinatedAttacks(ctx, noopSetDamageEvents)

    expect(ctx.modifiersInAction[0].currentStacks).toBe(2)
    expect(ctx.modifiersInAction[0].timeLeft).toBe(2) // unchanged
  })

  it('does NOT reset timeLeft when stacks are removed even if resetTimerOnApplication is true', () => {
    const targetMod = createMockDamageModifier('src-buff', {
      displayName: 'Draining Buff',
      type: 'buff',
      durationStrategy: { type: 'limited', timeDuration: 10 },
      stackingStrategy: { maxStacks: 5, resetTimerOnApplication: true, stacksRemovedEachTime: 1 },
    })
    const existingMia: ModifierInAction = {
      modifier: targetMod,
      applicationTime: 0,
      timeLeft: 7,
      swapsLeft: Infinity,
      currentStacks: 3,
      targetCharacter: null,
    }
    const ca = createMockCoordinatedAttack('Slash', {
      frequency: 1,
      duration: 10,
      statusModifications: [{ type: 'buff', targetName: 'Draining Buff', stackChange: -1 }],
    })
    const activeAttack = createMockCoordinatedAttackInAction(ca, 'TestChar', { timeLeft: 10, lastDamageTime: 0 })
    const ctx = buildCtx({
      modifiersInAction: [existingMia],
      coordinatedAttacksInAction: [activeAttack],
      castTime: 1,
    })

    processCoordinatedAttacks(ctx, noopSetDamageEvents)

    expect(ctx.modifiersInAction[0].currentStacks).toBe(2)
    expect(ctx.modifiersInAction[0].timeLeft).toBe(7) // not reset because stacks were removed
  })
})
