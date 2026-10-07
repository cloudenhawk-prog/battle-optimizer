import type { DamageModifier, ModifierInAction } from '../../types/modifiers'
import type { StepContext } from '../../types/stepContext'
import type { Character, ResolvedCharacter } from '../../types/character'
import type { Action } from '../../types/action'
import type { NegativeStatusInAction } from '../../types/negativeStatus'

// ========== Modifier Helpers =================================================================================================

/**
 * Collects all damage modifiers from various sources (character, action, negative statuses,
 * and ally characters' permanent 'all'-targeted passives).
 * Returns blueprints that need to be converted to ModifierInAction.
 *
 * Ally permanent modifiers with targetStrategy 'all' are included so that passives which
 * amplify a negative status (e.g. Hiyuki's Fine Snow → glacioChafeAmplifyDMG) apply to
 * DoT ticks regardless of which character is currently active.
 */
export function collectAllModifiers(character: Character, action: Action, negativeStatusesInAction: NegativeStatusInAction[], allies: readonly ResolvedCharacter[] = []): DamageModifier[] {
  const characterModifiers = (character.damageModifiers ?? []).map(mod => ({
    ...mod,
    ownerCharacter: mod.ownerCharacter ?? character.name,
  }))

  const actionModifiers = (action.damageModifiers ?? []).map(mod => ({
    ...mod,
    ownerCharacter: mod.ownerCharacter ?? character.name,
  }))

  const negativeStatusModifiers = negativeStatusesInAction
    .filter(ns => ns.currentStacks > 0)
    .flatMap(ns =>
      (ns.negativeStatus.damageModifiers ?? []).map(mod => ({
        ...mod,
        ownerCharacter: mod.ownerCharacter ?? null,
      })),
    )

  // Collect permanent 'all'-targeted modifiers from ally characters.
  // These passives (e.g. Hiyuki's Fine Snow Glacio Chafe amplification) must apply universally,
  // including during DoT ticks when the owning character is off-field.
  const allyPassiveModifiers = allies.flatMap(ally =>
    (ally.damageModifiers ?? [])
      .filter(mod => (!mod.durationStrategy || mod.durationStrategy.type === 'permanent') && mod.targetStrategy === 'all')
      .map(mod => ({
        ...mod,
        ownerCharacter: mod.ownerCharacter ?? ally.name,
      }))
  )

  return [...characterModifiers, ...actionModifiers, ...negativeStatusModifiers, ...allyPassiveModifiers]
}

/**
 * Activates new modifiers by converting blueprints to ModifierInAction.
 * Handles stacking for existing modifiers.
 */
export function activateModifiers(modifiers: DamageModifier[], existingModifiersInAction: ModifierInAction[], ctx: StepContext, applicationTimeOffset: number = 0): ModifierInAction[] {
  const result: ModifierInAction[] = [...existingModifiersInAction]

  for (const modifier of modifiers) {
    // Skip permanent modifiers - they don't need tracking
    // Also skip if durationStrategy is missing (treat as permanent for backwards compatibility)
    if (!modifier.durationStrategy || modifier.durationStrategy.type === 'permanent') {
      continue
    }

    // Respect activation condition — skip if condition is present and returns false
    if (modifier.activationCondition && !modifier.activationCondition(ctx)) {
      continue
    }

    // Check if this modifier already exists
    let existingIndex = result.findIndex(mia => mia.modifier.source === modifier.source && mia.modifier.displayName === modifier.displayName)

    if (existingIndex !== -1) {
      // Modifier exists - handle stacking
      const existing = result[existingIndex]
      const stacking = modifier.stackingStrategy

      // Add stacks (up to max)
      const newStacks = Math.min(existing.currentStacks + 1, stacking.maxStacks)

      // Reset timer if configured
      const newTimeLeft = stacking.resetTimerOnApplication ? (modifier.durationStrategy.type === 'limited' ? (modifier.durationStrategy.timeDuration ?? Infinity) + applicationTimeOffset : Infinity) : existing.timeLeft

      const newSwapsLeft = stacking.resetTimerOnApplication ? (modifier.durationStrategy.type === 'limited' ? (modifier.durationStrategy.numberOfSwaps ?? Infinity) : Infinity) : existing.swapsLeft

      // Remove any existing modifiers whose source matches the removal target (refresh case).
      // This fires on every re-activation, not just on first creation, because the
      // activationCondition already guarantees the prerequisite is present.
      // ownerCharacter scoping ensures that two characters wearing the same set don't
      // accidentally consume each other's tracked buffs.
      if (modifier.removesModifierSourceOnActivation) {
        const removeSource = modifier.removesModifierSourceOnActivation
        for (let i = result.length - 1; i >= 0; i--) {
          if (result[i].modifier.source === removeSource && result[i].modifier.ownerCharacter === modifier.ownerCharacter) {
            result.splice(i, 1)
            // Adjust existingIndex if the splice shifted it.
            if (i < existingIndex) existingIndex--
            break
          }
        }
      }

      result[existingIndex] = {
        ...existing,
        currentStacks: newStacks,
        timeLeft: newTimeLeft,
        swapsLeft: newSwapsLeft,
        // Re-compute frozen activation stats when the modifier duration is reset
        ...(modifier.statsOnActivation && stacking.resetTimerOnApplication
          ? { activationStats: modifier.statsOnActivation(ctx) }
          : {}),
        // Re-trigger on-cast heal proc when the modifier duration is reset
        ...(modifier.healProc && stacking.resetTimerOnApplication
          ? { lastHealProcTime: ctx.fromTime - modifier.healProc.frequency }
          : {}),
      }
    } else {
      // New modifier - create ModifierInAction

      // Remove any existing modifiers whose source matches the removal target.
      // ownerCharacter scoping ensures that two characters wearing the same set don't
      // accidentally consume each other's tracked buffs.
      if (modifier.removesModifierSourceOnActivation) {
        const removeSource = modifier.removesModifierSourceOnActivation
        for (let i = result.length - 1; i >= 0; i--) {
          if (result[i].modifier.source === removeSource && result[i].modifier.ownerCharacter === modifier.ownerCharacter) {
            result.splice(i, 1)
            break
          }
        }
      }

      const limited = modifier.durationStrategy.type === 'limited' ? modifier.durationStrategy : null

      result.push({
        modifier,
        applicationTime: ctx.fromTime,
        timeLeft: limited != null ? limited.timeDuration + applicationTimeOffset : Infinity,
        swapsLeft: limited?.numberOfSwaps ?? Infinity,
        currentStacks: 1,
        targetCharacter: ctx.lastSwappedToCharacter ?? null,
        // Freeze stat contribution at activation time when statsOnActivation is defined
        ...(modifier.statsOnActivation ? { activationStats: modifier.statsOnActivation(ctx) } : {}),
        // Place lastHealProcTime one frequency behind so the first tick fires immediately at applicationTime
        ...(modifier.healProc ? { lastHealProcTime: ctx.fromTime - modifier.healProc.frequency } : {}),
      })
    }
  }

  return result
}

/**
 * Updates modifiers based on time passing.
 * Removes stacks and expires modifiers as needed.
 */
export function updateModifiersForTime(modifiersInAction: ModifierInAction[], fromTime: number, toTime: number): ModifierInAction[] {
  const elapsed = toTime - fromTime
  const result: ModifierInAction[] = []

  for (const mia of modifiersInAction) {
    const stacking = mia.modifier.stackingStrategy
    const newTimeLeft = mia.timeLeft - elapsed

    // Check if time expired
    if (newTimeLeft <= 0 && mia.timeLeft !== Infinity) {
      // Remove stacks according to strategy
      const newStacks = Math.max(0, mia.currentStacks - stacking.stacksRemovedEachTime)

      if (newStacks > 0) {
        // Still has stacks - reset timer if it's time-based
        const duration = mia.modifier.durationStrategy.type === 'limited' ? (mia.modifier.durationStrategy.timeDuration ?? Infinity) : Infinity

        result.push({
          ...mia,
          currentStacks: newStacks,
          timeLeft: duration,
        })
      }
      // else: modifier fully expired, don't add to result
    } else {
      // Time hasn't expired yet
      result.push({
        ...mia,
        timeLeft: newTimeLeft,
      })
    }
  }

  return result
}

/**
 * Updates modifiers based on character swap.
 * Handles swap-based expiration and nextSwap target strategy.
 */
export function updateModifiersForSwap(modifiersInAction: ModifierInAction[], swappedToCharacter: string | null): ModifierInAction[] {
  const result: ModifierInAction[] = []

  for (const mia of modifiersInAction) {
    const stacking = mia.modifier.stackingStrategy

    // For 'nextSwap' modifiers that haven't claimed a target yet, this swap IS the claim.
    // Assign the target without decrementing swapsLeft — the counter starts after the target is set.
    if (mia.modifier.targetStrategy === 'nextSwap' && mia.targetCharacter === null) {
      result.push({ ...mia, targetCharacter: swappedToCharacter })
      continue
    }

    const newSwapsLeft = mia.swapsLeft === Infinity ? Infinity : mia.swapsLeft - 1

    // Check if swaps expired
    if (newSwapsLeft <= 0 && mia.swapsLeft !== Infinity) {
      // Remove stacks according to strategy
      const newStacks = Math.max(0, mia.currentStacks - stacking.stacksRemovedEachTime)

      if (newStacks > 0) {
        // Still has stacks - reset swap count if it's swap-based
        const swapDuration = mia.modifier.durationStrategy.type === 'limited' ? (mia.modifier.durationStrategy.numberOfSwaps ?? Infinity) : Infinity

        result.push({
          ...mia,
          currentStacks: newStacks,
          swapsLeft: swapDuration,
          targetCharacter: swappedToCharacter,
        })
      }
      // else: modifier fully expired, don't add to result
    } else {
      // Swaps haven't expired yet
      // Update targetCharacter for nextSwap modifiers
      const shouldUpdateTarget = mia.modifier.targetStrategy === 'nextSwap'

      result.push({
        ...mia,
        swapsLeft: newSwapsLeft,
        targetCharacter: shouldUpdateTarget ? swappedToCharacter : mia.targetCharacter,
      })
    }
  }

  return result
}

/**
 * Filters modifiers based on target strategy and current context.
 * Used before applying modifiers in damage calculations.
 */
export function filterApplicableModifiers(modifiersInAction: ModifierInAction[], permanentModifiers: DamageModifier[], ctx: StepContext): DamageModifier[] {
  const activeCharacter = ctx.character.name
  const result: DamageModifier[] = []

  // Add permanent modifiers that match target strategy
  for (const modifier of permanentModifiers) {
    if (shouldApplyModifier(modifier, activeCharacter, null)) {
      result.push(modifier)
    }
  }

  // Add active limited modifiers that match target strategy
  for (const mia of modifiersInAction) {
    if (mia.currentStacks > 0 && shouldApplyModifier(mia.modifier, activeCharacter, mia.targetCharacter)) {
      // Use frozen activation-time stats if present, otherwise fall back to static characterStats
      result.push(mia.activationStats ? { ...mia.modifier, characterStats: mia.activationStats } : mia.modifier)
    }
  }

  return result
}

/**
 * Determines if a modifier should apply based on target strategy.
 */
function shouldApplyModifier(modifier: DamageModifier, activeCharacter: string, targetCharacter: string | null): boolean {
  const { targetStrategy, ownerCharacter } = modifier

  switch (targetStrategy) {
    case 'self':
      return ownerCharacter === activeCharacter
    case 'active':
      return true
    case 'all':
      return true
    case 'activeAlly':
      return ownerCharacter !== activeCharacter
    case 'allExceptSelf':
      return ownerCharacter !== activeCharacter
    case 'nextSwap':
      // Only applies if targetCharacter is set and matches active
      return targetCharacter !== null && targetCharacter === activeCharacter
    default:
      return false
  }
}

/**
 * Multiplies modifier stats by current stack count.
 * Used in damage calculations to properly scale stacking modifiers.
 */
export function applyStackMultiplier(modifier: DamageModifier, modifiersInAction: ModifierInAction[]): DamageModifier {
  // Find the ModifierInAction for this modifier
  const mia = modifiersInAction.find(m => m.modifier.source === modifier.source && m.modifier.displayName === modifier.displayName)

  if (!mia || mia.currentStacks === 1) {
    return modifier
  }

  // Multiply all stat values by stack count
  const stackMultiplier = mia.currentStacks
  const multipliedCharacterStats = modifier.characterStats ? Object.fromEntries(Object.entries(modifier.characterStats).map(([key, value]) => [key, (value as number) * stackMultiplier])) : undefined

  const multipliedEnemyStats = modifier.enemyStats ? Object.fromEntries(Object.entries(modifier.enemyStats).map(([key, value]) => [key, (value as number) * stackMultiplier])) : undefined

  return {
    ...modifier,
    characterStats: multipliedCharacterStats,
    enemyStats: multipliedEnemyStats,
  }
}
