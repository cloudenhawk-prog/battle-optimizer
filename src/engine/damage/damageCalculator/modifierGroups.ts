// Contribution groups: groups damage modifiers by key and sums the stats of an active subset of groups.
import type { Action } from '../../../types/action'
import type { CharacterStats, EnemyStats } from '../../../types/stats'
import type { DamageModifier } from '../../../types/modifiers'
import type { StepContext } from '../../../types/stepContext'
import { aggregateStat } from '../../resolvers'
import { applyStackMultiplier } from '../../modifiers/modifierHelpers'

// ========== Group Keys =======================================================================================================

/**
 * Groups modifier indices by contribution key, in first-seen order.
 *
 * Key = contributionGroup (explicit opt-in), else `source::displayName`, else `modifier_<index>`.
 * Using source::displayName (not just source) keeps two effects from the same source (e.g. S1 base
 * vs S2 enhancement) separate; modifiers that should be reported together must set contributionGroup.
 * Tracker-only modifiers carry no stats and exist only to track state, so callers usually skip them.
 */
export function buildModifierGroups(damageModifiers: DamageModifier[], skipTrackerOnly: boolean): Map<string, number[]> {
  const groupIndices = new Map<string, number[]>()
  for (let i = 0; i < damageModifiers.length; i++) {
    const mod = damageModifiers[i]
    if (skipTrackerOnly && mod.trackerOnly) continue
    const groupKey = mod.contributionGroup ?? (mod.source !== undefined ? `${mod.source}::${mod.displayName ?? mod.source}` : `modifier_${i}`)
    if (!groupIndices.has(groupKey)) groupIndices.set(groupKey, [])
    groupIndices.get(groupKey)!.push(i)
  }
  return groupIndices
}

// ========== Stat Aggregation =================================================================================================

/**
 * Adds the stats of every modifier in the active groups into charMods / enemyMods (mutated).
 * Limited-duration modifiers are scaled by their current stacks, and every stat is scaled by the
 * modifier's condition multiplier (both need ctx; without ctx the raw stats are used).
 */
export function addActiveGroupStats(
  groups: Iterable<[string, number[]]>,
  activeKeys: Set<string>,
  damageModifiers: DamageModifier[],
  ctx: StepContext | undefined,
  charMods: Partial<CharacterStats>,
  enemyMods: Partial<EnemyStats>,
): void {
  for (const [groupKey, indices] of groups) {
    if (!activeKeys.has(groupKey)) continue
    for (const j of indices) {
      const mod = damageModifiers[j]
      const stackedMod = mod.durationStrategy?.type === 'limited' && ctx
        ? applyStackMultiplier(mod, ctx.modifiersInAction)
        : mod
      const conditionMultiplier = stackedMod.condition && ctx ? stackedMod.condition(ctx) : 1

      if (stackedMod.characterStats) {
        for (const [key, value] of Object.entries(stackedMod.characterStats)) {
          const statKey = key as keyof CharacterStats
          charMods[statKey] = aggregateStat(charMods[statKey] as number | undefined, (value as number) * conditionMultiplier, key) as any
        }
      }
      if (stackedMod.enemyStats) {
        for (const [key, value] of Object.entries(stackedMod.enemyStats)) {
          const statKey = key as keyof EnemyStats
          enemyMods[statKey] = aggregateStat(enemyMods[statKey] as number | undefined, (value as number) * conditionMultiplier, key) as any
        }
      }
    }
  }
}

/**
 * Sums an action's inherent modifiers (scaled by their condition) into a stat baseline.
 * When activeKeys is given, only inherents whose `inherent_${displayName}` key is active count
 * (buff-toggle re-evaluation); otherwise all of them do (Shapley baseline).
 */
export function sumInherentStats(action: Action, ctx: StepContext | undefined, activeKeys?: Set<string>): { inherentCharBase: Partial<CharacterStats>; inherentEnemyBase: Partial<EnemyStats> } {
  const inherentCharBase: Partial<CharacterStats> = {}
  const inherentEnemyBase: Partial<EnemyStats> = {}
  if (ctx && action.inherentModifiers?.length) {
    for (const im of action.inherentModifiers) {
      if (activeKeys && !activeKeys.has(`inherent_${im.displayName}`)) continue
      const scale = im.condition(ctx)
      if (scale !== 0) {
        if (im.characterStats) {
          for (const key in im.characterStats) {
            const statKey = key as keyof CharacterStats
            const value = (im.characterStats[statKey] as number) * scale
            inherentCharBase[statKey] = aggregateStat(inherentCharBase[statKey] as number | undefined, value, statKey) as any
          }
        }
        if (im.enemyStats) {
          for (const key in im.enemyStats) {
            const statKey = key as keyof EnemyStats
            const value = (im.enemyStats[statKey] as number) * scale
            inherentEnemyBase[statKey] = aggregateStat(inherentEnemyBase[statKey] as number | undefined, value, statKey) as any
          }
        }
      }
    }
  }
  return { inherentCharBase, inherentEnemyBase }
}
