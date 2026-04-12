import type { Action } from '../../../../types/action'
import type { EnergyType } from '../../../../types/baseTypes'

function makeEnergyUpAction(energyType: EnergyType, displayName: string): Action {
  return {
    name: `${displayName} Up`,
    displayName: `${displayName} Up`,
    category: 'Testing',
    castTime: 0,
    multiplier: 0,
    scaling: 'ATK',
    elements: [''],
    dmgTypes: [''],
    cooldown: 0,
    energyGenerated: [{ energyType, amount: 1000, share: 0 }],
    energyCost: [],
    statusModifications: [],
    damageModifiers: [],
    sideEffects: [],
    castConditions: {
      startState: 'ANY',
      endState: 'PRESERVE',
    },
    offtune: 0,
  }
}

const hiyuki_energy               = makeEnergyUpAction('energy',                'Energy')
const hiyuki_concerto             = makeEnergyUpAction('concerto',              'Concerto')
const hiyuki_dedication           = makeEnergyUpAction('dedication',            'Dedication')
const hiyuki_foreclaiming         = makeEnergyUpAction('foreclaiming',          'Foreclaiming')
const hiyuki_frostharden_iai      = makeEnergyUpAction('frostharden_iai',       'Frostharden Iai')
const hiyuki_frostheart           = makeEnergyUpAction('frostheart',            'Frostheart')
const hiyuki_whiteout_bitterfrost = makeEnergyUpAction('whiteout_bitterfrost',  'Whiteout Bitterfrost')
const hiyuki_snowforged_blade     = makeEnergyUpAction('snowforged_blade',      'Snowforged Blade')
const hiyuki_snow_rust            = makeEnergyUpAction('snow_rust',             'Snow Rust')
const hiyuki_s1_enhanced_ba1      = makeEnergyUpAction('s1_enhanced_ba1',       'S1 Enhanced BA1')
const hiyuki_s1_enhanced_ba2      = makeEnergyUpAction('s1_enhanced_ba2',       'S1 Enhanced BA2')
const hiyuki_s2_frostheart_token  = makeEnergyUpAction('s2_frostheart_token',   'S2 Frostheart Token')

export {
  hiyuki_energy,
  hiyuki_concerto,
  hiyuki_dedication,
  hiyuki_foreclaiming,
  hiyuki_frostharden_iai,
  hiyuki_frostheart,
  hiyuki_whiteout_bitterfrost,
  hiyuki_snowforged_blade,
  hiyuki_snow_rust,
  hiyuki_s1_enhanced_ba1,
  hiyuki_s1_enhanced_ba2,
  hiyuki_s2_frostheart_token,
}
