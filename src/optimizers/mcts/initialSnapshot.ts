// Row-0 snapshot for MCTS searches (and scripts/run-mcts.ts): starting energies only, everything else empty.
import type { ResolvedCharacter } from '../../types/character'
import type { Snapshot } from '../../types/snapshot'
import type { EnergyType } from '../../types/baseTypes'

/**
 * Builds the minimal valid initial snapshot for an MCTS simulation.
 * Seeds starting energies from character.startingEnergies (capped at max); all other fields are empty.
 *
 * Deliberately differs from the editor's createEmptySnapshot: permanent-modifier pre-evaluation is
 * skipped. The first resolver step writes the correct live values, so this only affects row-0
 * display, not computed DPS. Keep it this way — MCTS golden results depend on it.
 */
export function createMCTSInitialSnapshot(team: ResolvedCharacter[]): Snapshot {
  const charactersEnergies: Record<string, Partial<Record<EnergyType, number>>> = {}
  for (const char of team) {
    const energies: Partial<Record<EnergyType, number>> = {}
    const starting = char.startingEnergies?.(char.sequence) ?? {}
    for (const [key, maxVal] of Object.entries(char.maxEnergies) as [EnergyType, number][]) {
      energies[key] = Math.min(starting[key] ?? 0, maxVal)
    }
    charactersEnergies[char.name] = energies
  }

  return {
    id: '0',
    character: '',
    action: '',
    fromTime: 0,
    toTime: 0,
    damage: 0,
    dps: 0,
    charactersEnergies,
    buffs: {},
    buffsTimeLeft: {},
    buffsSwapsLeft: {},
    buffsMaxStacks: {},
    buffsActivationStats: {},
    buffsTargetCharacter: {},
    debuffs: {},
    debuffsTimeLeft: {},
    debuffsSwapsLeft: {},
    debuffsMaxStacks: {},
    negativeStatuses: {},
    negativeStatusesTimeLeft: {},
    negativeStatusesMaxStacks: {},
    coordinatedAttacks: {},
    coordinatedAttacksTimeLeft: {},
    coordinatedAttacksSwapRequired: {},
    charactersCooldowns: {},
    charactersActionStacks: {},
    charactersActionStacksConfig: {},
    charactersPositions: {},
    charactersPersistentUntil: {},
    charactersLastAction: {},
    charactersRequiresSwapOut: {},
    charactersForms: {},
    charactersSwapCooldownUntil: {},
    charactersAttemptFollowUp: {},
    charactersRestrictNextTo: {},
    charactersComboWindows: {},
    charactersForteGrants: {},
    charactersComboChainTags: {},
    charactersOffFieldSince: {},
    offFieldTriggerEvents: {},
  }
}
