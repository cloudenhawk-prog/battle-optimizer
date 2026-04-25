import type { Action } from '../../../types/action'

import * as skills from './skills/cheatBuff'
import * as introOutro from './others/introOutro'


export const all_actions = [
  ...Object.values(skills),
  ...Object.values(introOutro)
] as Action[]
