// Mornye — assembles every action into all_actions (order matters: UI listing + golden snapshots).
//
// Layout: form-baseline/ (Baseline Mode) and form-wide-field/ (Wide Field Observation Mode, entered via
// Heavy Attack or Intro), each split into basics/ (BA = basic attack chain, e.g. BA1_3 = stages 1-3; heavy)
// and skills/ (resonance skill, liberation). others/ = intro/outro + wait utilities, testing/ = resource
// top-ups. values.ts holds the per-stage numbers. Variant suffixes: _into_heavy / _cancel_with_swap|skill.

// TODO: Make sure all sequence/echo/gear specific things in her kit are defined in one data folder and referenced/rebuilt rather than hardcoding it in every action
// Path: src/data/modifiers/<single mega file, one file per category/character, or what> and similar if we need for sideEffects and other properties with heavy building

// TODO: Selecting an action on Mornye when the previous character has 100 concerto should show her Mode actions.
// -> We need functionality (the following should work automatically, but also consider if it's the most elegant):
//    -> When the active character has 100 concerto
//    -> A different character is chosen
//    -> Check if selected character's Intro Skill triggers a form change; if so use that form as basis for the selectable actions
//       -> If yes: use that form as basis for the selectable actions
//       -> If no: use their current form (this should be how the selector acts by default though)

// TODO: All BA versions should equal in the same cast time for BA1, BA2, BA3. Swapping should penalize by 0.4, skill cancel no penalty

import { mornye_BA_1_cancel_with_swap } from './form-baseline/basics/BA1'
import { mornye_BA_1_2_cancel_with_swap } from './form-baseline/basics/BA1_2'
import { mornye_BA_1_3_into_heavy, mornye_BA_1_3_cancel_with_swap } from './form-baseline/basics/BA1_3'
import { mornye_BA_2_cancel_with_swap } from './form-baseline/basics/BA2'
import { mornye_BA_2_3_into_heavy, mornye_BA_2_3_cancel_with_swap } from './form-baseline/basics/BA2_3'
import { mornye_BA_3_into_heavy, mornye_BA_3_cancel_with_swap, mornye_BA_3_cancel_with_skill } from './form-baseline/basics/BA3'
import { mornye_heavy, mornye_heavy_swap_in } from './form-baseline/basics/heavy'
import { mornye_skill } from './form-baseline/skills/resonance'
import { mode_mornye_BA_1_3 } from './form-wide-field/basics/BA1_3'
import { mode_mornye_skill } from './form-wide-field/skills/resonance'
import { mode_mornye_heavy } from './form-wide-field/basics/heavy'
import { mornye_liberation } from './form-wide-field/skills/liberation'
import { mornye_intro, mornye_outro } from './others/introOutro'
import { mornye_wait_005, mornye_wait_for_swap, mornye_wait_for_cooldown } from './others/swaps'
import { mornye_energy, mornye_concerto, mornye_rest_mass_energy, mornye_relative_momentum } from './testing/energies'

export const mornye_intro_outro_actions = [mornye_intro, mornye_outro]

// NOTE: mornye_BA_1_3_cancel_with_skill / mornye_BA_2_3_cancel_with_skill are defined but not listed here
// (only referenced by mornye_skill.castConditions.previousActions).
export const all_actions = [
  mornye_BA_1_cancel_with_swap,
  mornye_BA_1_2_cancel_with_swap,
  mornye_BA_1_3_into_heavy,
  mornye_BA_1_3_cancel_with_swap,
  mornye_BA_2_cancel_with_swap,
  mornye_BA_2_3_into_heavy,
  mornye_BA_2_3_cancel_with_swap,
  mornye_BA_3_into_heavy,
  mornye_BA_3_cancel_with_swap,
  mornye_BA_3_cancel_with_skill,
  mornye_heavy,
  mornye_heavy_swap_in,
  mornye_skill,
  mode_mornye_BA_1_3,
  mode_mornye_skill,
  mode_mornye_heavy,
  mornye_liberation,
  ...mornye_intro_outro_actions,
  mornye_wait_005,
  //mornye_wait_1,
  mornye_wait_for_swap,
  mornye_wait_for_cooldown,
  mornye_energy,
  mornye_concerto,
  mornye_rest_mass_energy,
  mornye_relative_momentum
]
