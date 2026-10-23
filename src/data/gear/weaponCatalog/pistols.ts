// Pistol weapon catalog entries (per-rank injected modifiers).
import { always } from '../../helpers/modifierConditions'
import type { WeaponCatalogEntry } from './types'

export const pistolWeapons: WeaponCatalogEntry[] = [
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
]
