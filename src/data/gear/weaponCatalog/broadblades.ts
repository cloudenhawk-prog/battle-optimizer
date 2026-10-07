// Broadblade weapon catalog entries (per-rank injected modifiers).
import { always } from '../../helpers/modifierConditions'
import type { WeaponCatalogEntry } from './types'

export const broadbladeWeapons: WeaponCatalogEntry[] = [
  {
    name: 'Starfield Calibrator',
    weaponType: 'Broadblade',
    stats: { baseATK: 412.50, energyPercent: 0.7704 },
    icon: 'assets/gear/weapons/starfield_calibrator.png',
    info: 'Increases DEF by 16%/20%/24%/28%/32%. Casting Resonance Liberation restores 8/10/12/14/16 points of Concerto Energy. This effect can be triggered 1 time every 20s. When the wielder heals Resonators, increases Crit. DMG of all nearby Resonators in the team by 20%/25%/30%/35%/40% for 4s. Effects of the same name cannot be stacked.',
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
                description: 'Increases DEF by 16%.',
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
                description: 'When the wielder heals Resonators, increases Crit. DMG of all nearby Resonators in the team by 20% for 4s.',
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
                description: 'Increases DEF by 20%.',
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
                description: 'When the wielder heals Resonators, increases Crit. DMG of all nearby Resonators in the team by 25% for 4s.',
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
                description: 'Increases DEF by 24%.',
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
                description: 'When the wielder heals Resonators, increases Crit. DMG of all nearby Resonators in the team by 30% for 4s.',
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
                description: 'Increases DEF by 28%.',
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
                description: 'When the wielder heals Resonators, increases Crit. DMG of all nearby Resonators in the team by 25% for 4s.', // NOTE: text says 25%, value is 35% (R4)
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
                description: 'Increases DEF by 32%.',
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
                description: 'When the wielder heals Resonators, increases Crit. DMG of all nearby Resonators in the team by 40% for 4s.',
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
