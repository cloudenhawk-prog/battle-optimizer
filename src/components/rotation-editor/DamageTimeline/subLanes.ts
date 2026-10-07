// Greedy sub-lane assignment so overlapping timeline blocks stack instead of drawing on top of each other.

// ========== Sub-Lanes ========================================================================================================

/** Sorts blocks by start time, then end time (returns a new array). */
export function sortByTime<T extends { startTime: number; endTime: number }>(blocks: T[]): T[] {
  return [...blocks].sort((a, b) => {
    if (a.startTime !== b.startTime) return a.startTime - b.startTime
    return a.endTime - b.endTime
  })
}

/**
 * Assigns `subLane` in place on time-sorted blocks: each block takes the first lane whose last block
 * ended at or before its start, else opens a new lane. Returns the number of lanes used.
 */
export function assignSubLanes(blocks: Array<{ startTime: number; endTime: number; subLane: number }>): number {
  // End time of the last block placed in each lane
  const laneEndTimes: number[] = []

  blocks.forEach(block => {
    // Find the first available sub-lane (one that ends before this block starts)
    let assignedLane = 0
    for (let i = 0; i < laneEndTimes.length; i++) {
      if (laneEndTimes[i] <= block.startTime) {
        assignedLane = i
        break
      }
    }

    // If no available lane found, create a new one
    if (assignedLane === 0 && laneEndTimes.length > 0 && laneEndTimes[0] > block.startTime) {
      assignedLane = laneEndTimes.length
    }

    block.subLane = assignedLane

    // Update the end time for this lane
    if (assignedLane >= laneEndTimes.length) {
      laneEndTimes.push(block.endTime)
    } else {
      laneEndTimes[assignedLane] = block.endTime
    }
  })

  return laneEndTimes.length
}
