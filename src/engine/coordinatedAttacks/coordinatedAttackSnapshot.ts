// Writes active/inactive state, time left and swap-required flags of all coordinated attacks into the row.
import type { StepContext } from '../../types/stepContext'
import { makeCoordinatedAttackKey } from './coordinatedAttackKey'

// ========== Snapshot State ==================================================================================================

/**
 * Writes the current active/inactive state and remaining duration of all tracked
 * coordinated attacks into the snapshot so it can be displayed in the rotation table.
 */
export function updateCoordinatedAttackSnapshot(ctx: StepContext): void {
  const coordAttacks: Record<string, number> = {}
  const coordAttacksTimeLeft: Record<string, number> = {}
  const coordAttacksSwapRequired: Record<string, boolean> = {}

  for (const caia of ctx.coordinatedAttacksInAction) {
    const key = makeCoordinatedAttackKey(caia.ownerCharacter, caia.coordinatedAttack.name)
    coordAttacks[key] = caia.applicationTime !== -1 ? 1 : 0
    coordAttacksTimeLeft[key] = caia.timeLeft
    coordAttacksSwapRequired[key] = caia.coordinatedAttack.swapRequired ?? false
  }

  ctx.current.coordinatedAttacks = coordAttacks
  ctx.current.coordinatedAttacksTimeLeft = coordAttacksTimeLeft
  ctx.current.coordinatedAttacksSwapRequired = coordAttacksSwapRequired
}
