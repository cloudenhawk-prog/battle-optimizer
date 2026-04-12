import { calculateDamage } from '../src/utils/calculators/damageCalculator'
import { resolveGear } from '../src/utils/gear/resolveGear'
import { weaponCatalog, buildWeapon } from '../src/data/gear/weaponCatalog'
import { createMockAction, createMockCharacterStats, createMockEnemy } from './testUtils'
import type { Gear } from '../src/types/gear'

// ========== Helpers ==========================================================================================================

function buildFrostburnGear(rank: 1 | 2 | 3 | 4 | 5 = 1): Gear {
  const entry = weaponCatalog.find(w => w.name === 'Frostburn')!
  const weapon = buildWeapon(entry, rank, 'TestChar')!
  return {
    weapon,
    echoSlots: { 1: null, 2: null, 3: null, 4: null, 5: null },
  }
}

// ========== Injection ========================================================================================================

describe('Frostburn: modifier injection', () => {
  it('injects both modifiers into GLACIO_CHAFE_APPLIER actions', () => {
    const gear = buildFrostburnGear(1)

    const chafe = createMockAction('Chafe Slash', {
      dmgTypes: ['SKILL'],
      elements: ['GLACIO'],
      tags: ['GLACIO_CHAFE_APPLIER'],
    })
    const other = createMockAction('Normal Attack', {
      dmgTypes: ['BASIC'],
      elements: ['GLACIO'],
    })

    resolveGear([chafe, other], [], gear, new Map())

    // The GLACIO_CHAFE_APPLIER action should receive both Frostburn buff modifiers
    expect(chafe.damageModifiers).toHaveLength(2)
    expect(chafe.damageModifiers.map(m => m.displayName)).toEqual(
      expect.arrayContaining(['Frostburn: Glacio Buff', 'Frostburn: Liberation Buff']),
    )
    const defIgnoreMod = chafe.damageModifiers.find(m => m.characterStats?.defIgnore !== undefined)
    expect(defIgnoreMod).toBeDefined()
    expect(defIgnoreMod!.characterStats!.defIgnore).toBe(0.10)
    const glacioMod = chafe.damageModifiers.find(m => m.characterStats?.glacioAmplifyDMG !== undefined)
    expect(glacioMod).toBeDefined()
    expect(glacioMod!.characterStats!.glacioAmplifyDMG).toBe(0.28)
  })

  it('does NOT inject into untagged actions', () => {
    const gear = buildFrostburnGear(1)

    const plain = createMockAction('Plain Attack', { dmgTypes: ['BASIC'] })

    resolveGear([plain], [], gear, new Map())

    expect(plain.damageModifiers).toHaveLength(0)
  })

  it('injects passive ATK modifier into character-level modifiers', () => {
    const gear = buildFrostburnGear(1)
    const characterDamageModifiers: any[] = []

    resolveGear([], characterDamageModifiers, gear, new Map())

    expect(characterDamageModifiers).toHaveLength(1)
    expect(characterDamageModifiers[0].characterStats.bonusATK).toBe(0.12)
  })
})

// ========== defIgnore condition ==============================================================================================

describe('Frostburn: defIgnore condition', () => {
  function getDefIgnoreCondition(rank: 1 | 2 | 3 | 4 | 5 = 1) {
    const gear = buildFrostburnGear(rank)
    const chafe = createMockAction('Chafe Slash', { tags: ['GLACIO_CHAFE_APPLIER'] })
    resolveGear([chafe], [], gear, new Map())
    return chafe.damageModifiers.find(m => m.characterStats?.defIgnore !== undefined)!.condition
  }

  it('returns 1 (active) for LIBERATION dmgType', () => {
    const condition = getDefIgnoreCondition()
    const ctx = { action: { dmgTypes: ['LIBERATION'] } } as any
    expect(condition(ctx)).toBe(1)
  })

  it('returns 0 (inactive) for non-LIBERATION dmgTypes', () => {
    const condition = getDefIgnoreCondition()
    expect(condition({ action: { dmgTypes: ['BASIC'] } } as any)).toBe(0)
    expect(condition({ action: { dmgTypes: ['SKILL'] } } as any)).toBe(0)
    expect(condition({ action: { dmgTypes: ['HEAVY'] } } as any)).toBe(0)
  })

  it('returns 1 when LIBERATION is among multiple dmgTypes', () => {
    const condition = getDefIgnoreCondition()
    const ctx = { action: { dmgTypes: ['LIBERATION', 'COORDINATED'] } } as any
    expect(condition(ctx)).toBe(1)
  })
})

// ========== defIgnore damage impact ==========================================================================================

describe('Frostburn: defIgnore boosts Liberation damage', () => {
  const enemy = createMockEnemy()
  const baseStats = createMockCharacterStats()
  const liberationAction = createMockAction('Liberation Strike', {
    multiplier: 1,
    scaling: 'ATK',
    elements: ['GLACIO'],
    dmgTypes: ['LIBERATION'],
  })

  it('defIgnore: 0.08 produces more Liberation damage than defIgnore: 0', () => {
    const withDefIgnore = calculateDamage({
      action: liberationAction,
      name: 'TestChar',
      stats: baseStats,
      damageModifiers: [],
      modifierCharacterStats: { defIgnore: 0.08 },
      modifierEnemyStats: {},
      enemy,
      snapshotId: 1,
      timeStamp: 0,
    })

    const withoutDefIgnore = calculateDamage({
      action: liberationAction,
      name: 'TestChar',
      stats: baseStats,
      damageModifiers: [],
      modifierCharacterStats: {},
      modifierEnemyStats: {},
      enemy,
      snapshotId: 1,
      timeStamp: 0,
    })

    expect(withDefIgnore.average).toBeGreaterThan(withoutDefIgnore.average)
  })

  it('defIgnore damage gain matches expected defense multiplier increase', () => {
    // Enemy level 85 → DEF = 8*85 + 792 = 1472
    // Attacker level 90 → ATK factor = 800 + 8*90 = 1520
    // defMult (no ignore)  = 1520 / (1520 + 1472)         ≈ 0.5080
    // defMult (8% ignore)  = 1520 / (1520 + 1472 * 0.92)  ≈ 0.5289
    // Expected ratio = (1520 + 1472) / (1520 + 1472*0.92) = 2992 / 2874.24 ≈ 1.0405

    const withDefIgnore = calculateDamage({
      action: liberationAction,
      name: 'TestChar',
      stats: baseStats,
      damageModifiers: [],
      modifierCharacterStats: { defIgnore: 0.08 },
      modifierEnemyStats: {},
      enemy,
      snapshotId: 1,
      timeStamp: 0,
    })

    const withoutDefIgnore = calculateDamage({
      action: liberationAction,
      name: 'TestChar',
      stats: baseStats,
      damageModifiers: [],
      modifierCharacterStats: {},
      modifierEnemyStats: {},
      enemy,
      snapshotId: 1,
      timeStamp: 0,
    })

    const ratio = withDefIgnore.average / withoutDefIgnore.average
    expect(ratio).toBeCloseTo(1.0405, 3)
  })
})
