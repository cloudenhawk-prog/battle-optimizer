// Wishes of Quiet Snowfall echoes (Glacio set).
import { always } from '../../../helpers/modifierConditions'
import { echoSkill_aleph1, echoSkill_glommoth } from '../sharedEffects'
import type { EchoCatalogEntry } from '../types'

export const wishesOfQuietSnowfallEchoes: EchoCatalogEntry[] = [
  {
    name: 'Aleph-1',
    setName: 'Wishes of Quiet Snowfall',
    cost: 4,
    icon: 'assets/gear/echoes/aleph-1.png',
    info_icon: 'assets/gear/echoes/info_aleph-1.png',
    info: 'The Resonator with this Echo equipped in the main slot gains 12.00% Glacio DMG Bonus and 12.00% Resonance Liberation DMG Bonus. Summon Aleph-1\'s Creation to deal 21.88% Glacio DMG 5 times and 164.16% Glacio DMG one time to enemies.',
    firstSlotStats: { glacioBonusDMG: 0.12, liberationBonusDMG: 0.12 },
    echoSkill: echoSkill_aleph1,
  },
  {
    name: 'Tremor Warrior',
    setName: 'Wishes of Quiet Snowfall',
    cost: 3,
    icon: 'assets/gear/echoes/tremor_warrior.png',
    info_icon: 'assets/gear/echoes/info_tremor_warrior.png',
    info: '',
  },
  {
    name: 'Ironhoof',
    setName: 'Wishes of Quiet Snowfall',
    cost: 3,
    icon: 'assets/gear/echoes/ironhoof.png',
    info_icon: 'assets/gear/echoes/info_ironhoof.png',
    info: '',
  },
  {
    name: 'Frostbite Coleoid',
    setName: 'Wishes of Quiet Snowfall',
    cost: 3,
    icon: 'assets/gear/echoes/frostbite_coleoid.png',
    info_icon: 'assets/gear/echoes/info_frostbite_coleoid.png',
    info: '',
  },
  {
    name: 'Glommoth',
    setName: 'Wishes of Quiet Snowfall',
    cost: 3,
    icon: 'assets/gear/echoes/glommoth.png',
    info_icon: 'assets/gear/echoes/info_glommoth.png',
    info: 'Summon a Glommoth to stomp enemies, dealing 273.60% Glacio DMG. Casting Outro Skill within 15s after summoning Glommoth grants 12.00% Glacio DMG Bonus to the incoming Resonator for 15s. CD: 20s.',
    // TODO: verify firstSlotStats passive bonus
    echoSkill: echoSkill_glommoth,
    injectedModifiers: [
      {
        targets: [{ tag: 'OUTRO_ACTION' }],
        modifiers: [
          {
            source: 'Glommoth',
            displayName: 'Glommoth: Glacio DMG Bonus',
            type: 'buff',
            description: 'Outro Skill within 15s of Glommoth active: incoming Resonator gains 12% Glacio DMG Bonus for 15s.',
            ownerCharacter: null,
            // TODO: condition should check that Glommoth echo skill was used within the last 15s
            condition: always(),
            characterStats: { glacioBonusDMG: 0.12 },
            targetStrategy: 'nextSwap',
            durationStrategy: { type: 'limited', timeDuration: 15 },
            stackingStrategy: { maxStacks: 1, resetTimerOnApplication: true, stacksRemovedEachTime: 1 },
          },
        ],
      },
    ],
  },
  {
    name: 'Windlash Coleoid',
    setName: 'Wishes of Quiet Snowfall',
    cost: 3,
    icon: 'assets/gear/echoes/windlash_coleoid.png',
    info_icon: 'assets/gear/echoes/info_windlash_coleoid.png',
    info: '',
  },
  {
    name: 'Iceglint Dancer',
    setName: 'Wishes of Quiet Snowfall',
    cost: 1,
    icon: 'assets/gear/echoes/iceglint_dancer.png',
    info_icon: 'assets/gear/echoes/info_iceglint_dancer.png',
    info: '',
  },
  {
    name: 'Shadow Stepper',
    setName: 'Wishes of Quiet Snowfall',
    cost: 1,
    icon: 'assets/gear/echoes/shadow_stepper.png',
    info_icon: 'assets/gear/echoes/info_shadow_stepper.png',
    info: '',
  },
]
