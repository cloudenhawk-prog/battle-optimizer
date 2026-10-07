// R7 resolveResourceMilestones: adds modifier stacks when the active character's resource crosses declared thresholds.
import type { StepContext } from '../../types/stepContext'

// ========== Resolver 7: Resource Milestones =================================================================================

/**
 * After resources are resolved, checks each ResourceMilestoneDef on the active character.
 * For each definition, counts how many thresholds the resource crossed this step (prev < threshold ≤ curr)
 * and adds that many stacks to the corresponding modifier in modifiersInAction.
 *
 * Rules encoded per-definition on the character:
 *   - Timer starts on the first stack. Adding stacks to an existing entry keeps its timer
 *     (resetTimerOnApplication is NOT consulted here).
 *   - All stacks expire together via stacksRemovedEachTime on the modifier.
 *   - Explicit removal (e.g. on Liberation) is handled by statusModifications on the relevant action.
 *
 * Runs after resolveResources (needs this step's energies) and before resolveModifierState,
 * which then subtracts this step's cast time from a freshly created entry's timer.
 */
export function resolveResourceMilestones(ctx: StepContext): void {
  const milestonesDefs = ctx.character.resourceMilestones
  if (!milestonesDefs || milestonesDefs.length === 0) return

  for (const { resourceType, milestones, modifier } of milestonesDefs) {
    const charName = ctx.character.name
    const prevValue = ctx.prev.charactersEnergies?.[charName]?.[resourceType] ?? 0
    const currValue = ctx.current.charactersEnergies?.[charName]?.[resourceType] ?? 0

    const count = milestones.filter(m => prevValue < m && currValue >= m).length
    if (count === 0) continue

    const existingIndex = ctx.modifiersInAction.findIndex(mia => mia.modifier.source === modifier.source)
    if (existingIndex !== -1) {
      const existing = ctx.modifiersInAction[existingIndex]
      const updated = [...ctx.modifiersInAction]
      updated[existingIndex] = {
        ...existing,
        currentStacks: Math.min(existing.currentStacks + count, modifier.stackingStrategy.maxStacks),
      }
      ctx.modifiersInAction = updated
    } else {
      const limited = modifier.durationStrategy.type === 'limited' ? modifier.durationStrategy : null
      ctx.modifiersInAction = [
        ...ctx.modifiersInAction,
        {
          modifier,
          applicationTime: ctx.fromTime,
          timeLeft: limited?.timeDuration ?? Infinity,
          swapsLeft: limited?.numberOfSwaps ?? Infinity,
          currentStacks: Math.min(count, modifier.stackingStrategy.maxStacks),
          targetCharacter: null,
        },
      ]
    }

    const finalStacks = ctx.modifiersInAction.find(mia => mia.modifier.source === modifier.source)?.currentStacks ?? 0
    ctx.logs.push({
      resolver: 'resolveResourceMilestones',
      message: `[${charName}] ${resourceType} milestone(s) crossed: +${count} stack(s) of '${modifier.displayName}', total: ${finalStacks}`,
      details: { resourceType, prevValue, currValue, count, finalStacks },
    })
  }
}
