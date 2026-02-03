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
import type { NegativeStatusInAction } from '../src/types/negativeStatus';

// ========== Snapshot Mocks ===================================================================================================

/**
 * Creates a minimal snapshot for testing
 * @param overrides - Partial snapshot properties to override defaults
 */
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

// ========== Character Mocks ==================================================================================================

/**
 * Creates a minimal character with default stats for testing
 * @param name - Character name
 * @param overrides - Partial character properties to override defaults
 */
export function createMockCharacter(name: string, overrides: Partial<Character> = {}): Character {
  return {
    name,
    actions: [],
    buffs: [],
    debuffs: [],
    maxEnergies: {},
    stats: {
      level: 90,
      baseATK: 1000,
      percentATK: 1,
      flatATK: 0,
      baseDEF: 500,
      percentDEF: 1,
      flatDEF: 0,
      baseHP: 10000,
      percentHP: 1,
      flatHP: 0,
      critRate: 0.05,
      critDamage: 1.5,
      dmgAmplification: 1,
      defIgnore: 0,
      elementalResPEN: 0,
      resistancePEN: 0,
      basicDMG: 0,
      heavyDMG: 0,
      skillDMG: 0,
      liberationDMG: 0,
      glacio: 0,
      fusion: 0,
      electro: 0,
      aero: 0,
      spectro: 0,
      havoc: 0,
    },
    damageModifiers: [],
    ...overrides,
  };
}

// ========== Action Mocks =====================================================================================================

/**
 * Creates a minimal action for testing
 * @param name - Action name
 * @param overrides - Partial action properties to override defaults
 */
export function createMockAction(name: string, overrides: Partial<Action> = {}): Action {
  return {
    name,
    castTime: 1.0,
    multiplier: 100,
    scaling: 'ATK',
    element: 'Glacio',
    dmgType: 'Basic',
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

/**
 * Creates a minimal enemy with default stats for testing
 * @param name - Enemy name (default: 'Test Enemy')
 */
export function createMockEnemy(name: string = 'Test Enemy'): Enemy {
  return {
    name,
    stats: {
      level: 90,
      glacioRES: 0.1,
      fusionRES: 0.1,
      electroRES: 0.1,
      aeroRES: 0.1,
      spectroRES: 0.1,
      havocRES: 0.1,
      resistance: 0,
      damageReduction: 0,
    },
  };
}

// ========== Negative Status Mocks ============================================================================================

/**
 * Creates empty negative status array for testing
 */
export function createMockNegativeStatuses(): NegativeStatusInAction[] {
  return [];
}
