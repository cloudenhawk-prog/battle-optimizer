// Cartethyia — Liberation "A Knight's Heartfelt Prayers": transforms into Fleurdelys and applies the Mandate buffs.
import type { Action } from '../../../../../types/action'
import { hasForteGrant } from '../../../../helpers/modifierConditions'

// ========== Transform ========================================================================================================
export const cartethyia_transform: Action = {
  name: 'To Fleurdelys Form',
  displayName: 'A Knights Heartfelt Prayers',
  category: 'Skills',
  castTime: 0.16,
  multiplier: 0,
  scaling: 'HP',
  elements: [''],
  dmgTypes: [''],
  cooldown: 25,
  energyGenerated: [
    { energyType: 'energy', amount: 0, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 20, share: 0 },
  ],
  energyCost: [{ energyType: 'energy', amount: 125 }],
  statusModifications: [],
  damageModifiers: [
    {
      // Coordinator buff: exists for resourceMilestones and clears forte grants on expiry.
      source: 'Cartethyia: Mandate',
      displayName: 'Mandate',
      type: 'buff',
      ownerCharacter: 'Cartethyia',
      color: '#1e90ff',
      condition: hasForteGrant('Mandate of Divinity'),
      targetStrategy: 'self',
      durationStrategy: { type: 'limited', timeDuration: 12 },
      stackingStrategy: { maxStacks: 1, resetTimerOnApplication: true, stacksRemovedEachTime: 1 },
      // When Mandate expires (timer or Liberation), all forte grants are cleared so the
      // next Mandate cast starts from a clean slate.
      clearsForteGrantsOnExpiry: true,
      contributionGroup: 'Cartethyia: Mandate',
    },
    {
      // Active when Sword of Divinity was consumed: amplifies Aero Erosion DMG and speeds up tick rate.
      source: 'Cartethyia: Mandate of Divinity',
      displayName: 'Mandate of Divinity',
      type: 'buff',
      ownerCharacter: 'Cartethyia',
      color: '#ff8c00',
      characterStats: { aeroErosionAmplifyDMG: 0.5 },
      negativeStatusEffects: [
        { targetStatus: 'Aero Erosion', property: 'frequency', value: -0.5 },
      ],
      condition: hasForteGrant('Mandate of Divinity'),
      targetStrategy: 'self',
      durationStrategy: { type: 'limited', timeDuration: 12 },
      stackingStrategy: { maxStacks: 1, resetTimerOnApplication: true, stacksRemovedEachTime: 1 },
      contributionGroup: 'Cartethyia: Mandate',
    },
    {
      // Active when Sword of Discord was consumed: presence marker (no stat effects, used as a condition).
      source: 'Cartethyia: Power of Discord',
      displayName: 'Power of Discord',
      type: 'buff',
      ownerCharacter: 'Cartethyia',
      color: '#5a00a8',
      condition: hasForteGrant('Power of Discord'),
      targetStrategy: 'self',
      durationStrategy: { type: 'limited', timeDuration: 12 },
      stackingStrategy: { maxStacks: 1, resetTimerOnApplication: true, stacksRemovedEachTime: 1 },
      contributionGroup: 'Cartethyia: Mandate',
    },
    {
      // S2: Once Sword of Discord is consumed, permanently raises the Aero Erosion max stack cap by 3.
      source: 'Cartethyia S2',
      displayName: 'Blade Broken by Tempest',
      type: 'buff',
      ownerCharacter: 'Cartethyia',
      color: '#b6f0ff',
      negativeStatusEffects: [
        { targetStatus: 'Aero Erosion', property: 'maxStacks', value: 3 },
      ],
      condition: hasForteGrant('Power of Discord'),
      targetStrategy: 'self',
      durationStrategy: { type: 'limited', timeDuration: 100000 },
      stackingStrategy: { maxStacks: 1, resetTimerOnApplication: true, stacksRemovedEachTime: 1 },
      contributionGroup: 'Cartethyia: Mandate',
    },
  ],
  sideEffects: [],
  formChange: 'Fleurdelys',
  castConditions: {
    startState: 'ANY',
    endState: 'PRESERVE',
  },
  offtune: 0.0,
}
