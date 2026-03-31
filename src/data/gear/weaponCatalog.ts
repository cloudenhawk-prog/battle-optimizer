/**
 * Catalog of all weapons available for selection in the gear picker.
 *
 * A catalog entry contains all static properties of a weapon — the only variable across ranks
 * is the injected modifiers (and occasionally a stat that scales with rank, e.g. a passive HP bonus).
 *
 * Only ranks with known data are defined. Undefined ranks are not selectable in the weapon picker.
 * Add more rank entries as their values are verified.
 */
import { always, atLeastOneStackOf } from '../../utils/conditions/damageModifierConditions'
import type { Weapon, WeaponType, InjectedModifier } from '../../types/gear'
import type { CharacterStats } from '../../types/stats'

// ========== Types ============================================================================================================

export type WeaponRankData = {
  injectedModifiers?: InjectedModifier[]
}

export type WeaponCatalogEntry = {
  name: string
  weaponType: WeaponType
  /** Base stats that are identical across all ranks. */
  stats: Partial<CharacterStats>
  icon: string
  info: string
  /** Only ranks with defined data are selectable in the weapon picker. */
  ranks: Partial<Record<1 | 2 | 3 | 4 | 5, WeaponRankData>>
}

// ========== Weapon Catalog ===================================================================================================

export const weaponCatalog: WeaponCatalogEntry[] = [

  // ==========================================================================================================================
  // Sword
  // ==========================================================================================================================

  {
    name: "Defier's Thorn",
    weaponType: 'Sword',
    stats: { baseATK: 412.50, bonusHP: 0.7223 },
    icon: "assets/gear/weapons/defier's_thorn.png",
    info: "Max HP is increased by 12%/15%/18%/21%/24%. 15s after casting Intro Skill or Basic Attacks, ignore 8%/10%/12%/14%/16% of the target's DEF when dealing damage. If the target has at least 1 stack of Aero Erosion, the DMG taken by the target is Amplified by 20%/25%/30%/35%/40%.",
    ranks: {
      1: {
        injectedModifiers: [
          {
            targets: ['character'],
            modifiers: [
              {
                source: "Defier's Thorn",
                displayName: "A Free Knight's Tarantella (HP)",
                type: 'buff',
                ownerCharacter: null,
                condition: always(),
                characterStats: { bonusHP: 0.12 },
                targetStrategy: 'self',
                durationStrategy: { type: 'permanent' },
                stackingStrategy: { maxStacks: 1, resetTimerOnApplication: false, stacksRemovedEachTime: 0 },
              },
              {
                source: "Defier's Thorn",
                displayName: "A Free Knight's Tarantella (1)",
                type: 'buff',
                ownerCharacter: null,
                condition: always(),
                characterStats: { defIgnore: 0.08 },
                targetStrategy: 'self',
                durationStrategy: { type: 'permanent' },
                stackingStrategy: { maxStacks: 1, resetTimerOnApplication: false, stacksRemovedEachTime: 0 },
              },
              {
                source: "Defier's Thorn",
                displayName: "A Free Knight's Tarantella (2)",
                type: 'buff',
                ownerCharacter: null,
                condition: atLeastOneStackOf('Aero Erosion'),
                characterStats: { amplifyDMG: 0.2 },
                targetStrategy: 'self',
                durationStrategy: { type: 'permanent' },
                stackingStrategy: { maxStacks: 1, resetTimerOnApplication: false, stacksRemovedEachTime: 0 },
              },
            ],
          },
        ],
      },
    },
  },

  {
    name: "Bloodpact's Pledge",
    weaponType: 'Sword',
    stats: { baseATK: 587.50, energyPercent: 0.3888 },
    icon: "assets/gear/weapons/bloodpact's_pledge.png",
    info: "Providing Healing increases Resonance Skill DMG by 10%/14%/18%/22%/26% for 6s. When Rover: Aero casts Resonance Skill Unbound Flow, Aero DMG dealt by nearby Resonators on the field is Amplified by 10%/14%/18%/22%/26% for 30s.",
    ranks: {
      5: {
        injectedModifiers: [
          {
            targets: [{ tag: 'HEAL_PROC' }],
            modifiers: [
              {
                source: "Bloodpact's Pledge",
                displayName: 'Harmonious Vibrancy',
                type: 'buff',
                ownerCharacter: null,
                condition: always(),
                characterStats: { skillBonusDMG: 0.26 },
                targetStrategy: 'self',
                durationStrategy: { type: 'limited', timeDuration: 6 },
                stackingStrategy: { maxStacks: 1, resetTimerOnApplication: true, stacksRemovedEachTime: 1 },
              },
            ],
          },
          {
            targets: [{ tags: ['SKILL', 'HEAL_PROC'], match: 'all' }],
            modifiers: [
              {
                source: "Bloodpact's Pledge",
                displayName: 'Harmonious Vibrancy',
                type: 'buff',
                ownerCharacter: null,
                condition: always(),
                characterStats: { skillBonusDMG: 0.26 },
                targetStrategy: 'self',
                durationStrategy: { type: 'limited', timeDuration: 36 },
                stackingStrategy: { maxStacks: 1, resetTimerOnApplication: true, stacksRemovedEachTime: 1 },
              },
            ],
          },
        ],
      },
    },
  },

  // ==========================================================================================================================
  // Pistol
  // ==========================================================================================================================

  {
    name: 'Static Mist',
    weaponType: 'Pistol',
    stats: { baseATK: 587.50, critRate: 0.2430 },
    icon: 'assets/gear/weapons/static_mist.png',
    info: "Increases Energy Regen by 12.8%/16%/19.2%/22.4%/25.6%. Incoming Resonator's ATK is increased by 10%/12.5%/15%/17.5%/20% for 14s, stackable for up to 1 time after the wielder casts Outro Skill.",
    ranks: {
      3: {
        injectedModifiers: [
          {
            targets: ['character'],
            modifiers: [
              {
                source: 'Static Mist',
                displayName: 'Static Mist Energy Regen',
                type: 'buff',
                ownerCharacter: null,
                condition: always(),
                characterStats: { energyPercent: 0.192 },
                targetStrategy: 'self',
                durationStrategy: { type: 'permanent' },
                stackingStrategy: { maxStacks: 1, resetTimerOnApplication: false, stacksRemovedEachTime: 0 },
              },
            ],
          },
          {
            targets: [{ tag: 'OUTRO_ACTION' }],
            modifiers: [
              {
                source: 'Static Mist',
                displayName: 'Static Mist Outro Buff',
                type: 'buff',
                ownerCharacter: null,
                condition: always(),
                characterStats: { bonusATK: 0.15 },
                targetStrategy: 'nextSwap',
                durationStrategy: { type: 'limited', timeDuration: 14, numberOfSwaps: 1 },
                stackingStrategy: { maxStacks: 1, resetTimerOnApplication: true, stacksRemovedEachTime: 1 },
              },
            ],
          },
        ],
      },
    },
  },

  // ==========================================================================================================================
  // Broadblade
  // ==========================================================================================================================

  {
    name: 'Starfield Calibrator',
    weaponType: 'Broadblade',
    stats: { baseATK: 412.50, energyPercent: 0.7704 },
    icon: 'assets/gear/weapons/starfield_calibrator.png',
    info: "Increases DEF by 16%/20%/24%/28%/32%. Casting Resonance Liberation restores 8/10/12/14/16 points of Concerto Energy. This effect can be triggered 1 time every 20s. When the wielder heals Resonators, increases Crit. DMG of all nearby Resonators in the team by 20%/25%/30%/35%/40% for 4s. Effects of the same name cannot be stacked.",
    ranks: {
      1: {
        injectedModifiers: [
          {
            targets: ['character'],
            modifiers: [
              {
                source: 'Starfield Calibrator',
                displayName: 'Starfield Calibrator: Passive DEF',
                type: 'buff',
                ownerCharacter: null,
                condition: always(),
                characterStats: { bonusDEF: 0.16 },
                targetStrategy: 'self',
                durationStrategy: { type: 'permanent' },
                stackingStrategy: { maxStacks: 1, resetTimerOnApplication: false, stacksRemovedEachTime: 0 },
              },
            ],
          },
          {
            targets: [{ tag: 'LIBERATION' }],
            modifiers: [],
            energyGeneration: [{ energyType: 'concerto', amount: 8, share: 0, cooldownKey: 'Starfield Calibrator: Liberation Energy', cooldownDuration: 20 }],
          },
          {
            targets: [{ tag: 'HEAL_PROC' }],
            modifiers: [
              {
                source: 'Starfield Calibrator',
                displayName: 'Starfield Calibrator: Heal Buff',
                type: 'buff',
                color: '#FF9B5E',
                ownerCharacter: null,
                condition: always(),
                characterStats: { critDamage: 0.20 },
                targetStrategy: 'all',
                durationStrategy: { type: 'limited', timeDuration: 4 },
                stackingStrategy: { maxStacks: 1, resetTimerOnApplication: true, stacksRemovedEachTime: 1 },
              },
            ],
          },
        ],
      },
      2: {
        injectedModifiers: [
          {
            targets: ['character'],
            modifiers: [
              {
                source: 'Starfield Calibrator',
                displayName: 'Starfield Calibrator: Passive DEF',
                type: 'buff',
                ownerCharacter: null,
                condition: always(),
                characterStats: { bonusDEF: 0.20 },
                targetStrategy: 'self',
                durationStrategy: { type: 'permanent' },
                stackingStrategy: { maxStacks: 1, resetTimerOnApplication: false, stacksRemovedEachTime: 0 },
              },
            ],
          },
          {
            targets: [{ tag: 'LIBERATION' }],
            modifiers: [],
            energyGeneration: [{ energyType: 'concerto', amount: 10, share: 0, cooldownKey: 'Starfield Calibrator: Liberation Energy', cooldownDuration: 20 }],
          },
          {
            targets: [{ tag: 'HEAL_PROC' }],
            modifiers: [
              {
                source: 'Starfield Calibrator',
                displayName: 'Starfield Calibrator: Heal Buff',
                type: 'buff',
                color: '#FF9B5E',
                ownerCharacter: null,
                condition: always(),
                characterStats: { critDamage: 0.25 },
                targetStrategy: 'all',
                durationStrategy: { type: 'limited', timeDuration: 4 },
                stackingStrategy: { maxStacks: 1, resetTimerOnApplication: true, stacksRemovedEachTime: 1 },
              },
            ],
          },
        ],
      },
      3: {
        injectedModifiers: [
          {
            targets: ['character'],
            modifiers: [
              {
                source: 'Starfield Calibrator',
                displayName: 'Starfield Calibrator: Passive DEF',
                type: 'buff',
                ownerCharacter: null,
                condition: always(),
                characterStats: { bonusDEF: 0.24 },
                targetStrategy: 'self',
                durationStrategy: { type: 'permanent' },
                stackingStrategy: { maxStacks: 1, resetTimerOnApplication: false, stacksRemovedEachTime: 0 },
              },
            ],
          },
          {
            targets: [{ tag: 'LIBERATION' }],
            modifiers: [],
            energyGeneration: [{ energyType: 'concerto', amount: 12, share: 0, cooldownKey: 'Starfield Calibrator: Liberation Energy', cooldownDuration: 20 }],
          },
          {
            targets: [{ tag: 'HEAL_PROC' }],
            modifiers: [
              {
                source: 'Starfield Calibrator',
                displayName: 'Starfield Calibrator: Heal Buff',
                color: '#FF9B5E',
                type: 'buff',
                ownerCharacter: null,
                condition: always(),
                characterStats: { critDamage: 0.30 },
                targetStrategy: 'all',
                durationStrategy: { type: 'limited', timeDuration: 4 },
                stackingStrategy: { maxStacks: 1, resetTimerOnApplication: true, stacksRemovedEachTime: 1 },
              },
            ],
          },
        ],
      },
      4: {
        injectedModifiers: [
          {
            targets: ['character'],
            modifiers: [
              {
                source: 'Starfield Calibrator',
                displayName: 'Starfield Calibrator: Passive DEF',
                type: 'buff',
                ownerCharacter: null,
                condition: always(),
                characterStats: { bonusDEF: 0.28 },
                targetStrategy: 'self',
                durationStrategy: { type: 'permanent' },
                stackingStrategy: { maxStacks: 1, resetTimerOnApplication: false, stacksRemovedEachTime: 0 },
              },
            ],
          },
          {
            targets: [{ tag: 'LIBERATION' }],
            modifiers: [],
            energyGeneration: [{ energyType: 'concerto', amount: 14, share: 0, cooldownKey: 'Starfield Calibrator: Liberation Energy', cooldownDuration: 20 }],
          },
          {
            targets: [{ tag: 'HEAL_PROC' }],
            modifiers: [
              {
                source: 'Starfield Calibrator',
                displayName: 'Starfield Calibrator: Heal Buff',
                type: 'buff',
                color: '#FF9B5E',
                ownerCharacter: null,
                condition: always(),
                characterStats: { critDamage: 0.35 },
                targetStrategy: 'all',
                durationStrategy: { type: 'limited', timeDuration: 4 },
                stackingStrategy: { maxStacks: 1, resetTimerOnApplication: true, stacksRemovedEachTime: 1 },
              },
            ],
          },
        ],
      },
      5: {
        injectedModifiers: [
          {
            targets: ['character'],
            modifiers: [
              {
                source: 'Starfield Calibrator',
                displayName: 'Starfield Calibrator: Passive DEF',
                type: 'buff',
                ownerCharacter: null,
                condition: always(),
                characterStats: { bonusDEF: 0.32 },
                targetStrategy: 'self',
                durationStrategy: { type: 'permanent' },
                stackingStrategy: { maxStacks: 1, resetTimerOnApplication: false, stacksRemovedEachTime: 0 },
              },
            ],
          },
          {
            targets: [{ tag: 'LIBERATION' }],
            modifiers: [],
            energyGeneration: [{ energyType: 'concerto', amount: 16, share: 0, cooldownKey: 'Starfield Calibrator: Liberation Energy', cooldownDuration: 20 }],
          },
          {
            targets: [{ tag: 'HEAL_PROC' }],
            modifiers: [
              {
                source: 'Starfield Calibrator',
                displayName: 'Starfield Calibrator: Heal Buff',
                type: 'buff',
                color: '#FF9B5E',
                ownerCharacter: null,
                condition: always(),
                characterStats: { critDamage: 0.40 },
                targetStrategy: 'all',
                durationStrategy: { type: 'limited', timeDuration: 4 },
                stackingStrategy: { maxStacks: 1, resetTimerOnApplication: true, stacksRemovedEachTime: 1 },
              },
            ],
          },
        ],
      },
    },
  },

]

// ========== Builder ==========================================================================================================

/**
 * Build a Weapon instance from a catalog entry at a given rank.
 * Returns null if this rank is not defined in the catalog (i.e., not yet implemented).
 * Creates independent copies of stats and injected modifiers so two characters can equip
 * the same weapon without sharing mutable objects.
 */
export function buildWeapon(entry: WeaponCatalogEntry, rank: 1 | 2 | 3 | 4 | 5, characterName: string): Weapon | null {
  const rankData = entry.ranks[rank]
  if (!rankData) return null

  return {
    name: entry.name,
    weaponType: entry.weaponType,
    icon: entry.icon,
    info: entry.info,
    rank,
    stats: { ...entry.stats },
    injectedModifiers: rankData.injectedModifiers
      ? rankData.injectedModifiers.map(im => ({
          targets: [...im.targets],
          modifiers: im.modifiers.map(m => ({ ...m, ownerCharacter: characterName })),
          ...(im.energyGeneration ? { energyGeneration: [...im.energyGeneration] } : {}),
        }))
      : undefined,
  }
}
