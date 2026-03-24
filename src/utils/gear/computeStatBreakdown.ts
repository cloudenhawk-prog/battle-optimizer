import type { Character } from '../../types/character'
import type { CharacterStats } from '../../types/stats'
import type { Snapshot } from '../../types/snapshot'
import type { DamageModifier } from '../../types/modifiers'
import { aggregateStat } from '../hooks/resolvers'
import { mergeStats } from '../calculators/damageCalculator'

// ========== Types ============================================================================================================

export type GearStatBreakdown = {
  weapon: Partial<CharacterStats>
  echoes: Partial<CharacterStats>
  setBonus: Partial<CharacterStats>
  passiveMods: Partial<CharacterStats>
}

export type ActiveModifierBreakdown = {
  selfBuffs: Partial<CharacterStats>
  teamBuffs: Partial<CharacterStats>
}

// ========== Gear Stat Breakdown ==============================================================================================

/**
 * Recomputes per-source stat contributions directly from the preserved gear data.
 * Does NOT read character.stats — derives each source independently.
 */
export function computeGearStatBreakdown(character: Character): GearStatBreakdown {
  const { gear, name, inherentStats, flattenedPassiveModifiers } = character
  const slots = gear.echoSlots

  // Weapon
  const weapon: Partial<CharacterStats> = { ...gear.weapon.stats }

  // Echoes: sum all slot contributions
  let echoes: Partial<CharacterStats> = {}
  for (const slotNum of [1, 2, 3, 4, 5] as const) {
    const echo = slots[slotNum]
    if (!echo) continue

    echoes = mergePartialStats(echoes, echo.baseStats)
    echoes = mergePartialStats(echoes, echo.subStats)

    if (slotNum === 1 && echo.firstSlotStats) {
      echoes = mergePartialStats(echoes, echo.firstSlotStats)
    }

    if (echo.conditionalStats?.condition(name)) {
      echoes = mergePartialStats(echoes, echo.conditionalStats.stats)
    }
  }

  // Set bonus (only when all 5 slots are filled)
  let setBonus: Partial<CharacterStats> = {}
  const allFilled = slots[1] && slots[2] && slots[3] && slots[4] && slots[5]
  if (allFilled && gear.setBonus?.stats) {
    setBonus = { ...gear.setBonus.stats }
  }

  // Passive mods: inherent stats + flattened passive modifier stats
  let passiveMods: Partial<CharacterStats> = { ...inherentStats }
  for (const mod of flattenedPassiveModifiers ?? []) {
    if (mod.characterStats) {
      passiveMods = mergePartialStats(passiveMods, mod.characterStats)
    }
  }

  return { weapon, echoes, setBonus, passiveMods }
}

// ========== Active Modifier Breakdown ========================================================================================

/**
 * Derives active modifier stat contributions from snapshot.buffs/debuffs.
 * Looks up modifier blueprints from all characters' damageModifiers and matches them
 * by displayName. Multiplies characterStats by the stack count from the snapshot.
 */
export function computeActiveModifierBreakdown(
  character: Character,
  snapshot: Snapshot | null,
  allCharacters: Character[],
): ActiveModifierBreakdown {
  if (!snapshot) return { selfBuffs: {}, teamBuffs: {} }

  // Collect all modifier blueprints from all characters
  const allModifiers: DamageModifier[] = []
  for (const char of allCharacters) {
    for (const mod of char.damageModifiers ?? []) {
      allModifiers.push({ ...mod, ownerCharacter: mod.ownerCharacter ?? char.name })
    }
    for (const mod of char.flattenedPassiveModifiers ?? []) {
      allModifiers.push({ ...mod, ownerCharacter: mod.ownerCharacter ?? char.name })
    }
  }

  let selfBuffs: Partial<CharacterStats> = {}
  let teamBuffs: Partial<CharacterStats> = {}

  const activeEntries: Array<{ displayName: string; stacks: number; type: 'buff' | 'debuff' }> = [
    ...Object.entries(snapshot.buffs).map(([key, stacks]) => ({ displayName: key, stacks, type: 'buff' as const })),
    ...Object.entries(snapshot.debuffs).map(([key, stacks]) => ({ displayName: key, stacks, type: 'debuff' as const })),
  ]

  for (const entry of activeEntries) {
    if (entry.stacks <= 0) continue

    const mod = allModifiers.find(m => m.displayName === entry.displayName && m.type === entry.type)
    if (!mod?.characterStats) continue

    const scaled = scaleStats(mod.characterStats, entry.stacks)

    if (mod.ownerCharacter === character.name) {
      selfBuffs = mergePartialStats(selfBuffs, scaled)
    } else {
      teamBuffs = mergePartialStats(teamBuffs, scaled)
    }
  }

  return { selfBuffs, teamBuffs }
}

// ========== Final Stats with Active Buffs ====================================================================================

/**
 * Merges the character's resolved base stats with active snapshot modifier contributions
 * to produce a live stat total for display purposes.
 */
export function computeFinalStats(
  character: Character,
  snapshot: Snapshot | null,
  allCharacters: Character[],
): CharacterStats {
  const { selfBuffs, teamBuffs } = computeActiveModifierBreakdown(character, snapshot, allCharacters)

  let aggregated: Partial<CharacterStats> = {}
  aggregated = mergePartialStats(aggregated, selfBuffs)
  aggregated = mergePartialStats(aggregated, teamBuffs)

  return mergeStats(character.stats as CharacterStats, aggregated)
}

// ========== Internal Helpers =================================================================================================

function mergePartialStats(
  base: Partial<CharacterStats>,
  incoming: Partial<CharacterStats>,
): Partial<CharacterStats> {
  const result = { ...base }
  for (const [key, value] of Object.entries(incoming)) {
    if (value === undefined) continue
    result[key as keyof CharacterStats] = aggregateStat(
      result[key as keyof CharacterStats] as number | undefined,
      value as number,
      key,
    ) as any
  }
  return result
}

function scaleStats(stats: Partial<CharacterStats>, stacks: number): Partial<CharacterStats> {
  const result: Partial<CharacterStats> = {}
  for (const [key, value] of Object.entries(stats)) {
    if (value !== undefined) {
      result[key as keyof CharacterStats] = ((value as number) * stacks) as any
    }
  }
  return result
}
