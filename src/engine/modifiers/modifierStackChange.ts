// Applies an explicit stack delta (from a statusModification) to one active modifier: clamp to [0, max], maybe reset timers.
import type { ModifierInAction } from '../../types/modifiers'

// ========== Apply Stack Change ===============================================================================================

/**
 * Returns a copy of `mia` with `stackChange` applied, clamped to [0, maxStacks].
 * When stacks are actually added and the modifier has resetTimerOnApplication, timeLeft/swapsLeft
 * reset to the configured duration (mirrors activateModifiers, but WITHOUT the cast-time offset).
 * Callers drop entries that end at 0 stacks.
 */
export function applyModifierStackChange(mia: ModifierInAction, stackChange: number): ModifierInAction {
  const maxStacks = mia.modifier.stackingStrategy?.maxStacks
  const unclampedStacks = mia.currentStacks + stackChange
  const clampedStacks = maxStacks != null ? Math.min(Math.max(unclampedStacks, 0), maxStacks) : Math.max(unclampedStacks, 0)
  const effectiveDelta = clampedStacks - mia.currentStacks

  // When stacks are added, mirror activateModifiers: reset timers if resetTimerOnApplication is set
  const isAddingStacks = effectiveDelta > 0
  const shouldResetTimer = isAddingStacks && mia.modifier.stackingStrategy?.resetTimerOnApplication
  const limited = shouldResetTimer && mia.modifier.durationStrategy?.type === 'limited' ? mia.modifier.durationStrategy : null
  const newTimeLeft = shouldResetTimer ? (limited?.timeDuration ?? Infinity) : mia.timeLeft
  const newSwapsLeft = shouldResetTimer ? (limited?.numberOfSwaps ?? Infinity) : mia.swapsLeft

  return { ...mia, currentStacks: clampedStacks, timeLeft: newTimeLeft, swapsLeft: newSwapsLeft }
}
