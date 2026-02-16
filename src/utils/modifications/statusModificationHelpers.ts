import type { StatusModification } from '../../types/sideEffect'

/**
 * Side Effect Helpers
 *
 * Utility functions to easily create status modifications for side effects.
 * These helpers provide intuitive APIs for common modification patterns.
 */

// ========== Negative Status Modifications ====================================================================================

export function removeNegativeStatusStacks(targetName: string, stacks: number): StatusModification {
  return {
    type: 'negativeStatus',
    targetName,
    stackChange: -stacks,
  }
}

export function addNegativeStatusStacks(targetName: string, stacks: number): StatusModification {
  return {
    type: 'negativeStatus',
    targetName,
    stackChange: stacks,
  }
}

export function extendNegativeStatusDuration(targetName: string, seconds: number): StatusModification {
  return {
    type: 'negativeStatus',
    targetName,
    durationChange: seconds,
  }
}

export function reduceNegativeStatusDuration(targetName: string, seconds: number): StatusModification {
  return {
    type: 'negativeStatus',
    targetName,
    durationChange: -seconds,
  }
}

export function refreshNegativeStatusDuration(targetName: string): StatusModification {
  return {
    type: 'negativeStatus',
    targetName,
    refreshDuration: true,
  }
}

// ========== Buff Modifications ===============================================================================================

export function removeBuffStacks(targetName: string, stacks: number): StatusModification {
  return {
    type: 'buff',
    targetName,
    stackChange: -stacks,
  }
}

export function addBuffStacks(targetName: string, stacks: number): StatusModification {
  return {
    type: 'buff',
    targetName,
    stackChange: stacks,
  }
}

export function extendBuffDuration(targetName: string, seconds: number): StatusModification {
  return {
    type: 'buff',
    targetName,
    durationChange: seconds,
  }
}

export function reduceBuffDuration(targetName: string, seconds: number): StatusModification {
  return {
    type: 'buff',
    targetName,
    durationChange: -seconds,
  }
}

export function refreshBuffDuration(targetName: string): StatusModification {
  return {
    type: 'buff',
    targetName,
    refreshDuration: true,
  }
}

// ========== Debuff Modifications =============================================================================================

export function removeDebuffStacks(targetName: string, stacks: number): StatusModification {
  return {
    type: 'debuff',
    targetName,
    stackChange: -stacks,
  }
}

export function addDebuffStacks(targetName: string, stacks: number): StatusModification {
  return {
    type: 'debuff',
    targetName,
    stackChange: stacks,
  }
}

export function extendDebuffDuration(targetName: string, seconds: number): StatusModification {
  return {
    type: 'debuff',
    targetName,
    durationChange: seconds,
  }
}

export function reduceDebuffDuration(targetName: string, seconds: number): StatusModification {
  return {
    type: 'debuff',
    targetName,
    durationChange: -seconds,
  }
}

export function refreshDebuffDuration(targetName: string): StatusModification {
  return {
    type: 'debuff',
    targetName,
    refreshDuration: true,
  }
}
