import type { Action } from '../../../types/action'

import * as skills from './skills/cheatBuff'
import * as glacioChafe26 from './skills/glacioChafe26'
import * as introOutro from './others/introOutro'


export const all_actions = [
  ...Object.values(skills),
  ...Object.values(glacioChafe26),
  ...Object.values(introOutro)
] as Action[]
