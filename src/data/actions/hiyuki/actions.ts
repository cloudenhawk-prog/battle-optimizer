// TODO: When Foreclaiming: Inward Vision or Iai hits a target, if the target has no fewer than 10 stacks of Glacio Bite, consume 10 stacks and trigger Frostbind once.
// TODO: On status modification: refreshDuration: true or false?

// TODO : need a version of Foreclaiming skill and normal skill where you cancel the animation entirely and chain it into the next step (0 dmg, but might save lots of time)

// TODO you seem to be able to dash cancel BA5, perhaps skill too (generates iai token quickly)

// TODO: What other actions can be cast in mid-air? Liberation, skills? Enhanced Heavy Attack?

// TODO Try dash cancel versions of different actions
// TODO Try skill cancel versions of different actions

import * as BA1 from './form-present-self/basics/BA1'
import * as BA2 from './form-present-self/basics/BA2'
import * as BA3 from './form-present-self/basics/BA3'
import type { Action } from '../../../types/action'
import * as resonance from './form-present-self/skills/resonance'
import * as liberation from './form-present-self/skills/liberation'
import * as heavy from './form-present-self/specials/heavy'

import * as forclaimed_BA1 from './form-foreclaimed-self/basics/BA1'
import * as forclaimed_BA2 from './form-foreclaimed-self/basics/BA2'
import * as forclaimed_BA3 from './form-foreclaimed-self/basics/BA3'
import * as forclaimed_BA4 from './form-foreclaimed-self/basics/BA4'
import * as forclaimed_BA5 from './form-foreclaimed-self/basics/BA5'
import * as forclaimed_MA1 from './form-foreclaimed-self/basics/MA1'
import * as forclaimed_MA2 from './form-foreclaimed-self/basics/MA2'
import * as forclaimed_MA3 from './form-foreclaimed-self/basics/MA3'
import * as forclaimed_resonance from './form-foreclaimed-self/skills/resonance'
import * as forclaimed_liberation from './form-foreclaimed-self/skills/liberation'
import * as forclaimed_heavy from './form-foreclaimed-self/specials/heavy'
import * as forclaimed_iai from './form-foreclaimed-self/specials/iai'

import * as introOutro from './others/introOutro'
import * as swaps from './others/swaps'
import * as energies from './testing/energies'

export const intro_outro_actions = [introOutro.hiyuki_intro, introOutro.hiyuki_outro]

export const all_actions = [
  // Present Self
  ...Object.values(BA1),
  ...Object.values(BA2),
  ...Object.values(BA3),
  ...Object.values(resonance),
  ...Object.values(liberation),
  ...Object.values(heavy),

  // Foreclaimed Self
  ...Object.values(forclaimed_BA1),
  ...Object.values(forclaimed_BA2),
  ...Object.values(forclaimed_BA3),
  ...Object.values(forclaimed_BA4),
  ...Object.values(forclaimed_BA5),
  ...Object.values(forclaimed_MA1),
  ...Object.values(forclaimed_MA2),
  ...Object.values(forclaimed_MA3),
  ...Object.values(forclaimed_resonance),
  ...Object.values(forclaimed_liberation),
  ...Object.values(forclaimed_heavy),
  ...Object.values(forclaimed_iai),

  // Others
  ...Object.values(introOutro),
  ...Object.values(swaps),

  // Testing
  ...Object.values(energies),
] as Action[]
