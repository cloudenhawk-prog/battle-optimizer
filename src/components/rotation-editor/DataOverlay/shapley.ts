// Shapley attribution of a row's damage to each active modifier (exact for <= 15 players, Monte Carlo above)
import type { DamageEvent } from '../../../types/events'
import { getEventDamage } from './damageMath'
import type { DamageMode } from './damageMath'
import { collectContribMeta } from './modifierMap'

/**
 * Game: players = active contribution keys, v(S) = damage of the active-source events re-evaluated with only S.
 * Returns per-key Shapley value (rawDamage) and its % of the no-modifier base damage.
 * Above 15 non-null players it samples 300 random permutations with Math.random, so results vary between calls —
 * callers must memoize.
 */
export function computeModifierShapley(
  damageEvents: DamageEvent[],
  activeSources: Set<string>,
  activeContribs: Set<string>,
  mode: DamageMode,
) {
  const activeEvents = damageEvents.filter(e => activeSources.has(e.actionName))

  // Aggregate contribution metadata from all events so entries stay stable when sources toggle.
  const metaMap = collectContribMeta(damageEvents)

  const evaluateDamage = (contribSet: Set<string>): number => {
    let dmg = 0
    for (const event of activeEvents) {
      if (!event.calcParams) {
        dmg += getEventDamage(event, mode)
      } else {
        const r = event.calcParams.reEvaluate(contribSet)
        dmg += mode === 'average' ? r.avg : mode === 'normal' ? r.normal : r.crit
      }
    }
    return dmg
  }

  const baseDamage = evaluateDamage(new Set<string>())

  // All active modifier keys (inherent and non-inherent) are players in the same Shapley game.
  // Filter to non-null players only: a modifier is a null player when v({i}) = v(∅) —
  // adding it alone to the empty coalition changes nothing. Null players always get φ_i = 0
  // and can be excluded without affecting other players' values. This keeps n small so the
  // exact algorithm is used more often (threshold: 15).
  const allActiveKeys = Object.keys(metaMap).filter(k => activeContribs.has(k))
  const nonNullKeys = allActiveKeys.filter(key => {
    const withKey = evaluateDamage(new Set([key]))
    return Math.abs(withKey - baseDamage) > 0.001
  })
  const n = nonNullKeys.length

  const shapleyValues: Record<string, number> = {}
  for (const k of allActiveKeys) shapleyValues[k] = 0  // null players default to 0

  const MAX_EXACT = 15
  if (n > 0 && n <= MAX_EXACT) {
    // Exact: evaluate v(S) once for all 2^n subsets (bitmask j = nonNullKeys[j]), then for each i sum the
    // weighted marginals over every subset of N \ {i}, enumerated with the (s - 1) & mask trick.
    const subsetDmg = new Float64Array(1 << n)
    for (let mask = 0; mask < (1 << n); mask++) {
      const contribSet = new Set<string>()
      for (let j = 0; j < n; j++) {
        if (mask & (1 << j)) contribSet.add(nonNullKeys[j])
      }
      subsetDmg[mask] = evaluateDamage(contribSet)
    }
    const fact = new Float64Array(n + 1)
    fact[0] = 1
    for (let k = 1; k <= n; k++) fact[k] = fact[k - 1] * k
    const popcount = (x: number): number => { let c = 0; let v = x; while (v) { c += v & 1; v >>>= 1 } return c }
    for (let i = 0; i < n; i++) {
      let shapley = 0
      const nWithoutI = ((1 << n) - 1) ^ (1 << i)
      let s = nWithoutI
      while (true) {
        const sSize = popcount(s)
        const weight = (fact[sSize] * fact[n - sSize - 1]) / fact[n]
        shapley += weight * (subsetDmg[s | (1 << i)] - subsetDmg[s])
        if (s === 0) break
        s = (s - 1) & nWithoutI
      }
      shapleyValues[nonNullKeys[i]] = shapley
    }
  } else if (n > MAX_EXACT) {
    const SAMPLES = 300
    // Monte Carlo: average marginal contributions over random orderings (in-place Fisher–Yates;
    // the permutation carries over between samples, which is still uniform).
    const perm = [...nonNullKeys]
    for (let s = 0; s < SAMPLES; s++) {
      for (let i = perm.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[perm[i], perm[j]] = [perm[j], perm[i]]
      }
      const contribSet = new Set<string>()
      let prevDmg = baseDamage
      for (const key of perm) {
        contribSet.add(key)
        const newDmg = evaluateDamage(contribSet)
        shapleyValues[key] += newDmg - prevDmg
        prevDmg = newDmg
      }
    }
    for (const key of nonNullKeys) shapleyValues[key] /= SAMPLES
  }

  const marginalMap: Record<string, { rawDamage: number; pct: number }> = {}
  for (const key of Object.keys(metaMap)) {
    if (!activeContribs.has(key)) {
      marginalMap[key] = { rawDamage: 0, pct: 0 }
    } else {
      const rawDamage = shapleyValues[key] ?? 0
      const pct = baseDamage > 0 ? (rawDamage / baseDamage) * 100 : 0
      marginalMap[key] = { rawDamage, pct }
    }
  }

  return { metaMap, marginalMap, baseDamage }
}
