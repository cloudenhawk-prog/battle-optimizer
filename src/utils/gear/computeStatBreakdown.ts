import type { Character } from '../../types/character'
import type { CharacterStats } from '../../types/stats'
import type { Snapshot } from '../../types/snapshot'
import type { DamageModifier } from '../../types/modifiers'
import { aggregateStat } from '../hooks/resolvers'
import { mergeStats } from '../calculators/damageCalculator'
import { echoSetRegistry, computeEchoSetCounts } from '../../data/gear/echoSets'

// ========== Types ============================================================================================================

export type NamedStatContribution = {
  name: string
  stats: Partial<CharacterStats>
}

export type GearStatBreakdown = {
  weapon: { name: string; total: Partial<CharacterStats> }
  echoes: { items: NamedStatContribution[]; total: Partial<CharacterStats> }
  setBonus: { name: string; total: Partial<CharacterStats> } | null
  passiveMods: { items: NamedStatContribution[]; total: Partial<CharacterStats> }
}

export type ActiveModifierBreakdown = {
  selfBuffs: { items: NamedStatContribution[]; total: Partial<CharacterStats> }
  teamBuffs: { items: NamedStatContribution[]; total: Partial<CharacterStats> }
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
  const weaponTotal: Partial<CharacterStats> = { ...gear.weapon.stats }

  // Echoes: per-slot breakdown
  const echoItems: NamedStatContribution[] = []
  let echoesTotal: Partial<CharacterStats> = {}
  for (const slotNum of [1, 2, 3, 4, 5] as const) {
    const echo = slots[slotNum]
    if (!echo) continue

    let echoStats: Partial<CharacterStats> = {}
    echoStats = mergePartialStats(echoStats, echo.baseStats)
    echoStats = mergePartialStats(echoStats, echo.subStats)

    if (slotNum === 1 && echo.firstSlotStats) {
      echoStats = mergePartialStats(echoStats, echo.firstSlotStats)
    }

    if (echo.conditionalStats?.condition(name)) {
      echoStats = mergePartialStats(echoStats, echo.conditionalStats.stats)
    }

    echoItems.push({ name: echo.name, stats: echoStats })
    echoesTotal = mergePartialStats(echoesTotal, echoStats)
  }

  // Set bonus stats from global EchoSet registry (supports multiple active sets / partial sets)
  const setCounts = computeEchoSetCounts(slots)
  let setBonusTotal: Partial<CharacterStats> = {}
  const activeSetNames: string[] = []
  for (const [setName, count] of Object.entries(setCounts)) {
    const echoSet = echoSetRegistry[setName]
    if (!echoSet) continue
    for (const [milestoneStr, milestone] of Object.entries(echoSet.milestones)) {
      if (count >= Number(milestoneStr) && milestone.stats) {
        setBonusTotal = mergePartialStats(setBonusTotal, milestone.stats)
        if (!activeSetNames.includes(setName)) activeSetNames.push(setName)
      }
    }
  }
  const setBonus: GearStatBreakdown['setBonus'] = activeSetNames.length > 0
    ? { name: activeSetNames.join(', '), total: setBonusTotal }
    : null

  // Passive: inherent stats + flattened passive modifier stats
  const passiveItems: NamedStatContribution[] = []
  let passiveTotal: Partial<CharacterStats> = {}

  if (inherentStats && Object.keys(inherentStats).length > 0) {
    passiveItems.push({ name: 'Inherent Stats', stats: { ...inherentStats } })
    passiveTotal = mergePartialStats(passiveTotal, inherentStats)
  }

  for (const mod of flattenedPassiveModifiers ?? []) {
    if (mod.characterStats) {
      passiveItems.push({ name: mod.displayName, stats: mod.characterStats })
      passiveTotal = mergePartialStats(passiveTotal, mod.characterStats)
    }
  }

  return {
    weapon: { name: gear.weapon.name, total: weaponTotal },
    echoes: { items: echoItems, total: echoesTotal },
    setBonus,
    passiveMods: { items: passiveItems, total: passiveTotal },
  }
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
  if (!snapshot) return {
    selfBuffs: { items: [], total: {} },
    teamBuffs: { items: [], total: {} },
  }

  // Collect all modifier blueprints from all characters
  const allModifiers: DamageModifier[] = []
  for (const char of allCharacters) {
    const pushMod = (mod: DamageModifier) =>
      allModifiers.push({ ...mod, ownerCharacter: mod.ownerCharacter ?? char.name })

    for (const mod of char.damageModifiers ?? []) pushMod(mod)
    for (const mod of char.flattenedPassiveModifiers ?? []) pushMod(mod)
    for (const milestone of char.resourceMilestones ?? []) pushMod(milestone.modifier)

    // Also collect modifiers injected into action.damageModifiers and coordinated attacks
    for (const action of char.actions ?? []) {
      for (const mod of action.damageModifiers ?? []) pushMod(mod)
      for (const ca of action.coordinatedAttacks ?? []) {
        for (const mod of ca.damageModifiers ?? []) pushMod(mod)
      }
    }
  }

  const selfItems: NamedStatContribution[] = []
  const teamItems: NamedStatContribution[] = []
  let selfTotal: Partial<CharacterStats> = {}
  let teamTotal: Partial<CharacterStats> = {}

  const activeEntries: Array<{ displayName: string; stacks: number; type: 'buff' | 'debuff' }> = [
    ...Object.entries(snapshot.buffs).map(([key, stacks]) => ({ displayName: key, stacks, type: 'buff' as const })),
    ...Object.entries(snapshot.debuffs).map(([key, stacks]) => ({ displayName: key, stacks, type: 'debuff' as const })),
  ]

  for (const entry of activeEntries) {
    if (entry.stacks <= 0) continue

    const mod = allModifiers.find(m => m.displayName.replace(/\s+/g, '') === entry.displayName && m.type === entry.type)
    if (!mod?.characterStats) continue

    const scaled = scaleStats(mod.characterStats, entry.stacks)

    if (mod.ownerCharacter === character.name) {
      selfItems.push({ name: entry.displayName, stats: scaled })
      selfTotal = mergePartialStats(selfTotal, scaled)
    } else {
      teamItems.push({ name: entry.displayName, stats: scaled })
      teamTotal = mergePartialStats(teamTotal, scaled)
    }
  }

  return {
    selfBuffs: { items: selfItems, total: selfTotal },
    teamBuffs: { items: teamItems, total: teamTotal },
  }
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
  aggregated = mergePartialStats(aggregated, selfBuffs.total)
  aggregated = mergePartialStats(aggregated, teamBuffs.total)

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
