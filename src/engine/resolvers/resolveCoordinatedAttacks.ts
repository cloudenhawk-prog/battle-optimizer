// R5 resolveCoordinatedAttacks: activates/refreshes coordinated attacks from this action and ticks all active ones.
import type { StepContext } from '../../types/stepContext'
import { activateCoordinatedAttacks, processCoordinatedAttacks, updateCoordinatedAttackSnapshot } from '../coordinatedAttacks/coordinatedAttackHelpers'

// ========== Resolver 5: Coordinated Attacks =================================================================================

/**
 * Ticks all active coordinated attacks for the current step window [fromTime, toTime].
 *
 * Runs after resolveSideEffectsAndStatuses so that ctx.damageModifiers and
 * ctx.aggregatedCharacterModifiers are already populated. Runs before resolveResources so
 * that per-hit energy is stacked on top of the main action energy.
 */
export function resolveCoordinatedAttacks(ctx: StepContext): void {
  activateCoordinatedAttacks(ctx)
  processCoordinatedAttacks(ctx)
  updateCoordinatedAttackSnapshot(ctx)

  ctx.logs.push({
    resolver: 'resolveCoordinatedAttacks',
    message: `Coordinated attacks processed: ${ctx.coordinatedAttacksInAction.filter(a => a.applicationTime !== -1).length} active`,
    details: {
      active: ctx.coordinatedAttacksInAction.filter(a => a.applicationTime !== -1).map(a => ({ name: a.coordinatedAttack.name, owner: a.ownerCharacter, timeLeft: a.timeLeft })),
    },
  })
}
