// Builds the StatusDetailPanel tooltip data for a hovered modifier-contribution row
import type { Snapshot } from '../../../types/snapshot'
import type { StatusDetailInfo } from '../StatusDetailPanel'
import type { ModifierInfo } from './modifierMap'

/**
 * Prefers the stats captured when the modifier activated on this row (scaled by stacks/conditions);
 * falls back to the modifier's raw definition stats when none were captured.
 */
export function buildContribStatusInfo(
  contrib: { source: string; displayName?: string },
  modifierMap: Map<string, ModifierInfo>,
  snapshot: Snapshot | null,
): StatusDetailInfo {
  const lookupKey = contrib.displayName ?? contrib.source
  const info = modifierMap.get(lookupKey)
  const name = contrib.displayName ?? contrib.source
  const icon = `/assets/modifiers/${name.toLowerCase().replace(/:/g, '').replace(/\s+/g, '_')}.png`
  const activationStats = snapshot?.buffsActivationStats?.[name.replace(/\s+/g, '')]
  const charStatsSource =
    activationStats && Object.values(activationStats).some(v => v !== 0)
      ? activationStats
      : info?.characterStats
  const accent =
    info?.type === 'buff' ? 'rgba(255, 190, 60, 0.95)' :
    info?.type === 'debuff' ? 'rgba(255, 130, 100, 0.95)' :
    undefined
  return {
    key: contrib.source,
    label: name,
    icon,
    showStatus: false,
    type: info?.type,
    color: accent,
    description: info?.description,
    showStats: true,
    stats: charStatsSource,
    enemyStats: info?.enemyStats,
  }
}
