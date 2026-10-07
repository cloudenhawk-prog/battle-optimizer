// Cartethyia — assembles every action into the exported lists, in the order the character expects.
//
// Layout: form-cartethyia/ (base form) and form-fleurdelys/ (after Liberation transform), each split into
//   basics/ (BA = basic attack chain, e.g. BA1_4 = stages 1-4; MA = mid-air attack; heavy; plunge)
//   skills/ (resonance skill, liberation / transform)
// others/  intro/outro + wait/swap utilities, testing/ resource top-up actions.
// Variants: `_cancel_with_swap|skill|jump` = same hits, animation cut short by that input.
// Form-specific lists get `requiredForms` stamped on here (copies), so the per-file objects stay form-agnostic.

// S2
// TODO: Casting Resonance Liberation - A Knight's Heartfelt Prayers increases the max stack limit of Aero Erosion on targets within a certain range by 3 stacks.
// TEST in tower how long it lasts
// Immediately apply 3 stacks of Aero Erosion and trigger aero explosion once

// TODO: Casting mid-air atttack (Cartethyia plunge) every 1 forte consumed reduces the cooldown of Resonance Skill Cartethyia by 1 second

// S3
// Fleurdelys Heavy Attack 2                          - Applies 2 aero ersoion (instead of 1) - but then also removes 1 stack to trigger aeroExplosion
// Fleurdelys Skill 2 (May Tempest Break the Tides)   - Applies 2 aero ersoion (instead of 1) - but then also removes 1 stack to trigger aeroExplosion

// Fleurdelys Liberation - Blade of Howling Squall    - Multiplier increased by 100 %

import type { Action } from '../../../types/action'

// Cartethyia form
import { cartethyia_BA_1_4_cancel_with_skill, cartethyia_BA_1_4_cancel_with_swap } from './form-cartethyia/basics/BA1_4'
import { cartethyia_BA_2_4, cartethyia_BA_2_4_cancel_with_jump, cartethyia_BA_2_4_cancel_with_swap } from './form-cartethyia/basics/BA2_4'
import { cartethyia_heavy, cartethyia_heavy_cancel_with_swap } from './form-cartethyia/basics/heavy'
import { cartethyia_plunge, cartethyia_plunge_cancel_with_swap } from './form-cartethyia/basics/plunge'
import { cartethyia_skill, cartethyia_skill_cancel_with_swap } from './form-cartethyia/skills/resonance'
import { cartethyia_transform } from './form-cartethyia/skills/transform'

// Fleurdelys form
import { fleurdelys_BA_1_5, fleurdelys_BA_1_5_cancel_with_swap } from './form-fleurdelys/basics/BA1_5'
import { fleurdelys_BA_3_5, fleurdelys_BA_3_5_cancel_with_swap } from './form-fleurdelys/basics/BA3_5'
import { fleurdelys_heavy_1, fleurdelys_heavy_1_cancel_with_swap } from './form-fleurdelys/basics/heavy1'
import { fleurdelys_heavy_2, fleurdelys_heavy_2_cancel_with_swap } from './form-fleurdelys/basics/heavy2'
import { fleurdelys_midair_1_3, fleurdelys_midair_1_3_cancel_with_swap } from './form-fleurdelys/basics/MA1_3'
import { fleurdelys_midair_1_2, fleurdelys_midair_1_2_cancel_with_swap } from './form-fleurdelys/basics/MA1_2'
import { fleurdelys_skill_1, fleurdelys_skill_1_cancel_with_swap } from './form-fleurdelys/skills/resonance1'
import { fleurdelys_skill_2, fleurdelys_skill_2_cancel_with_swap } from './form-fleurdelys/skills/resonance2'
import { fleurdelys_liberation } from './form-fleurdelys/skills/liberation'

// Others / testing
import { cartethyia_intro, cartethyia_outro, fleurdelys_intro } from './others/introOutro'
import { cartethyia_wait_005, cartethyia_wait_for_swap, cartethyia_wait_for_cooldown } from './others/swaps'
import { cartethyia_energy, cartethyia_concerto, cartethyia_forte, cartethyia_conviction } from './testing/energies'

export const cartethyia_actions: Action[] = [cartethyia_BA_1_4_cancel_with_skill, cartethyia_BA_1_4_cancel_with_swap, cartethyia_BA_2_4, cartethyia_BA_2_4_cancel_with_jump, cartethyia_BA_2_4_cancel_with_swap, cartethyia_heavy, cartethyia_heavy_cancel_with_swap, cartethyia_plunge, cartethyia_plunge_cancel_with_swap, cartethyia_skill, cartethyia_skill_cancel_with_swap, cartethyia_transform].map(a => ({ ...a, castConditions: { ...a.castConditions, requiredForms: ['Cartethyia'] } }))

export const fleurdelys_actions: Action[] = [fleurdelys_BA_1_5, fleurdelys_BA_1_5_cancel_with_swap, fleurdelys_BA_3_5, fleurdelys_BA_3_5_cancel_with_swap, fleurdelys_heavy_1, fleurdelys_heavy_1_cancel_with_swap, fleurdelys_heavy_2, fleurdelys_heavy_2_cancel_with_swap, fleurdelys_midair_1_3, fleurdelys_midair_1_3_cancel_with_swap, fleurdelys_midair_1_2, fleurdelys_midair_1_2_cancel_with_swap, fleurdelys_skill_1, fleurdelys_skill_1_cancel_with_swap, fleurdelys_skill_2, fleurdelys_skill_2_cancel_with_swap, fleurdelys_liberation].map(a => ({ ...a, castConditions: { ...a.castConditions, requiredForms: ['Fleurdelys'] } }))

export const universal_actions = [cartethyia_wait_005, cartethyia_wait_for_swap, cartethyia_wait_for_cooldown, cartethyia_energy, cartethyia_concerto, cartethyia_forte, cartethyia_conviction]

export const cartethyia_intro_outro_actions = [cartethyia_intro, cartethyia_outro]

export const fleurdelys_intro_outro_actions = [fleurdelys_intro]

export const all_actions = [...cartethyia_actions, ...fleurdelys_actions, ...universal_actions, ...cartethyia_intro_outro_actions, ...fleurdelys_intro_outro_actions]
