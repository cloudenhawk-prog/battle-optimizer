import type { Snapshot } from '../../types/snapshot'
import type { ModifierInAction, DamageModifier } from '../../types/modifiers'
import type { CharacterStats } from '../../types/stats'
import type { StepContext } from '../../types/stepContext'

// ========== Modifier State Helpers ===========================================================================================

/**
 * Extracts modifier stacks, time left, swaps left, and max stacks from a snapshot.
 * Returns separate objects for buffs and debuffs.
 */
export function getModifierStacks(snapshot: Snapshot): {
  buffs: Record<string, number>
  debuffs: Record<string, number>
} {
  return {
    buffs: { ...snapshot.buffs },
    debuffs: { ...snapshot.debuffs },
  }
}

/**
 * Updates snapshot with current modifier state from ModifierInAction array.
 * Also includes permanent modifiers that are currently active (condition > 0).
 * Similar to updateNegativeStatusStacks but for buffs/debuffs.
 */
export function updateModifierStacks(snapshot: Snapshot, modifiersInAction: ModifierInAction[], permanentModifiers: DamageModifier[], ctx: StepContext): void {
  // Initialize all tracking records
  const buffs: Record<string, number> = {}
  const buffsTimeLeft: Record<string, number> = {}
  const buffsSwapsLeft: Record<string, number> = {}
  const buffsMaxStacks: Record<string, number> = {}
  const buffsActivationStats: Record<string, Partial<CharacterStats>> = {}
  const buffsTargetCharacter: Record<string, string | null> = {}

  const debuffs: Record<string, number> = {}
  const debuffsTimeLeft: Record<string, number> = {}
  const debuffsSwapsLeft: Record<string, number> = {}
  const debuffsMaxStacks: Record<string, number> = {}

  // Process each active limited modifier
  for (const mia of modifiersInAction) {
    const displayName = mia.modifier.displayName
    const key = displayName.replace(/\s+/g, '') // Remove spaces to match column keys
    const type = mia.modifier.type
    const stacks = mia.currentStacks
    const timeLeft = mia.timeLeft
    const swapsLeft = mia.swapsLeft
    const maxStacks = mia.modifier.stackingStrategy.maxStacks

    if (type === 'buff') {
      buffs[key] = stacks
      buffsTimeLeft[key] = timeLeft
      buffsSwapsLeft[key] = swapsLeft
      buffsMaxStacks[key] = maxStacks
      const rawStats = mia.activationStats ?? mia.modifier.characterStats
      if (rawStats) {
        const conditionValue = mia.modifier.condition(ctx)
        if (conditionValue === 1) {
          buffsActivationStats[key] = rawStats
        } else {
          const scaled: Partial<CharacterStats> = {}
          for (const [stat, val] of Object.entries(rawStats) as [keyof CharacterStats, number][]) {
            scaled[stat] = (val as number) * conditionValue
          }
          buffsActivationStats[key] = scaled
        }
      }
      if (mia.modifier.targetStrategy === 'nextSwap') buffsTargetCharacter[key] = mia.targetCharacter
    } else if (type === 'debuff') {
      debuffs[key] = stacks
      debuffsTimeLeft[key] = timeLeft
      debuffsSwapsLeft[key] = swapsLeft
      debuffsMaxStacks[key] = maxStacks
    }
  }

  // Process permanent modifiers - evaluate their condition to determine if active
  for (const modifier of permanentModifiers) {
    const displayName = modifier.displayName
    const key = displayName.replace(/\s+/g, '') // Remove spaces to match column keys
    const type = modifier.type
    const conditionValue = modifier.condition(ctx)
    const maxStacks = modifier.stackingStrategy.maxStacks

    // Only track if condition is active (returns > 0)
    if (conditionValue > 0) {
      if (type === 'buff') {
        buffs[key] = 1 // Permanent modifiers show 1 stack when active (not the condition value)
        buffsTimeLeft[key] = Infinity
        buffsSwapsLeft[key] = Infinity
        buffsMaxStacks[key] = maxStacks
        if (modifier.characterStats) {
          // Scale each stat by the condition multiplier so the tooltip reflects the true effective value
          const scaled: Partial<CharacterStats> = {}
          for (const [stat, val] of Object.entries(modifier.characterStats) as [keyof CharacterStats, number][]) {
            scaled[stat] = val * conditionValue
          }
          buffsActivationStats[key] = scaled
        }
      } else if (type === 'debuff') {
        debuffs[key] = 1 // Permanent modifiers show 1 stack when active (not the condition value)
        debuffsTimeLeft[key] = Infinity
        debuffsSwapsLeft[key] = Infinity
        debuffsMaxStacks[key] = maxStacks
      }
    }
  }

  // Update snapshot with all modifier data
  snapshot.buffs = buffs
  snapshot.buffsTimeLeft = buffsTimeLeft
  snapshot.buffsSwapsLeft = buffsSwapsLeft
  snapshot.buffsMaxStacks = buffsMaxStacks
  snapshot.buffsActivationStats = buffsActivationStats
  snapshot.buffsTargetCharacter = buffsTargetCharacter

  snapshot.debuffs = debuffs
  snapshot.debuffsTimeLeft = debuffsTimeLeft
  snapshot.debuffsSwapsLeft = debuffsSwapsLeft
  snapshot.debuffsMaxStacks = debuffsMaxStacks
}
