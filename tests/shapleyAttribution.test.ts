import { splitEventByCharacter } from '../src/utils/calculators/contributionAttribution'
import type { DamageEvent } from '../src/types/events'

// ============================================================================================================================
// Helpers
// ============================================================================================================================

const TOL = 1e-6

/**
 * Builds a DamageEvent with a reEvaluate closure that models:
 *   damage(S) = baseDmg × Π_k (1 + buffValue[k])   for each buff key k active in S
 */
function makeEvent(
  caster: string,
  buffs: { key: string; owner: string; value: number }[],
  baseDmg: number,
): DamageEvent {
  const fullDmg = buffs.reduce((acc, b) => acc * (1 + b.value), baseDmg)
  const contributions: DamageEvent['contributions'] = {}
  for (const b of buffs) {
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

/**
 * Replicates the computeContributionData accumulation loop from SummaryOverlay.
 * Returns a map of character name → total attributed damage.
 */
function computeAttribution(events: DamageEvent[]): Map<string, number> {
  const getBaseChar = (dealer: string) => {
    const idx = dealer.indexOf(': ')
    return idx >= 0 ? dealer.slice(0, idx) : dealer
  }
  const attribution = new Map<string, number>()
  for (const event of events) {
    const casterBase = getBaseChar(event.dealer)
    const { casterShare, externalByOwner } = splitEventByCharacter(event, casterBase)
    attribution.set(casterBase, (attribution.get(casterBase) ?? 0) + casterShare)
    for (const [owner, phi] of externalByOwner) {
      attribution.set(owner, (attribution.get(owner) ?? 0) + phi)
    }
  }
  return attribution
}

// ============================================================================================================================
//
// SCENARIO: 3 characters — Alice, Bob, Carol
//
// Each character buffs others via 2 multiplicative buff keys (grouped into one Shapley player per character).
//
// ── EVENT 1: Alice casts, baseDmg = 1000 ─────────────────────────────────────────────────────────────────────────────────
//
//   Bob provides:   bob_atk (+20%), bob_bdmg (+30%)   → combined multiplier 1.20 × 1.30 = 1.56
//   Carol provides: carol_crit (+25%), carol_el (+20%) → combined multiplier 1.25 × 1.20 = 1.50
//
//   Coalition values — v(S) = 1000 × multiplier_Bob_if_in(S) × multiplier_Carol_if_in(S):
//     v(∅)           = 1000
//     v({Bob})       = 1000 × 1.56            = 1560
//     v({Carol})     = 1000 × 1.50            = 1500
//     v({Bob,Carol}) = 1000 × 1.56 × 1.50    = 2340
//
//   Shapley values (2 external players → 2! = 2 permutations each):
//     φ_Bob   = ½ [v({Bob})       − v(∅)]        + ½ [v({Bob,Carol}) − v({Carol})]
//             = ½ (1560 − 1000)                  + ½ (2340 − 1500)
//             = ½ × 560                          + ½ × 840
//             = 280 + 420 = 700
//
//     φ_Carol = ½ [v({Carol})     − v(∅)]        + ½ [v({Bob,Carol}) − v({Bob})]
//             = ½ (1500 − 1000)                  + ½ (2340 − 1560)
//             = ½ × 500                          + ½ × 780
//             = 250 + 390 = 640
//
//     Alice (caster) receives v(∅) = 1000
//     Check: 1000 + 700 + 640 = 2340 = event1.average ✓
//
// ── EVENT 2: Bob casts, baseDmg = 500 ────────────────────────────────────────────────────────────────────────────────────
//
//   Alice provides: alice_atk (+40%), alice_bdmg (+25%) → combined multiplier 1.40 × 1.25 = 1.75
//   Carol provides: carol_crit2 (+20%), carol_el2 (+10%) → combined multiplier 1.20 × 1.10 = 1.32
//
//   Coalition values:
//     v(∅)              = 500
//     v({Alice})        = 500 × 1.75            = 875
//     v({Carol})        = 500 × 1.32            = 660
//     v({Alice,Carol})  = 500 × 1.75 × 1.32    = 1155
//
//   Shapley values:
//     φ_Alice = ½ [v({Alice})      − v(∅)]         + ½ [v({Alice,Carol}) − v({Carol})]
//             = ½ (875 − 500)                      + ½ (1155 − 660)
//             = ½ × 375                            + ½ × 495
//             = 187.5 + 247.5 = 435
//
//     φ_Carol = ½ [v({Carol})      − v(∅)]         + ½ [v({Alice,Carol}) − v({Alice})]
//             = ½ (660 − 500)                      + ½ (1155 − 875)
//             = ½ × 160                            + ½ × 280
//             = 80 + 140 = 220
//
//     Bob (caster) receives v(∅) = 500
//     Check: 500 + 435 + 220 = 1155 = event2.average ✓
//
// ── ACCUMULATED TOTALS ────────────────────────────────────────────────────────────────────────────────────────────────────
//
//   Alice = 1000 (caster share, event 1) + 435 (buffer share, event 2) = 1435
//   Bob   =  700 (buffer share, event 1) + 500 (caster share, event 2) = 1200
//   Carol =  640 (buffer share, event 1) + 220 (buffer share, event 2) =  860
//
//   Grand total = 1435 + 1200 + 860 = 3495 = 2340 + 1155 ✓
//
// ============================================================================================================================

describe('multi-event Shapley attribution accumulation', () => {
  const event1 = makeEvent('Alice', [
    { key: 'bob_atk',   owner: 'Bob',   value: 0.20 },
    { key: 'bob_bdmg',  owner: 'Bob',   value: 0.30 },
    { key: 'carol_crit', owner: 'Carol', value: 0.25 },
    { key: 'carol_el',  owner: 'Carol', value: 0.20 },
  ], 1000)

  const event2 = makeEvent('Bob', [
    { key: 'alice_atk',   owner: 'Alice', value: 0.40 },
    { key: 'alice_bdmg',  owner: 'Alice', value: 0.25 },
    { key: 'carol_crit2', owner: 'Carol', value: 0.20 },
    { key: 'carol_el2',   owner: 'Carol', value: 0.10 },
  ], 500)

  describe('event 1 — Alice casts, Bob and Carol each have 2 buffs', () => {
    const { casterShare, externalByOwner } = splitEventByCharacter(event1, 'Alice')

    it('Alice (caster) receives v(∅) = 1000', () => {
      expect(casterShare).toBeCloseTo(1000, TOL)
    })

    it('Bob receives φ_Bob = 700', () => {
      expect(externalByOwner.get('Bob')).toBeCloseTo(700, TOL)
    })

    it('Carol receives φ_Carol = 640', () => {
      expect(externalByOwner.get('Carol')).toBeCloseTo(640, TOL)
    })

    it('shares sum to event1.average (2340)', () => {
      const total = casterShare
        + (externalByOwner.get('Bob') ?? 0)
        + (externalByOwner.get('Carol') ?? 0)
      expect(total).toBeCloseTo(2340, TOL)
    })
  })

  describe('event 2 — Bob casts, Alice and Carol each have 2 buffs', () => {
    const { casterShare, externalByOwner } = splitEventByCharacter(event2, 'Bob')

    it('Bob (caster) receives v(∅) = 500', () => {
      expect(casterShare).toBeCloseTo(500, TOL)
    })

    it('Alice receives φ_Alice = 435', () => {
      expect(externalByOwner.get('Alice')).toBeCloseTo(435, TOL)
    })

    it('Carol receives φ_Carol = 220', () => {
      expect(externalByOwner.get('Carol')).toBeCloseTo(220, TOL)
    })

    it('shares sum to event2.average (1155)', () => {
      const total = casterShare
        + (externalByOwner.get('Alice') ?? 0)
        + (externalByOwner.get('Carol') ?? 0)
      expect(total).toBeCloseTo(1155, TOL)
    })
  })

  describe('accumulated attribution across both events', () => {
    const attribution = computeAttribution([event1, event2])

    it('Alice total = 1435 (1000 caster + 435 buffer)', () => {
      expect(attribution.get('Alice')).toBeCloseTo(1435, TOL)
    })

    it('Bob total = 1200 (700 buffer + 500 caster)', () => {
      expect(attribution.get('Bob')).toBeCloseTo(1200, TOL)
    })

    it('Carol total = 860 (640 buffer + 220 buffer)', () => {
      expect(attribution.get('Carol')).toBeCloseTo(860, TOL)
    })

    it('grand total = 3495 = event1.average + event2.average', () => {
      const grandTotal = [...attribution.values()].reduce((s, v) => s + v, 0)
      expect(grandTotal).toBeCloseTo(3495, TOL)
    })
  })
})
