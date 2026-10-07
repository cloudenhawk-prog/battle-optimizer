// Applies aggregated buff/debuff stack edits (statusModifications) to active modifiers, e.g. an action ending a buff.
import type { StepContext } from '../../../types/stepContext'
import type { AggregatedStatusModifications } from './statusModifications'
import { applyModifierStackChange } from '../../modifiers/modifierStackChange'
import { clearForteGrantsForRemovedModifiers } from '../forteGrants'

// ========== Buff/Debuff Stack Modifications =================================================================================

export function helpModifierStatusModifications(ctx: StepContext, statusModifications: AggregatedStatusModifications): void {
  const types = ['buff', 'debuff'] as const
  const anyChanges = types.some(t => Object.keys(statusModifications[t]).length > 0)
  if (!anyChanges) return

  const applied: { type: string; targetName: string; requestedStackChange: number; effectiveDelta: number; stacksBefore: number; stacksAfter: number }[] = []

  const modifiersBefore = ctx.modifiersInAction

  // Targets are matched by modifier displayName; entries that end at 0 stacks are removed
  ctx.modifiersInAction = ctx.modifiersInAction
    .map(mia => {
      const bucket = statusModifications[mia.modifier.type as 'buff' | 'debuff']
      if (!bucket) return mia
      const changes = bucket[mia.modifier.displayName]
      if (!changes) return mia
      // Duration-related modifications are not currently supported for buffs/debuffs.
      // Log and ignore them explicitly to avoid silent no-ops.
      if (changes.durationChange !== 0 || changes.refreshDuration) {
        ctx.logs.push({
          resolver: 'helpModifierStatusModifications',
          message: 'Duration modifications for buffs/debuffs are not supported and will be ignored.',
          details: {
            type: mia.modifier.type,
            targetName: mia.modifier.displayName,
            durationChange: changes.durationChange,
            refreshDuration: changes.refreshDuration,
          },
        })
      }
      if (changes.stackChange === 0) return mia
      const updated = applyModifierStackChange(mia, changes.stackChange)
      const effectiveDelta = updated.currentStacks - mia.currentStacks

      applied.push({ type: mia.modifier.type, targetName: mia.modifier.displayName, requestedStackChange: changes.stackChange, effectiveDelta, stacksBefore: mia.currentStacks, stacksAfter: updated.currentStacks })
      return updated
    })
    .filter(mia => mia.currentStacks > 0)

  // Clear forteGrants for any modifier with clearsForteGrantsOnExpiry that was explicitly removed
  clearForteGrantsForRemovedModifiers(ctx, modifiersBefore)

  if (applied.length > 0) {
    ctx.logs.push({
      resolver: 'helpModifierStatusModifications',
      message: 'Buff/debuff stack modifications applied',
      details: { applied },
    })
  }
}
