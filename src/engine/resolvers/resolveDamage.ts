// R3 resolveDamage: computes the main hit of the action (incl. inherent modifiers) and the running damage/DPS totals.
import type { StepContext } from '../../types/stepContext'
import type { CharacterStats, EnemyStats } from '../../types/stats'
import type { DamageEvent } from '../../types/events'
import { calculateDamage, evaluateDamageWithGroups, mergeStats } from '../damage/damageCalculator'
import { aggregateStat } from './statHelpers'

// ========== Resolver 3: Damage ==============================================================================================

export function resolveDamage(ctx: StepContext): void {
  const action = ctx.action
  const name = ctx.character.name
  const baseStats = ctx.character.stats
  const damageModifiers = ctx.damageModifiers
  const modifierEnemyStats = ctx.aggregatedEnemyModifiers
  const enemy = ctx.enemy
  const snapshotId = ctx.snapshotId
  const prev = ctx.prev
  const current = ctx.current
  const toTime = ctx.toTime

  // Apply inherent modifiers — ephemeral conditional amplifiers on this action only.
  // Never dispatched into modifiersInAction; evaluated once here and discarded.
  const modifierCharacterStats = applyInherentModifiers(ctx)

  const { average, damageEvent } = calculateDamage({ action, name, stats: baseStats, damageModifiers, modifierCharacterStats, modifierEnemyStats, enemy, snapshotId, timeStamp: ctx.fromTime, ctx })

  // Compute inherent modifier contributions: "damage without modifier i" using pre-inherent baseline
  addInherentContributions(ctx, damageEvent)

  // Attach a re-evaluation closure so DataOverlay can recompute damage with a subset of active buffs
  const _calcFinalStats = mergeStats(baseStats, modifierCharacterStats)
  _calcFinalStats.critRate = Math.min(_calcFinalStats.critRate, 1.0)
  damageEvent.calcParams = {
    reEvaluate: (activeGroupKeys) => evaluateDamageWithGroups(
      { action, characterName: name, baseStats, damageModifiers, enemy, ctx },
      snapshotId, ctx.fromTime, activeGroupKeys,
    ),
    finalCharacterStats: _calcFinalStats,
  }
  ctx.damageEvents.push(damageEvent)

  const cumulativeDamage = prev.damage + average
  const dps = toTime > 0 ? cumulativeDamage / toTime : 0

  current.damage = cumulativeDamage
  current.dps = dps

  ctx.logs.push({
    resolver: 'resolveDamage',
    message: `Damage resolved for snapshot ${snapshotId}: +${average} dmg, cumulative ${cumulativeDamage}`,
    details: { damageEvent },
  })
}

// ========== Inherent Modifiers ==============================================================================================

/** Aggregated character stats + this action's inherent modifiers (characterStats only), each scaled by its condition. */
function applyInherentModifiers(ctx: StepContext): Partial<CharacterStats> {
  const action = ctx.action
  let modifierCharacterStats = ctx.aggregatedCharacterModifiers
  if (action.inherentModifiers?.length) {
    const merged = { ...modifierCharacterStats }
    for (const im of action.inherentModifiers) {
      const scale = im.condition(ctx)
      if (scale !== 0 && im.characterStats) {
        for (const key in im.characterStats) {
          const statKey = key as keyof CharacterStats
          const value = (im.characterStats[statKey] as number) * scale
          merged[statKey] = aggregateStat(merged[statKey] as number | undefined, value, statKey) as any
        }
      }
    }
    modifierCharacterStats = merged
  }
  return modifierCharacterStats
}

/**
 * Adds one `inherent_<name>` contribution per active inherent modifier to the damage event,
 * computed by re-running calculateDamage with every OTHER inherent modifier applied.
 */
function addInherentContributions(ctx: StepContext, damageEvent: DamageEvent): void {
  const action = ctx.action
  const name = ctx.character.name
  const baseStats = ctx.character.stats
  const damageModifiers = ctx.damageModifiers
  const enemy = ctx.enemy
  const snapshotId = ctx.snapshotId

  if (action.inherentModifiers?.length) {
    for (const im of action.inherentModifiers) {
      const scale = im.condition(ctx)
      if (scale === 0) continue

      // Rebuild charStats = aggregatedCharacterModifiers + all OTHER inherent mods
      const charWithout: Partial<CharacterStats> = { ...ctx.aggregatedCharacterModifiers }
      for (const other of action.inherentModifiers) {
        if (other === im) continue
        const otherScale = other.condition(ctx)
        if (otherScale !== 0 && other.characterStats) {
          for (const key in other.characterStats) {
            const statKey = key as keyof CharacterStats
            const value = (other.characterStats[statKey] as number) * otherScale
            charWithout[statKey] = aggregateStat(charWithout[statKey] as number | undefined, value, statKey) as any
          }
        }
      }

      // Rebuild enemyStats = aggregatedEnemyModifiers + all OTHER inherent mods
      const enemyWithout: Partial<EnemyStats> = { ...ctx.aggregatedEnemyModifiers }
      for (const other of action.inherentModifiers) {
        if (other === im) continue
        const otherScale = other.condition(ctx)
        if (otherScale !== 0 && other.enemyStats) {
          for (const key in other.enemyStats) {
            const statKey = key as keyof EnemyStats
            const value = (other.enemyStats[statKey] as number) * otherScale
            enemyWithout[statKey] = aggregateStat(enemyWithout[statKey] as number | undefined, value, statKey) as any
          }
        }
      }

      const { damageEvent: withoutEvent } = calculateDamage({ action, name, stats: baseStats, damageModifiers, modifierCharacterStats: charWithout, modifierEnemyStats: enemyWithout, enemy, snapshotId, timeStamp: ctx.fromTime, skipContributions: true })

      const safePercent = (withVal: number, withoutVal: number) => (!withoutVal ? 0 : (withVal / withoutVal - 1) * 100)

      const contribKey = `inherent_${im.displayName}`
      damageEvent.contributions[contribKey] = {
        source: contribKey,
        displayName: im.displayName,
        isInherent: true,
        normal_damage_contributed: Math.max(0, damageEvent.normalStrike - withoutEvent.normalStrike),
        normal_percent_damage_contributed: safePercent(damageEvent.normalStrike, withoutEvent.normalStrike),
        crit_damage_contributed: Math.max(0, damageEvent.criticalStrike - withoutEvent.criticalStrike),
        crit_percent_damage_contributed: safePercent(damageEvent.criticalStrike, withoutEvent.criticalStrike),
        average_damage_contributed: Math.max(0, damageEvent.average - withoutEvent.average),
        average_percent_damage_contributed: safePercent(damageEvent.average, withoutEvent.average),
      }
    }
  }
}
