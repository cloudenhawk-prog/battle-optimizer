// Periodic heal-proc ticks (e.g. Syntony Field) that activate gear-injected proc modifiers on every tick.
import type { StepContext } from '../../../types/stepContext'
import { activateModifiers } from '../../modifiers/modifierHelpers'

// ========== Heal Proc Modifiers =============================================================================================

/**
 * Ticks periodic heal procs from active heal-proc modifiers (e.g. Syntony Field).
 *
 * For each ModifierInAction that carries `healProc`:
 *  - Computes how many ticks fall in [lastHealProcTime + frequency, toTime].
 *  - For each tick: calls activateModifiers on healProc.procModifiers so gear-injected
 *    buffs (e.g. Starfield Calibrator crit DMG) are activated or refreshed.
 *  - Updates lastHealProcTime on the live MIA entry.
 *
 * Runs after helpModifierStatusModifications so that any modifier removed this step
 * (e.g. Liberation destroying Syntony Field) does not fire a final proc.
 */
export function helpHealProcModifiers(ctx: StepContext): void {
  // Snapshot to avoid processing procs activated within this same step
  const snapshot = [...ctx.modifiersInAction]
  for (const mia of snapshot) {
    const { healProc } = mia.modifier
    if (!healProc || healProc.procModifiers.length === 0) continue

    const lastProcTimeBase = mia.lastHealProcTime ?? (mia.applicationTime - healProc.frequency)
    if (lastProcTimeBase + healProc.frequency > ctx.toTime) continue

    let lastProcTime = lastProcTimeBase
    while (lastProcTime + healProc.frequency <= ctx.toTime) {
      lastProcTime += healProc.frequency
      ctx.modifiersInAction = activateModifiers(healProc.procModifiers, ctx.modifiersInAction, ctx)
    }

    // activateModifiers sets each proc-modifier's timeLeft = timeDuration measured from ctx.fromTime,
    // but the tick actually fires at lastProcTime (which may be > ctx.fromTime for long steps).
    // resolveModifierState will later subtract (toTime - fromTime) from timeLeft, so we pre-compensate
    // by adding (lastProcTime - fromTime) here, making the effective duration start from lastProcTime.
    const tickOffset = lastProcTime - ctx.fromTime
    if (tickOffset > 0) {
      for (const procMod of healProc.procModifiers) {
        if (!procMod.durationStrategy || procMod.durationStrategy.type === 'permanent') continue
        const procIdx = ctx.modifiersInAction.findIndex(
          m => m.modifier.source === procMod.source && m.modifier.displayName === procMod.displayName,
        )
        if (procIdx !== -1 && ctx.modifiersInAction[procIdx].timeLeft !== Infinity) {
          ctx.modifiersInAction[procIdx] = {
            ...ctx.modifiersInAction[procIdx],
            timeLeft: ctx.modifiersInAction[procIdx].timeLeft + tickOffset,
          }
        }
      }
    }

    // Update lastHealProcTime on the live entry (activateModifiers may have replaced the object)
    const liveIndex = ctx.modifiersInAction.findIndex(
      m => m.modifier.source === mia.modifier.source && m.modifier.displayName === mia.modifier.displayName,
    )
    if (liveIndex !== -1) {
      ctx.modifiersInAction[liveIndex] = { ...ctx.modifiersInAction[liveIndex], lastHealProcTime: lastProcTime }
    }
  }
}
