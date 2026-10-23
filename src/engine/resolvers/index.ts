// Public API of the per-row resolver pipeline (one file per resolver) plus the shared aggregateStat helper.
//
// Pipeline order, exactly as executed by simulation/resolveAction.ts (updateSnapshotsWithAction):
//   R0  buildStepContext               context for the row; swap-based modifier expiry
//   R1  resolveTime                    fromTime/toTime
//   R2  resolveDamageModifiers         activate limited modifiers, aggregate applicable buffs/debuffs
//   R3  resolveDamage                  main hit (+ inherent modifiers), cumulative damage/DPS
//   R4  resolveSideEffectsAndStatuses  side effects/triggers, negative-status ticks, buff stack edits, heal procs
//   R5  resolveCoordinatedAttacks      activate + tick coordinated attacks (adds per-hit energy)
//   R6  resolveResources               energy cost/generation, concerto drain on Outro
//   R7  resolveResourceMilestones      resource thresholds → modifier stacks
//   R8  resolveOffFieldTriggers        off-field duration → energy/charge restore
//   R9  resolveModifierState           tick modifier timers by cast time, write buff/debuff columns
//   R10 resolveCooldowns               cooldowns, action charges, cooldown reductions
//   R11 resolveCastState               position, persistence, follow-ups, forms, swap state, combo windows
//
// Named re-exports (not `export *`) on purpose: damage/ imports aggregateStat from here while the
// resolvers import damage/, and named re-exports stay resolvable through that import cycle.

export { buildStepContext } from './buildStepContext'
export { resolveTime } from './resolveTime'
export { resolveDamageModifiers } from './resolveDamageModifiers'
export { resolveDamage } from './resolveDamage'
export { resolveSideEffectsAndStatuses } from './sideEffectsAndStatuses/resolveSideEffectsAndStatuses'
export { helpNegativeStatuses } from './sideEffectsAndStatuses/negativeStatuses'
export { resolveCoordinatedAttacks } from './resolveCoordinatedAttacks'
export { resolveResources } from './resolveResources'
export { resolveResourceMilestones } from './resolveResourceMilestones'
export { resolveOffFieldTriggers } from './resolveOffFieldTriggers'
export { resolveModifierState } from './resolveModifierState'
export { resolveCooldowns } from './resolveCooldowns'
export { resolveCastState } from './castState/resolveCastState'
export { aggregateStat } from './statHelpers'
