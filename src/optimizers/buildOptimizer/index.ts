// Build optimizer public API: echo-config types/helpers, candidate generation, scoring and the chunked runner.
export type { BuildResult, EchoSlotConfig, EchoOptConfig } from './types'
export { makeDefaultSlotConfig, serializeEchoConfig, deserializeEchoConfig } from './echoConfig'
export type { PersistedSlotConfig, PersistedCharConfig } from './echoConfig'
export { compactCandidateLabel, detailedCandidateLines } from './labels'
export { MAX_OPTIMIZER_BUILDS, buildEchoCandidates, countCandidates, buildAllCandidates } from './candidates'
export { scoreRotation, rankResults } from './scoring'
export { runBuildOptimizer } from './runBuildOptimizer'
export type { BuildOptimizerRunParams } from './runBuildOptimizer'
