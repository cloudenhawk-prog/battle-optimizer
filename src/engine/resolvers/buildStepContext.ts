// R0 buildStepContext: builds the per-row StepContext every resolver reads/writes, and applies swap-based modifier expiry.
import type { StepContext } from '../../types/stepContext'
import type { ModifierInAction } from '../../types/modifiers'
import type { Snapshot } from '../../types/snapshot'
import type { Action } from '../../types/action'
import type { ResolvedCharacter } from '../../types/character'
import type { Enemy } from '../../types/enemy'
import type { NegativeStatusInAction } from '../../types/negativeStatus'
import type { CoordinatedAttackInAction } from '../../types/coordinatedAttack'
import { updateModifiersForSwap } from '../modifiers/modifierHelpers'

// ========== Resolver 0: Build Step Context ==================================================================================

export function buildStepContext(snapshotId: number, current: Snapshot, prev: Snapshot, character: ResolvedCharacter, action: Action, enemy: Enemy, negativeStatusesInAction: NegativeStatusInAction[], modifiersInAction: ModifierInAction[], characterMap: Record<string, ResolvedCharacter>, coordinatedAttacksInAction: CoordinatedAttackInAction[] = []): StepContext {
  const fromTime = prev.toTime
  const toTime = fromTime + action.castTime
  current.action = action.name
  current.resolvedDisplayName = action.displayName

  const allies = []
  for (const [name, char] of Object.entries(characterMap)) {
    if (name !== character.name) {
      allies.push(char)
    }
  }

  // Determine if this is a swap: character changed from prev to current
  // Intro actions are swap-triggered, so we include them
  const isSwap = prev.character && prev.character !== character.name
  const lastSwappedToCharacter = isSwap ? character.name : undefined

  // Handle swap-based modifier expiration
  let updatedModifiersInAction = modifiersInAction
  if (isSwap && lastSwappedToCharacter) {
    updatedModifiersInAction = updateModifiersForSwap(modifiersInAction, lastSwappedToCharacter)
  }

  const ctx: StepContext = {
    snapshotId,

    current,
    prev,

    character,
    allies,
    enemy,

    action,

    fromTime,
    toTime,

    modifiersInAction: updatedModifiersInAction,
    negativeStatusesInAction,
    coordinatedAttacksInAction,

    permanentModifiers: [],
    damageModifiers: [],
    aggregatedCharacterModifiers: {},
    aggregatedEnemyModifiers: {},

    damageEvents: [],

    lastSwappedToCharacter,

    pendingEnergyCooldowns: [],

    logs: [],
  }

  ctx.logs.push({
    resolver: 'buildStepContext',
    message: `Context built for snapshot ${snapshotId}`,
    details: { character: character.name, action: action.name, isSwap },
  })

  return ctx
}
