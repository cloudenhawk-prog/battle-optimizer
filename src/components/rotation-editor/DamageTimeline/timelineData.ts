// Damage timeline data pipeline: snapshots + damage events → owners, laned action blocks and buff/debuff blocks.
import type { Snapshot } from '../../../types/snapshot'
import type { DamageEvent } from '../../../types/events'
import type { Character } from '../../../types/character'
import type { ActionBlock, ChartMode, TimelineData, WithSubLane } from './types'
import { collectOwners, buildActionBlocks } from './actionBlocks'
import { buildStatusBlocks } from './statusBlocks'
import { assignSubLanes, sortByTime } from './subLanes'

// ========== Timeline Data ====================================================================================================

/**
 * Extracts owners, action blocks and buff/debuff blocks, then assigns sub-lanes for overlaps
 * (action blocks per owner swimlane; buffs and debuffs each in their own section).
 */
export function buildTimelineData(
  snapshots: Snapshot[],
  damageEvents: DamageEvent[],
  mode: ChartMode,
  selectedCharacters: Character[],
): TimelineData {
  if (!snapshots || snapshots.length === 0) {
    return {
      maxValue: 1,
      maxTime: 1,
      owners: [],
      actionBlocks: [],
      buffBlocks: [],
      debuffBlocks: [],
      maxBuffSubLanes: 0,
      maxDebuffSubLanes: 0,
      maxSubLanesByOwner: new Map<string, number>(),
    }
  }

  const { characterOwners, owners } = collectOwners(snapshots, damageEvents)
  const blocks = buildActionBlocks(snapshots, damageEvents, characterOwners)
  const buffDebuffBlocksList = buildStatusBlocks(snapshots, selectedCharacters)

  // ---- Action block sub-lanes: sorted globally, then laid out per owner swimlane ----
  const blocksWithLanes = sortByTime(blocks).map(block => ({
    ...block,
    subLane: 0,
  }))

  const blocksByOwner = new Map<string, WithSubLane<ActionBlock>[]>()
  blocksWithLanes.forEach(block => {
    if (!blocksByOwner.has(block.owner)) {
      blocksByOwner.set(block.owner, [])
    }
    blocksByOwner.get(block.owner)!.push(block)
  })

  blocksByOwner.forEach(ownerBlocks => {
    assignSubLanes(ownerBlocks)
  })

  // Calculate max sub-lanes per owner for dynamic height
  const maxSubLanesByOwner = new Map<string, number>()
  blocksWithLanes.forEach(block => {
    const current = maxSubLanesByOwner.get(block.owner) || 0
    maxSubLanesByOwner.set(block.owner, Math.max(current, block.subLane + 1))
  })

  // ---- Buff / debuff sub-lanes ----
  const buffBlocksWithLanes = sortByTime(buffDebuffBlocksList.filter(b => b.type === 'buff'))
    .map(block => ({ ...block, subLane: 0 }))

  const debuffBlocksWithLanes = sortByTime(buffDebuffBlocksList.filter(b => b.type === 'debuff'))
    .map(block => ({ ...block, subLane: 0 }))

  const maxBuffSubLanes = assignSubLanes(buffBlocksWithLanes)
  const maxDebuffSubLanes = assignSubLanes(debuffBlocksWithLanes)

  // maxValue is a fixed placeholder scale: the chart view does not plot data points yet
  const maxT = Math.max(...snapshots.map(s => s.toTime), 1)
  const maxVal = mode === 'cumulative' ? 100000 : 10000

  return {
    maxValue: maxVal,
    maxTime: maxT,
    owners,
    actionBlocks: blocksWithLanes,
    buffBlocks: buffBlocksWithLanes,
    debuffBlocks: debuffBlocksWithLanes,
    maxBuffSubLanes,
    maxDebuffSubLanes,
    maxSubLanesByOwner,
  }
}
