// Sword weapon catalog entries (per-rank injected modifiers).
import { always, atLeastOneStackOf } from '../../helpers/modifierConditions'
import type { WeaponCatalogEntry } from './types'

export const swordWeapons: WeaponCatalogEntry[] = [
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
    name: 'Bloodpact\'s Pledge',
    weaponType: 'Sword',
    stats: { baseATK: 587.50, energyPercent: 0.3888 },
    icon: 'assets/gear/weapons/bloodpact\'s_pledge.png',
    info: 'Providing Healing increases Resonance Skill DMG by 10%/14%/18%/22%/26% for 6s. When Rover: Aero casts Resonance Skill Unbound Flow, Aero DMG dealt by nearby Resonators on the field is Amplified by 10%/14%/18%/22%/26% for 30s.',
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
          // NOTE: info describes a team Aero DMG Amplify on Unbound Flow; this models it as a 36s Skill DMG buff instead.
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

  {
    name: 'Frostburn',
    weaponType: 'Sword',
    stats: { baseATK: 587, critRate: 0.243 },
    icon: 'assets/gear/weapons/frostburn.png',
    info: 'Increase ATK by 12/15/18/21/24%. When applying Glacio Chafe, Glacio DMG is Amplified by 28/35/42/49/56% and Liberation DMG ignore 10/12.5/15/17.5/20% DEF for 20 seconds. When the wielder is the active resonator in the team, Glacio Chafe DMG dealt by all resoantors is amplified by 20% for 6s.',
    ranks: {
      1: {
        injectedModifiers: [
          {
            targets: ['character'],
            modifiers: [
              {
                source: 'Frostburn',
                displayName: 'Frostburn: Passive ATK',
                type: 'buff',
                description: 'Increases ATK by 12%.',
                ownerCharacter: null,
                condition: always(),
                characterStats: { bonusATK: 0.12 },
                targetStrategy: 'self',
                durationStrategy: { type: 'permanent' },
                stackingStrategy: { maxStacks: 1, resetTimerOnApplication: false, stacksRemovedEachTime: 0 },
              }
            ],
          },
          {
            targets: [{ tag: 'GLACIO_CHAFE_APPLIER' }],
            modifiers: [
              {
                source: 'Frostburn',
                displayName: 'Frostburn: Glacio Buff',
                description: 'When applying Glacio Chafe, Glacio DMG is Amplified by 28% for 20 seconds.',
                type: 'buff',
                color: '#FF2E3A',
                ownerCharacter: null,
                condition: always(),
                characterStats: { glacioAmplifyDMG: 0.28 },
                targetStrategy: 'self',
                durationStrategy: { type: 'limited', timeDuration: 20 },
                stackingStrategy: { maxStacks: 1, resetTimerOnApplication: true, stacksRemovedEachTime: 1 }
              },
              {
                source: 'Frostburn',
                displayName: 'Frostburn: Liberation Buff',
                type: 'buff',
                color: '#FF2E3A',
                description: 'When applying Glacio Chafe, Liberation DMG ignore 10% DEF for 20 seconds.',
                ownerCharacter: null,
                condition: (ctx) => ctx.action.dmgTypes.includes('LIBERATION') ? 1 : 0,
                characterStats: { defIgnore: 0.10 },
                targetStrategy: 'self',
                durationStrategy: { type: 'limited', timeDuration: 20 },
                stackingStrategy: { maxStacks: 1, resetTimerOnApplication: true, stacksRemovedEachTime: 1 }
              },
            ],
          }
        ],
      },
      2: {
        injectedModifiers: [
          {
            targets: ['character'],
            modifiers: [
              {
                source: 'Frostburn',
                displayName: 'Frostburn: Passive ATK',
                type: 'buff',
                description: 'Increases ATK by 15%.',
                ownerCharacter: null,
                condition: always(),
                characterStats: { bonusATK: 0.15 },
                targetStrategy: 'self',
                durationStrategy: { type: 'permanent' },
                stackingStrategy: { maxStacks: 1, resetTimerOnApplication: false, stacksRemovedEachTime: 0 },
              }
            ],
          },
          {
            targets: [{ tag: 'GLACIO_CHAFE_APPLIER' }],
            modifiers: [
              {
                source: 'Frostburn',
                displayName: 'Frostburn: Glacio Buff',
                type: 'buff',
                color: '#FF2E3A',
                description: 'When applying Glacio Chafe, Glacio DMG is Amplified by 35% for 20 seconds.',
                ownerCharacter: null,
                condition: always(),
                characterStats: { glacioAmplifyDMG: 0.35 },
                targetStrategy: 'self',
                durationStrategy: { type: 'limited', timeDuration: 20 },
                stackingStrategy: { maxStacks: 1, resetTimerOnApplication: true, stacksRemovedEachTime: 1 }
              },
              {
                source: 'Frostburn',
                displayName: 'Frostburn: Liberation Buff',
                type: 'buff',
                color: '#FF2E3A',
                description: 'When applying Glacio Chafe, Liberation DMG ignore 12.5% DEF for 20 seconds.',
                ownerCharacter: null,
                condition: (ctx) => ctx.action.dmgTypes.includes('LIBERATION') ? 1 : 0,
                characterStats: { defIgnore: 0.125 },
                targetStrategy: 'self',
                durationStrategy: { type: 'limited', timeDuration: 20 },
                stackingStrategy: { maxStacks: 1, resetTimerOnApplication: true, stacksRemovedEachTime: 1 }
              },
            ],
          }
        ],
      },
      3: {
        injectedModifiers: [
          {
            targets: ['character'],
            modifiers: [
              {
                source: 'Frostburn',
                displayName: 'Frostburn: Passive ATK',
                type: 'buff',
                description: 'Increases ATK by 18%.',
                ownerCharacter: null,
                condition: always(),
                characterStats: { bonusATK: 0.18 },
                targetStrategy: 'self',
                durationStrategy: { type: 'permanent' },
                stackingStrategy: { maxStacks: 1, resetTimerOnApplication: false, stacksRemovedEachTime: 0 },
              }
            ],
          },
          {
            targets: [{ tag: 'GLACIO_CHAFE_APPLIER' }],
            modifiers: [
              {
                source: 'Frostburn',
                displayName: 'Frostburn: Glacio Buff',
                type: 'buff',
                color: '#FF2E3A',
                description: 'When applying Glacio Chafe, Glacio DMG is Amplified by 42% for 20 seconds.',
                ownerCharacter: null,
                condition: always(),
                characterStats: { glacioAmplifyDMG: 0.42 },
                targetStrategy: 'self',
                durationStrategy: { type: 'limited', timeDuration: 20 },
                stackingStrategy: { maxStacks: 1, resetTimerOnApplication: true, stacksRemovedEachTime: 1 }
              },
              {
                source: 'Frostburn',
                displayName: 'Frostburn: Liberation Buff',
                type: 'buff',
                color: '#FF2E3A',
                description: 'When applying Glacio Chafe, Liberation DMG ignore 15% DEF for 20 seconds.',
                ownerCharacter: null,
                condition: (ctx) => ctx.action.dmgTypes.includes('LIBERATION') ? 1 : 0,
                characterStats: { defIgnore: 0.15 },
                targetStrategy: 'self',
                durationStrategy: { type: 'limited', timeDuration: 20 },
                stackingStrategy: { maxStacks: 1, resetTimerOnApplication: true, stacksRemovedEachTime: 1 }
              },
            ],
          }
        ],
      },
      4: {
        injectedModifiers: [
          {
            targets: ['character'],
            modifiers: [
              {
                source: 'Frostburn',
                displayName: 'Frostburn: Passive ATK',
                type: 'buff',
                description: 'Increases ATK by 21%.',
                ownerCharacter: null,
                condition: always(),
                characterStats: { bonusATK: 0.21 },
                targetStrategy: 'self',
                durationStrategy: { type: 'permanent' },
                stackingStrategy: { maxStacks: 1, resetTimerOnApplication: false, stacksRemovedEachTime: 0 },
              }
            ],
          },
          {
            targets: [{ tag: 'GLACIO_CHAFE_APPLIER' }],
            modifiers: [
              {
                source: 'Frostburn',
                displayName: 'Frostburn: Glacio Buff',
                type: 'buff',
                color: '#FF2E3A',
                description: 'When applying Glacio Chafe, Glacio DMG is Amplified by 49% for 20 seconds.',
                ownerCharacter: null,
                condition: always(),
                characterStats: { glacioAmplifyDMG: 0.49 },
                targetStrategy: 'self',
                durationStrategy: { type: 'limited', timeDuration: 20 },
                stackingStrategy: { maxStacks: 1, resetTimerOnApplication: true, stacksRemovedEachTime: 1 }
              },
              {
                source: 'Frostburn',
                displayName: 'Frostburn: Liberation Buff',
                type: 'buff',
                color: '#FF2E3A',
                description: 'When applying Glacio Chafe, Liberation DMG ignore 17.5% DEF for 20 seconds.',
                ownerCharacter: null,
                condition: (ctx) => ctx.action.dmgTypes.includes('LIBERATION') ? 1 : 0,
                characterStats: { defIgnore: 0.175 },
                targetStrategy: 'self',
                durationStrategy: { type: 'limited', timeDuration: 20 },
                stackingStrategy: { maxStacks: 1, resetTimerOnApplication: true, stacksRemovedEachTime: 1 }
              },
            ],
          }
        ],
      },
      5: {
        injectedModifiers: [
          {
            targets: ['character'],
            modifiers: [
              {
                source: 'Frostburn',
                displayName: 'Frostburn: Passive ATK',
                type: 'buff',
                description: 'Increases ATK by 24%.',
                ownerCharacter: null,
                condition: always(),
                characterStats: { bonusATK: 0.24 },
                targetStrategy: 'self',
                durationStrategy: { type: 'permanent' },
                stackingStrategy: { maxStacks: 1, resetTimerOnApplication: false, stacksRemovedEachTime: 0 },
              }
            ],
          },
          {
            targets: [{ tag: 'GLACIO_CHAFE_APPLIER' }],
            modifiers: [
              {
                source: 'Frostburn',
                displayName: 'Frostburn: Glacio Buff',
                type: 'buff',
                color: '#FF2E3A',
                description: 'When applying Glacio Chafe, Glacio DMG is Amplified by 56% for 20 seconds.',
                ownerCharacter: null,
                condition: always(),
                characterStats: { glacioAmplifyDMG: 0.56 },
                targetStrategy: 'self',
                durationStrategy: { type: 'limited', timeDuration: 20 },
                stackingStrategy: { maxStacks: 1, resetTimerOnApplication: true, stacksRemovedEachTime: 1 }
              },
              {
                source: 'Frostburn',
                displayName: 'Frostburn: Liberation Buff',
                type: 'buff',
                color: '#FF2E3A',
                description: 'When applying Glacio Chafe, Liberation DMG ignore 20% DEF for 20 seconds.',
                ownerCharacter: null,
                condition: (ctx) => ctx.action.dmgTypes.includes('LIBERATION') ? 1 : 0,
                characterStats: { defIgnore: 0.20 },
                targetStrategy: 'self',
                durationStrategy: { type: 'limited', timeDuration: 20 },
                stackingStrategy: { maxStacks: 1, resetTimerOnApplication: true, stacksRemovedEachTime: 1 }
              },
            ],
          }
        ],
      },
    },
  },
]
