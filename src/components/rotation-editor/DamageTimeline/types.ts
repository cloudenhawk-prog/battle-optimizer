// Damage timeline data shapes: view modes, owners (swimlanes) and action / buff / debuff blocks.
import type { Snapshot } from '../../../types/snapshot'

// ========== Modes ============================================================================================================

export type ChartMode = 'dps' | 'cumulative'
export type ViewMode = 'timeline' | 'chart'

// ========== Owners & Blocks ==================================================================================================

/** A swimlane: one per character, plus a single "Global" lane for non-character sources. */
export type Owner = {
  name: string
  color: string
  isGlobal: boolean
}

/** A bar in an owner's swimlane: one action use, a merged run of damage events, or a negative-status duration. */
export type ActionBlock = {
  owner: string // Who caused this (for swimlane placement)
  attribution: string // What action/event generated it (skill name, status name, etc)
  startTime: number
  endTime: number
  snapshots: Snapshot[]
}

/** A buff/debuff active interval shown in the BUFFS / DEBUFFS sections. */
export type StatusBlock = {
  name: string
  type: 'buff' | 'debuff'
  startTime: number
  endTime: number
  ownerCharacter?: string
  targetStrategy?: string
  durationStrategy?: string
}

/** Block plus its stacked row index inside its lane (0 = top), assigned so blocks never overlap. */
export type WithSubLane<T> = T & { subLane: number }

export type TimelineData = {
  maxValue: number
  maxTime: number
  owners: Owner[]
  actionBlocks: WithSubLane<ActionBlock>[]
  buffBlocks: WithSubLane<StatusBlock>[]
  debuffBlocks: WithSubLane<StatusBlock>[]
  maxBuffSubLanes: number
  maxDebuffSubLanes: number
  maxSubLanesByOwner: Map<string, number>
}
