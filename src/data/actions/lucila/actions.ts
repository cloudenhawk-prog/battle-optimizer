import type { Action } from '../../../types/action'

// Default Form — basics
import * as BA1 from './form-default/basics/BA1'
import * as BA2 from './form-default/basics/BA2'
import * as BA3 from './form-default/basics/BA3'

// Default Form — skills
import * as skill from './form-default/skills/skill'
import * as liberation from './form-default/skills/liberation'

// Reminiscence Form — basics
import * as tracingBA1 from './form-reminiscence/basics/tracingBA1'
import * as tracingBA2 from './form-reminiscence/basics/tracingBA2'
import * as tracingBA3 from './form-reminiscence/basics/tracingBA3'

// Reminiscence Form — specials
import * as lettingItGo from './form-reminiscence/specials/lettingItGo'

// Others
import * as introOutro from './others/introOutro'

// Testing / utility
import * as cheatBuff from './testing/cheatBuff'
import * as glacioChafe26 from './testing/glacioChafe26'
import * as energies from './testing/energies'

export const intro_outro_actions = [introOutro.lucila_intro, introOutro.lucila_outro]

export const all_actions = [
  // Default Form — basics
  ...Object.values(BA1),
  ...Object.values(BA2),
  ...Object.values(BA3),

  // Default Form — skills
  ...Object.values(skill),
  ...Object.values(liberation),

  // Reminiscence Form — basics
  ...Object.values(tracingBA1),
  ...Object.values(tracingBA2),
  ...Object.values(tracingBA3),

  // Reminiscence Form — specials
  ...Object.values(lettingItGo),

  // Others
  ...Object.values(introOutro),

  // Testing / utility
  ...Object.values(energies),
  ...Object.values(cheatBuff),
  ...Object.values(glacioChafe26),
] as Action[]

