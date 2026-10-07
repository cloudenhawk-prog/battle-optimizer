// Ciaccona — public action list. The character spreads this module with Object.values(), so the
// re-export ORDER below is the action order (keep it; golden snapshots depend on it).
//
// Layout (no forms): basics/ (BA3_4 = basic attack stages 3-4, MA2_BA4 = mid-air 2 into BA4, heavy),
// skills/ (resonance, liberation), others/ (intro/outro, wait utilities), testing/ (resource top-ups).
// Variants: _cancel_with_swap|skill = same hits, animation cut short by that input.

export { ciaccona_BA_3_4_cancel_with_skill, ciaccona_BA_3_4_cancel_with_swap } from './basics/BA3_4'
export { ciaccona_midair_2_BA_4_cancel_with_skill, ciaccona_midair_2_BA_4_cancel_with_swap } from './basics/MA2_BA4'
export { ciaccona_skill, ciaccona_skill_cancel_with_swap } from './skills/resonance'
export { ciaccona_liberation } from './skills/liberation'
export { ciaccona_heavy, ciaccona_heavy_cancel_with_swap } from './basics/heavy'
export { ciaccona_intro, ciaccona_outro } from './others/introOutro'
export { ciaccona_wait_005, ciaccona_wait_for_swap } from './others/swaps'
export { ciaccona_energy, ciaccona_concerto, ciaccona_forte } from './testing/energies'
