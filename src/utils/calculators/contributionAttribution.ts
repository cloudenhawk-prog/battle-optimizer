import type { DamageEvent } from '../../types/events'

/**
 * Splits a single damage event's damage between the caster and external buffer characters
 * using character-level exact Shapley values.
 *
 * - "Players" = distinct external ownerCharacters with non-inherent, non-self contributions.
 * - v(S) evaluated via calcParams.reEvaluate() with keys owned by chars in S (plus base keys).
 * - Caster receives v(∅); external chars share v(N) − v(∅) via exact Shapley enumeration.
 * - Fallback (no calcParams): sums pre-computed per-modifier average_damage_contributed values.
 *
 * Efficiency property: casterShare + Σ externalByOwner = event.average exactly.
 */
export function splitEventByCharacter(
  event: DamageEvent,
  casterBase: string,
): { casterShare: number; externalByOwner: Map<string, number> } {
  const externalByOwner = new Map<string, number>()

  const keysByOwner = new Map<string, string[]>()
  for (const [key, contrib] of Object.entries(event.contributions)) {
    const owner = contrib.ownerCharacter
    if (!owner || owner === casterBase || contrib.isInherent || contrib.isSelf) continue
    const list = keysByOwner.get(owner) ?? []
    list.push(key)
    keysByOwner.set(owner, list)
  }

  const externalOwners = Array.from(keysByOwner.keys())
  const n = externalOwners.length

  if (n === 0) {
    return { casterShare: event.average, externalByOwner }
  }

  if (!event.calcParams) {
    let sumExternal = 0
    for (const [owner, keys] of keysByOwner) {
      const phi = keys.reduce((s, k) => s + (event.contributions[k]?.average_damage_contributed ?? 0), 0)
      externalByOwner.set(owner, phi)
      sumExternal += phi
    }
    return { casterShare: Math.max(0, event.average - sumExternal), externalByOwner }
  }

  const baseContribKeys = new Set<string>(
    Object.entries(event.contributions)
      .filter(([, c]) => c.isInherent || c.isSelf || !c.ownerCharacter || c.ownerCharacter === casterBase)
      .map(([k]) => k)
  )

  const subsetDmg = new Float64Array(1 << n)
  for (let mask = 0; mask < (1 << n); mask++) {
    const activeKeys = new Set<string>(baseContribKeys)
    for (let j = 0; j < n; j++) {
      if (mask & (1 << j)) {
        for (const k of keysByOwner.get(externalOwners[j])!) activeKeys.add(k)
      }
    }
    subsetDmg[mask] = event.calcParams.reEvaluate(activeKeys).avg
  }

  const baseDmg = subsetDmg[0]
  const fullMask = (1 << n) - 1

  const fact = new Float64Array(n + 1)
  fact[0] = 1
  for (let k = 1; k <= n; k++) fact[k] = fact[k - 1] * k

  const popcount = (x: number): number => { let c = 0; let v = x; while (v) { c += v & 1; v >>>= 1 } return c }

  for (let i = 0; i < n; i++) {
    const nWithoutI = fullMask ^ (1 << i)
    let phi = 0
    let s = nWithoutI
    while (true) {
      const sSize = popcount(s)
      const weight = (fact[sSize] * fact[n - sSize - 1]) / fact[n]
      phi += weight * (subsetDmg[s | (1 << i)] - subsetDmg[s])
      if (s === 0) break
      s = (s - 1) & nWithoutI
    }
    externalByOwner.set(externalOwners[i], phi)
  }

  return { casterShare: baseDmg, externalByOwner }
}
