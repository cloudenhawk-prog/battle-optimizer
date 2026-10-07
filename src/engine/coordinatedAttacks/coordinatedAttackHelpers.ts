// Public API of the coordinated-attack engine (activation, per-step ticking, snapshot columns, key helpers).
//
// Lifecycle (driven by resolvers/resolveCoordinatedAttacks): activate → process (tick hits, expire) → write snapshot.
// Attack entries are tracked in ctx.coordinatedAttacksInAction and mutated in place.

export { activateCoordinatedAttacks } from './activateCoordinatedAttacks'
export { processCoordinatedAttacks } from './processCoordinatedAttacks'
export { updateCoordinatedAttackSnapshot } from './coordinatedAttackSnapshot'
export { makeCoordinatedAttackKey, parseCoordinatedAttackKey } from './coordinatedAttackKey'
