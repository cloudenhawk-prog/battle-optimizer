// Echo catalog: every echo selectable in the gear picker, grouped by set, plus lookup/build helpers.
//
// Cost = slot cost in the loadout (max 12 across 5 slots):
//   4 (CALAMITY): bosses, Nightmare:/Reminiscence: variants · 3 (ELITE): named non-bosses · 1 (COMMON): small enemies
export type { EchoCatalogEntry } from './types'
export { echoCatalog } from './catalog'
export { getEchoSets, getEchoCost, getEchoesForSet, buildEcho } from './helpers'
