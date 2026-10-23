// Rectifier weapon catalog entries (per-rank injected modifiers).
import { always } from '../../helpers/modifierConditions'
import type { WeaponCatalogEntry } from './types'

export const rectifierWeapons: WeaponCatalogEntry[] = [
  {
    name: 'Freeze Frame',
    weaponType: 'Rectifier',
    stats: { baseATK: 587.50, critRate: 0.243 },
    icon: 'assets/gear/weapons/freeze_frame.png',
    info: 'Increases ATK by 12%/15%/18%/21%/24%. After the wielder inflicts Glacio Chafe on the target, their Glacio DMG Bonus is increased by 30%/37.5%/45%/52.5%/60% for 12s. The ATK of all Resonators in the team (including self) is increased by 24%/30%/36%/42%/48% ATK for 30s.',
    ranks: {
      1: {
        injectedModifiers: [
          {
            targets: ['character'],
            modifiers: [
              {
                source: 'Freeze Frame',
                displayName: 'Freeze Frame: Passive ATK',
                type: 'buff',
                description: 'Increases ATK by 12%.',
                ownerCharacter: null,
                condition: always(),
                characterStats: { bonusATK: 0.12 },
                targetStrategy: 'self',
                durationStrategy: { type: 'permanent' },
                stackingStrategy: { maxStacks: 1, resetTimerOnApplication: false, stacksRemovedEachTime: 0 },
              },
            ],
          },
          {
            targets: [{ tag: 'GLACIO_CHAFE_APPLIER' }],
            modifiers: [
              {
                source: 'Freeze Frame',
                displayName: 'Freeze Frame: Glacio DMG Bonus',
                type: 'buff',
                description: 'After inflicting Glacio Chafe, Glacio DMG Bonus +30% for 12s.',
                ownerCharacter: null,
                condition: always(),
                characterStats: { glacioBonusDMG: 0.30 },
                targetStrategy: 'self',
                durationStrategy: { type: 'limited', timeDuration: 12 },
                stackingStrategy: { maxStacks: 1, resetTimerOnApplication: true, stacksRemovedEachTime: 1 },
              },
              {
                source: 'Freeze Frame',
                displayName: 'Freeze Frame: Team ATK',
                type: 'buff',
                description: 'After inflicting Glacio Chafe, ATK of all Resonators in the team +24% for 30s.',
                ownerCharacter: null,
                condition: always(),
                characterStats: { bonusATK: 0.24 },
                targetStrategy: 'all',
                durationStrategy: { type: 'limited', timeDuration: 30 },
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
                source: 'Freeze Frame',
                displayName: 'Freeze Frame: Passive ATK',
                type: 'buff',
                description: 'Increases ATK by 15%.',
                ownerCharacter: null,
                condition: always(),
                characterStats: { bonusATK: 0.15 },
                targetStrategy: 'self',
                durationStrategy: { type: 'permanent' },
                stackingStrategy: { maxStacks: 1, resetTimerOnApplication: false, stacksRemovedEachTime: 0 },
              },
            ],
          },
          {
            targets: [{ tag: 'GLACIO_CHAFE_APPLIER' }],
            modifiers: [
              {
                source: 'Freeze Frame',
                displayName: 'Freeze Frame: Glacio DMG Bonus',
                type: 'buff',
                description: 'After inflicting Glacio Chafe, Glacio DMG Bonus +37.5% for 12s.',
                ownerCharacter: null,
                condition: always(),
                characterStats: { glacioBonusDMG: 0.375 },
                targetStrategy: 'self',
                durationStrategy: { type: 'limited', timeDuration: 12 },
                stackingStrategy: { maxStacks: 1, resetTimerOnApplication: true, stacksRemovedEachTime: 1 },
              },
              {
                source: 'Freeze Frame',
                displayName: 'Freeze Frame: Team ATK',
                type: 'buff',
                description: 'After inflicting Glacio Chafe, ATK of all Resonators in the team +30% for 30s.',
                ownerCharacter: null,
                condition: always(),
                characterStats: { bonusATK: 0.30 },
                targetStrategy: 'all',
                durationStrategy: { type: 'limited', timeDuration: 30 },
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
                source: 'Freeze Frame',
                displayName: 'Freeze Frame: Passive ATK',
                type: 'buff',
                description: 'Increases ATK by 18%.',
                ownerCharacter: null,
                condition: always(),
                characterStats: { bonusATK: 0.18 },
                targetStrategy: 'self',
                durationStrategy: { type: 'permanent' },
                stackingStrategy: { maxStacks: 1, resetTimerOnApplication: false, stacksRemovedEachTime: 0 },
              },
            ],
          },
          {
            targets: [{ tag: 'GLACIO_CHAFE_APPLIER' }],
            modifiers: [
              {
                source: 'Freeze Frame',
                displayName: 'Freeze Frame: Glacio DMG Bonus',
                type: 'buff',
                description: 'After inflicting Glacio Chafe, Glacio DMG Bonus +45% for 12s.',
                ownerCharacter: null,
                condition: always(),
                characterStats: { glacioBonusDMG: 0.45 },
                targetStrategy: 'self',
                durationStrategy: { type: 'limited', timeDuration: 12 },
                stackingStrategy: { maxStacks: 1, resetTimerOnApplication: true, stacksRemovedEachTime: 1 },
              },
              {
                source: 'Freeze Frame',
                displayName: 'Freeze Frame: Team ATK',
                type: 'buff',
                description: 'After inflicting Glacio Chafe, ATK of all Resonators in the team +36% for 30s.',
                ownerCharacter: null,
                condition: always(),
                characterStats: { bonusATK: 0.36 },
                targetStrategy: 'all',
                durationStrategy: { type: 'limited', timeDuration: 30 },
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
                source: 'Freeze Frame',
                displayName: 'Freeze Frame: Passive ATK',
                type: 'buff',
                description: 'Increases ATK by 21%.',
                ownerCharacter: null,
                condition: always(),
                characterStats: { bonusATK: 0.21 },
                targetStrategy: 'self',
                durationStrategy: { type: 'permanent' },
                stackingStrategy: { maxStacks: 1, resetTimerOnApplication: false, stacksRemovedEachTime: 0 },
              },
            ],
          },
          {
            targets: [{ tag: 'GLACIO_CHAFE_APPLIER' }],
            modifiers: [
              {
                source: 'Freeze Frame',
                displayName: 'Freeze Frame: Glacio DMG Bonus',
                type: 'buff',
                description: 'After inflicting Glacio Chafe, Glacio DMG Bonus +52.5% for 12s.',
                ownerCharacter: null,
                condition: always(),
                characterStats: { glacioBonusDMG: 0.525 },
                targetStrategy: 'self',
                durationStrategy: { type: 'limited', timeDuration: 12 },
                stackingStrategy: { maxStacks: 1, resetTimerOnApplication: true, stacksRemovedEachTime: 1 },
              },
              {
                source: 'Freeze Frame',
                displayName: 'Freeze Frame: Team ATK',
                type: 'buff',
                description: 'After inflicting Glacio Chafe, ATK of all Resonators in the team +42% for 30s.',
                ownerCharacter: null,
                condition: always(),
                characterStats: { bonusATK: 0.42 },
                targetStrategy: 'all',
                durationStrategy: { type: 'limited', timeDuration: 30 },
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
                source: 'Freeze Frame',
                displayName: 'Freeze Frame: Passive ATK',
                type: 'buff',
                description: 'Increases ATK by 24%.',
                ownerCharacter: null,
                condition: always(),
                characterStats: { bonusATK: 0.24 },
                targetStrategy: 'self',
                durationStrategy: { type: 'permanent' },
                stackingStrategy: { maxStacks: 1, resetTimerOnApplication: false, stacksRemovedEachTime: 0 },
              },
            ],
          },
          {
            targets: [{ tag: 'GLACIO_CHAFE_APPLIER' }],
            modifiers: [
              {
                source: 'Freeze Frame',
                displayName: 'Freeze Frame: Glacio DMG Bonus',
                type: 'buff',
                description: 'After inflicting Glacio Chafe, Glacio DMG Bonus +60% for 12s.',
                ownerCharacter: null,
                condition: always(),
                characterStats: { glacioBonusDMG: 0.60 },
                targetStrategy: 'self',
                durationStrategy: { type: 'limited', timeDuration: 12 },
                stackingStrategy: { maxStacks: 1, resetTimerOnApplication: true, stacksRemovedEachTime: 1 },
              },
              {
                source: 'Freeze Frame',
                displayName: 'Freeze Frame: Team ATK',
                type: 'buff',
                description: 'After inflicting Glacio Chafe, ATK of all Resonators in the team +48% for 30s.',
                ownerCharacter: null,
                condition: always(),
                characterStats: { bonusATK: 0.48 },
                targetStrategy: 'all',
                durationStrategy: { type: 'limited', timeDuration: 30 },
                stackingStrategy: { maxStacks: 1, resetTimerOnApplication: true, stacksRemovedEachTime: 1 },
              },
            ],
          },
        ],
      },
    },
  },
]
