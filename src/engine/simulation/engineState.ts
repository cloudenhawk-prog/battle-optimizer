// Cross-row simulation state that lives outside snapshots (active modifiers, statuses, coordinated attacks).
import type { NegativeStatusInAction } from '../../types/negativeStatus'
import type { ModifierInAction } from '../../types/modifiers'
import type { CoordinatedAttackInAction } from '../../types/coordinatedAttack'
import { negativeStatuses as negativeStatusesData } from '../../data/negativeStatuses'

// ========== Type =============================================================================================================

/**
 * Holds the mutable cross-step simulation state that lives outside of individual snapshots.
 * Pass this into engineStep and use the returned updated copy for each subsequent step.
 */
export type EngineState = {
  negativeStatusesInAction: NegativeStatusInAction[]
  modifiersInAction: ModifierInAction[]
  coordinatedAttacksInAction: CoordinatedAttackInAction[]
}

// ========== Init =============================================================================================================

/**
 * Creates a fresh EngineState from the global negative status definitions.
 * Call this once at the start of a simulation (MCTS rollout, or rotation editor init).
 */
export function initEngineState(): EngineState {
  return {
    negativeStatusesInAction: Object.values(negativeStatusesData).map(status => ({
      negativeStatus: status,
      applicationTime: -1,
      timeLeft: 0,
      currentStacks: 0,
      lastDamageTime: 0,
    })),
    modifiersInAction: [],
    coordinatedAttacksInAction: [],
  }
}
