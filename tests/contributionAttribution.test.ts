import { splitEventByCharacter } from '../src/utils/calculators/contributionAttribution'
import type { DamageEvent } from '../src/types/events'

// ========== Helpers ==========================================================================================================

const TOL = 1e-6

/**
 * Builds a minimal DamageEvent with a reEvaluate closure that models:
 *
 *   damage(S) = baseDmg × Π_k (1 + buffValue[k])
 *
 * where each buff in `buffs` adds a multiplicative factor.
 * This captures cross-stat multiplicative interactions (e.g. ATK buff × critDmg buff)
 * which are the main scenario where last-in marginals would overcount.
 */
function makeEvent(
  caster: string,
  buffs: { key: string; owner: string; value: number }[],
  baseDmg: number,
): DamageEvent {
  const fullDmg = buffs.reduce((acc, b) => acc * (1 + b.value), baseDmg)

  const contributions: DamageEvent['contributions'] = {}
  for (const b of buffs) {
    // Pre-computed φ values (not used when calcParams is present, but required by the type)
    contributions[b.key] = {
      source: b.key,
      ownerCharacter: b.owner,
      displayName: b.key,
      isInherent: false,
      isSelf: false,
      average_damage_contributed: 0,
      average_percent_damage_contributed: 0,
      normal_damage_contributed: 0,
      normal_percent_damage_contributed: 0,
      crit_damage_contributed: 0,
      crit_percent_damage_contributed: 0,
    }
  }

  return {
    snapshotId: 1,
    dealer: caster,
    target: 'Enemy',
    elements: ['GLACIO'],
    dmgTypes: ['BASIC'],
    scaling: 'ATK',
    actionName: 'Test Action',
    normalStrike: fullDmg,
    criticalStrike: fullDmg,
    average: fullDmg,
    contributions,
    timeStamp: 0,
    calcParams: {
      reEvaluate: (activeKeys) => {
        const dmg = buffs
          .filter(b => activeKeys.has(b.key))
          .reduce((acc, b) => acc * (1 + b.value), baseDmg)
        return { normal: dmg, crit: dmg, avg: dmg }
      },
    },
  }
}

// ========== Tests ============================================================================================================

describe('splitEventByCharacter', () => {
  describe('no external buffs', () => {
    it('gives everything to the caster', () => {
      const event = makeEvent('Alice', [], 1000)
      const { casterShare, externalByOwner } = splitEventByCharacter(event, 'Alice')

      expect(casterShare).toBeCloseTo(1000, TOL)
      expect(externalByOwner.size).toBe(0)
    })
  })

  describe('single external buffer', () => {
    it('caster + buffer sum to event.average exactly', () => {
      // Alice fires. Bob gives +40% critDmg.
      const event = makeEvent('Alice', [{ key: 'bob_crit', owner: 'Bob', value: 0.4 }], 1000)
      const { casterShare, externalByOwner } = splitEventByCharacter(event, 'Alice')

      expect(casterShare + (externalByOwner.get('Bob') ?? 0)).toBeCloseTo(event.average, TOL)
      // With one player, Shapley = last-in marginal = v(N) - v(∅) = 1400 - 1000 = 400
      expect(externalByOwner.get('Bob')).toBeCloseTo(400, TOL)
      expect(casterShare).toBeCloseTo(1000, TOL)
    })
  })

  describe('two buffers — same owner type, symmetric (symmetry property)', () => {
    it('symmetric buffs receive equal Shapley values', () => {
      // Bob and Carol both give +40% (same value, different owners).
      // v(∅)=1000, v({B})=1400, v({C})=1400, v({B,C})=1000×1.4×1.4=1960
      // φ_B = φ_C = ½(400) + ½(560) = 480
      const event = makeEvent('Alice', [
        { key: 'bob_crit', owner: 'Bob', value: 0.4 },
        { key: 'carol_crit', owner: 'Carol', value: 0.4 },
      ], 1000)
      const { casterShare, externalByOwner } = splitEventByCharacter(event, 'Alice')
      const bobPhi   = externalByOwner.get('Bob')   ?? 0
      const carolPhi = externalByOwner.get('Carol') ?? 0

      // Symmetry: identical buffs get identical shares
      expect(Math.abs(bobPhi - carolPhi)).toBeLessThan(TOL)
      // Efficiency: all shares sum to event.average
      expect(casterShare + bobPhi + carolPhi).toBeCloseTo(event.average, TOL)
      // Each gets 480 (not 560 which last-in marginal would give)
      expect(bobPhi).toBeCloseTo(480, TOL)
    })
  })

  describe('two buffers — different stats, multiplicative interaction', () => {
    // Alice fires; Bob gives +25% ATK, Carol gives +40% critDmg.
    // damage(S) = 1000 × (1 + atkBuff) × (1 + critBuff) — strictly multiplicative.
    //
    // v(∅)      = 1000
    // v({B})    = 1000 × 1.25 = 1250       (+250 over base)
    // v({C})    = 1000 × 1.40 = 1400       (+400 over base)
    // v({B,C})  = 1000 × 1.25 × 1.40 = 1750
    //
    // Shapley:
    //   φ_B = ½ [v({B}) - v(∅)]   + ½ [v({B,C}) - v({C})]
    //       = ½ × 250             + ½ × 350              = 300
    //   φ_C = ½ [v({C}) - v(∅)]   + ½ [v({B,C}) - v({B})]
    //       = ½ × 400             + ½ × 500              = 450
    //
    // Note: φ_B + φ_C = 750 = v({B,C}) - v(∅) = 1750 - 1000  ✓
    // Note: last-in marginals would give B=350, C=500 (sum 850 > 750) — Shapley avoids this

    const baseDmg = 1000
    const event = makeEvent('Alice', [
      { key: 'bob_atk',    owner: 'Bob',   value: 0.25 },
      { key: 'carol_crit', owner: 'Carol', value: 0.40 },
    ], baseDmg)

    it('caster share equals v(∅)', () => {
      const { casterShare } = splitEventByCharacter(event, 'Alice')
      expect(casterShare).toBeCloseTo(1000, TOL)
    })

    it('φ_Bob ≈ 300 (ATK buff gets less because crit amplifies it symmetrically)', () => {
      const { externalByOwner } = splitEventByCharacter(event, 'Alice')
      expect(externalByOwner.get('Bob')).toBeCloseTo(300, TOL)
    })

    it('φ_Carol ≈ 450 (crit buff gets more because it amplifies the higher ATK-buffed base)', () => {
      const { externalByOwner } = splitEventByCharacter(event, 'Alice')
      expect(externalByOwner.get('Carol')).toBeCloseTo(450, TOL)
    })

    it('all shares sum exactly to event.average (Shapley efficiency)', () => {
      const { casterShare, externalByOwner } = splitEventByCharacter(event, 'Alice')
      const total = casterShare + Array.from(externalByOwner.values()).reduce((s, v) => s + v, 0)
      expect(total).toBeCloseTo(event.average, TOL)
    })

    it('Shapley sum ≠ sum of last-in marginals (proves non-trivial interaction)', () => {
      // Last-in marginals: Bob=350, Carol=500, sum=850 > 750
      // Shapley sum must equal 750
      const { externalByOwner } = splitEventByCharacter(event, 'Alice')
      const shapleySum = Array.from(externalByOwner.values()).reduce((s, v) => s + v, 0)
      expect(shapleySum).toBeCloseTo(750, TOL)
      expect(shapleySum).not.toBeCloseTo(850, 1)
    })
  })

  describe('three buffers — each buffing a different stat', () => {
    // v(S) = 1000 × (1 + atkBuff in S) × (1 + critBuff in S) × (1 + dmgBuff in S)
    // Bob: +25% ATK, Carol: +40% critDmg, Dan: +20% bonusDMG
    // v(∅)         = 1000
    // v({B,C,D})   = 1000 × 1.25 × 1.40 × 1.20 = 2100
    // Shapley efficiency: φ_B + φ_C + φ_D = 2100 - 1000 = 1100
    it('efficiency: shares sum to event.average for three buffers from different characters', () => {
      const event = makeEvent('Alice', [
        { key: 'bob_atk',   owner: 'Bob',   value: 0.25 },
        { key: 'carol_cdmg', owner: 'Carol', value: 0.40 },
        { key: 'dan_dmg',   owner: 'Dan',   value: 0.20 },
      ], 1000)
      const { casterShare, externalByOwner } = splitEventByCharacter(event, 'Alice')
      const total = casterShare + Array.from(externalByOwner.values()).reduce((s, v) => s + v, 0)
      expect(total).toBeCloseTo(event.average, TOL)
    })

    it('each buffer gets a distinct non-zero Shapley share', () => {
      const event = makeEvent('Alice', [
        { key: 'bob_atk',    owner: 'Bob',   value: 0.25 },
        { key: 'carol_cdmg', owner: 'Carol', value: 0.40 },
        { key: 'dan_dmg',    owner: 'Dan',   value: 0.20 },
      ], 1000)
      const { externalByOwner } = splitEventByCharacter(event, 'Alice')
      const shares = ['Bob', 'Carol', 'Dan'].map(c => externalByOwner.get(c) ?? 0)
      for (const s of shares) expect(s).toBeGreaterThan(0)
      // All three should differ because each buff value is different
      expect(shares[0]).not.toBeCloseTo(shares[1], 1)
      expect(shares[1]).not.toBeCloseTo(shares[2], 1)
    })
  })

  describe('one buffer with multiple contrib keys (e.g. two separate passives from same character)', () => {
    it('groups both keys under the same owner and computes single Shapley value', () => {
      // Bob contributes two separate buffs (+25% ATK and +10% bonusDMG).
      // For attribution purposes they should be treated as a single "Bob" player.
      const event = makeEvent('Alice', [
        { key: 'bob_atk',  owner: 'Bob', value: 0.25 },
        { key: 'bob_bdmg', owner: 'Bob', value: 0.10 },
      ], 1000)
      const { casterShare, externalByOwner } = splitEventByCharacter(event, 'Alice')

      expect(externalByOwner.size).toBe(1)
      expect(externalByOwner.has('Bob')).toBe(true)
      // v(∅)=1000, v({Bob})=1000×1.25×1.10=1375 → φ_Bob = 375, casterShare = 1000
      expect(casterShare).toBeCloseTo(1000, TOL)
      expect(externalByOwner.get('Bob')).toBeCloseTo(375, TOL)
      expect(casterShare + (externalByOwner.get('Bob') ?? 0)).toBeCloseTo(event.average, TOL)
    })
  })

  describe('inherent contributions are excluded from external attribution', () => {
    it('inherent key is treated as part of base damage, not attributed to any external char', () => {
      const fullDmg = 1000 * 1.3 * 1.25  // inherent +30%, Bob +25%
      const event: DamageEvent = {
        snapshotId: 1,
        dealer: 'Alice',
        target: 'Enemy',
        elements: ['GLACIO'],
        dmgTypes: ['BASIC'],
        scaling: 'ATK',
        actionName: 'Test',
        normalStrike: fullDmg,
        criticalStrike: fullDmg,
        average: fullDmg,
        timeStamp: 0,
        contributions: {
          inherent_buff: {
            source: 'inherent_buff',
            ownerCharacter: 'Alice',
            isInherent: true,
            isSelf: false,
            average_damage_contributed: 0,
            average_percent_damage_contributed: 0,
            normal_damage_contributed: 0,
            normal_percent_damage_contributed: 0,
            crit_damage_contributed: 0,
            crit_percent_damage_contributed: 0,
          },
          bob_atk: {
            source: 'bob_atk',
            ownerCharacter: 'Bob',
            isInherent: false,
            isSelf: false,
            average_damage_contributed: 0,
            average_percent_damage_contributed: 0,
            normal_damage_contributed: 0,
            normal_percent_damage_contributed: 0,
            crit_damage_contributed: 0,
            crit_percent_damage_contributed: 0,
          },
        },
        calcParams: {
          reEvaluate: (activeKeys) => {
            // inherent key is always in baseContribKeys so reEvaluate receives it in every call.
            // Only bob_atk is external.
            const bobActive = activeKeys.has('bob_atk')
            const dmg = 1000 * 1.3 * (bobActive ? 1.25 : 1)
            return { normal: dmg, crit: dmg, avg: dmg }
          },
        },
      }

      const { casterShare, externalByOwner } = splitEventByCharacter(event, 'Alice')

      // v(∅) includes inherent: 1000 × 1.3 = 1300
      expect(casterShare).toBeCloseTo(1300, TOL)
      // Bob only gets the lift from his ATK buff on top of the inherent base
      expect(externalByOwner.get('Bob')).toBeCloseTo(325, TOL)  // 1625 - 1300
      expect(casterShare + (externalByOwner.get('Bob') ?? 0)).toBeCloseTo(event.average, TOL)
    })
  })

  describe('fallback path (no calcParams)', () => {
    it('uses pre-computed average_damage_contributed and caster gets the remainder', () => {
      const event: DamageEvent = {
        snapshotId: 1,
        dealer: 'Alice',
        target: 'Enemy',
        elements: ['GLACIO'],
        dmgTypes: ['BASIC'],
        scaling: 'ATK',
        actionName: 'Test',
        normalStrike: 1000,
        criticalStrike: 1000,
        average: 1000,
        timeStamp: 0,
        contributions: {
          bob_buff: {
            source: 'bob_buff',
            ownerCharacter: 'Bob',
            isInherent: false,
            isSelf: false,
            average_damage_contributed: 300,
            average_percent_damage_contributed: 30,
            normal_damage_contributed: 300,
            normal_percent_damage_contributed: 30,
            crit_damage_contributed: 300,
            crit_percent_damage_contributed: 30,
          },
        },
        // calcParams intentionally absent
      }

      const { casterShare, externalByOwner } = splitEventByCharacter(event, 'Alice')

      expect(externalByOwner.get('Bob')).toBeCloseTo(300, TOL)
      expect(casterShare).toBeCloseTo(700, TOL)
    })
  })

  describe('many buff keys owned by 3 characters (2^3 = 8 subsets, not 2^N for N keys)', () => {
    it('correctly attributes 6 buff keys across 3 characters, efficiency holds', () => {
      // Bob has 2 ATK buffs, Carol has 2 critDmg buffs, Dan has 2 bonusDMG buffs.
      // 6 individual buff keys → 3 character-level players → only 8 subset evaluations.
      // v(S) = 1000 × Π(1 + active buff values)
      //
      // Per-character combined multipliers:
      //   Bob:   ×1.15 × ×1.10 = ×1.265
      //   Carol: ×1.20 × ×1.25 = ×1.50
      //   Dan:   ×1.10 × ×1.05 = ×1.155
      //
      // v(∅)=1000, v(N)=1000×1.265×1.50×1.155≈2193.9375
      const event = makeEvent('Alice', [
        { key: 'bob_atk1',   owner: 'Bob',   value: 0.15 },
        { key: 'bob_atk2',   owner: 'Bob',   value: 0.10 },
        { key: 'carol_crit1', owner: 'Carol', value: 0.20 },
        { key: 'carol_crit2', owner: 'Carol', value: 0.25 },
        { key: 'dan_dmg1',   owner: 'Dan',   value: 0.10 },
        { key: 'dan_dmg2',   owner: 'Dan',   value: 0.05 },
      ], 1000)

      const { casterShare, externalByOwner } = splitEventByCharacter(event, 'Alice')

      // Efficiency: all shares sum to event.average
      const total = casterShare + Array.from(externalByOwner.values()).reduce((s, v) => s + v, 0)
      expect(total).toBeCloseTo(event.average, TOL)

      // Exactly 3 character-level players
      expect(externalByOwner.size).toBe(3)

      // Caster still gets only the base
      expect(casterShare).toBeCloseTo(1000, TOL)

      // Each external character gets a positive share
      expect(externalByOwner.get('Bob')!).toBeGreaterThan(0)
      expect(externalByOwner.get('Carol')!).toBeGreaterThan(0)
      expect(externalByOwner.get('Dan')!).toBeGreaterThan(0)

      // Carol buffs more total value (×1.50) than Bob (×1.265) and Dan (×1.155),
      // so Carol's Shapley share should be the largest.
      expect(externalByOwner.get('Carol')!).toBeGreaterThan(externalByOwner.get('Bob')!)
      expect(externalByOwner.get('Carol')!).toBeGreaterThan(externalByOwner.get('Dan')!)
    })
  })

  describe('pie-chart normalization (shares as % of total damage)', () => {
    it('caster + buffer shares each divide by event.average to give a valid pie distribution', () => {
      // Alice fires; Bob gives +25% ATK, Carol gives +40% critDmg.
      // v(∅)=1000, v(N)=1750.  φ_Bob=300, φ_Carol=450.
      //
      // Pie slices (normalized to v(N)=1750):
      //   Alice: 1000/1750 ≈ 57.14%
      //   Bob:    300/1750 ≈ 17.14%
      //   Carol:  450/1750 ≈ 25.71%
      //   Sum: exactly 100%
      const event = makeEvent('Alice', [
        { key: 'bob_atk',    owner: 'Bob',   value: 0.25 },
        { key: 'carol_cdmg', owner: 'Carol', value: 0.40 },
      ], 1000)

      const { casterShare, externalByOwner } = splitEventByCharacter(event, 'Alice')
      const total = event.average  // = v(N) = 1750

      const alicePct = casterShare / total * 100
      const bobPct   = (externalByOwner.get('Bob')   ?? 0) / total * 100
      const carolPct = (externalByOwner.get('Carol') ?? 0) / total * 100

      // Slices sum exactly to 100%
      expect(alicePct + bobPct + carolPct).toBeCloseTo(100, TOL)

      // Correct individual slices
      expect(alicePct).toBeCloseTo(1000 / 1750 * 100, TOL)   // ≈ 57.14%
      expect(bobPct).toBeCloseTo(300  / 1750 * 100, TOL)     // ≈ 17.14%
      expect(carolPct).toBeCloseTo(450 / 1750 * 100, TOL)    // ≈ 25.71%
    })

    it('buffer with both synergy-boosted and base contributions gets correct pie slice', () => {
      // Three buffers: Bob (+25% ATK), Carol (+40% critDmg), Dan (+20% bonusDMG).
      // v(N) = 1000×1.25×1.40×1.20 = 2100
      // Pie slice each must be positive, distinct, and sum to 100%.
      const event = makeEvent('Alice', [
        { key: 'bob_atk',    owner: 'Bob',   value: 0.25 },
        { key: 'carol_cdmg', owner: 'Carol', value: 0.40 },
        { key: 'dan_bdmg',   owner: 'Dan',   value: 0.20 },
      ], 1000)

      const { casterShare, externalByOwner } = splitEventByCharacter(event, 'Alice')
      const total = event.average  // = 2100

      const slices = [
        casterShare,
        externalByOwner.get('Bob')   ?? 0,
        externalByOwner.get('Carol') ?? 0,
        externalByOwner.get('Dan')   ?? 0,
      ]

      const sumPct = slices.reduce((s, v) => s + v / total * 100, 0)
      expect(sumPct).toBeCloseTo(100, TOL)

      // All slices positive
      for (const s of slices) expect(s).toBeGreaterThan(0)

      // Alice (caster/base) owns the most — v(∅)/v(N) = 1000/2100 ≈ 47.6%
      expect(casterShare).toBeGreaterThan(externalByOwner.get('Bob')!)
      expect(casterShare).toBeGreaterThan(externalByOwner.get('Carol')!)
      expect(casterShare).toBeGreaterThan(externalByOwner.get('Dan')!)
    })
  })
})
