import type { StepContext } from '../../types/stepContext'

// ========== Stack Based Conditions ===============================================================

export function stacksOf(statusName: string) {
  return (ctx: StepContext): number => {
    const status = ctx.negativeStatusesInAction.find(ns => ns.negativeStatus.name === statusName)
    const stacks = status?.currentStacks ?? 0
    
    if (stacks === 0) return 0
    if (stacks <= 3) return 3
    if (stacks === 4) return 4
    if (stacks === 5) return 5
    return 6
  }
}

export function stacksOfCap(statusName: string) {
  return (ctx: StepContext): number => {
    const status = ctx.negativeStatusesInAction.find(ns => ns.negativeStatus.name === statusName)
    const stacks = status?.currentStacks ?? 0

    if (stacks > 5) return 5
    return stacks
  }
}

export function atLeastOneStackOf(statusName: string) {
  return (ctx: StepContext): number => {
    const status = ctx.negativeStatusesInAction.find(ns => ns.negativeStatus.name === statusName)
    const stacks = status?.currentStacks ?? 0
    return stacks >= 1 ? 1 : 0
  }
}

// ========== Always True ===============================================================

const ALWAYS_CONDITION_TAG = Symbol('always')

export function always() {
  const fn = (): number => 1;
  (fn as any)[ALWAYS_CONDITION_TAG] = true
  return fn
}

/** Returns true if the condition was created by always() — used to detect passive modifiers at resolution time. */
export function isAlwaysCondition(condition: (ctx: unknown) => number): boolean {
  return (condition as any)[ALWAYS_CONDITION_TAG] === true
}

// ========== Forte Grant Conditions ===============================================================

/** Returns 1 if the active character's charactersForteGrants contains grantName, 0 otherwise. */
export function hasForteGrant(grantName: string) {
  return (ctx: StepContext): number => {
    const grants = ctx.current.charactersForteGrants?.[ctx.character.name] ?? []
    return grants.includes(grantName) ? 1 : 0
  }
}

// ========== Sequence Conditions ===============================================================

/**
 * Returns a condition that is active (returns 1) when the named character's sequence level
 * is at least `minSequence`. Works whether that character is the active character or an ally.
 *
 * Usage: condition: ownerAtLeast('Mornye', 2)
 */
export function ownerAtLeast(characterName: string, minSequence: number) {
  return (ctx: StepContext): number => {
    const char = ctx.character?.name === characterName
      ? ctx.character
      : ctx.allies?.find(c => c.name === characterName)
    return (char?.sequence ?? 0) >= minSequence ? 1 : 0
  }
}
