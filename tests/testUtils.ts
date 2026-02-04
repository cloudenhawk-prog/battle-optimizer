/**
 * Test Utilities - Shared mock factories and helpers for tests
 * 
 * This file provides factory functions to create mock objects for testing.
 * All factories accept optional overrides to customize the returned objects.
 */

import type { Snapshot } from '../src/types/snapshot';
import type { Character } from '../src/types/character';
import type { Action } from '../src/types/action';
import type { Enemy } from '../src/types/enemy';
import type { NegativeStatusInAction, NegativeStatus } from '../src/types/negativeStatus';
import type { Buff, Debuff } from '../src/types/buff';
import type { DamageModifier } from '../src/types/modifiers';

// ========== Snapshot Mocks ===================================================================================================

export function createMockSnapshot(overrides: Partial<Snapshot> = {}): Snapshot {
  return {
    id: '1',
    character: undefined,
    action: undefined,
    fromTime: 0,
    toTime: 0,
    damage: 0,
    dps: 0,
    charactersEnergies: {},
    buffs: {},
    debuffs: {},
    negativeStatuses: {},
    ...overrides,
  };
}

// ========== Stats Mocks ======================================================================================================

export function createMockCharacterStats(overrides: Partial<import('../src/types/stats').CharacterStats> = {}): import('../src/types/stats').CharacterStats {
  return {
    level: 90,

    baseATK: 1000,
    flatATK: 0,
    bonusATK: 0,
    amplifyATK: 0,
    totalMultiplierATK: 1,

    baseHP: 10000,
    flatHP: 0,
    bonusHP: 0,
    amplifyHP: 0,
    totalMultiplierHP: 1,

    baseDEF: 500,
    flatDEF: 0,
    bonusDEF: 0,
    amplifyDEF: 0,
    totalMultiplierDEF: 1,

    critRate: 0.05,
    critDamage: 1.5,

    bonusDMG: 0,
    amplifyDMG: 0,
    totalMultiplierDMG: 1,

    defIgnore: 0,
    elementalResPEN: 0,
    resistancePEN: 0,

    basicBonusDMG: 0,
    basicAmplifyDMG: 0,
    basicTotalMultiplierDMG: 1,
    heavyBonusDMG: 0,
    heavyAmplifyDMG: 0,
    heavyTotalMultiplierDMG: 1,
    skillBonusDMG: 0,
    skillAmplifyDMG: 0,
    skillTotalMultiplierDMG: 1,
    liberationBonusDMG: 0,
    liberationAmplifyDMG: 0,
    liberationTotalMultiplierDMG: 1,
    coordinatedBonusDMG: 0,
    coordinatedAmplifyDMG: 0,
    coordinatedTotalMultiplierDMG: 1,
    echoBonusDMG: 0,
    echoAmplifyDMG: 0,
    echoTotalMultiplierDMG: 1,
    introBonusDMG: 0,
    introAmplifyDMG: 0,
    introTotalMultiplierDMG: 1,
    outroBonusDMG: 0,
    outroAmplifyDMG: 0,
    outroTotalMultiplierDMG: 1,

    aeroErosionBonusDMG: 0,
    aeroErosionAmplifyDMG: 0,
    aeroErosionTotalMultiplierDMG: 1,
    spectroFrazzleBonusDMG: 0,
    spectroFrazzleAmplifyDMG: 0,
    spectroFrazzleTotalMultiplierDMG: 1,
    havocBaneBonusDMG: 0,
    havocBaneAmplifyDMG: 0,
    havocBaneTotalMultiplierDMG: 1,
    glacioChafeBonusDMG: 0,
    glacioChafeAmplifyDMG: 0,
    glacioChafeTotalMultiplierDMG: 1,
    fusionBurstBonusDMG: 0,
    fusionBurstAmplifyDMG: 0,
    fusionBurstTotalMultiplierDMG: 1,
    electroFlareBonusDMG: 0,
    electroFlareAmplifyDMG: 0,
    electroFlareTotalMultiplierDMG: 1,

    spectroBonusDMG: 0,
    spectroAmplifyDMG: 0,
    spectroTotalMultiplierDMG: 1,
    fusionBonusDMG: 0,
    fusionAmplifyDMG: 0,
    fusionTotalMultiplierDMG: 1,
    aeroBonusDMG: 0,
    aeroAmplifyDMG: 0,
    aeroTotalMultiplierDMG: 1,
    glacioBonusDMG: 0,
    glacioAmplifyDMG: 0,
    glacioTotalMultiplierDMG: 1,
    electroBonusDMG: 0,
    electroAmplifyDMG: 0,
    electroTotalMultiplierDMG: 1,
    havocBonusDMG: 0,
    havocAmplifyDMG: 0,
    havocTotalMultiplierDMG: 1,

    energyPercent: 1,
    ...overrides,
  };
}

export function createMockEnemyStats(overrides: Partial<import('../src/types/stats').EnemyStats> = {}): import('../src/types/stats').EnemyStats {
  return {
    level: 90,
    glacioRES: 0.1,
    fusionRES: 0.1,
    electroRES: 0.1,
    aeroRES: 0.1,
    spectroRES: 0.1,
    havocRES: 0.1,
    resistance: 0,
    damageReduction: 0,
    ...overrides,
  };
}

// ========== Character Mocks ==================================================================================================

export function createMockCharacter(name: string, overrides: Partial<Character> = {}): Character {
  return {
    name,
    actions: [],
    buffs: [],
    debuffs: [],
    maxEnergies: {},
    stats: createMockCharacterStats(),
    damageModifiers: [],
    ...overrides,
  };
}

// ========== Action Mocks =====================================================================================================

export function createMockAction(name: string, overrides: Partial<Action> = {}): Action {
  return {
    name,
    castTime: 1.0,
    multiplier: 100,
    scaling: 'ATK',
    element: 'GLACIO',
    dmgType: 'BASIC',
    cooldown: 0,
    energyGenerated: [],
    energyCost: [],
    negativeStatusesApplied: {},
    buffsApplied: [],
    debuffsApplied: [],
    damageModifiers: [],
    ...overrides,
  };
}

// ========== Enemy Mocks ======================================================================================================

export function createMockEnemy(name: string = 'Test Enemy', overrides: Partial<Enemy> = {}): Enemy {
  return {
    name,
    stats: createMockEnemyStats(),
    ...overrides,
  };
}

// ========== Negative Status Mocks ============================================================================================

export function createMockNegativeStatus(name: string, overrides: Partial<NegativeStatus> = {}): NegativeStatus {
  return {
    name,
    duration: 10,
    maxStacksDefault: 1,
    frequency: 1,
    damage: { 1: 100 },
    element: 'FUSION',
    reductionStrategy: {
      stackConsumption: 0,
      triggerDmgOnReduction: false,
      resetTimerOnApplication: true,
    },
    damageModifiers: [],
    ...overrides,
  };
}

export function createMockActiveNegativeStatus(negativeStatus: NegativeStatus, overrides: Partial<NegativeStatusInAction> = {}): NegativeStatusInAction {
  return {
    negativeStatus,
    applicationTime: 0,
    timeLeft: negativeStatus.duration,
    currentStacks: 1,
    lastDamageTime: 0,
    ...overrides,
  };
}

export function createMockNegativeStatuses(): NegativeStatusInAction[] {
  return [];
}

// ========== Buff/Debuff Mocks ================================================================================================

export function createMockBuff(name: string, overrides: Partial<Buff> = {}): Buff {
  return {
    name,
    duration: 10,
    damageModifiers: [],
    expirationStrategy: { type: 'infinite' },
    targetingStrategy: { type: 'active' },
    source: 'test',
    ...overrides,
  };
}

export function createMockDebuff(name: string, overrides: Partial<Debuff> = {}): Debuff {
  return {
    name,
    duration: 10,
    damageModifiers: [],
    ...overrides,
  };
}

// ========== Damage Modifier Mocks ============================================================================================

export function createMockDamageModifier(source: string, overrides: Partial<DamageModifier> = {}): DamageModifier {
  return {
    source,
    ...overrides,
  };
}
